# Card War Game
I implemented War the card game, fetching cards from the [Cards API](https://www.deckofcardsapi.com/). This project consists of the [React frontend](https://github.com/nll004/war_cards/tree/main/react_UI) and an [Express.js API](https://github.com/nll004/war_cards/tree/main/node_API) that I built to handle CRUD operations for users and game stats. 

Try [WAR](https://war-battle.surge.sh/) out.

## Features
- Create new user
- Login/logout
- Can play with or without being logged in
- Being logged in stores statistics for user
- Edit users information including password

### Technologies Used
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
- PostgreSQL and PG driver

## Future Direction for Project
- Improve styling
- Include a random bet or max bet option for battles
- Include more stats (cards won, hands won, double battles, double battles won, etc.)
- Let user determine the amount of decks or if they want to play with
- Include an autodraw option
- Introduce a websocket for 2 player functionality
