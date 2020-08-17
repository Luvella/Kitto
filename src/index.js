const fs = require('fs');
const {RSA, Crypt} = require('hybrid-crypto-js');
const rsa = new RSA();
const crypt = new Crypt({md: 'sha512'});

if (!fs.existsSync(`${__dirname}/../data`)) fs.mkdirSync(`${__dirname}/../data`);
if (!fs.existsSync(`${__dirname}/../data/pub.pem`) || !fs.existsSync(`${__dirname}/../data/priv.pem`)) {
	console.log('Generating keys...');
	return rsa.generateKeyPair((keys) => {
		fs.writeFileSync(`${__dirname}/../data/pub.pem`, keys.publicKey);
		fs.writeFileSync(`${__dirname}/../data/priv.pem`, keys.privateKey);
		start();
	});
}

start();

function start() {
	if (!fs.existsSync(`${__dirname}/../data/conf.json`)) fs.writeFileSync(`${__dirname}/../data/conf.json`, JSON.stringify({welcome: true}, null, 4));
	if (require('../data/conf.json').welcome) return require('./WelcomeScreen').run(crypt);

	require('./Client').run(crypt);
}
