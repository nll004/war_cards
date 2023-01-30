"use strict";

process.env.NODE_ENV = 'test';

const {User, checkIfUsernameOrEmailExists} = require('./user');
const {commonBeforeAll, commonAfterAll} = require('./testSetup');

beforeAll(() => {
    console.log('BeforeAll ->', 'NODE_ENV ->', process.env.NODE_ENV);
    commonBeforeAll();
});

afterAll(() => {
    commonAfterAll();
});

// ============== Check For Existing Username Or Email ==============================================

describe('checkForExistingUsernameOrEmail function', function() {
    it('should throw Error if username already exists in database', async () => {
        try {
            await checkIfUsernameOrEmailExists('testuser', 'nonExistentEmail@gmail.com');
        } catch (err) {
            expect(err instanceof Error).toBeTruthy();
        };
    });

    it('should be case insensitive and still throw Error if user is found', async() =>{
        try {
            await checkIfUsernameOrEmailExists('testUser', 'nonExistentEmail@gmail.com');
        } catch (err) {
            expect(err instanceof Error).toBeTruthy();
        };
    });

    it('should throw Error if email already exists in database', async () => {
        try {
            await checkIfUsernameOrEmailExists('nullUser', 'testUser@gmail.com');
        } catch (err) {
            expect(err instanceof Error).toBeTruthy();
        };
    });

    it('should return without throwing an error if username/email is not found', async () => {
        await expect(checkIfUsernameOrEmailExists('nullUser', 'nonExistentEmail@gmail.com'))
            .resolves.toBe(undefined);
    });
});

// ============================ User Registration  ==================================================

describe('User.register', function() {
    const newUser = {
        username: "newUser",
        password: 'unhashedPwd',
        email: "newUser@gmail.com",
        firstName: "New",
        lastName: 'User'
    };

    it('should register user as expected', async () => {
        expect(await User.register(newUser)).toEqual({
                            email: "newUser@gmail.com",
                            firstName: "New",
                            lastName: "User",
                            password: expect.stringContaining('$2b'),
                            username: "newuser",
                      });
    });
    it('should throw an error if username or email already exist', async () => {
        try{
            await User.register(newUser); // repeat registering the newUser
        } catch(err){
            expect(err instanceof Error).toBeTruthy();
        };
    });
});

// ============================== User Retrieval ===================================================
