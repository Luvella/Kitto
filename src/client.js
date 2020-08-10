const net = require('net');
const keys = require('../keys/server.json');

class KittoClient {
	static run(crypt) {
		const client = net.createConnection({ port: 5335 }, () => {
			console.log('connected to server!');
			client.write('TRANSMISSION - START,')
			client.write(`CLIENT PUBLIC KEY - ${keys.publicKey},`)
		});

		client.on('data', (d) => {
			console.log(d.toString())
		});

		client.on('close', () => {
			console.log('disconnected from server');
		});
	}
}

module.exports = KittoClient;
