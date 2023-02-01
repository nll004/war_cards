"use strict";

const {db, BCRYPT_WORK_FACTOR} = require("../db");
const bcrypt = require("bcrypt");

/** Returns true if either the username or email already exists in the database
 *
 * @param username {string} - lowercased username
 * @param email {string} - validated email address
*/
async function checkIfUsernameOrEmailExists(username, email) {
    const res = await db.query(`SELECT username, email
                                FROM users
                                WHERE username = $1 OR email = $2`,
                                [username, email]);
    if(res.rows.length > 0) throw new Error('Username/email already exists');
};

/** Related functions for users. */

class User {
    constructor({username, firstName, lastName, email}){
        this.username = username;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
    };

    /** Registers a new user and returns user data and JWT
     *
     * @param userData {object} - {username, firstName, lastName, email, password}
     * @returns {object} - {username, firstName, lastName, email, token}
    */
    static async register({username, password, firstName, lastName, email}){
        try {
            await checkIfUsernameOrEmailExists(username, email);
            const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

            const result = await db.query(`
                                INSERT INTO users
                                    (username, password, first_name, last_name, email)
                                VALUES ($1, $2, $3, $4, $5)
                                RETURNING
                                    username, password, first_name AS "firstName", last_name AS "lastName", email`,
                                [username, hashedPassword, firstName, lastName, email]);
            return new User(result.rows[0])
        }
        catch (errors) {
            throw new Error(errors.message); // pass error up to route
        }
    };
}

module.exports = {
    User,
    checkIfUsernameOrEmailExists
}
