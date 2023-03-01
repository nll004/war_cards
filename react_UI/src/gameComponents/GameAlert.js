import React from "react";
import "./Game.css";

function GameAlert({message}){
    return(
        <div className="Game-alert">
            <div className="Game-alert-track">
                <h5>{message}</h5>
            </div>
        </div>
    )
};

export default GameAlert;
