{
const isNode = Object.prototype.toString.call(typeof process !== 'undefined' ? process : 0) === '[object process]';

const Api = (url) => {
	if (!isNode && !url) throw 'You must pass a db url to the client';
	const db = new URL(url || process.env.REPLIT_DB_URL).toString();

	return async (options = {}) => {
		const { body = {}, method = 'GET', prefix, key } = options;

		const params = { body, method, headers: { connection: 'keep-alive' } };

		// setting keys
		if (body) {
			params.method = 'POST';
			params.headers['Content-Type'] = 'application/x-www-form-urlencoded';
		};

		let path;
		if (key) path = encodeURIComponent(key); // getting/deleting a key
		else if (prefix) path = '?encode=true&prefix=' + encodeURIComponent(prefix); // listing keys
		
		return fetch(`${db}/${path}`, params);
	}
};

const parseJson = (val) => {
	try {
		return JSON.parse(val);
	} catch (err) {
		return val;
	}
}

class Client {
	/**
	 * Initiates Class.
	 * @param {String} url Custom database URL
	 */
	constructor(url) {
		this.fetch = Api(url);
		this.cache = {};
	}

	/**
	 * Retrieves a value from the cache or the database.
	 * @param {String|Number} key - The key to retrieve.
	 * @param {Object} [config] - Configuration options.
	 * @param {Boolean} [config.raw=false] - If true, returns the raw string value instead of parsing it.
	 * @returns {*} - The value of the key.
	 */
	async get(key, config = {}) {
		const { raw = false } = config;

		let value = this.cache[key];
		if (typeof value === 'undefined') {
			value = await this.fetch({ key }).then(res => res.text());
			this.cache[key] = value;
		}

		return raw ? value : parseJson(value);
	}

	/**
	 * Sets entries through an object.
	 * @param {Object} entries An object containing key/value pairs to be set.
	 */
	async set(entries) {
		if (typeof entries !== 'object') throw Error('Set method expects an object.');

		let query = '';
		for (const key in entries) {
			const value = JSON.stringify(entries[key]);
			query += `${encode(key)}=${encode(value)}&`;
			this.cache[key] = value;
		}

		const body = query.slice(0, -1); // removes the trailing &

		await this.fetch({ body });
	}

	/**
	 * Deletes a key
	 * @param {String|Number} key Key
	 */
	async delete(key) {
		delete this.cache[key];
		await this.fetch({ key, method: 'DELETE' });
	}

	/**
	 * List keys starting with a prefix or list all keys.
	 * @param {Object} [config] - Configuration options.
	 * @param {String} [config.prefix=''] Filter keys starting with prefix.
	 */
	async list(config = {}) {
		const { prefix = '' } = config;

		const text = await this.fetch({ prefix }).then(res => res.text());
		if (text.length === 0) return [];

		return text.split('\n').map(decodeURIComponent);
	}

	/**
	 * Clears the database.
	 */
	async empty() {
		this.cache = {};

		const keys = await this.list();
		await this.deleteMany(keys);
	}

	/**
	 * Get all key/value pairs and return as an object.
	 */
	async getAll() {
		const output = {};
		const keys = await this.list();
		for (let i = 0; i < keys.length; i++) {
			const key = keys[i];
			output[key] = await this.get(key);
		}

		return output;
	}

	/**
	 * Delete many entries by keys.
	 * @param {Array<String|Number>} keys List of keys to delete.
	 */
	async deleteMany(keys) {
		for (let i = 0; i < keys.length; i++)
			await this.delete(keys[i]);
	}
}

if (isNode) module.exports = { Client };
else window.Client = Client;
}