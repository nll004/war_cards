import axios from "axios";

const WAR_CARDS_BACKEND_URL = process.env.REACT_APP_BASE_URL || "http://localhost:3001";

/** API Class with static methods to communicate with the War API  */

class WarApi {
    // the token will be stored here to make API interaction simpler
    static token;

    static async request(endpoint, data = {}, method = "get") {
        console.debug("API Call:", "Endpoint->", endpoint, "Data->", data, "Method->", method);

        const url = `${WAR_CARDS_BACKEND_URL}/${endpoint}`;
        const headers = { Authorization: `Bearer ${WarApi.token}` };
        const params = (method === "get")
            ? data
            : {};

        try {
            const res = await (await axios({ url, method, data, params, headers })).data;
            console.debug("API Response:", res);
            return res
        }
        catch (err) {
            console.error("API Error:", err);
            let message = err.response.data.error.message;
            throw Array.isArray(message) ? message : [message];
        };
    };

    // Individual API calls

    /** Send new user data to register and store the returned token on class.*/
    static async signup(formData) {
        const res = await WarApi.request('users/register', formData, 'post');
        WarApi.token = res._token;
        return res._token
    };

    /** Send username/password and store the returned token on class. */
    static async login(formData) {
        const res = await WarApi.request('users/login', formData, 'post');
        WarApi.token = res._token;
        return res._token
    };

    /** Get user data by username. A valid token must be present on the WarAPI class */
    static async getUser(username) {
        const res = await WarApi.request(`users/${username}`);
        return res.user
    };

    /** Get user stats by username. A valid token must be present on the WarAPI class */
    static async getUserStats(username) {
        const res = await WarApi.request(`users/${username}/stats`);
        return res.gameStats
    };

    /** Allows editing of user data and returns new user data */
    static async editUser(username, formData) {
        const res = await WarApi.request(`users/${username}`, formData, 'patch');
        return res.user
    };
};

export { WarApi, WAR_CARDS_BACKEND_URL};
