[![npm version](https://badge.fury.io/js/replit-db.svg)](https://badge.fury.io/js/replit-db)

[![Run on Repl.it](https://repl.it/badge/github/7heMech/Replit-Database)](https://repl.it/github/7heMech/Replit-Database)

# Replit DB client
Replit DB client is a simple way to use Replit's Database in your Node.js repls.

## Get started
```js
const { Client } = require("replit-db");
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

Gets a value. Returns Promise.

```js
client.get("key", { raw: false });
```


> `set(String key, Any value)`

Sets a key to a value. Returns Client. 


> `delete(String key)`

Deletes a key. Returns Client.


> `list(Object config?)`

Lists all of the keys, or all of the keys starting with `prefix` if specifed.

```js
client.list({ prefix: "" });
```


> `empty()`

Clears the database. Returns Client


> `getAll()`

Get all key/value pairs and return as an object.


> `setMany(Object obj)`

Sets multiple key/value pairs from an object. Returns Client.


> `deleteMany(Array keys)`

Deletes multiple keys. Returns client.


## Tests
```sh
npm i
npm run test
```