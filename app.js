"use strict";
const jsonschema = require('jsonschema');
const express = require("express");
const app = express();

const {User} = require('./models/user');
const {createToken} = require('./helpers/tokens');
const registerUserSchema = require('./jsonSchemas/registerUser');
const loginUserSchema = require('./jsonSchemas/loginUser.json');
const editUserSchema = require('./jsonSchemas/editUser.json');
const { authenticateJWT, ensureLoggedIn, ensureCorrectUserOrAdmin } = require('./middleware/auths');
const { BadRequestError, UnauthorizedError } = require('./expressErrors');

// Parse request bodies for JSON
app.use(express.json());
app.use(authenticateJWT);

/** POST /users/register {user} => {user, _token}
 *
 * Registers a new user when given an object containing all of the following:
 * { username, password, firstName, lastName, email }
 *
 * If the username or password already exist in the database an error is returned.
 *
 * If request is successfully completed, the user (minus password) and a JWT are returned
 * */
app.post('/users/register', async function(req, res, next){
    try {
        const validator = jsonschema.validate(req.body, registerUserSchema);
        if (!validator.valid) throw new BadRequestError();

        const newUser = await User.register(req.body);
        const token = createToken(newUser);

        return res.status(201).send({ success: true, user: newUser, _token: token });
    }
    catch(error){
        return next(error);
    };
});

/** POST /users/login - {username,password} => {user, _token, success}
 *
 * Authenticates a user when give an object containing all of the following:
 * {username, password}
 *
 * If the username/password is incorrect or missing, returns {error}
 *
 * If the username and password is correct, returns user data and JWT
 */
app.post('/users/login', async function(req, res, next) {
    try{
        const validator = jsonschema.validate(req.body, loginUserSchema);
        if (!validator.valid) throw new BadRequestError();

        const userData = await User.login(req.body.username, req.body.password);
        const token = createToken(userData);

        return res.status(200).send({ success: true, user: userData, _token: token});
    }
    catch(error){
        return next(error);
    }
});

/** GET /users/:username
 *
 * Retrieve user data and user stats.
 *
 * Requires: Logged in user (Token)
 *
 * User's self or Admin can retrieve user data
 */
app.get('/users/:username', ensureLoggedIn, ensureCorrectUserOrAdmin, async (req, res, next) => {
    try{
        const {username} = req.params;
        const userData = await User.get(username);
        delete userData.password;

        return res.status(200).send({success: true, user: userData});
    }
    catch(error){
        return next(error);
    }
});

/** DELETE /users/:username
 *
 * Route for deleting user
 *
 * Requires: logged in user or admin
 *
 * Only user's self or admin can delete user
*/
app.delete('/users/:username', ensureLoggedIn, ensureCorrectUserOrAdmin, async (req, res, next) => {
    try {
        const { username } = req.params;
        const deletedUser = await User.delete(username);

        return res.status(200).send({success: true, deleted: deletedUser });
    }
    catch (error) {
        return next(error);
    };
});

/** PATCH /users/:username
 *
 *  Route for editing user information
 *
 *  Requires: logged in user
 *
 *  Only user's self or admin can edit data.
 *  Username and admin status is only able to be changed by admin
*/
app.patch('/users/:username', ensureLoggedIn, ensureCorrectUserOrAdmin, async function(req, res, next){
    try{
        const validator = jsonschema.validate(req.body, editUserSchema);
        if (!validator.valid) throw new BadRequestError('Invalid JSON properties');

        if ((req.body.username || req.body.isAdmin) && !res.locals.user.isAdmin) { // only admin can change username or admin status
            throw new UnauthorizedError('Admin required to make the requested changes');
        }
        const { username } = req.params;
        const result = await User.edit(username, req.body);
        return res.status(201).send({ success: true, modified: result});
    }
    catch(error){
        return next(error);
    }
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
