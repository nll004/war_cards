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
