const fs = require('fs');
const {RSA, Crypt} = require('hybrid-crypto-js');
const rsa = new RSA();
const crypt = new Crypt({md: 'sha512'});

// TODO: Have users ad their very own keys (from keybase, or pem files..?)
// // and don't store keys in JSON .-.
if (!fs.existsSync(`${__dirname}/../keys/server.json`)) return rsa.generateKeyPair((keys) => {
	console.log('Generating keys...')
	fs.appendFileSync(`${__dirname}/../keys/server.json`, JSON.stringify({
		publicKey: keys.publicKey,
		privateKey: keys.privateKey
	}, null, 4));

	require('./server').run(crypt);
	require('./client').run(crypt);
});

require('./server').run(crypt);
require('./client').run(crypt);