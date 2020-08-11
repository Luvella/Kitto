const net = require('net');
const keys = require('../keys/keys.json');
const carrier = require('carrier');

class KittoServer {
	static run(crypt) {
		const server = net.createServer((socket) => {
			socket.setTimeout(5000);
			let stage = 0;
			let ack = true;
			carrier.carry(socket, (d) => {
				if(!ack) return;
				const type = d.trim().split(' - ')[0]
				const content = d.trim().split(' - ')[1]
				if (!content) return _endSocket(1);
				switch (type) {
					case 'TRANSMISSION':
						if (stage !== 0) return _endSocket(2);
						switch (content) {
							case 'START':
								stage++;
							break;

							case 'END':
								socket.end()
							break;

							default:
								_endSocket(3)
							break;
						}
					break;

					case 'CLIENT PUBLIC KEY':
						if (stage !== 1) return _endSocket(2);
						console.log('Sending public key to client..')
						socket.write(`SERVER PUBLIC KEY - ${keys.publicKey}|`)
						stage++
					break;

					case 'CONTENT':
						console.log(`Someone sent message: ${crypt.decrypt(keys.privateKey, content).message}`);
						stage++
					break;
				}
				//console.log('Client sent: %s - %s', type, content)
			}, 'utf8', '|');

			socket.on('timeout', () => {
				console.log('client timeout');
				_endSocket(4)
			});
			socket.on('close', () => {
				console.log('client disconnected');
				process.exit()
			});

			function _endSocket(code) {
				ack = false;
				socket.end(`ERROR - ${code}`)
			}
		}).on('error', (err) => {
			throw err;
		});

		server.listen(5335, () => {
			console.log('opened server on', server.address());
		});


	}
}

module.exports = KittoServer;
