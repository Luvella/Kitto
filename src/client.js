const net = require('net');
const keys = require('../keys/keys.json');
const carrier = require('carrier');

class KittoClient {
	static run(crypt) {
		const client = net.createConnection({ port: 5335 }, () => {
			console.log('connected to server!');
			client.write('TRANSMISSION - START|')
			client.write(`CLIENT PUBLIC KEY - ${keys.publicKey}|`)
		});

		carrier.carry(client, (d) => {
				const type = d.split(' - ')[0]
				const content = d.split(' - ')[1]
			if (type === 'SERVER PUBLIC KEY') {
				console.log('sending message')
				client.write(`CONTENT - ${crypt.encrypt(content, 'Hello there, this is Kitto!')}|`)
			}
		}, 'utf8', '|');

		client.on('close', () => {
			console.log('disconnected from server');
		});
	}
}

module.exports = KittoClient;
