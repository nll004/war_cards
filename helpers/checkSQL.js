"use strict";

const { db } = require("../db");
const { BadRequestError } = require("../expressErrors");

/** Returns error if either the username or email already exists in the database
 *
 * @param username {string} - username
 * @param email {string} - full email address
*/
async function checkIfUsernameOrEmailExists(email, username) {
    const res = await db.query(`SELECT username, email
                                FROM users
                                WHERE email = $1 OR username = $2`,
        [email, username]);
    if (res.rows.length > 0) throw new BadRequestError('Username/email already exists');
    return false
};

module.exports = checkIfUsernameOrEmailExists;
