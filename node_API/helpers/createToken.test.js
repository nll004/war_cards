"use strict";

const jwt = require('jsonwebtoken');
const createToken = require('./createToken');

console.log('createToken helper tests ->', 'NODE_ENV ->', process.env.NODE_ENV);

describe('createToken helper function', function(){
    it('returns a token with username, isAdmin(provided), exp values', function(){
        const userToken= createToken({ username: 'testUser', isAdmin: true});
        const decodedToken = jwt.decode(userToken);

        expect(userToken).toEqual(expect.any(String));
        expect(decodedToken).toEqual({
                                    username: 'testUser',
                                    isAdmin: true,
                                    exp: expect.any(Number),
                                    iat: expect.any(Number)
                                });
        expect(decodedToken.exp).toBeGreaterThan(decodedToken.iat);
    });

    it('returns a token with username, isAdmin(default), exp values', function(){
        const userToken = createToken({ username: 'testUser'});
        const decodedToken = jwt.decode(userToken);

        expect(userToken).toEqual(expect.any(String));
        expect(decodedToken).toEqual({
                                    username: 'testUser',
                                    isAdmin: false,
                                    exp: expect.any(Number),
                                    iat: expect.any(Number)
                                });
        expect(decodedToken.exp).toBeGreaterThan(decodedToken.iat);
    });
});
