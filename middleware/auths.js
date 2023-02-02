"use strict";

/** Middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressErrors");

/** Middleware: Authenticate user.
 *
 * If a token is provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) {
    try {
        const authHeader = req.headers && req.headers.authorization;
        const currentTime = Math.floor(Date.now() / 1000);

        if (authHeader) {
            const token = authHeader.replace(/^[Bb]earer /, "").trim();
            res.locals.user = jwt.verify(token, SECRET_KEY);
        }
        return next();
    } catch (err) {
        return next();
    }
};

/** Middleware to ensure a user must be logged in.
 *
 * If not, raises Error.
 */

function ensureLoggedIn(req, res, next) {
    try {
        if (!res.locals.user) throw new UnauthorizedError();

        const currentTime = Math.floor(Date.now() / 1000);
        if (res.locals.user.exp < currentTime) {
            throw new UnauthorizedError('Login credentials have expired. Please log in again');
        };
        return next();
    } catch (err) {
        return next(err);
    }
};

module.exports = {
    authenticateJWT,
    ensureLoggedIn
};
