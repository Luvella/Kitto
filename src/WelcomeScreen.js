const blessed = require('blessed');
const contrib = require('blessed-contrib');

class KittoWelcomeScreen {
	static run(crypt) {
		const screen = blessed.screen({
			smartCSR: true,
			title: 'Welcome to Kitto'
		});

		const form = blessed.form({
			parent: screen,
			width: '100%',
			left: 'center',
			keys: true,
			vi: true
		});

		const box = blessed.box({
			parent: form,
			top: 'center',
			left: 'center',
			width: '100%',
			height: '100%',
			border: {
				type: 'line'
			},
			style: {
				border: {
					fg: 'cyan'
				}
			}
		});

		blessed.text({
			parent: box,
			content: require('fs').readFileSync(`${__dirname}/kittoAscii.txt`).toString()
		});

		blessed.text({
			parent: box,
			content: 'Welcome! Kitto is a open source, secure and pretty fast way of sending messages directly to someone.\nNote that you can only send messages to another Kitto user.',
			top: 5,
			left: 'center'
		});

		blessed.text({
			parent: box,
			content: 'Press Enter to start using Kitto! Once you are in the interface,\nyou can type anything and you can get help from there.\nTo exit: press Q or Ctrl-C,\nto check the box: press TAB then space.',
			top: 10,
			left: 38
		})

		const checkbox = blessed.checkbox({
			parent: box,
			checked: false,
			text: 'Don\'t show this screen again',
			left: "center",
			top: 18
		})

		blessed.text({
			parent: form,
			content: '^ our logo and "mascot"\nnamed after the service itself.',
			top: 22,
			left: 10
		});

		screen.key('enter', () => { 
			screen.destroy()
			require('./Client').run(crypt);
		});
		screen.key(['q', 'C-c'], () => { process.exit(); });

		screen.render();
	}
}

module.exports = KittoWelcomeScreen;
