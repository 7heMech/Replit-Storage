const { Client } = require("./index");

let client;

beforeAll(async () => {
	client = new Client();
	await client.empty();
});

afterEach(async () => {
	await client.empty();
});

test("create a client", async () => {
	expect(client).toBeTruthy();
	expect(typeof client.cache).toBe("object");
});

test("sets and gets values", async () => {
	await client.set("key", "value");
	expect(await client.getAll()).toEqual({
		key: "value",
	});
	await client.setMany({
		key: "val",
		second: "secondThing",
	});
	expect(await client.getAll()).toEqual({
		key: "val",
		second: "secondThing"
	});
});

test("list keys", async () => {
	await client.setMany({
		key: "value",
		second: "secondThing",
	});

	expect(await client.list()).toEqual(["key", "second"]);
});

test("key and value with newline", async () => {
	await client.set("key\na", "val\nue");

	expect(await client.getAll()).toEqual({
		"key\na": "val\nue",
	});
});

test("delete values", async () => {
	await client.setMany({
		key: "value",
		deleteThis: "please",
		somethingElse: "in delete multiple",
		andAnother: "again same thing",
	});

	await client.delete("deleteThis")
	await client.deleteMany(["somethingElse", "andAnother"])
	expect(await client.list()).toEqual(["key"]);
	await client.empty()
	expect(await client.list()).toEqual([]);
});

test("ensure that we escape values when setting", async () => {
	await client.set("https://example.com/", "1;b=2");
	expect(await client.list()).toEqual(["a"]);
	expect(await client.get("https://example.com/")).toEqual("1;b=2");
});

test("ensure that we escape values when emptying", async () => {
	await client.set("https://example.com/", "1;b=2");
	await client.empty();
	expect(await client.list()).toEqual([]);
});