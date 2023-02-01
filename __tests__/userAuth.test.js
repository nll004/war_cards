"use strict";

const {User, checkIfUsernameOrEmailExists} = require('../models/user');
const {seedTestDB, commonAfterAll} = require('../testSetup');

beforeAll(()=> {
    console.log('UserAuth tests BeforeAll ->', 'NODE_ENV ->', process.env.NODE_ENV);
    seedTestDB();
});
afterAll(()=> commonAfterAll());


// ============== Check For Existing Username Or Email Helper Function ===========================

describe('checkForExistingUsernameOrEmail helper function', function() {
    it('should throw Error if username already exists in database', async () => {
        try {
            await checkIfUsernameOrEmailExists('testUser', 'nonExistentEmail@gmail.com');
            fail();
        } catch (err) {
            expect(err instanceof Error).toBeTruthy();
        };
    });

    it('should throw Error if email already exists in database', async () => {
        try {
            await checkIfUsernameOrEmailExists('nullUser', 'testUser@gmail.com');
            fail();
        } catch (err) {
            expect(err instanceof Error).toBeTruthy();
        };
    });

    it('should return without throwing an error if username/email is not found', async () => {
        await expect(checkIfUsernameOrEmailExists('nullUser', 'nonExistentEmail@gmail.com'))
                    .resolves.toBe(undefined);
    });
});

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
        const userData = await User.register(newUser);
        expect(userData).toEqual({
                            email: "newUser@gmail.com",
                            firstName: "New",
                            lastName: "User",
                            username: "newUser",
                        });
        expect(userData).not.toHaveProperty('password');
    });

    it('should throw an error if username or email already exist', async () => {
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
        try{
            await User.login('nullUser', 'password');
            fail();
        } catch(err) {
            expect(err instanceof Error).toBeTruthy();
            expect(err.message).toEqual('User not found');
        }
    });

    it('returns error if password is incorrect', async function(){
        try{
            await User.login('testUser2', 'incorrectPwd');
            fail();
        } catch(err) {
            expect(err instanceof Error).toBeTruthy();
            expect(err.message).toEqual('Incorrect username/password');
        }
    });

    it('returns user data (minus password) if username and password is correct', async() => {
        const userData = await User.login('testUser2', 'password');
        expect(userData).toEqual({
                            email: "testUser2@gmail.com",
                            firstName: "test",
                            lastName: "user",
                            username: "testUser2",
                        });
        expect(userData).not.toHaveProperty('password');
    });
})
