"use strict";

const checkIfUsernameOrEmailExists = require('./checkSQL');
const { seedTestDB, commonAfterAll } = require('../testSetup');
const { BadRequestError } = require('../expressErrors');

beforeAll(() => console.log('checkForExistingUsernameOrEmail helper tests ->', 'NODE_ENV ->', process.env.NODE_ENV));
beforeEach(seedTestDB);
afterAll(commonAfterAll);

// ============== Check For Existing Username Or Email Helper Function ===========================

describe('checkForExistingUsernameOrEmail helper function', function () {
    it('should throw Error if username already exists in database', async () => {
        expect.assertions(2);
        try {
            await checkIfUsernameOrEmailExists('nonExistentEmail@gmail.com', 'testUser');
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
            expect(err.message).toEqual('Username/email already exists');
        };
    });

    it('should throw Error if email already exists in database', async () => {
        expect.assertions(2);
        try {
            await checkIfUsernameOrEmailExists('testUser@gmail.com', 'nullUser');
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
            expect(err.message).toEqual('Username/email already exists');
        };
    });

    it('should return without throwing an error if username/email is not found', async () => {
        expect.assertions(1);
        await expect(checkIfUsernameOrEmailExists('nonExistentEmail@gmail.com', 'nullUser'))
            .resolves.toBe(false);
    });
});
