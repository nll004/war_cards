"use strict";

const SECRET_KEY = process.env.SECRET_KEY || "devKey@1092";
const JWT_OPTIONS = {expiresIn: 60 * 60 * 24 * 5}; // expiresIn: 5 days

module.exports = {
    SECRET_KEY, JWT_OPTIONS
};
