"use strict";

const {db, BCRYPT_WORK_FACTOR} = require("../db");
const bcrypt = require("bcrypt");
const checkIfUsernameOrEmailExists = require('../helpers/checkSQL');
const { BadRequestError, NotFoundError } = require("../expressErrors");

/** Related functions for users. */

class User {

    /** Registers user. Hashes pwd then returns user data (minus password)
     *
     * @param userData {object} - {username, firstName, lastName, email, password}
     * @returns {object} - {username:, firstName:, lastName:, email:}
    */
    static async register({username, password, firstName, lastName, email, isAdmin=false}){
        try {
            await checkIfUsernameOrEmailExists(username, email);
            const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

            const result = await db.query(`
                                INSERT INTO users
                                    (username, password, first_name, last_name, email, is_admin)
                                VALUES ($1, $2, $3, $4, $5, $6)
                                RETURNING
                                    username, first_name AS "firstName", last_name AS "lastName", email, is_admin AS "isAdmin"`,
                                [username, hashedPassword, firstName, lastName, email, isAdmin]);
            return result.rows[0]
        }
        catch (errors) {
            throw new BadRequestError(errors.message); // pass error up to route
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
                                    email,
                                    is_admin AS "isAdmin"
                            FROM users
                            WHERE username = $1`,
                            [username]);
        if (result.rows.length === 0) throw new NotFoundError('User not found');
        return result.rows[0]
    };

    /** Return user data (minus password) if username and password is correct.
     *
     * @returns {object} { username, firstName, lastName, email, isAdmin }
     * Or Error if username/password is incorrect
     */
    static async login(username, password){
        try {
            const user = await User.get(username);
            const validPassword = await bcrypt.compare(password, user.password);

            if(validPassword === true) {
                delete user.password; // removing password before returning user
                return user
            }
            else throw new BadRequestError('Incorrect username/password');
        }
        catch (errors){
            throw new BadRequestError(errors.message); // pass up to route
        }
    };

    /** Returns username if the given user was delete
     *
     *  If no user was deleted, returns an error.
     */
    static async delete(username){
        try{
            const deletedUser = await db.query(` DELETE FROM users
                                                WHERE username=$1
                                                RETURNING username`, [username]);
            if (deletedUser.rows.length === 0) throw new Error('User not found');
            return deletedUser.rows[0]
        }catch(errors){
            throw new BadRequestError(errors.message); // pass up to route
        }
    };
};

module.exports = {
    User,
    checkIfUsernameOrEmailExists
}
