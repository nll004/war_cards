"use strict";

const {db, BCRYPT_WORK_FACTOR} = require("../db");
const bcrypt = require("bcrypt");
const checkIfUsernameOrEmailExists = require('../helpers/checkSQL');
const {sqlUpdateQueryBuilder} = require('../helpers/sqlUpdateQuery');
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
            await checkIfUsernameOrEmailExists(email, username);
            const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

            const result = await db.query(`
                                INSERT INTO users
                                    (username, password, first_name, last_name, email, admin)
                                VALUES ($1, $2, $3, $4, $5, $6)
                                RETURNING
                                    username, first_name AS "firstName", last_name AS "lastName", email, admin AS "isAdmin"`,
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
                                    admin AS "isAdmin"
                            FROM users
                            WHERE username = $1`,
                            [username]);
        if (result.rows.length === 0) throw new NotFoundError('User not found');
        return result.rows[0]
    };

    /** Return user data (minus password) if username and password is correct.
     *
     * @returns {object} { username, firstName, lastName, email, admin }
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

    /** Returns username if the given user was successfully delete
     *  @param username {string} - case sensitive username
     *
     *  If no user was deleted, returns an error.
     */
    static async delete(username){
        try{
            const deletedUser = await db.query(` DELETE FROM users
                                                WHERE username=$1
                                                RETURNING username`, [username]);
            if (deletedUser.rows.length === 0) throw new NotFoundError('User not found');
            return deletedUser.rows[0]
        }catch(errors){
            throw new BadRequestError(errors.message); // pass up to route
        }
    };

    /**  */
    static async edit(username, dataToEdit){
        const jsToSql = {
            firstName: 'first_name',
            lastName: 'last_name',
            isAdmin: 'admin'
        };
        try{
            await User.get(username);  // check for user, if no user throw NotFoundError
            if('email' in dataToEdit) {
                // check if email already exist and throw error if it does
                await checkIfUsernameOrEmailExists(dataToEdit.email);
            };
            if('password' in dataToEdit) {
            //  hash new password if it in the data to be edited
                const hashedPassword = await bcrypt.hash(dataToEdit.password, BCRYPT_WORK_FACTOR);
                dataToEdit.password = hashedPassword;
            };
            const {query, values} = sqlUpdateQueryBuilder('users', username, dataToEdit, jsToSql);
            const res = await db.query(query, values);
            return res.rows[0]
        }
        catch(errors){
            throw new BadRequestError(errors.message);
        };
    };

    // get game stats

    /**  */
    static async editGameStats(username, dataToEdit){
        const jsToSql = {
            gamesPlayed: 'games_played',
            gamesWon: 'games_won',
            gamesLost: 'games_lost',
            battles: 'battles',
            battlesWon: 'battles_won',
            battlesLost: 'battles_lost'
        };
        try{
            await User.get(username);  // check for user or throw NotFoundError
            // check for existing email?
            // hash password

            const result = await this.sqlQueryBuilder(tableName, username, dataToEdit, )

        }catch(errors){
            throw new BadRequestError(errors.message);
        }
    }
};

module.exports = {
    User,
    checkIfUsernameOrEmailExists
}
