const net = require('net');
const kitto = require('../lib');
const carrier = require('carrier');
const client = require('./Client');

class KittoServer {
	static run(crypt) {
		const server = net.createServer((socket) => {
			socket.setTimeout(5000);

			let stage = 0;
			let ack = true;
			let message = null;
			carrier.carry(socket, (d) => {
				if (!ack) return;
				const type = d.trim().split(' - ')[0];
				const content = d.trim().split(' - ')[1];
				if (!content) return _endSocket(1);
				switch (type) {
					case 'TRANSMISSION':
						switch (content) {
							case 'START':
								if (stage !== 0) return _endSocket(2);
								stage++;
								break;

							case 'END':
								if (stage !== 3) return _endSocket(2);
								socket.end('SUCCESS - TRUE');
								client.messages.log(`${client._getTime()} Received: ${message}`);
								break;

							default:
								_endSocket(3);
								break;
						}
						break;

					case 'CLIENT PUBLIC KEY':
						if (stage !== 1) return _endSocket(2);
						socket.write(`SERVER PUBLIC KEY - ${kitto.keys.publicKey}|`);
						stage++;
						break;

					case 'CONTENT':
						if (stage !== 2) return _endSocket(2);
						message = crypt.decrypt(kitto.keys.privateKey, content).message;
						stage++;
						break;

					// No default
				}
				
			}, 'utf8', '|');

			socket.on('timeout', () => {
				_endSocket(4);
			});

			function _endSocket(code) {
				ack = false;
				socket.end(`ERROR - ${code}`);
			}
		}).on('error', err => { throw err; });

		server.listen(5335, () => {
			client.messages.log(`${client._getTime()} You are now online.`);
		});
	}
}

module.exports = KittoServer;
