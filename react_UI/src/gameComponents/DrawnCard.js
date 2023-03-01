import React from "react";

function DrawnCard({card, position="10%", player, offset}){
    if(card && card.flipped) return (
        <img
             src={card.images.png}
             alt={`${player} drew ${card.value} of ${card.suit}`}
             className="card Drawn-card flip-in-ver-left"
             style={{ transform: `rotate(${card.angle}deg)`, top: position }}
        />
    )
    if(card && !card.flipped) return (
        <img
             src={require('../images/card.jpg')}
             alt={`${player} placed face down card`}
             className="card face-down-card"
             style={{ transform: `rotate(${card.angle}deg)`, top: `${offset * 5}vh` }}
        />
    )
}

export default DrawnCard;
