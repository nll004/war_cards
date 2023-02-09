import React, {useState, useEffect} from 'react';
import RouteList from './RouteList';
import { WarApi } from './WarAPI';
import UserContext from './context/UserContext';
import AuthContext from './context/AuthContext';


function App() {
  // const [loggedIn, setLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [warToken, setWarToken] = useState(null);



  async function registerNewUser(loginInfo) {
      try {
          const token = await WarApi.signup(loginInfo);
          setWarToken(token);
          return {success: true}
      }
      catch (errors) {
          console.error('failed registerNewUser->', errors);
          return {success: false, errors}
      };
  };



  return (
    <AuthContext.Provider value={{ userLogin, userLogout, registerNewUser }}>
        <UserContext.Provider value={{ currentUser, warToken }}>
            <div className="App">
                <RouteList />
            </div>
        </UserContext.Provider>
    </AuthContext.Provider>
  );
}

export default App;
