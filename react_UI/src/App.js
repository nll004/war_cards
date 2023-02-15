import React, {useState, useEffect} from 'react';
import jwt from "jsonwebtoken";

import RouteList from './routes/RouteList';
import { WarApi } from './apis/WarAPI';
import UserContext from './context/UserContext';
import AuthContext from './context/AuthContext';

const WAR_API_JWT_ID = "WT-ID";

function App() {
    const [currentUser, setCurrentUser] = useState(null);
    const [warToken, setWarToken] = useState(null);

    useEffect(() => {
      // If token in state, refresh token in local storage and get user data
      if (warToken) {
          console.debug('useEffect -> token exists')
          localStorage.setItem(WAR_API_JWT_ID, warToken);
          let { username } = jwt.decode(warToken);
          getAndSaveCurrentUser(username);
      }
      else {
          // If no token in state, check local storage for saved token. Allows for persistent login
          console.debug('useEffect -> no token')
          const savedToken = localStorage.getItem(WAR_API_JWT_ID);
          if (savedToken) {
              WarApi.token = savedToken;
              setWarToken(savedToken);
          }
          else setCurrentUser(null);
      };
    }, [warToken]);

    async function getAndSaveCurrentUser(username) {
        try {
            const userData = await WarApi.getUser(username);
            const gameStats = await WarApi.getUserStats(username);
            const user = {...userData, stats: gameStats};
            setCurrentUser(user);
        }
        catch (errors) {
            console.error('failed getAndSaveCurrentUser->', errors);
        }
    };

    async function registerNewUser(loginInfo) {
        try {
            const token = await WarApi.signup(loginInfo);
            setWarToken(token);
        }
        catch (errors) {
            return { errors: errors}
        };
    };

    async function userLogin(loginInfo) {
        try {
            const token = await WarApi.login(loginInfo);
            setWarToken(token);
        }
        catch (errors) {
            return { errors: errors }
        }
    };

    function logout() {
        localStorage.removeItem(WAR_API_JWT_ID);
        setWarToken(false);
    };

    return (
        <AuthContext.Provider value={{ userLogin, logout, registerNewUser }}>
            <UserContext.Provider value={{ currentUser, warToken }}>
                <div className="App">
                    <RouteList />
                </div>
            </UserContext.Provider>
        </AuthContext.Provider>
    );
};

export default App;
