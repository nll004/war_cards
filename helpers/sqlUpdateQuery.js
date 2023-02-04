"use strict";

const { BadRequestError } = require("../expressErrors");

/**
 * Helper for making custom update queries.
 *
 * @param tableName {string} - sql table name for query
 * @param username {string} - username to be used in WHERE clause
 * @param data {object} - <p> key/values to add to query. <p>
 *      Ex: { password: 'newPassword', firstName: 'newName', ...}
 * @param keysToUpdate {object} - optional. Keys that need to be changed from camel case to snake case for SQL.
 *      Ex: { firstName: 'first_name', lastName = 'last_name'}
 *
 * @returns {object}
 * @example fn('users', 'usersName', {firstName: 'Aliya', age: 32}, {firstName: 'first_name'} =>
 *   { query: 'UPDATE users SET "first_name"=$1, "age"=$2 WHERE username = "usersName"',
 *     values: ['Aliya', 32] }
 */

function sqlUpdateQueryBuilder(tableName, username, data, keysToUpdate) {
    if(!tableName || !username || !data || Object.keys(data).length === 0) {
        throw new BadRequestError('Cannot build query without tableName, username and data');
    }
    const queryString = [`UPDATE ${tableName} SET`];
    const queryValues = [];
    let valueIndex = 1;

    for (let [key, value] of Object.entries(data)) {
        if (key in keysToUpdate) {
            // change camel case to snake case for sql
            queryString.push(`"${keysToUpdate[key]}" = $${valueIndex}`);
        }else{
            queryString.push(`"${key}" = $${valueIndex}`);
        }
        if (valueIndex < Object.keys(data).length) queryString.push(',');
        queryValues.push(value);
        valueIndex++;
    };
    queryString.push(`WHERE username = $${valueIndex} RETURNING username;`);
    queryValues.push(username);

    return {query: queryString.join(' '), values: queryValues}
}

module.exports = {
    sqlUpdateQueryBuilder,
};
