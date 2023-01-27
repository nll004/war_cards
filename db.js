const { Client } = require("pg");

const DB_URI = (process.env.NODE_ENV === 'test')
    ? DB_URI = 'postgresql:///war_cards_test'
    : DB_URI = 'postgresql:///war_cards';

let db = new Client({
    connectionString: DB_URI
});

db.connect();

module.exports = db;
