![war-logo (2)](https://user-images.githubusercontent.com/96667141/222450728-db5b8f36-fcb2-4c56-920c-b047463a1c40.png)

I implemented War the card game, fetching cards from the [Cards API](https://www.deckofcardsapi.com/). This project consists of the [React frontend](https://github.com/nll004/war_cards/tree/main/react_UI) and an [Express.js API](https://github.com/nll004/war_cards/tree/main/node_API) that I built to handle CRUD operations for users and game stats. 

## Table of Contents
- [Features](#features)
  - [Game Play](#game-play)
  - [Register New User](#register-new-users)
  - [Login/Logout](#user-login-logout)
  - [User Profile](#player-profile)
- [Technologies Used](#technologies-used)
- [Future Direction](#future-direction-for-project)

## Features

### Game Play
Register and log in to track your stats or play as a guest. 

https://user-images.githubusercontent.com/96667141/222455927-ddfb71bb-0f3d-4e25-b48b-c71253cb2846.mp4

### Register new users
Register and send game stats to my [Express.js API](https://github.com/nll004/war_cards/tree/main/node_API) with JWT for validation.

https://user-images.githubusercontent.com/96667141/222469671-448c84ea-49c9-483f-9e72-0cb32f366725.mp4

### User Login Logout

https://user-images.githubusercontent.com/96667141/222470659-f290cb30-1294-4c15-b971-828b46c4bbe1.mp4

### Player Profile
View player statitics and edit user information when logged in

https://user-images.githubusercontent.com/96667141/222468275-d0c2c16f-ded1-4148-844f-4b884f6d2c0e.mp4

### Technologies Used
- Node.js
- Express.js
- React.js
- React router
- HTML/CSS
- Reactstrap
- Jest testing
- JWT
- JSON validation
- Bcrypt
- Axios
- PostgreSQL and PG driver

## Future Direction for Project
- Improve styling and animations
- Include a random bet or max bet option for battles
- Introduce more stats (cards won, hands won, double battles, double battles won, etc.)
- Include an autodraw option
- Allow user to select the card images they want to play with as well as the table design
- Introduce a websocket for 2 player functionality
