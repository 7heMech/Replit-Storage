declare class Client<T extends Record<string, unknown> = Record<string, unknown>> {
	/** 
	 * Initiates Class. 
	 * @param url Custom database URL
	 */
	constructor(url?: string);

	/**
	 * Retrieves a value from the cache or the database.
	 * @param {String} key - The key to retrieve.
	 * @param {Object} [config] - Configuration options.
	 * @param {Boolean} [config.raw=false] - If true, returns the raw string value instead of parsing it.
	 * @returns {*} - The value of the key.
	 */
	public get(key: keyof T, config: {
		raw: true
	}): Promise<string>;

	public get<K extends keyof T>(key: K, config?: {
		raw?: false
	}): Promise<T[K]>;

	public get<K extends keyof T>(key: K, config?: {
		raw?: boolean
	}): Promise<T[K] | string>;

	/** 
	 * Sets a key 
	 * @param key Key 
	 * @param value Value 
	 */
	public set<K extends keyof T>(key: K, value: T[K]): Promise<void>;

	/** 
	 * Deletes a key 
	 * @param key Key 
	 */
	public delete(key: keyof T): Promise<void>;

	/**
	 * List keys starting with a prefix or list all.
	 * @param {Object} [config] - Configuration options.
	 * @param {String} [config.prefix=''] Filter keys starting with prefix.
	 */
	public list(config?: {
		prefix?: string
	}): Promise<(keyof T)[]>;

	/** Clears the database. */
	public empty(): Promise<void>;

	/**
	 * Get all key/value pairs and return as an object.
	 */
	public getAll(): Promise<T>;

	/** 
	 * Sets many entries through an object. 
	 * @param {Object} obj An object containing key/value pairs to be set.
	 */
	public setMany(obj: Partial<T>): Promise<void>;

	/** 
	 * Delete many entries by keys.
	 * @param {Array<string>} keys List of keys to delete.
	 */
	public deleteMany(keys: Array<(keyof T)[]>): Promise<void>;
}

export { Client };