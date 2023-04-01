const { Client } = require('./index');
let db;

beforeAll(async () => {
	db = new Client('https://replitdb.repl.co');
	await db.empty();
});

afterAll(async () => await db.empty());

test('set values', async () => db.set({
	key: 'val',
	second: 'secondThing'
}));

test('get values', async () => {
	expect(await db.getAll()).toEqual({
		key: 'val',
		second: 'secondThing'
	});
});

test('delete values', async () => {
	await db.empty();
	expect(await db.list()).toEqual([]);
});

test('ensure that we escape values when setting', async () => {
	await db.set('https://example.com/', '1;b=2');
	expect(await db.get('https://example.com/')).toEqual('1;b=2');
});

test('ensure that we escape values when deleting', async () => {
	await db.delete('https://example.com/');
	expect(await db.list()).toEqual([]);
});