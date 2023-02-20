# War Cards API

This API was developed to serve my implementation of the WAR cards game. It provides CRUD operations for users as well as retrieving and updating game stats for users.

This API was created with:
- Node.js
- Express.js
- JEST testing
- JWT
- JSON validation
- Bcrypt password hashing
- Axios
- PostgreSQL and PG driver

## API Routes

### Register new user and get token

    POST /user/register

**Requires:**

Body - {username, password, firstName, lastName, email}

**Returns:** 

{ user: { username, firstName, lastName, email }, _token, success } or { error }

Route checks for existing username/email and hashes password before storing new user. Returns a success boolean, user data (minus password) and a JWT with expiration value, admin boolean and username.

### User login and get token

    POST /user/login

**Requires:**

Body - {username, password}

**Returns:** 

{ success, user: { username, firstName, lastName, email }, _token } or { error }

Route checks username and password against hashed password. If username/password combination is correct, returns a success boolean, user data (minus password) and a JWT with expiration value, admin boolean and username

### Get user info

    GET /user/:username

**Requires:**

Headers - authorization: "Bearer tokenString"

**Returns**: 

{ success, user: { username, firstName, lastName, email }, _token } or { error }

If token is provided correctly and validated, returns a success boolean and user data (minus password)

### Edit user info

    PATCH /user/:username

**Requires:**

Headers - authorization: "Bearer tokenString"

Body - 

{ username, password, firstName, lastName, email, isAdmin } - Can include any

Only admin users can alter admin status of other users.

**Returns** 

{ success, modified : {username} } vs { error }

If token is validated and user has permissions to make changes, route checks if the provided email already exists before making changes and hashes any new password before storing the edited information. Returns a success boolean and modified object with user's username.

### Delete user

    DELETE /user/:username

**Requires:**

Headers - authorization: "Bearer tokenString"

**Returns**: 

{ success, deleted: { username } } or { error }

If token is provided correctly and validated, returns a success boolean and deleted object with user's username

### Get user stats

    GET /user/:username/stats

**Requires:**

Headers - authorization: "Bearer tokenString"

**Returns**: 

{ success, gameStats: { username, gamesPlayed, gamesWon, battles, battlesWon } } or { error }

Route validates token and if user has permissions to retrieve user. Returns success boolean and gameStats object if successful.

### Edit user stats

    PATCH /user/:username/stats

**Requires:**

Headers - authorization: "Bearer tokenString"

Body - { gamesPlayed: 1, gamesWon: 0 or 1, battles: >0, battlesWon: > or = to battles }- Must include all properties as described with no additional properties

**Returns**: 

{ success, modified: { username : 'usersName' } or { error }

Route validates token and if the user has permissions to edit stats. Then increments existing stats by the amount received via request before restoring in database.

<br>

## Scripts
To start server:
```js
npm start
```

To start server for development use:
```js
npm run dev
```

To run tests:
```js
npm test      // run all tests
npm test fileName.test.js  // test specific file
```
