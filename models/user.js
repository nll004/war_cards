"use strict";

const {db, BCRYPT_WORK_FACTOR} = require("../db");
const bcrypt = require("bcrypt");

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
    if(res.rows.length > 0) throw new Error('Username/email already exists');
};

/** Related functions for users. */

class User {

    /** Registers user. Hashes pwd then returns user data (minus password)
     *
     * @param userData {object} - {username, firstName, lastName, email, password}
     * @returns {object} - {username:, firstName:, lastName:, email:}
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
                                    username, first_name AS "firstName", last_name AS "lastName", email`,
                                [username, hashedPassword, firstName, lastName, email]);
            return result.rows[0]
        }
        catch (errors) {
            throw new Error(errors.message); // pass error up to route
        }
    };

    /** Retrieve user's data with password if user exists. Otherwise returns Error.
     *
     * @param username {string}
     * @returns {object} { username, firstName, lastName, email } vs Error if not found
    */
    static async get(username) {
        const result = await db.query(`
                            SELECT  username,
                                    password,
                                    first_name AS "firstName",
                                    last_name AS "lastName",
                                    email
                            FROM users
                            WHERE username = $1`,
                            [username]);
        if (result.rows.length === 0) throw new Error('User not found');
        return result.rows[0]
    };

    static async login(username, password){
        try {
            const user = await User.get(username);
            const validPassword = await bcrypt.compare(password, user.password);

            if(validPassword === true) {
                delete user.password; // removing password before returning user
                return user
            }
            else throw new Error('Incorrect username/password');
        }
        catch (errors){
            throw new Error(errors.message); // pass up to route
        }
    }
}

module.exports = {
    User,
    checkIfUsernameOrEmailExists
}
