"use strict";

const { db } = require("../db");
const { BadRequestError } = require("../expressErrors");

/** If the email or username provided is found in the database, throw error else return false
 *
 *  @param email {string} - full email address
 *  @param username {string} - username. Optional*
*/
async function checkIfUsernameOrEmailExists(email, username='') {
    const res = await db.query(`SELECT username, email
                                FROM users
                                WHERE email = $1 OR username = $2`,
        [email, username]);
    if (res.rows.length > 0) throw new BadRequestError('Username/email already exists');
    return false
};

module.exports = checkIfUsernameOrEmailExists;
