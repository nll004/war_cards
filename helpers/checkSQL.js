"use strict";

const { db } = require("../db");
const { BadRequestError } = require("../expressErrors");

/** Returns error if either the username or email already exists in the database
 *
 * @param username {string} - username
 * @param email {string} - full email address
*/
async function checkIfUsernameOrEmailExists(username, email) {
    const res = await db.query(`SELECT username, email
                                FROM users
                                WHERE username = $1 OR email = $2`,
        [username, email]);
    if (res.rows.length > 0) throw new BadRequestError('Username/email already exists');
};

module.exports = checkIfUsernameOrEmailExists;
