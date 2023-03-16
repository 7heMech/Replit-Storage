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
	}

	/**
	 * Retrieves a value from the cache or the database.
	 * @param {String} key - The key to retrieve.
	 * @param {Object} [config] - Configuration options.
	 * @param {Boolean} [config.raw=false] - If true, returns the raw string value instead of parsing it.
	 * @returns {*} - The value of the key.
	 */
	async get(key, config = {}) {
		if (typeof key !== 'string') throw ERRORS.INVALID_KEY;
		const { raw = false } = config;

		let value = this.cache[key];
		if (typeof this.value === 'undefined') {
			value = await dbFetch(`${this.#url}/${encodeURIComponent(key)}`).then(res => res.text());
			this.cache[key] = value;
		}

		return raw ? value : parseJson(value);
	}

	/**
	 * Sets a key
	 * @param {String} key Key
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
	}

	/**
	 * Deletes a key
	 * @param {String} key Key
	 */
	async delete(key) {
		if (typeof key !== 'string') throw ERRORS.INVALID_KEY;

		delete this.cache[key];
		await dbFetch(`${this.#url}/${encodeURIComponent(key)}`, { method: 'DELETE' });
	}

	/**
	 * List keys starting with a prefix or list all.
	 * @param {Object} [config] - Configuration options.
	 * @param {String} [config.prefix=''] Filter keys starting with prefix.
	 */
	async list(config = {}) {
		const { prefix = '' } = config;

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
	 * Sets many entries through an object.
	 * @param {Object} obj An object containing key/value pairs to be set.
	 */
	async setMany(obj) {
		for (const key in obj) await this.set(key, obj[key]);
	}

	/**
	 * Delete many entries by keys.
	 * @param {Array<string>} keys List of keys to delete.
	 */
	async deleteMany(keys) {
		for (let i = 0; i < keys.length; i++)
			await this.delete(keys[i]);
	}
}

module.exports = { Client };