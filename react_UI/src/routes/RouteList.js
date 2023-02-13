import React from "react";
import { Routes, Route } from 'react-router-dom';
import HomePage from "./Home";
import RegistrationForm from "../forms/RegistrationForm";
import LoginForm from "../forms/LoginForm";
import EditUserForm from "../forms/EditUserForm";

function RouteList() {
    return (
        <Routes>
            <Route path="" element={<HomePage />}>
                <Route path="login" element={<LoginForm />}/>
                <Route path="register" element={<RegistrationForm />} />
                <Route path="player-info" element={<h2>Stats module</h2>} />
                <Route path="player-edit" element={<EditUserForm />} />
            </Route>
            <Route path="*" element={<h1> 404 </h1>} />
        </Routes>
    )
};

export default RouteList;
