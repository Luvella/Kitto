const fs = require('fs');
const {RSA, Crypt} = require('hybrid-crypto-js');
const rsa = new RSA();
const crypt = new Crypt({md: 'sha512'});

// TODO: Have users add their very own keys (from keybase, or pem files..?)
// and don't store keys in JSON .-.

if (!fs.existsSync(`${__dirname}/../keys`)) fs.mkdirSync(`${__dirname}/../keys`);
if (!fs.existsSync(`${__dirname}/../keys/keys.json`)) {
	console.log('Generating keys...');
	return rsa.generateKeyPair((keys) => {
		fs.appendFileSync(`${__dirname}/../keys/keys.json`, JSON.stringify({
			publicKey: keys.publicKey,
			privateKey: keys.privateKey
		}, null, 4));
		start();
	});
}

start();

function start() {
	require('./client').run(crypt);
}
