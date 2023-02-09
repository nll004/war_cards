import React from "react";
import { Routes, Route } from 'react-router-dom';
import HomePage from "./Home";
import RegistrationForm from "./RegistrationForm";

function RouteList() {
    return (
        <Routes>
            <Route path="" element={<HomePage />}>
                <Route path="login" element={<h1>Login form</h1>}/>
                <Route path="register" element={<RegistrationForm />} />
                <Route path="player-info" element={<h2>Stats module</h2>} />
                <Route path="player-edit" element={<h2>Edit the player profile?</h2>} />
            </Route>
            <Route path="*" element={<h1> 404 </h1>} />
        </Routes>
    )
};

export default RouteList;
