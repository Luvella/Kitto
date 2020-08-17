const net = require('net');
const kitto = require('../lib');
const carrier = require('carrier');
const blessed = require('blessed');
const contrib = require('blessed-contrib');

class KittoClient {
	static messages = null;
	static run(crypt) {
		const screen = blessed.screen({
			smartCSR: true,
			title: 'Kitto'
		});

		const form = blessed.form({
			parent: screen,
			width: '100%',
			left: 'center',
			keys: true,
			vi: true
		});

		const grid = new contrib.grid({
			rows: 8,
			cols: 10,
			screen
		});

		this.messages = grid.set(0, 0, 7.5, 10, contrib.log, {
			label: 'Inbox',
			tags: true,
			style: {
				fg: 'green',
				border: {fg: 'cyan'}
			},
			screen,
			bufferLength: screen.height
		});

		const messageBox = blessed.textarea({
			parent: form,
			name: 'msg',
			top: '94%',
			height: 3,
			inputOnFocus: true,
			content: 'first',
			border: {type: 'line'},
			style: {
				fg: 'green',
				border: {fg: 'cyan'}
			}
		});
		messageBox.focus();

		require('./Server').run(crypt);

		messageBox.key('enter', () => form.submit());
		form.on('submit', () => {
			const msg = messageBox.getValue();
			messageBox.clearValue();

			if (!msg.startsWith('/')) return this.messages.log('You are in an empty void. The only thing you can do is: "/send <ip> <message>"');

			const command = msg.slice(1).split(' ')[0];
			const args = msg.slice(command.length + 1).trim().split(' ');
			switch (command) {
				case 'send':
					if (!args[0]) return this.messages.log(`${this._getTime()} Missing IP of person to send to.`);
					if (!args[1]) return this.messages.log(`${this._getTime()} Missing message to send to user.`);
					this.messages.log(`${this._getTime()} Connecting to user...`);
					const socket = net.createConnection({host: args[0], port: 5335}, () => {
						socket.write('TRANSMISSION - START|');
						socket.write(`CLIENT PUBLIC KEY - ${kitto.keys.publicKey}|`);
					});

					carrier.carry(socket, (d) => {
						const type = d.split(' - ')[0];
						const content = d.split(' - ')[1];
						switch (type) {
							case 'SERVER PUBLIC KEY':
								this.messages.log(`${this._getTime()} Encrypting and sending message...`);
								socket.write(`CONTENT - ${crypt.encrypt(content, args.slice(1).join(' '))}|`);
								socket.write('TRANSMISSION - END|');
								break;

							case 'SUCCESS':
								socket.emit('success');
								break;

							case 'ERROR':
								socket.emit('kittoError', content);
								break;
						}
					}, 'utf8', '|');
					
					socket.on('success', () => { this.messages.log(`${this._getTime()} Successfully sent the message!`); })
					socket.on('kittoError', code => { this.messages.log(`${this._getTime()} Could not send successfully. Received error code: ${code}`); })
					break;

				// No default
			}
		});

		screen.key(['q', 'C-c'], () => { process.exit(); });

		screen.render();
	}

	static _getTime() {
		const options = {
			hour: 'numeric',
			minute: 'numeric',
			second: 'numeric',
			hour12: true
		};
		return `[${new Intl.DateTimeFormat({}, options).format(new Date())}]`;
	}
}

module.exports = KittoClient;
