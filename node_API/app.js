"use strict";
const jsonschema = require('jsonschema');
const express = require("express");
const app = express();

const { User } = require('./models/user');
const createToken = require('./helpers/createToken');
const registerUserSchema = require('./jsonSchemas/registerUser');
const loginUserSchema = require('./jsonSchemas/loginUser.json');
const editUserSchema = require('./jsonSchemas/editUser.json');
const editUserStatsSchema = require('./jsonSchemas/editUserStats.json');
const { authenticateJWT, ensureLoggedIn, ensureCorrectUserOrAdmin } = require('./middleware/auths');
const { BadRequestError, UnauthorizedError } = require('./expressErrors');

// Parse request bodies for JSON
app.use(express.json());
app.use(authenticateJWT);

/** POST /users/register            Registers New User
 *
 *  JSON schema ensures all properties are present and that the email address is correctly formatted
 *  If the username or email address already exist in the database an error is returned.
 *  If request is successful, the user (minus password) and a JWT are returned.
 *
 *  Accepts: { username, password, firstName, lastName, email } - Must include all
 *  Returns: { success, user, _token } vs { error }
 *
 *  Authorization required: none
 */
app.post('/users/register', async (req, res, next) => {
    try {
        const validator = jsonschema.validate(req.body, registerUserSchema);
        if (!validator.valid) throw new BadRequestError();

        const newUser = await User.register(req.body);
        const token = createToken(newUser);

        return res.status(201).send({ success: true, user: newUser, _token: token });
    }
    catch (error) {
        return next(error);
    };
});

/** POST /users/login               Login User
 *
 *  JSON schema ensures all properties are present in request
 *  If the username/password is incorrect, returns Error
 *  If username/password is correct, the user (minus password) and a JWT are returned
 *
 *  Accepts: { username, password } - Must include all
 *  Returns: { success, user, _token }
 *
 *  Authorization required: none
 */
app.post('/users/login', async (req, res, next) => {
    try {
        const validator = jsonschema.validate(req.body, loginUserSchema);
        if (!validator.valid) throw new BadRequestError();

        const userData = await User.login(req.body.username, req.body.password);
        const token = createToken(userData);

        return res.status(200).send({ success: true, user: userData, _token: token });
    }
    catch (error) {
        return next(error);
    }
});

/** GET /users/:username            Get Specified User's Data
 *
 *  If username is not found or nonAdmin user tries to retrieve another user => { error }
 *  If successful, the user's information (minus password) is returned
 *
 *  Returns: { successful, user }
 *
 *  Authorization required: Logged in user or admin
 */
app.get('/users/:username', ensureLoggedIn, ensureCorrectUserOrAdmin, async (req, res, next) => {
    try {
        const { username } = req.params;
        const userData = await User.get(username);
        delete userData.password;

        return res.status(200).send({ success: true, user: userData });
    }
    catch (error) {
        return next(error);
    }
});

/** DELETE /users/:username             Delete Specified User
 *
 *  If username is not found or nonAdmin user tries to delete another user => { error }
 *  If successful, the user's username is returned
 *
 *  Returns: { successful, deleted } or { error }
 *
 *  Authorization required: Logged in user or admin
*/
app.delete('/users/:username', ensureLoggedIn, ensureCorrectUserOrAdmin, async (req, res, next) => {
    try {
        const { username } = req.params;
        const deletedUser = await User.delete(username);

        return res.status(200).send({ success: true, deleted: deletedUser });
    }
    catch (error) {
        return next(error);
    };
});

/** PATCH /users/:username              Edit Specified User
 *
 *  JSON schema ensures properties are optional but will not accept unlisted properties
 *  If nonAdmin user tries to edit username or admin status => error
 *  If nonAdmin user tries to edit another users data => error
 *  If successful, returns username
 *
 *  Accepts: { username, password, firstName, lastName, email, isAdmin } - Can include any
 *  Returns: { success, modified } vs { error }
 *
 *  Authorization required: Logged in user or admin
*/
app.patch('/users/:username', ensureLoggedIn, ensureCorrectUserOrAdmin, async (req, res, next) => {
    try {
        const validator = jsonschema.validate(req.body, editUserSchema);
        if (!validator.valid) throw new BadRequestError('Invalid JSON properties');

        if ((req.body.username || req.body.isAdmin) && !res.locals.user.isAdmin) { // only admin can change username or admin status
            throw new UnauthorizedError('Admin required to make the requested changes');
        };
        const { username } = req.params;
        const result = await User.edit(username, req.body);

        return res.status(201).send({ success: true, modified: result });
    }
    catch (error) {
        return next(error);
    }
});

/** GET /users/:username/stats          Get Specified User's Game Stats
 *
 *  If username is not found or nonAdmin user tries to retrieve another user's stats => { error }
 *  If successful, the user's game stats are returned
 *
 *  Returns {success, gameStats} vs { error }
 *
 *  Authorization required: Logged in user or admin
 */
app.get('/users/:username/stats', ensureLoggedIn, ensureCorrectUserOrAdmin, async (req, res, next) => {
    try {
        const { username } = req.params;
        const gameStats = await User.getGameStats(username);

        return res.status(200).send({ success: true, gameStats: gameStats });
    }
    catch (error) {
        res.status(error.status).send({ success: false, error: error})
        return next(error);
    }
});

/** PATCH /users/:username/stats            Update Specified User's Game Stats
 *
 *  JSON schema ensures that all of the specified properties exist with no additional properties
 *  Other validators: gamesPlayed = 1, gamesWon 0 or 1, battlesWon is not > battles
 *  If user does not exist or nonAdmin user tries to change other users stats => error
 *  Retrieves user's existing stats from db and adds new stats to them before updating db
 *
 *  Accepts: { gamesPlayed: 1, gamesWon: 0 || 1, battles: >0, battlesWon: > or = to battles } - Must include all
 *  Returns: { success, modified } vs { error }

 *  Authorization required: Logged in user or admin
*/
app.patch('/users/:username/stats', ensureLoggedIn, ensureCorrectUserOrAdmin, async (req, res, next) => {
    try {
        const validator = jsonschema.validate(req.body, editUserStatsSchema);
        if (!validator.valid || (req.body.battlesWon > req.body.battles)) {
            throw new BadRequestError('Invalid JSON properties');
        };

        const { username } = req.params;
        const existingStats = await User.getGameStats(username);
        const newStats = req.body;

        const adjustedStats = {};
        for (let key in newStats) {
            adjustedStats[key] = existingStats[key] + newStats[key];
        };
        const result = await User.editGameStats(username, adjustedStats);

        return res.status(201).send({ success: true, modified: result });
    }
    catch (error) {
        return next(error);
    }
});

/** Handle 404 errors */
app.use(function (req, res, next) {
    return next(new NotFoundError());
});

/** Generic error handler; anything unhandled goes here. */
app.use(function (err, req, res, next) {
    if (process.env.NODE_ENV !== "test") console.error(err.stack);
    const status = err.status || 500;
    const message = err.message;

    return res.status(status).json({
        error: { message, status },
    });
});

module.exports = app;
