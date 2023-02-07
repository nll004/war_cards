"use strict";

const { User } = require('./user');
const { commonAfterAll, seedTestDB } = require('../testSetup');
const { BadRequestError } = require('../expressErrors');
const { db } = require('../db');

beforeAll(() => console.log('UserGameStats tests', 'NODE_ENV ->', process.env.NODE_ENV));
beforeEach(seedTestDB);
afterAll(commonAfterAll);

// ================================= Create Stats For New User =========================================

describe('User.initGameStats', function () {
    it('returns error if not successfully created', async function(){
        expect.assertions(2);
        try{
            await User.initGameStats('testUser');
            await User.initGameStats('testUser'); // trying to recreate should fail
        }catch (err){
            expect(err instanceof BadRequestError).toBeTruthy();
            expect(err.message).toContain('duplicate key value violates unique constraint');
        }
    });
});

// ================================= Get Stats =========================================================

describe('User.getGameStats', function(){
    it('throws error if user does not exist', async function(){
        expect.assertions(2);
        try{
            await User.getGameStats('null user');
        }catch(err){
            expect(err instanceof BadRequestError).toBeTruthy();
            expect(err.message).toContain('User not found');
        }
    });

    it('throws error if no game stats are found', async function(){
        expect.assertions(2);
        // delete all game_stats so that User.getGameStats will return no rows
        await db.query('DELETE FROM game_stats');
        try {
            await User.getGameStats('testUser');
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
            expect(err.message).toContain('Unable to retrieve game stats');
        }
    });

    it('returns user game stats as requested', async function(){
        expect.assertions(1);
        const res = await User.getGameStats('testUser');
        expect(res).toEqual({   username: 'testUser',
                                gamesPlayed: 5,
                                gamesWon: 3,
                                battles: 16,
                                battlesWon: 10
                            });
    });
});

// ================================= Edit Stats =========================================================

describe('User.editGameStats', function () {
    it('should throw error if the given username is not found', async function () {
        expect.assertions(2);
        try {
            await User.editGameStats('nullUser', { gamesPlayed: 1 });
        } catch (err) {
            expect(err instanceof Error).toBeTruthy();
            expect(err.message).toEqual('User not found');
        };
    });

    it('should throw error if edit was not successful', async function () {
        // delete all game_stats so that User.getGameStats will return no rows
        await db.query('DELETE FROM game_stats');
        expect.assertions(2);
        try {
            await User.editGameStats('testUser', { gamesPlayed: 1 });
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
            expect(err.message).toContain('Failed to update game statistics');
        }
    });

    it('should return username once changes are successfully made', async function () {
        const gameStats = {gamesPlayed: 1, gamesWon: 1, battles: 20, battlesWon: 16};

        expect.assertions(2);
        const res = await User.editGameStats('testUser', gameStats);
        expect(res).toEqual({ username: 'testUser' });

        // retrieve user stats to ensure changes were made
        const userAfterEdit = await User.getGameStats('testUser');
        expect(userAfterEdit).toEqual({ username: 'testUser',
                                        gamesPlayed: 1,
                                        gamesWon: 1,
                                        battles: 20,
                                        battlesWon: 16
        });
    });
});
