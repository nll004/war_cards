const {db} = require('../db');

async function commonBeforeAll() {
    // clear user table before starting
    await db.query('DELETE from users');
    // create a few test users
    await db.query(`INSERT INTO users(username, password, email, first_name, last_name)
                    VALUES ('testUser', 'password', 'testUser@gmail.com', 'test', 'user'),
                           ('testUser2', 'password', 'testUser2@gmail.com', 'test', 'user')`
                );
};

async function commonAfterAll() {
    await db.end();
};


module.exports = {
    commonBeforeAll,
    commonAfterAll
}
