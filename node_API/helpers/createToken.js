const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

// expiresIn: set expiration date to 5 days
const JWT_OPTIONS = { expiresIn: 60 * 60 * 24 * 5 };

/** Returns a signed JWT with encoded username, isAdmin and expiration values.
 *
 *  Requires an object containing username and isAdmin(optional) properties.
 *
 *  It sets an expiration value to 5 days from token initialization.
*/
function createToken({username, isAdmin=false}) {
    const payload = {
                username: username,
                isAdmin: isAdmin
              };

    return jwt.sign(payload, SECRET_KEY, JWT_OPTIONS);
};

module.exports = createToken;
