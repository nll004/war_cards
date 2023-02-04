"use strict";

const checkIfUsernameOrEmailExists = require('./checkSQL');
const { seedTestDB, commonAfterAll } = require('../testSetup');
const { BadRequestError } = require('../expressErrors');

beforeAll(seedTestDB);
afterAll(commonAfterAll);

// ============== Check For Existing Username Or Email Helper Function ===========================

describe('checkForExistingUsernameOrEmail helper function', function () {
    it('should throw Error if username already exists in database', async () => {
        expect.assertions(1);
        try {
            await checkIfUsernameOrEmailExists('nonExistentEmail@gmail.com', 'testUser');
            fail();
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        };
    });

    it('should throw Error if email already exists in database', async () => {
        expect.assertions(1);
        try {
            await checkIfUsernameOrEmailExists('testUser@gmail.com', 'nullUser');
            fail();
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        };
    });

    it('should return without throwing an error if username/email is not found', async () => {
        expect.assertions(1);
        await expect(checkIfUsernameOrEmailExists('nonExistentEmail@gmail.com', 'nullUser'))
            .resolves.toBe(false);
    });
});
