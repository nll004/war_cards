"use strict";

const {commonAfterAll, seedTestDB} = require('../testSetup');
const request = require('supertest');
const app = require('../app');

describe('GET /users/:username', function(){
    beforeAll(() => console.log('Get user route tests->', 'NODE_ENV ->', process.env.NODE_ENV));
    beforeEach(seedTestDB);
    afterAll(commonAfterAll);

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

        // try to get user data with user's token
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
