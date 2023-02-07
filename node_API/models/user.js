"use strict";

const {db, BCRYPT_WORK_FACTOR} = require("../db");
const bcrypt = require("bcrypt");
const checkIfUsernameOrEmailExists = require('../helpers/checkSQL');
const sqlUpdateQueryBuilder = require('../helpers/sqlUpdateQuery');
const { BadRequestError, NotFoundError } = require("../expressErrors");

/** Related functions for users. */

class User {

    /** Registers new user with data.
     *  Hashes password and inserts user into users table as well as inits game stats.
     *
     * @param userData {object} - { username, firstName, lastName, email, password, isAdmin* } - *optional
     * @returns {object} - { username, firstName, lastName, email, isAdmin } - omits hashed password
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
            // create game stats table row for new user with default values or throw error
            await User.initGameStats(username);

            return result.rows[0]
        }
        catch (errors) {
            throw new BadRequestError(errors.message); // pass error up to route
        }
    };

    /** Retrieve user's data (including password) if user exists.
     *
     *  @param username {string} - case sensitive username
     *  @returns {object} { username, firstName, lastName, email, isAdmin } vs NotFoundError
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
        if (result.rowCount === 0) throw new NotFoundError('User not found');

        return result.rows[0]
    };

    /** Return user data (minus password) if correct username/password
     *
     *  @param username {string} - case sensitive username
     *  @param password {string} - unhashed password
     *
     *  @returns {object} { username, firstName, lastName, email, isAdmin } vs Error
     */
    static async login(username, password){
        try {
            const user = await User.get(username); // find user data and hashed pwd
            const validPassword = await bcrypt.compare(password, user.password);

            if(validPassword === true) {
                delete user.password; // removing password before returning user
                return user
            }
            else throw new BadRequestError();
        }
        catch (errors){
            throw new BadRequestError('Incorrect username/password'); // pass up to route
        }
    };

    /** Deletes specified user
     *
     *  @param username {string} - case sensitive username
     *  @returns {object} -  { username: "user's name" } or error if failed
     */
    static async delete(username){
        try{
            const deletedUser = await db.query(` DELETE FROM users
                                                WHERE username=$1
                                                RETURNING username`, [username]);
            if (deletedUser.rowCount === 0) throw new NotFoundError('User not found');

            return deletedUser.rows[0]
        }
        catch(errors){
            throw new BadRequestError(errors.message); // pass up to route
        }
    };

    /** Updates user table for the specified username with data provided
     *
     *  @param username {string} - case sensitive username
     *  @param dataToEdit {object} - key/value pairs of data to change
     *       Ex: { email: 'newEmail@gmail.com', password: 'newPassword', ...}
     *  @returns {object} { username: 'testUser' } or Error
     *
     *  Checks to make sure email is unique and hashes new password if provided
    */
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
                //  hash new password before storing
                const hashedPassword = await bcrypt.hash(dataToEdit.password, BCRYPT_WORK_FACTOR);
                dataToEdit.password = hashedPassword;
            };
            const {query, values} = sqlUpdateQueryBuilder('users', username, dataToEdit, jsToSql);
            const res = await db.query(query, values);

            return res.rows[0]
        }
        catch(errors){
            throw new BadRequestError(errors.message); // pass up to route
        };
    };

    /** Creates game_stats row for new players with default values of 0.
     *
     *  If the row fails to create, error is returned.
    */
    static async initGameStats(username){
        try{
            const res = await db.query(`INSERT INTO game_stats (username)
                                        VALUES ($1)
                                        RETURNING username;`, [username]);
            if (res.rowCount === 0) throw new BadRequestError('Failed to create game_stats');
        }
        catch(errors){
            throw new BadRequestError(errors.message); // pass up to route
        }
    };

    /** Return game stats for specified user
     *
     *  @param username {string} - case sensitive username
     *  @returns {object} - { username, gamesPlayed, gamesWon, battles, battlesWon} or Error
    */
    static async getGameStats(username){
        try{
            await User.get(username); // check for user, if no user throw NotFoundError
            const res = await db.query(`SELECT  username,
                                                games_played AS "gamesPlayed",
                                                games_won AS "gamesWon",
                                                battles,
                                                battles_won AS "battlesWon"
                                        FROM game_stats
                                        WHERE username = $1`, [username]);
            if (res.rowCount === 0) throw new BadRequestError('Unable to retrieve game stats');

            return res.rows[0]
        }
        catch(errors){
            throw new BadRequestError(errors.message); // pass up to route
        }
    };

    /** Updates game_stats table for the specified username with data provided
     *
     *  @param username {string} - case sensitive username
     *  @param dataToEdit {object} - key/value pairs of data to update
     *       Ex: { gamesPlayed: 101, gamesWon: 64, battles: 3451, battlesWon: 2012 }
     *  @returns {object} { username: 'testUser' } or Error
     */
    static async editGameStats(username, dataToEdit){
        const jsToSql = {
            gamesPlayed: 'games_played',
            gamesWon: 'games_won',
            battles: 'battles',
            battlesWon: 'battles_won'
        };
        try{
            await User.get(username);  // check for user or throw NotFoundError

            const { query, values } = sqlUpdateQueryBuilder('game_stats', username, dataToEdit, jsToSql);
            const res = await db.query(query, values);

            if (res.rowCount === 0) throw new BadRequestError('Failed to update game statistics');

            return res.rows[0]
        }
        catch(errors){
            throw new BadRequestError(errors.message);
        }
    };
};

module.exports = {
    User,
    checkIfUsernameOrEmailExists
};
