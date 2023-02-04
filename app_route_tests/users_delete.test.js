"use strict";
const { commonAfterAll, seedTestDB } = require('../testSetup');
const request = require('supertest');
const app = require('../app');

// ======================  DELETE /user/:username Route ====================================================
describe('DELETE /users/:username', function(){
    beforeAll(() => console.log('User delete route tests ->', 'NODE_ENV ->', process.env.NODE_ENV));
    beforeEach(seedTestDB);
    afterAll(commonAfterAll);

    it('should return an error if no token is provided', async () => {
        expect.assertions(2);
        const res = await request(app).delete('/users/testUser');
        expect(res.statusCode).toEqual(401);
        expect(res.body).toEqual({ error: { message: "Unauthorized", status: 401 } });
    });

    it('should return an error if token is invalid', async () => {
        expect.assertions(2);
        const res = await request(app).delete('/users/testUser')
                                      .set('authorization', `Bearer incorrect token`);
        expect(res.statusCode).toEqual(401);
        expect(res.body).toEqual({ error: { message: "Unauthorized", status: 401 } });
    });

    it("should fail to delete another user", async function () {
        expect.assertions(3);
        // get nonAdmin user token first
        const res = await request(app).post('/users/login')
                                      .send({ username: 'testUser', password: "password" });
        expect(res.body._token).toEqual(expect.any(String));

        // fail to delete another user
        const res2 = await request(app).delete('/users/testUser2')
                                       .set('authorization', `Bearer ${res.body._token}`);
        expect(res2.statusCode).toEqual(401);
        expect(res2.body).toEqual({ error: { message: "Unauthorized", status: 401 } });
    });

    it("should return deleted username if user deletes successfully", async function () {
        expect.assertions(3);
        // get nonAdmin user token first
        const res = await request(app).post('/users/login')
                                      .send({ username: 'testUser', password: "password" });
        expect(res.body._token).toEqual(expect.any(String));

        // should delete user's self with valid token
        const res2 = await request(app).delete('/users/testUser')
                                       .set('authorization', `Bearer ${res.body._token}`);
        expect(res2.statusCode).toEqual(200);
        expect(res2.body).toEqual({ success: true, deleted: { username: 'testUser' } })
    });

    it("should return deleted username when admin deletes", async function () {
        expect.assertions(3);
        // get nonAdmin user token first
        const res = await request(app).post('/users/login')
                                      .send({ username: 'adminUser', password: "password" });
        expect(res.body._token).toEqual(expect.any(String));

        // should delete user's self with valid token
        const res2 = await request(app).delete('/users/testUser')
                                       .set('authorization', `Bearer ${res.body._token}`);
        expect(res2.statusCode).toEqual(200);
        expect(res2.body).toEqual({ success: true, deleted: { username: 'testUser' } })
    });
});
