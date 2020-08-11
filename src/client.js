const net = require('net');
const keys = require('../keys/keys.json');
const carrier = require('carrier');
const blessed = require("blessed")
const contrib = require("blessed-contrib")

class KittoClient {
	static messages = null;
	static run(crypt) {
		const screen = blessed.screen({
			smartCSR: true,
			title: "Kitto"
		})

		const form = blessed.form({
			parent: screen,
			width: "100%",
			left: "center",
			keys: true,
			vi: true
		})

		const grid = new contrib.grid({ rows: 10, cols: 10, screen: screen })
		this.messages = grid.set(0, 0, 9, 10, contrib.log, {
			label: "Inbox",
			tags: true,
			style: {
				fg: "green",
				border: {
					fg: "cyan"
				}
			},
			screen: screen,
			bufferLength: screen.height
		})

		let messageBox = blessed.textarea({
			parent: form,
			name: "msg",
			top: "94%",
			height: 3,
			inputOnFocus: true,
			content: "first",
			border: {
				type: "line"
			},
			style: {
				fg: 'cyan',
				border: {
					fg: "cyan"
				}
			}
		})

		messageBox.key("enter", () => form.submit())

		form.on("submit", () => {
			const msg = messageBox.getValue()
			messageBox.clearValue()
			if (!msg.startsWith("/")) return this.messages.log('You are in an empty void. The only thing you can do is: "/send <ip> <message>"')

			const command = msg.slice(1).split(" ")[0]
			const args = msg.slice(command.length + 1).trim().split(" ")
			switch (command) {
				case 'send':
					if (!args[0]) return this.messages.log(`${this._getTime()} Missing IP of person to send to.`)
					if (!args[1]) return this.messages.log(`${this._getTime()} Missing message to send to user.`)
					this.messages.log(`${this._getTime()} Connecting to user...`)
					const socket = net.createConnection({ host: args[0], port: 5335 }, () => {
						socket.write('TRANSMISSION - START|')
						socket.write(`CLIENT PUBLIC KEY - ${keys.publicKey}|`)
					});

					carrier.carry(socket, (d) => {
						const type = d.split(' - ')[0]
						const content = d.split(' - ')[1]
						if (type === 'SERVER PUBLIC KEY') {
							this.messages.log(`${this._getTime()} Encrypting and sending message...`)
							socket.write(`CONTENT - ${crypt.encrypt(content, args.slice(1).join(' '))}|`)
						}
					}, 'utf8', '|');

					socket.on('close', () => {
						// TODO: Make this less vague
						this.messages.log(`${this._getTime()} Disconnected. This should mean a success.`);
					});
				break;
			}
		})

		screen.key(["q", "C-c"], () => {
			process.exit();
		})

		screen.render()
	}

	static _getTime(timestamp) {
		return `[${new Intl.DateTimeFormat({}, {timeStyle: "short", hour12: true}).format(timestamp ? new Date(timestamp) : new Date())}]`
	}
}

module.exports = KittoClient;
