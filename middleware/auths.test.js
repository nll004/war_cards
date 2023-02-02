"use strict";

const jwt = require("jsonwebtoken");
const { authenticateJWT, ensureLoggedIn} = require("./auths");

const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressErrors");
const testJwt = jwt.sign({ username: "test", isAdmin: false }, SECRET_KEY);
const incorrectJWT = jwt.sign({ username: "test", isAdmin: false }, "wrong");

describe("authenticateJWT", function () {
    it("should store user in locals with correct header and token", function () {
        expect.assertions(2);
        const req = { headers: { authorization: `Bearer ${testJwt}` } };
        const res = { locals: {} };
        const next = function (err) {
            expect(err).toBeFalsy();
        };
        authenticateJWT(req, res, next);
        expect(res.locals).toEqual({
            user: {
                iat: expect.any(Number),
                username: "test",
                isAdmin: false,
            },
        });
    });

    it("should have no data in locals if no authorization header is sent", function () {
        expect.assertions(2);
        const req = {};
        const res = { locals: {} };
        const next = function (err) {
            expect(err).toBeFalsy();
        };
        authenticateJWT(req, res, next);
        expect(res.locals).toEqual({});
    });

    it("should have no data in locals if invalid token", function () {
        expect.assertions(2);
        const req = { headers: { authorization: `Bearer ${incorrectJWT}` } };
        const res = { locals: {} };
        const next = function (err) {
            expect(err).toBeFalsy();
        };
        authenticateJWT(req, res, next);
        expect(res.locals).toEqual({});
    });
});


describe("ensureLoggedIn", function () {
    it("should not throw error if local user exists", function () {
        expect.assertions(1);
        const req = {};
        const res = { locals: { user: { username: "test", isAdmin: false } } };
        const next = function (err) {
            expect(err).toBeFalsy();
        };
        ensureLoggedIn(req, res, next);
    });

    it("should throw error if local user does not exist", function () {
        expect.assertions(1);
        const req = {};
        const res = { locals: {} };
        const next = function (err) {
            expect(err instanceof UnauthorizedError).toBeTruthy();
        };
        ensureLoggedIn(req, res, next);
    });

    it("should throw and error if token is expired", function () {
        const currentTime = Math.floor(Date.now() / 1000);
        const expiredTime = currentTime - 10000;

        expect.assertions(1);
        const req = {};
        const res = { locals: { user: {username: 'test', isAdmin: false, exp: expiredTime }} };
        const next = function (err) {
            expect(err instanceof UnauthorizedError).toBeTruthy();
        };
        ensureLoggedIn(req, res, next);
    });
});
