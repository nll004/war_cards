"use strict";
const { commonAfterAll, clearDB } = require('../testSetup');
const request = require('supertest');
const app = require('../app');
const jwt = require('jsonwebtoken');

describe('POST /users/register', function () {
    beforeAll(() => {
        console.log('User register route tests ->', 'NODE_ENV ->', process.env.NODE_ENV);
        clearDB();
    });
    afterAll(commonAfterAll);

    const newUser = {
        username: "newUser20384",
        password: "password",
        firstName: "new",
        lastName: "user",
        email: "newUserEmail@gmail.com"
    };

    test('creates a new user and returns user and JWT', async function () {
        expect.assertions(4);
        const res = await request(app).post('/users/register').send(newUser);
        expect(res.statusCode).toEqual(201);
        expect(res.body).toEqual({
            success: true,
            _token: expect.any(String),
            user: {
                username: "newUser20384",
                firstName: "new",
                lastName: "user",
                email: "newUserEmail@gmail.com",
                isAdmin: false
            }
        });
        const jwtPayload = jwt.decode(res.body._token);
        // JWT should contain expiration value
        expect(jwtPayload).toEqual({
            username: "newUser20384",
            exp: expect.any(Number),
            iat: expect.any(Number),
            isAdmin: false
        });
        expect(jwtPayload.exp).toBeGreaterThan(jwtPayload.iat);
    });

    test('returns error if username/email already exists at signup', async function () {
        expect.assertions(2);
        const res = await request(app).post('/users/register').send(newUser);
        expect(res.statusCode).toEqual(400);
        expect(res.body).toEqual({  error: {
                                        message: "Username/email already exists",
                                        status: 400
                                    }
        });
    });

    test('returns error if missing JSON data', async function () {
        expect.assertions(2);
        const res = await request(app).post('/users/register')
                                      .send({
                                          username: "incompleteUser",
                                          firstName: "I forgot the rest of my data"
                                      });
        expect(res.statusCode).toEqual(400);
        expect(res.body).toEqual({  error: {
                                        message: "Bad Request",
                                        status: 400
                                    }
        });
    });
});
