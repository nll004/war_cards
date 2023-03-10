"use strict";

/** Middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressErrors");

/** Middleware: Authenticate JWT token.
 *
 *  If an auth bearer token is provided, verify it, and, if valid, store the token
 *  payload on res.locals (includes username, isAdmin and "exp"- token expiration field.)
 *
 *  It's not an error if no token was provided or if the token is not valid.
 */
function authenticateJWT(req, res, next) {
    try {
        const authHeader = req.headers && req.headers.authorization;

        if (authHeader) {
            const token = authHeader.replace(/^[Bb]earer /, "").trim();
            res.locals.user = jwt.verify(token, SECRET_KEY); // this also checks exp value
        }
        return next();
    } catch (err) {
        return next();
    }
};

/** Middleware to ensure a user must be logged in.
 *
 *  Looks for user in locals.user and confirms that the token is not expired
 *
 *  If not, raises Error.
 */
function ensureLoggedIn(req, res, next) {
    try {
        if (!res.locals.user) throw new UnauthorizedError();
        return next();
    } catch (err) {
        return next(err);
    }
};

/** Middleware to use when they must provide a valid token & be user matching
 *  username provided as route param.
 *
 *  If not, raises Unauthorized.
 */
function ensureCorrectUserOrAdmin(req, res, next) {
    try {
        const user = res.locals.user;
        if (user.username !== req.params.username && !user.isAdmin) {
            throw new UnauthorizedError();
        }
        return next();
    } catch (err) {
        return next(err);
    }
};

/** Middleware to use when they must be an admin user.
 *
 *  If not, raises Unauthorized.
 */
function ensureAdmin(req, res, next) {
    try {
        if (!res.locals.user || !res.locals.user.isAdmin) {
            throw new UnauthorizedError();
        }
        return next();
    } catch (err) {
        return next(err);
    }
};

module.exports = {
    authenticateJWT,
    ensureLoggedIn,
    ensureCorrectUserOrAdmin,
    ensureAdmin
};
