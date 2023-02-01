"use strict";
const jsonschema = require('jsonschema');
const jwt = require('jsonwebtoken');
const express = require("express");
const app = express();

const {SECRET_KEY, JWT_OPTIONS} = require('./config');
const registerUserSchema = require('./jsonSchemas/registerUser');
const loginUserSchema = require('./jsonSchemas/loginUser.json');
const {User} = require('./models/user');

// Parse request bodies for JSON
app.use(express.json());

/** Route for registering new users */

app.post('/users/register', async function(req, res, next){
    try {
        const validator = jsonschema.validate(req.body, registerUserSchema);
        if (!validator.valid) {
            throw new Error(validator.errors[0]);
        };

        const newUser = await User.register(req.body);

        if(newUser){
            const payload = {username: newUser.username};
            const token = jwt.sign(payload, SECRET_KEY, JWT_OPTIONS);
            return res.status(201).send({ user: newUser, _token: token });
        }
    }catch(error){
        res.status(400).send({ error: error.message });
        return next(error);
    };
});

app.post('/users/login', async function(req, res, next) {
    try{
        const validator = jsonschema.validate(req.body, loginUserSchema);
        if (!validator.valid) {
          throw new Error(validator.errors[0]);
        };

        const userData = await User.login(req.body.username, req.body.password);
        if(userData){
            const payload = {username: userData.username};
            const token = jwt.sign(payload, SECRET_KEY, JWT_OPTIONS);

            return res.status(200).send({ user: userData, _token: token});
        };
    } catch(error){
        res.status(400).send({ error: error.message});
        return next(error);
    }
});


module.exports = app;
