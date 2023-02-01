"use strict";
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('./app');
const jwt = require('jsonwebtoken');
const {db} = require('./db');

beforeAll(async()=> {
    console.log('BeforeAll App.test.js ->', 'NODE_ENV ->', process.env.NODE_ENV);
    await db.query('Delete FROM users');
});
beforeEach(async() => await db.query('Delete FROM users'));
afterAll(async()=> await db.end());


describe('POST /users', function() {
    const newUser = {
        username: "newUser20384",
        password: "password",
        firstName: "new",
        lastName: "user",
        email: "newUserEmail@gmail.com"
    };

    test('creates a new user and returns user and JWT', async function() {
        const res = await request(app).post('/users').send(newUser);
        expect(res.statusCode).toEqual(201);
        expect(res.body).toEqual({
                            user: {
                                username: "newUser20384",
                                firstName: "new",
                                lastName: "user",
                                email: "newUserEmail@gmail.com",
                            }, _token: expect.any(String)
        });
    });

    test('JWT contains username and expiration value', async function(){
        const res = await request(app).post('/users').send(newUser);
        const jwtPayload = jwt.decode(res.body._token);
        expect(jwtPayload).toEqual({
                                username: "newUser20384",
                                exp: expect.any(Number),
                                iat: expect.any(Number)
                            });
        expect(jwtPayload.exp).toBeGreaterThan(jwtPayload.iat);
    });

    test('returns error if username/email already exists at signup', async function() {
        await request(app).post('/users').send(newUser);
        // sign the same user up again
        const res = await request(app).post('/users').send(newUser);
        expect(res.statusCode).toEqual(400);
        expect(res.body).toEqual({"error": "Username/email already exists"});
    });

    test('returns error if missing JSON data', async function() {
        const res = await request(app).post('/users')
                                      .send({
                                            username: "incompleteUser",
                                            firstName: "I forgot the rest of my data"
                                        });
            expect(res.statusCode).toEqual(400);
            expect(res.body).toEqual({error: expect.any(String)});
    });
});
