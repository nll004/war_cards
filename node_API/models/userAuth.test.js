"use strict";

const {User} = require('./user');
const {seedTestDB, commonAfterAll} = require('../testSetup');
const { BadRequestError } = require('../expressErrors');

beforeAll(()=> console.log('UserAuth tests->', 'NODE_ENV ->', process.env.NODE_ENV));
beforeEach(seedTestDB);
afterAll(commonAfterAll);

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

    it('should throw an error if username already exist', async () => {
        expect.assertions(2);
        try{
            await User.register({   username: "testUser",
                                    password: 'unhashedPwd',
                                    email: "nonExistingEmail@gmail.com",
                                    firstName: "New",
                                    lastName: 'User'
                                });
        } catch(err){
            expect(err instanceof Error).toBeTruthy();
            expect(err.message).toEqual("Username/email already exists");
        };
    });

    it('should throw an error if email already exist', async () => {
        expect.assertions(2);
        try{
            await User.register({   username: "nonExistingUser",
                                    password: 'unhashedPwd',
                                    email: "testUser@gmail.com",
                                    firstName: "New",
                                    lastName: 'User'
                                });
        } catch(err){
            expect(err instanceof Error).toBeTruthy();
            expect(err.message).toEqual("Username/email already exists");
        };
    });
});

// ================================= User Login ===================================================

describe('User.login', function(){
    it('returns error if no user is found', async function(){
        expect.assertions(2);
        try{
            await User.login('nullUser', 'password');
        } catch(err) {
            expect(err instanceof BadRequestError).toBeTruthy();
            expect(err.message).toEqual('Incorrect username/password');
        }
    });

    it('returns error if password is incorrect', async function(){
        expect.assertions(2);
        try{
            await User.login('testUser2', 'incorrectPwd');
        } catch(err) {
            expect(err instanceof BadRequestError).toBeTruthy();
            expect(err.message).toEqual('Incorrect username/password');
        }
    });

    it('returns user data (minus password) if username and password are correct', async() => {
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
