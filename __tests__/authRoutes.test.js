"use strict";
const {clearDB, commonAfterAll, seedTestDB} = require('../testSetup');
const request = require('supertest');
const app = require('../app');
const jwt = require('jsonwebtoken');

beforeAll(()=> {
    console.log('Reg/login Route tests BeforeAll ->', 'NODE_ENV ->', process.env.NODE_ENV)
    seedTestDB();
});
afterAll(commonAfterAll);


describe('POST /users', function() {
    const newUser = {
        username: "newUser20384",
        password: "password",
        firstName: "new",
        lastName: "user",
        email: "newUserEmail@gmail.com"
    };

    test('creates a new user and returns user and JWT', async function() {
        const res = await request(app).post('/users/register').send(newUser);
        expect(res.statusCode).toEqual(201);
        expect(res.body).toEqual({
                            user: {
                                username: "newUser20384",
                                firstName: "new",
                                lastName: "user",
                                email: "newUserEmail@gmail.com",
                            }, _token: expect.any(String)
        });
        const jwtPayload = jwt.decode(res.body._token);
        // JWT should contain expiration value
        expect(jwtPayload).toEqual({
                            username: "newUser20384",
                            exp: expect.any(Number),
                            iat: expect.any(Number)
                        });
        expect(jwtPayload.exp).toBeGreaterThan(jwtPayload.iat);
    });

    test('returns error if username/email already exists at signup', async function() {
        const res = await request(app).post('/users/register').send(newUser);
        expect(res.statusCode).toEqual(400);
        expect(res.body).toEqual({"error": "Username/email already exists"});
    });

    test('returns error if missing JSON data', async function() {
        const res = await request(app).post('/users/register')
                                      .send({
                                            username: "incompleteUser",
                                            firstName: "I forgot the rest of my data"
                                        });
            expect(res.statusCode).toEqual(400);
            expect(res.body).toEqual({error: expect.any(String)});
    });
});

describe('POST /users/login', function(){
    it('returns user data (minus password) with token', async function() {
        const res = await request(app).post('/users/login')
                                      .send({
                                        username: 'testUser',
                                        password: "password"
                                      });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            user: {
                username: "testUser",
                firstName: "test",
                lastName: "user",
                email: "testUser@gmail.com",
            }, _token: expect.any(String)
        });
    });

    it('returns error if incorrect username', async function() {
        const res = await request(app).post('/users/login').send({username: 'nullUser', password: "password"});
        expect(res.statusCode).toEqual(400);
        expect(res.body).toEqual({error: "User not found"});
    });

    it('returns error if incorrect password', async function() {
        const res = await request(app).post('/users/login').send({username: 'testUser', password: "incorrectPassword"});
        expect(res.statusCode).toEqual(400);
        expect(res.body).toEqual({error: "Incorrect username/password"});
    });

    it('returns error if missing username or password', async function() {
        const res = await request(app).post('/users/login').send({password: "IforgotToSendMyUsername"});
        expect(res.statusCode).toEqual(400);
        expect(res.body).toEqual({error: expect.any(String)});
    });
})
