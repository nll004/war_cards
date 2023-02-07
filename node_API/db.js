const { Client } = require("pg");

let DB_URI;
let BCRYPT_WORK_FACTOR;

if (process.env.NODE_ENV === 'test') {
    DB_URI = 'postgresql:///war_cards_test';
    BCRYPT_WORK_FACTOR = 1;
} else {
    DB_URI = process.env.DATABASE_URL || 'postgresql:///war_cards';
    BCRYPT_WORK_FACTOR = 12;
}

let db = new Client({
    connectionString: DB_URI
});

db.connect();

module.exports = {
    db,
    BCRYPT_WORK_FACTOR
}
