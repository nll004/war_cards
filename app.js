"use strict";
const jsonschema = require('jsonschema');
const jwt = require('jsonwebtoken');
const express = require("express");
const app = express();

const {SECRET_KEY, JWT_OPTIONS} = require('./config');
const registerUserSchema = require('./jsonSchemas/registerUser.json')
const {User} = require('./models/user');

// Parse request bodies for JSON
app.use(express.json());

/** Route for registering new users */
app.post('/users', async function(req, res, next){
    try {
        const validator = jsonschema.validate(req.body, registerUserSchema);
        if (!validator.valid) {
          const errs = validator.errors.map(e => e.stack);
          throw new Error(errs);
        };
        const newUser = await User.register(req.body);
        const payload = {username: newUser.username};
        const token = jwt.sign(payload, SECRET_KEY, JWT_OPTIONS);
        return res.status(201).send({ user: newUser, _token: token });
    }
    catch (error){
        res.status(400).send({ error: error.message });
        return next(error);
    };
});


module.exports = app;
