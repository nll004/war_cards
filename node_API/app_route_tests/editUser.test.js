"use strict";

const { commonAfterAll, seedTestDB } = require('../testSetup');
const request = require('supertest');
const app = require('../app');

describe('PATCH /users/:username', function () {
    beforeAll(() => console.log('User edit route tests ->', 'NODE_ENV ->', process.env.NODE_ENV));
    let nonAdminToken;
    let adminToken;
    beforeEach(async ()=> {
        await seedTestDB();
        const res = await request(app).post('/users/login').send({ username: 'testUser', password: "password" });
            nonAdminToken = res.body._token;
        const res2 = await request(app).post('/users/login').send({ username: 'adminUser', password: "password" });
            adminToken = res2.body._token;
    });
    afterAll(commonAfterAll);
    // -----------------------------------------------------------------------------------

    it('should return an error if nonAdmin tries to change username', async () => {
        expect.assertions(2);
        const res = await request(app).patch('/users/testUser')
                                       .set('authorization', `Bearer ${nonAdminToken}`)
                                       .send({username: 'hellosoaerh'});
        expect(res.statusCode).toEqual(401);
        expect(res.body).toEqual({  error: {
                                        message: "Admin required to make the requested changes",
                                        status: 401 }
                                    });
    });

    it('should return an error if nonAdmin tries to change admin status', async () => {
        expect.assertions(2);
        const res = await request(app).patch('/users/testUser')
                                       .set('authorization', `Bearer ${nonAdminToken}`)
                                       .send({isAdmin: true });
        expect(res.statusCode).toEqual(401);
        expect(res.body).toEqual({  error: {
                                        message: "Admin required to make the requested changes",
                                        status: 401 }
                                    });
    });

    it('should return an error if inaccurate properties are sent to route', async () => {
        expect.assertions(1);
        const res = await request(app).patch('/users/testUser')
                                       .set('authorization', `Bearer ${adminToken}`)
                                       .send({ notAValidKey: 'hi' });
        expect(res.body).toEqual({  error: {
                                        message: "Invalid JSON properties",
                                        status: 400
                                    }
        });
    });

    it('should work for user', async()=> {
        expect.assertions(3);
        const res = await request(app).patch('/users/testUser')
                                      .set('authorization', `Bearer ${nonAdminToken}`)
                                      .send({   firstName: 'myNewName',
                                                lastName: 'myNewLName',
                                                password: 'newPassword',
                                                email: "anotherEmail@gmail.com"});
        expect(res.statusCode).toEqual(201);
        expect(res.body).toEqual({ success: true, modified: { username: 'testUser' } });

        const res2 = await request(app).post('/users/login').send({ username: 'testUser', password: "newPassword" });
        expect(res2.body).toHaveProperty("user", {  username: 'testUser',
                                                    email: "anotherEmail@gmail.com",
                                                    firstName: 'myNewName',
                                                    lastName: 'myNewLName',
                                                    isAdmin: false
                                                });
    });

    it('should work for admin user', async()=> {
        expect.assertions(3);
        const res = await request(app).patch('/users/testUser')
                                      .set('authorization', `Bearer ${adminToken}`)
                                      .send({   firstName: 'usersNewName',
                                                lastName: 'usersNewLName',
                                                password: 'newPassword',
                                                email: "anotherEmail@gmail.com"});
        expect(res.statusCode).toEqual(201);
        expect(res.body).toEqual({ success: true, modified: { username: 'testUser' } });

        const res2 = await request(app).post('/users/login').send({ username: 'testUser', password: "newPassword" });
        expect(res2.body).toHaveProperty("user", {  username: 'testUser',
                                                    email: "anotherEmail@gmail.com",
                                                    firstName: 'usersNewName',
                                                    lastName: 'usersNewLName',
                                                    isAdmin: false
                                                });
    });
});
