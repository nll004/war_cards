import React, {useContext} from "react";
import { Outlet, NavLink, Link } from "react-router-dom";

import GameTable from "../gameComponents/GameTable";
import UserContext from '../context/UserContext';
import AuthContext from '../context/AuthContext';

import './Home.css';

function HomePage(){
    const {currentUser} = useContext(UserContext);
    const {logout} = useContext(AuthContext);

    return (
        <>
            <header>
                <nav>
                    <Link to="">Home</Link>
                    {!currentUser && (<>
                        <NavLink to="login">Login</NavLink>
                        <NavLink to="register">Sign Up</NavLink>
                    </>)}
                    {currentUser && (<>
                        <NavLink to="player-info">Stats</NavLink>
                        <NavLink to="player-edit">Edit Profile</NavLink>
                        <button onClick={logout}>Logout</button>
                    </>)}
                </nav>
            </header>
            <main>
                <Outlet />
                <GameTable />
            </main>
        </>
    )
};

export default HomePage;
