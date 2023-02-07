"use strict";

const { commonAfterAll, seedTestDB } = require('../testSetup');
const request = require('supertest');
const app = require('../app');

describe('PATCH /users/:username/stats', function () {
    beforeAll(() => console.log('Edit game stats route tests ->', 'NODE_ENV ->', process.env.NODE_ENV));
    let nonAdminToken;
    let adminToken;
    beforeEach(async () => {
        await seedTestDB();
        const res = await request(app).post('/users/login').send({ username: 'testUser', password: "password" });
            nonAdminToken = res.body._token;
        const res2 = await request(app).post('/users/login').send({ username: 'adminUser', password: "password" });
            adminToken = res2.body._token;
    });
    afterAll(commonAfterAll);
    // -----------------------------------------------------------------------------------

    it('should return an error if token is invalid', async () => {
        expect.assertions(2);
        const res = await request(app).patch('/users/testUser/stats')
                                      .set('authorization', `Bearer incorrect token`);
        expect(res.statusCode).toEqual(401);
        expect(res.body).toEqual({ error: { message: "Unauthorized", status: 401 } });
    });

    it('should return an error if inaccurate properties are sent to route', async () => {
        expect.assertions(1);
        const res = await request(app).patch('/users/testUser/stats')
                                      .set('authorization', `Bearer ${adminToken}`)
                                      .send({ notAValidKey: 'hi' });
        expect(res.body).toEqual({ error: { message: "Invalid JSON properties", status: 400 } });
    });

    it('should return an error some properties are missing from JSON body', async () => {
        expect.assertions(1);
        const res = await request(app).patch('/users/testUser/stats')
                                      .set('authorization', `Bearer ${adminToken}`)
                                      .send({ gamesPlayed: 1, gamesWon: 1 });
        expect(res.body).toEqual({ error: { message: "Invalid JSON properties", status: 400 } });
    });

    it('should return an error if gamesPlayed property is not exactly 1', async () => {
        expect.assertions(1);
        const res = await request(app).patch('/users/testUser/stats')
                                      .set('authorization', `Bearer ${adminToken}`)
                                      .send({ gamesPlayed: 2, gamesWon: 1, battles: 5, battlesWon: 2 });
        expect(res.body).toEqual({ error: { message: "Invalid JSON properties", status: 400 } });
    });

    it('should return an error if battlesWon > battles', async () => {
        expect.assertions(1);
        const res = await request(app).patch('/users/testUser/stats')
                                      .set('authorization', `Bearer ${adminToken}`)
                                      .send({ gamesPlayed: 1, gamesWon: 1, battles: 5, battlesWon: 10 });
        expect(res.body).toEqual({ error: { message: "Invalid JSON properties", status: 400 } });
    });

    it("should return unAuth error if user tries to edit another user", async function () {
        expect.assertions(2);
        const res = await request(app).patch('/users/testUser2/stats')
                                      .set('authorization', `Bearer ${nonAdminToken}`);
        expect(res.statusCode).toEqual(401);
        expect(res.body).toEqual({ error: { message: "Unauthorized", status: 401 } });
    });

    it("should successfully add user's stats to existing stats if valid users token", async function () {
        expect.assertions(4);
        const statsBeforeChange = await request(app).get('/users/testUser/stats')
                                                    .set('authorization', `Bearer ${nonAdminToken}`);
        expect(statsBeforeChange.body).toEqual({success: true,
                                                gameStats: {
                                                    username: 'testUser',
                                                    gamesPlayed: 5,
                                                    gamesWon: 3,
                                                    battles: 16,
                                                    battlesWon: 10
                                                }
        });

        const res = await request(app).patch('/users/testUser/stats')
                                      .set('authorization', `Bearer ${nonAdminToken}`)
                                      .send({ gamesPlayed: 1, gamesWon: 1, battles: 19, battlesWon: 10 });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toEqual({ success: true, modified: { username: 'testUser' } });

        const statsAfterChange = await request(app).get('/users/testUser/stats')
                                                   .set('authorization', `Bearer ${nonAdminToken}`);
        expect(statsAfterChange.body).toEqual({ success: true,
                                                gameStats: {
                                                    username: 'testUser',
                                                    gamesPlayed: 6,
                                                    gamesWon: 4,
                                                    battles: 35,
                                                    battlesWon: 20
                                                }
        });
    });

    it("should successfully add user's stats to existing stats if valid admin token", async function () {
        expect.assertions(4);
        const statsBeforeChange = await request(app).get('/users/testUser/stats')
                                                    .set('authorization', `Bearer ${adminToken}`);
        expect(statsBeforeChange.body).toEqual({success: true,
                                                gameStats: {
                                                    username: 'testUser',
                                                    gamesPlayed: 5,
                                                    gamesWon: 3,
                                                    battles: 16,
                                                    battlesWon: 10
                                                }
        });

        const res = await request(app).patch('/users/testUser/stats')
                                      .set('authorization', `Bearer ${adminToken}`)
                                      .send({ gamesPlayed: 1, gamesWon: 1, battles: 19, battlesWon: 10 });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toEqual({ success: true, modified: { username: 'testUser' } });

        const statsAfterChange = await request(app).get('/users/testUser/stats')
                                                   .set('authorization', `Bearer ${adminToken}`)
        expect(statsAfterChange.body).toEqual({ success: true,
                                                gameStats: {
                                                    username: 'testUser',
                                                    gamesPlayed: 6,
                                                    gamesWon: 4,
                                                    battles: 35,
                                                    battlesWon: 20
                                                }
        });
    });
});
