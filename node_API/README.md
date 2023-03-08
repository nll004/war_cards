# War Cards API

This API was developed to support my implementation of the [WAR](https://github.com/nll004/war_cards) cards game. It provides CRUD operations for users as well as retrieving and updating game stats for users.

### Technologies Used
- Node.js
- Express.js
- JEST testing
- JWT
- JSON validation
- Bcrypt password hashing
- Axios
- PostgreSQL and PG driver

## API Routes

### Base Url

    https://war.herokuapp.com/

### Register new user and get token

    POST /user/register

**Requires:** - Request Body 
``` 
{
    username, 
    password, 
    firstName, 
    lastName, 
    email
}
```

**Returns:** 
```
{ 
    user: { 
        username, 
        firstName, 
        lastName, 
        email 
        }, 
    _token, 
    success 
} 
```
Checks for existing username/email and hashes password before storing new user. Returns a success boolean, user data (minus password) and a JWT with expiration value, admin boolean and username or an error.

### User login and get token

    POST /user/login

**Requires:** - Request Body 
```
{
    username, 
    password
}
```
**Returns:** 
```
{ 
    user: { 
        username, 
        firstName, 
        lastName, 
        email 
       }, 
    success, 
    _token 
}
```
Checks username and password against hashed password. If username/password combination is correct, returns a success boolean, user data (minus password) and a JWT with expiration value, admin boolean and username vs an error.

### Get user info

    GET /user/:username

**Requires:** - Headers
```
{
    authorization: "Bearer <tokenString>"
}
```
**Returns**: 
```
{ 
    user: { 
        username, 
        firstName, 
        lastName, 
        email 
       }, 
    success, 
    _token 
}
``` 
If token is provided correctly and validated, returns a success boolean and user data (minus password) or { error }

### Edit user info

    PATCH /user/:username

**Requires:** - Headers and Request Body

*Headers*
```
{
    authorization: "Bearer <tokenString>"
}
```
*Request Body* - can include any of the following
```
{
    username, 
    password, 
    firstName, 
    lastName, 
    email, 
    isAdmin 
} 
```
Only admin users can alter admin status of other users.

**Returns** 
```
{ 
    success, 
    modified : {
                  username
                }
}
```
If token is validated and user has permissions to make changes, route checks if the provided email already exists before making changes and hashes any new password before storing the edited information. Returns a success boolean and modified object with user's username.

### Delete user

    DELETE /user/:username

**Requires:** - Headers

*Headers* 
```
{
    authorization: "Bearer <tokenString>"
}
```
**Returns**: 
```
{ 
    success, 
    deleted: { 
                username 
             } 
}
```
If token is provided correctly and validated, returns a success boolean and deleted object with user's username

### Get user stats

    GET /user/:username/stats

**Requires:** - Headers
```
{
    authorization: "Bearer <tokenString>"
}
```
**Returns**: 
```
{ 
    success, 
    gameStats: { 
                  username, 
                  gamesPlayed, 
                  gamesWon, 
                  battles, 
                  battlesWon 
                } 
}
```
Route validates token and if user has permissions to retrieve user. Returns success boolean and gameStats object if successful.

### Edit user stats

    PATCH /user/:username/stats

**Requires:** - Headers and Request Body

*Headers* 
```
{
    authorization: "Bearer <tokenString>"
}
```
*Request Body* - Must include all properties as described with no additional properties
```
{ 
    gamesPlayed: 1, 
    gamesWon: 0 or 1, 
    battles: >0, 
    battlesWon: (> or = to battles) 
}
```
**Returns**: 
```
{ 
    success, 
    modified: { 
                username 
              } 
}
```
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
