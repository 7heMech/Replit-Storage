let rawFetch;

if (typeof fetch != 'undefined') {
	const { emitWarning } = process;

	process.emitWarning = (warning, ...args) => {
		if (args[0] === 'ExperimentalWarning' || args[0].type === 'ExperimentalWarning') return;
		return emitWarning(warning, ...args);
	};

	rawFetch = fetch;
} else rawFetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

const https = require('https');

const agent = new https.Agent({
	keepAlive: true
});

module.exports = (url, options) =>
	rawFetch(url, typeof options === 'object' ? { agent, ...options } : { agent });