"use strict";
const jsonschema = require('jsonschema');
const express = require("express");
const app = express();

const {User} = require('./models/user');
const {createToken} = require('./helpers/tokens');
const registerUserSchema = require('./jsonSchemas/registerUser');
const loginUserSchema = require('./jsonSchemas/loginUser.json');
const { authenticateJWT, ensureLoggedIn, ensureCorrectUserOrAdmin } = require('./middleware/auths');
const { BadRequestError } = require('./expressErrors');

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

/** POST /users/login - {username,password} => {user, _token}
 *
 * Authenticates a user when give an object containing all of the following:
 * {username, password}
 *
 * * If the username/password is incorrect or missing, returns {error}
 *
 * If the username and password is correct, returns user data and JWT
 * {user: {username, email, firstName, lastName}, _token}
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
 * Token is required for authentication and ensure user is logged in
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
