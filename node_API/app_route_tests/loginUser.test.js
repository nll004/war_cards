"use strict";

const { commonAfterAll, seedTestDB } = require('../testSetup');
const request = require('supertest');
const app = require('../app');

describe('POST /users/login', function () {
    beforeAll(() => console.log('User login route tests ->', 'NODE_ENV ->', process.env.NODE_ENV));
    beforeEach(seedTestDB);
    afterAll(commonAfterAll);

    it('returns user data (minus password) with token', async function () {
        const res = await request(app).post('/users/login')
                                      .send({
                                          username: 'testUser',
                                          password: "password"
                                      });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({  success: true,
                                    _token: expect.any(String),
                                    user: {
                                        username: "testUser",
                                        firstName: "test",
                                        lastName: "user",
                                        email: "testUser@gmail.com",
                                        isAdmin: false
                                    }
        });
    });

    it('returns error if incorrect username', async function () {
        const res = await request(app).post('/users/login').send({ username: 'nullUser', password: "password" });
        expect(res.statusCode).toEqual(400);
        expect(res.body).toEqual({  error: {
                                        message: "Incorrect username/password",
                                        status: 400
                                    }
        });
    });

    it('returns error if incorrect password', async function () {
        const res = await request(app).post('/users/login').send({ username: 'testUser', password: "incorrectPassword" });
        expect(res.statusCode).toEqual(400);
        expect(res.body).toEqual({  error: {
                                        message: "Incorrect username/password",
                                        status: 400
                                    }
        });
    });

    it('returns error if missing username or password', async function () {
        const res = await request(app).post('/users/login').send({ password: "IforgotToSendMyUsername" });
        expect(res.statusCode).toEqual(400);
        expect(res.body).toEqual({  error: {
                                        message: "Bad Request",
                                        status: 400
                                    }
        });
    });
});
