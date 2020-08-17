const fs = require('fs');

class KittoKeysRetriever {
	static _pub = null;
	static _priv = null;

	static get publicKey() {
		if (this._pub) return this._pub;
		return this._pub = fs.readFileSync(`${__dirname}/../data/pub.pem`).toString();
	}

	static get privateKey() {
		if (this._priv) return this._priv;
		return this._priv = fs.readFileSync(`${__dirname}/../data/priv.pem`).toString();
	}
}

module.exports = KittoKeysRetriever;
