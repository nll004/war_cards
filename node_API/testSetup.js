"use strict"
process.env.NODE_ENV = 'test';
const bcrypt = require("bcrypt");
const {db, BCRYPT_WORK_FACTOR} = require('./db');

async function clearDB() {
    // clear user and game_stats tables
    await db.query('DELETE FROM users');
    await db.query('DELETE FROM game_stats');
};

async function seedTestDB() {
    await clearDB();

    const hashedPassword = await bcrypt.hash('password', BCRYPT_WORK_FACTOR);
        // create a few test users
    await db.query(`INSERT INTO users(username, password, email, first_name, last_name, admin)
                    VALUES ('testUser', '${hashedPassword}', 'testUser@gmail.com', 'test', 'user', false),
                           ('testUser2', '${hashedPassword}', 'testUser2@gmail.com', 'test', 'user', false),
                           ('adminUser', '${hashedPassword}', 'admin@gmail.com', 'admin', 'user', true);`
    );
        // create test game stats for users
    await db.query(`INSERT INTO game_stats(username, games_played, games_won, battles, battles_won)
                    VALUES ('testUser', 5, 3, 16, 10),
                           ('testUser2', 9, 7, 22, 18),
                           ('adminUser', 10, 1, 26, 4);`
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
