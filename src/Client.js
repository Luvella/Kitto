const net = require('net');
const kitto = require('../lib');
const carrier = require('carrier');
const blessed = require('blessed');
const contrib = require('blessed-contrib');
const conf = require('../data/conf.json');

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

		const server = require('./Server');
		if (server.running) this.log(`You are now online.`);
		else server.run(crypt);

		messageBox.key('enter', () => form.submit());
		form.on('submit', () => {
			const msg = messageBox.getValue();
			messageBox.clearValue();

			this._handleCommand(msg, screen, crypt)
		});

		screen.key(['q', 'C-c'], () => { process.exit(); });

		screen.render();
	}

	static _handleCommand(msg, screen, crypt) {
		if (!msg.startsWith('/')) this.log('You are in an empty void. The only thing you can do is: "/send <ip> <message>"');

		const argv = msg.slice(1).trim().split(' ');
		const command = argv[0];
		const args = argv.slice(1);
		switch (command) {
			case 'send':
				if (!args[0]) return this.log(`Missing IP of person to send to.`);
				if (!args[1]) return this.log(`Missing message to send to user.`);
				this.log(`Connecting to user...`);
				const socket = net.createConnection({host: args[0], port: 5335}, () => {
					socket.write('TRANSMISSION - START|');
					socket.write(`CLIENT PUBLIC KEY - ${kitto.keys.publicKey}|`);
				});

				carrier.carry(socket, (d) => {
					const type = d.split(' - ')[0];
					const content = d.split(' - ')[1];
					switch (type) {
						case 'SERVER PUBLIC KEY':
							this.log(`Encrypting and sending message...`);
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
					
				socket.on('success', () => this.log(`Successfully sent the message!`));
				socket.on('kittoError', (code) => this.log(`Could not send successfully. Received error code: ${code}`));

				socket.on('error', (err) => {
					switch (err.code) {
						case 'ENOTFOUND':
							this.log(`Could not connect. Person is either offline or not a Kitto user.`);
							break;

						default:
							throw err;
							break;
					}
				});
				break;

			case 'refresh':
				screen.destroy();
				delete require.cache[require.resolve('./Client')];
				require('./Client').run(crypt);
				break;

			default:
				this.log('You are in an empty void. The only thing you can do is: "/send <ip> <message>"');
				break;
			}
	}

	static log(msg) {
		this.messages.log(`${this._getTime()} ${msg}`);
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
