const net = require('net');
const carrier = require('carrier');

class KittoServer {
	static run() {
		const server = net.createServer((socket) => {
			let type = 0
			carrier.carry(socket, (d) => {
				const type = d.split(' - ')[0]
				const content = d.split(' - ')[1]
				if (type === 'CLIENT PUBLIC KEY') {
					socket.publicKey = content;
					return console.log(`Got public key: ${socket.publicKey}`)
				}
				console.log('Received: "%s" - "%s"', type, content)
			}, 'utf8', ',');

			socket.on('close', () => {
				console.log('client disconnected');
				process.exit()
			});

		}).on('error', (err) => {
			throw err;
		});

		server.listen(5335, () => {
			console.log('opened server on', server.address());
		});
	}
}

module.exports = KittoServer;
