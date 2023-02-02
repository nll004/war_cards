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
        const verifiedUser = jwt.verify(token, SECRET_KEY);
        if (verifiedUser.exp < currentTime) {
            throw new UnauthorizedError('Login credentials have expired. Please log in again');
        }
        res.locals.user = verifiedUser;
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
    console.log('EnsureLoggedIn', res.locals.user)
    try {
      if (!res.locals.user) throw new UnauthorizedError();
      return next();
    } catch (err) {
      return next(err);
    }
  };


  /** Middleware to use when they be logged in as an admin user.
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

  /** Middleware to use when they must provide a valid token & be user matching
   *  username provided as route param.
   *
   *  If not, raises Unauthorized.
   */

  function ensureCorrectUserOrAdmin(req, res, next) {
    try {
      const user = res.locals.user;
      if (!(user && (user.isAdmin || user.username === req.params.username))) {
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
    ensureAdmin,
    ensureCorrectUserOrAdmin,
  };
