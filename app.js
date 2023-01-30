"use strict";

const express = require("express");
const app = express();
const {User} = require('./models/user');

// Parse request bodies for JSON
app.use(express.json());

/** Route for registering new users */
app.post('/users', async function(req, res){
    // need JSON schema to validate json body content
    // all usernames should be lowercased?

    const userData = req.body;
    console.debug('POST /users --> Request body', userData);

    try{
        const user = await User.register(userData);
        return res.status(200).send(user);
    }catch(error){
        console.error(error);
        return res.status(400).send(error.message);
    };
});


module.exports = app;
