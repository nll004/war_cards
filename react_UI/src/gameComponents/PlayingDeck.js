import React, {useContext} from "react";
import UserContext from "../context/UserContext";
const cardBack = require('../images/card.jpg');

function PlayingDeck({ player= "Guest", deck, draw, id}) {
    const user = useContext(UserContext);
    return (
        <div className="card Player-deck" id={id}>
            {(id && user && user.currentUser && user.currentUser.username)
                ? <h2> {user.currentUser.username} </h2>
                : <h2> {player} </h2>
            }
            <img src={cardBack}
                 alt='Back of playing card'
                {...(draw && {onClick: draw })}
            />
            {deck.length > 9 && <h3> {deck.length} </h3>}
            {deck.length <= 9 && <h3 style={{ color: 'red' }}> {deck.length} </h3>}
        </div>
    )
}

export default PlayingDeck;
