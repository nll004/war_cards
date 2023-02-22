import React, { useContext } from "react";
import { Link } from "react-router-dom";
import UserContext from '../context/UserContext';

function UserProfile(){
    const { currentUser } = useContext(UserContext);

    return (
        <div>
            <h2>Profile</h2>
            {currentUser && <>
                <p> User:       {currentUser.username} </p>
                <p> Name:       {currentUser.firstName + ' ' + currentUser.lastName} </p>
                <p> Email:      {currentUser.email} </p>
                <Link to='/player-edit'> Edit User </Link>

                <h4> Player Stats </h4>
                <p>Games Played:    {currentUser.stats.gamesPlayed} </p>
                <p>Games Won:       {currentUser.stats.gamesWon}
                    <span> --       {(currentUser.stats.gamesWon / currentUser.stats.gamesPlayed) * 100}% </span>
                </p>
                <p>Games Lost:      {currentUser.stats.gamesPlayed - currentUser.stats.gamesWon} </p>
                <p>Battles:         {currentUser.stats.battles} </p>
                <p>Battles Won:     {currentUser.stats.battlesWon}
                    <span> --       {(currentUser.stats.battlesWon / currentUser.stats.battles) * 100}% </span>
                </p>
                <p>Battles Lost:    {currentUser.stats.battles - currentUser.stats.battlesWon} </p>
            </>}
        </div>
    )
};

export default UserProfile;
