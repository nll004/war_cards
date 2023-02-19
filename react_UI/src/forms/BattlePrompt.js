import React, { useState } from "react";

function BattlePrompt({battle, deck}){
    const [drawAmt, setDrawAmt] = useState(null);
    const [errors, setErrors] = useState(null);

    const handleChange = (evt) => {
        setDrawAmt(Number(evt.target.value));
    };

    function handleSubmit(evt){
        evt.preventDefault();
        // if either player's remaining cards are <= than drawAmt, battle with the fewest remaining cards - 1
        if (deck.p1.length <= drawAmt || deck.p2.length <= drawAmt) {
            if (deck.p1.length <= drawAmt) {
                setErrors(`You don't have enough cards for that. Try ${deck.p1.length - 1}`)
                return setDrawAmt(deck.p1.length - 1);
            };
            if (deck.p2.length <= drawAmt) {
                setErrors(`Your opponent doesn't have enough cards for that. Try ${deck.p2.length - 1}`)
                return setDrawAmt(deck.p2.length - 1)
            };
        }
        else if (drawAmt < 1) {
            setErrors("Don't be afraid! At least risk one card.");
            return setDrawAmt(1);
        }
        else if (drawAmt > 8) {
            setErrors("Whoa tiger! Lets cap it at 8 cards.");
            return setDrawAmt(8);
        };
        battle(drawAmt);
    };

    return(
        <form onSubmit={handleSubmit}>
            <h6>How many cards would you like to risk in this battle?</h6>
            {errors &&
                <p>{ errors }</p> }
            <label htmlFor="draw"> Draw </label>
            <input  type='number'
                    name='draw'
                    value={drawAmt}
                    onChange={handleChange}>
            </input>
            <button> Battle </button>
        </form>
    );
};

export default BattlePrompt;
