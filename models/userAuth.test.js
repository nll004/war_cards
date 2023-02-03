"use strict";

const {User} = require('./user');
const {seedTestDB, commonAfterAll} = require('../testSetup');
const { BadRequestError } = require('../expressErrors');

beforeAll(()=> {
    console.log('UserAuth tests BeforeAll ->', 'NODE_ENV ->', process.env.NODE_ENV);
    seedTestDB();
});
afterAll(()=> commonAfterAll());

// ============================ User Registration  ================================================

describe('User.register', function() {
    const newUser = {
        username: "newUser",
        password: 'unhashedPwd',
        email: "newUser@gmail.com",
        firstName: "New",
        lastName: 'User'
    };

    it('should register user and return user data minus password', async () => {
        expect.assertions(2);
        const userData = await User.register(newUser);
        expect(userData).toEqual({
                            email: "newUser@gmail.com",
                            firstName: "New",
                            lastName: "User",
                            username: "newUser",
                            isAdmin: false
                        });
        expect(userData).not.toHaveProperty('password');
    });

    it('should throw an error if username or email already exist', async () => {
        expect.assertions(1);
        try{
            await User.register(newUser); // repeat registering the newUser
            fail();
        } catch(err){
            expect(err instanceof Error).toBeTruthy();
        };
    });
});

// ================================= User Login ===================================================

describe('User.login', function(){
    it('returns error if no user is found', async function(){
        expect.assertions(2);
        try{
            await User.login('nullUser', 'password');
            fail();
        } catch(err) {
            expect(err instanceof BadRequestError).toBeTruthy();
            expect(err.message).toEqual('User not found');
        }
    });

    it('returns error if password is incorrect', async function(){
        expect.assertions(2);
        try{
            await User.login('testUser2', 'incorrectPwd');
            fail();
        } catch(err) {
            expect(err instanceof BadRequestError).toBeTruthy();
            expect(err.message).toEqual('Incorrect username/password');
        }
    });

    it('returns user data (minus password) if username and password is correct', async() => {
        expect.assertions(2);
        const userData = await User.login('testUser2', 'password');
        expect(userData).toEqual({
                            email: "testUser2@gmail.com",
                            firstName: "test",
                            lastName: "user",
                            username: "testUser2",
                            isAdmin: false
                        });
        expect(userData).not.toHaveProperty('password');
    });
})
