# Card War Game
Springboard software engineering bootcamp - Cohort Jan 2022
Project started Jan 2023

## Assignment
For a final capstone project I needed to incorporate an external API and create a full stack project. Games are more challenging than other projects and provide lots of opportunity for future features. I selected a free [Cards API](https://www.deckofcardsapi.com/) for this project and focused on experimenting/expanding my front end skills with this project.

## Technologies Used
- Node.js
- Express.js
- React.js
- React router
- HTML/CSS
- Jest testing
- JWT
- JSON validation
- Bcrypt
- Axios


## API Routes
    POST /user/register
**Requires:** {username, password, firstName, lastName, email}

**Returns:** { user: { username, firstName, lastName, email }, _token } or { error }

    POST /user/login
**Requires:** {username, password}

**Returns:** { user: { username, firstName, lastName, email }, _token } or { error }

## Scripts
To start server use:
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
