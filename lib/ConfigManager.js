const fs = require('fs');
const conf = require('../data/conf.json');

class KittoConfigManager {
	static welcome(bool) {
		const newconf = conf;
		newconf.welcome = bool;
		fs.writeFileSync(require.resolve('../data/conf.json'), JSON.stringify(newconf, null, 4));
	}

	static get data() {
		return conf;
	}
}

module.exports = KittoConfigManager;
