"use strict";

const { User } = require('./user');
const { commonAfterAll, seedTestDB } = require('../testSetup');
const { BadRequestError } = require('../expressErrors');
const { db } = require('../db');

beforeAll(() => console.log('GET /users/:username/stats tests ->', 'NODE_ENV ->', process.env.NODE_ENV));
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
    })
});

// ================================= Get Stats =========================================================

describe('User.getGameStats', function(){
    it('throws error if user is not valid', async function(){
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
