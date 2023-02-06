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
            await User.initGameStats(username); // create game stats table row
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

    /** Updates user table. Returns username if data is successfully updated
     *
     * @param username {string} - case sensitive username
     * @param dataToEdit {object} - key/value pairs of data to change
     *      Ex: {email: 'newEmail@gmail.com', password: 'newPassword', ...}
     *
     * @returns {object} {username: 'testUser'} or Error
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
            throw new BadRequestError(errors.message);
        };
    };

    /** Creates a game_stats row for new players using default values of 0.
     *
     *  If the row fails to create, error is returned.
    */
    static async initGameStats(username){
        try{
            const result = await db.query(` INSERT INTO game_stats (username)
                                        VALUES ($1)
                                        RETURNING username;`, [username]);
            if (result.rows.length === 0) throw new BadRequestError('Failed to create game_stats');
        }catch(errors){
            throw new BadRequestError(errors.message);
        }
    };

    /** Return game stats for specified user
     *  @param username {string} - case sensitive username
     *  @returns {object} - {username, gamesPlayed, gamesWon, gamesLost, battles, battlesWon, battlesLost}
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
            if(res.rows.length === 0) throw new BadRequestError('Unable to retrieve game stats');
            return res.rows[0]
        }catch(errors){
            throw new BadRequestError(errors.message);
        }
    };

    /** Edit game stats and return username if successful
     *
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
            if(res.rowCount === 0) throw new BadRequestError('Game stat update unsuccessful');

            return res.rows[0]
        }catch(errors){
            throw new BadRequestError(errors.message);
        }
    }
};

module.exports = {
    User,
    checkIfUsernameOrEmailExists
}
