"use strict";

const {sqlUpdateQueryBuilder} = require('./sqlUpdateQuery');
const { seedTestDB, commonAfterAll } = require('../testSetup');
const { BadRequestError } = require('../expressErrors');

beforeAll(()=> console.log('SqlUpdateQueryBuilder helper tests', 'NODE_ENV ->', process.env.NODE_ENV));
beforeEach(seedTestDB);
afterAll(commonAfterAll);

describe('sqlUpdateQueryBuilder', function(){
    it('should throw error if missing arguments', function(){
        expect.assertions(1);
        try{
            sqlUpdateQueryBuilder('users', undefined, {firstName: 'testUser'});
        }catch(e){
            expect(e instanceof BadRequestError).toBeTruthy();
        }
    });

    it('should throw error if data to be changed is an empty object', function(){
        expect.assertions(2);
        try{
            sqlUpdateQueryBuilder('users', 'testUser', {});
        }catch(e){
            expect(e instanceof BadRequestError).toBeTruthy();
            expect(e.message).toEqual('Cannot build query without tableName, username and data');
        }
    });

    it('should return sanitized sql update query for user table', function(){
        const data = {  firstName : 'Test',
                        lastName: 'User',
                        password: 'newPassword234'
        };
        const sqlNames = {  firstName: 'first_name',
                            lastName: 'last_name',
                            gamesPlayed: 'games_played', // it should ignore
        };
        expect.assertions(1);
        const queryObj = sqlUpdateQueryBuilder('users', 'testUser', data, sqlNames);
        expect(queryObj).toEqual({
            query: "UPDATE users SET \"first_name\" = $1 , \"last_name\" = $2 , \"password\" = $3 WHERE username = $4 RETURNING username;",
            values: ['Test', 'User', "newPassword234", 'testUser']
        });
    });

    it('should return sanitized sql update query for game_stats table', function(){
        const data = {  gamesPlayed : 5,
                        gamesWon: 3,
                        gamesLost: 2
        };
        const sqlNames = {  gamesPlayed: 'games_played',
                            gamesWon: 'games_won',
                            gamesLost: 'games_lost',
                            battlesWon: 'battles_won' // it should ignore
        };
        expect.assertions(1);
        const queryObj = sqlUpdateQueryBuilder('game_stats', 'testUser', data, sqlNames);
        expect(queryObj).toEqual({
            query: "UPDATE game_stats SET \"games_played\" = $1 , \"games_won\" = $2 , \"games_lost\" = $3 WHERE username = $4 RETURNING username;",
            values: [5, 3, 2, 'testUser']
        });
    });
});
