const dbFetch = require("./dbFetch");

const parseJson = (val) => {
	try {
		return JSON.parse(val);
	} catch (err) {
		return val;
	}
}

const ERRORS = {
	INVALID_KEY: new Error('The type of a DB key must be string.'),
	INVALID_URL: new Error('You must either pass a database URL into the Client constructor, or you must set the REPLIT_DB_URL environment variable. If you are using the repl.it editor, you must log in to get an auto-generated REPLIT_DB_URL environment variable.'),
};

class Client {
	#url;

	/**
	 * Initiates Class.
	 * @param {String} url Custom database URL
	 */
	constructor(url) {
		this.#url = url || process.env.REPLIT_DB_URL;
		if (!this.#url || typeof this.#url !== 'string') throw ERRORS.INVALID_URL;

		this.cache = {};
		this.getAll({ fetch: true });
	}

	/**
	 * Retrieves a value from the cache or the database.
	 * @param {string} key - The key to retrieve.
	 * @param {object} [config] - Configuration options.
	 * @param {boolean} [config.raw=false] - If true, returns the raw string value instead of parsing it.
	 * @param {boolean} [config.fetch=false] - If true, fetches the value from the database.
	 * @returns {*} - The value of the key.
	 */
	async get(key, config = {}) {
		if (typeof key !== 'string') throw ERRORS.INVALID_KEY;
		const { fetch = false, raw = false } = config;

		let value;

		if (!fetch) {
			value = this.cache[key];
		} else {
			value = await dbFetch(`${this.#url}/${encodeURIComponent(key)}`).then(res => res.text());
			this.cache[key] = value;
		}

		return raw ? value : parseJson(value);
	}

	/**
	 * Sets a key
	 * @param {string} key Key
	 * @param {any} value Value
	 */
	async set(key, value) {
		if (typeof key !== 'string') throw ERRORS.INVALID_KEY;
		const strValue = JSON.stringify(value);

		this.cache[key] = strValue;

		await dbFetch(this.#url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: `${encodeURIComponent(key)}=${encodeURIComponent(strValue)}`,
		});

		return this;
	}

	/**
	 * Deletes a key
	 * @param {String} key Key
	 */
	async delete(key) {
		if (typeof key !== 'string') throw ERRORS.INVALID_KEY;

		delete this.cache[key];
		await dbFetch(`${this.#url}/${encodeURIComponent(key)}`, { method: 'DELETE' });

		return this;
	}

	/**
	 * List keys starting with a prefix or list all.
	 * @param {object} [config] - Configuration options.
	 * @param {string} [config.prefix=''] Filter keys starting with prefix.
	 * @param {boolean} [config.fetch=false] Fetches values from the database. Default is false.
	 */
	async list(config = {}) {
		const { fetch = false, prefix = '' } = config;

		if (!fetch) return Object.keys(this.cache).filter(key => key.startsWith(prefix));

		const text = await dbFetch(
			`${this.#url}?encode=true&prefix=${encodeURIComponent(prefix)}`
		).then(res => res.text());

		if (text.length === 0) return [];

		return text.split('\n').map(decodeURIComponent);
	}

	/**
	 * Clears the database.
	 */
	async empty() {
		const keys = await this.list({ fetch: true });
		await this.deleteMany(keys);
		this.cache = {};

		return this;
	}

	/**
	 * Get all key/value pairs and return as an object.
	 * @param {object} [config] - Configuration options.
	 * @param {boolean} [config.fetch=false] If true, fetches values from the database. Default is false.
	 */
	async getAll(config = {}) {
		const { fetch = false } = config;

		const output = {};
		const keys = await this.list({ fetch });
		for (let i = 0; i < keys.length; i++) {
			const key = keys[i];
			output[key] = await this.get(key, { fetch });
		}

		return output;
	}

	/**
	 * Sets many entries through an object.
	 * @param {Object} obj An object containing key/value pairs to be set.
	 */
	async setMany(obj) {
		for (const key in obj) await this.set(key, obj[key]);

		return this;
	}

	/**
	 * Delete many entries by keys.
	 * @param {Array<string>} keys List of keys to delete.
	 */
	async deleteMany(keys) {
		for (let i = 0; i < keys.length; i++)
			await this.delete(keys[i]);

		return this;
	}
}

module.exports = { Client };