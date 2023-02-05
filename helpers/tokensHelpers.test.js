"use strict";

const jwt = require('jsonwebtoken');
const {createToken} = require('./tokens');

console.log('createToken helper tests ->', 'NODE_ENV ->', process.env.NODE_ENV);

describe('createToken helper function', function(){
    it('returns a token with username, isAdmin(provided), exp values', function(){
        const user1Token= createToken({ username: 'testUser', isAdmin: true});
        const decodedToken = jwt.decode(user1Token);

        expect(user1Token).toEqual(expect.any(String));
        expect(decodedToken).toEqual({
                                    username: 'testUser',
                                    isAdmin: true,
                                    exp: expect.any(Number),
                                    iat: expect.any(Number)
                                });
        expect(decodedToken.exp).toBeGreaterThan(decodedToken.iat);
    });

    it('returns a token with username, isAdmin(default), exp values', function(){
        const user2Token = createToken({ username: 'testUser'});
        const decodedToken = jwt.decode(user2Token);

        expect(user2Token).toEqual(expect.any(String));
        expect(decodedToken).toEqual({
                                    username: 'testUser',
                                    isAdmin: false,
                                    exp: expect.any(Number),
                                    iat: expect.any(Number)
                                });
        expect(decodedToken.exp).toBeGreaterThan(decodedToken.iat);
    });
});
