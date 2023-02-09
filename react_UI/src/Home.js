import React, {useState} from "react";
import { Outlet, NavLink, Link } from "react-router-dom";
import GameTable from "./GameTable";
import './Home.css';

function HomePage(){

    return (
        <>
            <header>
                <nav>
                    <Link to="">Home</Link>
                    <NavLink to="login">Login</NavLink>
                    <NavLink to="register">Sign Up</NavLink>
                    <NavLink to="player-info">Stats</NavLink>
                    <NavLink to="player-edit">Edit Profile</NavLink>
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
