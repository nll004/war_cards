"use strict";
const {commonAfterAll, seedTestDB} = require('./testSetup');
const request = require('supertest');
const app = require('./app');
const jwt = require('jsonwebtoken');

beforeAll(()=> {
    console.log('Reg/login Route tests BeforeAll ->', 'NODE_ENV ->', process.env.NODE_ENV)
    seedTestDB();
});
afterAll(commonAfterAll);

// ======================  POST /users/register Route ====================================================

describe('POST /users/register', function() {
    const newUser = {
        username: "newUser20384",
        password: "password",
        firstName: "new",
        lastName: "user",
        email: "newUserEmail@gmail.com"
    };

    test('creates a new user and returns user and JWT', async function() {
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

    test('returns error if username/email already exists at signup', async function() {
        expect.assertions(2);
        const res = await request(app).post('/users/register').send(newUser);
        expect(res.statusCode).toEqual(400);
        expect(res.body).toEqual({ error: {
                                        message: "Username/email already exists",
                                        status: 400
                                    }
                                });
    });

    test('returns error if missing JSON data', async function() {
        expect.assertions(2);
        const res = await request(app).post('/users/register')
                                      .send({
                                            username: "incompleteUser",
                                            firstName: "I forgot the rest of my data"
                                        });
            expect(res.statusCode).toEqual(400);
            expect(res.body).toEqual({ error: {
                                            message: "Bad Request",
                                            status: 400
                                        }
                                    });
    });
});

// ======================  POST /users/login Route ====================================================

describe('POST /users/login', function(){
    it('returns user data (minus password) with token', async function() {
        const res = await request(app).post('/users/login')
                                      .send({
                                        username: 'testUser',
                                        password: "password"
                                      });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
                            success: true,
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

    it('returns error if incorrect username', async function() {
        const res = await request(app).post('/users/login').send({username: 'nullUser', password: "password"});
        expect(res.statusCode).toEqual(400);
        expect(res.body).toEqual({error: {
                                        message: "User not found",
                                        status: 400
                                    }
                                });
    });

    it('returns error if incorrect password', async function() {
        const res = await request(app).post('/users/login').send({username: 'testUser', password: "incorrectPassword"});
        expect(res.statusCode).toEqual(400);
        expect(res.body).toEqual({ error: {
                                        message: "Incorrect username/password",
                                        status: 400
                                    }
                                });
    });

    it('returns error if missing username or password', async function() {
        const res = await request(app).post('/users/login').send({password: "IforgotToSendMyUsername"});
        expect(res.statusCode).toEqual(400);
        expect(res.body).toEqual({error: {
                                        message: "Bad Request",
                                        status: 400
                                    }
                                });
    });
});

// ======================  GET /users/:username Route ====================================================

describe('GET /users/:username', function(){
    it('should return an error if no token is provided', async()=>{
        expect.assertions(2);
        const res = await request(app).get('/users/testUser');
        expect(res.statusCode).toEqual(401);
        expect(res.body).toEqual({ error: { message: "Unauthorized", status: 401 }});
    });

    it('should return an error if token is invalid', async()=>{
        expect.assertions(2);
        const res = await request(app).get('/users/testUser')
                                      .set('authorization', `Bearer incorrect token`);
        expect(res.statusCode).toEqual(401);
        expect(res.body).toEqual({ error: { message: "Unauthorized", status: 401 }});
    });

    it("should return user's data to user's self if token is valid", async function(){
        expect.assertions(3);
        // get nonAdmin user token first
        const res = await request(app).post('/users/login')
                                      .send({ username: 'testUser', password: "password" });
        expect(res.body._token).toEqual(expect.any(String));

        // try to get user data with token
        const res2 = await request(app).get('/users/testUser').set('authorization', `Bearer ${res.body._token}`);
        expect(res2.statusCode).toEqual(200);
        expect(res2.body).toEqual({ success: true,
                                    user: { email: "testUser@gmail.com",
                                            firstName: 'test',
                                            lastName: 'user',
                                            username: 'testUser',
                                            isAdmin: false
                                        }
                                });
    });

    it("should return user's data to admin user if token is valid", async function(){
        expect.assertions(3);
        // get admin user token first
        const res = await request(app).post('/users/login')
                                      .send({ username: 'adminUser', password: "password" });
        expect(res.body._token).toEqual(expect.any(String));

        // try to get user data with admin token
        const res2 = await request(app).get('/users/testUser').set('authorization', `Bearer ${res.body._token}`);
        expect(res2.statusCode).toEqual(200);
        expect(res2.body).toEqual({ success: true,
                                    user: {
                                        email: "testUser@gmail.com",
                                        firstName: 'test',
                                        lastName: 'user',
                                        username: 'testUser',
                                        isAdmin: false
                                    }
                                });
    });
});

// ======================  DELETE /user/:username Route ====================================================
