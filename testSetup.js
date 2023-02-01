"use strict"
process.env.NODE_ENV = 'test';
const bcrypt = require("bcrypt");
const {db, BCRYPT_WORK_FACTOR} = require('./db');

async function clearDB() {
    // clear user table before starting
    await db.query('DELETE FROM users');
    await db.query('DELETE FROM game_stats')
};

async function seedTestDB() {
    await clearDB();

    const hashedPassword = await bcrypt.hash('password', BCRYPT_WORK_FACTOR);
        // create a few test users
    await db.query(`INSERT INTO users(username, password, email, first_name, last_name)
                    VALUES ('testUser', '${hashedPassword}', 'testUser@gmail.com', 'test', 'user'),
                           ('testUser2', '${hashedPassword}', 'testUser2@gmail.com', 'test', 'user')`
                );
};

async function commonAfterAll() {
    await db.end();
};


module.exports = {
    clearDB,
    seedTestDB,
    commonAfterAll
}
