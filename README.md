[![npm version](https://badge.fury.io/js/replit-db.svg)](https://badge.fury.io/js/replit-db)

[![Run on Repl.it](https://repl.it/badge/github/7heMech/Replit-Database)](https://repl.it/github/7heMech/Replit-Database)

# Replit DB client
Replit DB client is a simple way to use Replit's Database in your Node.js repls.

## Get started
```js
const { Client } = require("replit-storage");
const client = new Client();

client.set("key", "value").then(async () => {
	const key = await client.get("key");
	console.log(key);
});
```

## Docs
### `class Client(String url?)`
The parameter url is an optional custom DB URL.

**Functions**

These are the methods which a client instance provides.


> `get(String key, Object config?)`

Gets a value.

```js
client.get("key", { raw: false });
```


> `set(String key, Any value)`

Sets a key to a value.


> `delete(String key)`

Deletes a key.


> `list(Object config?)`

Lists all of the keys, or all of the keys starting with `prefix` if specifed.

```js
client.list({ prefix: "" });
```


> `empty()`

Clears the database.


> `getAll()`

Get all key/value pairs and return as an object.


> `setMany(Object obj)`

Sets multiple key/value pairs from an object.


> `deleteMany(Array keys)`

Deletes multiple keys.


## Tests
```sh
npm i
npm run test
```