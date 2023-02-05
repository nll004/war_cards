"use strict";

const bcrypt = require('bcrypt');
const {User} = require('./user');
const {seedTestDB, commonAfterAll} = require('../testSetup');
const { BadRequestError } = require('../expressErrors');

beforeAll(()=> console.log('UserModel tests BeforeAll ->', 'NODE_ENV ->', process.env.NODE_ENV));
beforeEach(seedTestDB);
afterAll(commonAfterAll);

// ============================= Get User ========================================================

describe('User.get', function(){
    it('finds and returns user data including hashed password', async function(){
        expect.assertions(2);
        const user = await User.get('testUser2');
        expect(user).toEqual({
                          username: 'testUser2',
                          password: expect.any(String),
                          email: 'testUser2@gmail.com',
                          firstName: 'test',
                          lastName: 'user',
                          isAdmin: false
                        });
        expect(user.password).toContain('2b');
    });

    it('should throw error if no user is found', async function(){
        expect.assertions(2);
        try{
            await User.get('nullUser');
        } catch(err){
            expect(err instanceof Error).toBeTruthy();
            expect(err.message).toEqual('User not found');
        };
    });
});

// =============================== Delete User ======================================================

describe('User.delete', function() {
    it('should throw error if no user is found', async function () {
        expect.assertions(2);
        try {
            await User.delete('nullUser');
        } catch (err) {
            expect(err instanceof Error).toBeTruthy();
            expect(err.message).toEqual('User not found');
        };
    });

    it('should return a username if deletion was successful', async function () {
        expect.assertions(1);
        const res = await User.delete('testUser');
        expect(res).toEqual({username: 'testUser'});
    });
});

// ================================= Edit User =========================================================

describe('User.edit', function() {
    it('should throw error if no existing user is found', async function() {
        expect.assertions(2);
        try {
            await User.edit('nullUser');
        } catch (err) {
            expect(err instanceof Error).toBeTruthy();
            expect(err.message).toEqual('User not found');
        };
    });

    it('should throw error if email is not unique', async function(){
        expect.assertions(2);
        try {
            await User.edit('testUser', {firstName: 'newName', email: 'admin@gmail.com'});
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
            expect(err.message).toEqual('Username/email already exists');
        };
    });

    it('should return username once changes are successfully made', async function() {
        expect.assertions(2);
        const res = await User.edit('testUser', { firstName: 'newName', lastName: 'changedName', isAdmin: true });
        expect(res).toEqual({ username: 'testUser' });

        const userAfterEdit = await User.get('testUser');
        expect(userAfterEdit).toEqual({ username: 'testUser',
                                        email: 'testUser@gmail.com',
                                        firstName: 'newName',
                                        lastName: 'changedName',
                                        isAdmin: true,
                                        password: expect.any(String)
                                    });
    });

    it('should successfully change email if the email is unique', async function() {
        expect.assertions(1);
        await User.edit('testUser', { email: 'newEmail@gmail.com' });
        const userAfterEdit = await User.get('testUser');
        expect(userAfterEdit).toEqual({ username: 'testUser',
                                        email: 'newEmail@gmail.com',
                                        firstName: 'test',
                                        lastName: 'user',
                                        isAdmin: false,
                                        password: expect.any(String)
                                    });
    });

    it('should hash a new password if password is changed', async function() {
        await User.edit('testUser', { password: 'newPassword' });
        const {password} = await User.get('testUser');
        expect(await bcrypt.compare('newPassword', password)).toBeTruthy();
    });
});
