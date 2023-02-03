"use strict";

const {User} = require('./user');
const {seedTestDB, commonAfterAll} = require('../testSetup');

beforeAll(()=> console.log('UserModel tests BeforeAll ->', 'NODE_ENV ->', process.env.NODE_ENV));
beforeEach(()=> seedTestDB());
afterAll(()=> commonAfterAll());

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
            fail();
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
            fail();
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
