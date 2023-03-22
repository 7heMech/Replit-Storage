let req;
if (typeof fetch != 'undefined') {
	const { emitWarning } = process;

	process.emitWarning = (warning, ...args) => {
		if (args[0] === 'ExperimentalWarning' && warning.includes('Fetch API')) return;
		return emitWarning(warning, ...args);
	};

	req = fetch;
} else req = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

const https = require('https');

const agent = new https.Agent({
	keepAlive: true
});

module.exports = (url, options) =>
	req(url, typeof options === 'object' ? { agent, ...options } : { agent });