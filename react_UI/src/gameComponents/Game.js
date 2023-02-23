import React, {useState, useEffect} from "react";
import BattlePrompt from "./BattlePrompt";
import GameTable from "./GameTable";
import GameAlert from "./GameAlert";
import CardsApi from "../apis/CardsApi";
import { WarApi } from "../apis/WarAPI";
// import "./Game.css";

const DELAY = (process.env.NODE_ENV === 'test') ? 0 : 3000;
const ALERT_DELAY = (process.env.NODE_ENV === 'test') ? 0 : 4000;

const DECK_KEY = 'Y3h5na938qb45';
const P1_KEY= '8ie284-sha9eth1';
const P2_KEY= '10a92h40sah9t24';

const CARD_RANKS = {
    "2": 2,
    "3": 3,
    "4": 4,
    "5": 5,
    "6": 6,
    "7": 7,
    "8": 8,
    "9": 9,
    "10": 10,
    "JACK": 11,
    "QUEEN": 12,
    "KING": 13,
    "ACE": 14
}

function Game( {currentUser} ){
    const [stats, setStats] = useState({ gamesPlayed: 0, gamesWon: 0, battles: 0, battlesWon: 0 });
    const [deck, setDeck] = useState({ p1: null, p2: null });
    const [p1DrawnCards, setP1DrawnCards] = useState(null);
    const [p2DrawnCards, setP2DrawnCards] = useState(null);
    const [cardsAreInPlay, setCardsInPlay] = useState(false);

    const [showBattleBtn, setShowBattleBtn] = useState(null);
    const [activeBattle, setActiveBattle] = useState(null);
    const [battlePrompt, setBattlePrompt] = useState(false);

    const [endGame, setEndGame] = useState(null);
    const [alert, setAlert] = useState({message: null});

    useEffect(()=> {        // get LS values on refresh
        setEndGame(JSON.parse(localStorage.getItem('game')));
        setStats(JSON.parse(localStorage.getItem('stats')));
        setP1DrawnCards(JSON.parse(localStorage.getItem(P1_KEY)));
        setP2DrawnCards(JSON.parse(localStorage.getItem(P2_KEY)));
        setDeck(JSON.parse(localStorage.getItem(DECK_KEY)));
        setShowBattleBtn(JSON.parse(localStorage.getItem('battle')));
    }, []);

    useEffect(() => {       // refresh LS with every set of drawn cards
        localStorage.setItem('game', endGame);
        localStorage.setItem('stats', JSON.stringify(stats));
        localStorage.setItem('battle', showBattleBtn);
        localStorage.setItem(P1_KEY, JSON.stringify(p1DrawnCards));
        localStorage.setItem(P2_KEY, JSON.stringify(p2DrawnCards));
        localStorage.setItem(DECK_KEY, JSON.stringify(deck));
    }, [p2DrawnCards, showBattleBtn, stats]);

    useEffect(()=> {        // compare p1 and p2 cards 3s after p2 draws
        if (cardsAreInPlay) setTimeout(()=> checkCardsForWinner(), DELAY);
    }, [cardsAreInPlay]);

    useEffect(()=>{
        if(alert.message) setTimeout(()=> setAlert({message: null}), ALERT_DELAY);
    }, [alert])

    /** Get new shuffled deck to split between players */
    async function startNewGame(){
        const cards = await CardsApi.startGame();
        const middleIndex = Math.ceil(cards.length / 2);
        setDeck({   p1: cards.slice(0, middleIndex),
                    p2: cards.slice(-middleIndex)
                });
        setStats({ gamesPlayed: 1, gamesWon: 0, battles: 0, battlesWon: 0 });
        // reset state
        setP1DrawnCards(null);
        setP2DrawnCards(null);
        setCardsInPlay(false);
        setEndGame(false);
        setShowBattleBtn(false);
    };

    /** Player draws card, flips up and stores in drawn card state */
    function p1DrawCard() {
        if(deck.p1 && deck.p1.length > 0 && deck.p1.length < 52) {
            const drawnCard = deck.p1.pop();
            drawnCard.flipped = true;
            setP1DrawnCards(cards => Array.isArray(cards) ? [...cards, drawnCard] : [drawnCard]);
            p2DrawCard(); // auto draw for p2
        };
    };

    /** Opponent draws card, flips up and stores in drawn card state */
    function p2DrawCard() {
        if (deck.p2 && deck.p2.length > 0) {
            const drawnCard = deck.p2.pop();
            drawnCard.flipped = true;
            setP2DrawnCards(cards => Array.isArray(cards) ? [...cards, drawnCard] : [drawnCard]);
            setCardsInPlay(true);
        };
    };

    /** Handles/passes all drawn cards to winners deck.
     *  @param player {string} - "p1" or "p2" only
     */
    function winsHand(player){
        // flip all cards facedown before returning to deck
        p1DrawnCards.map((c) => c.flipped = false);
        p2DrawnCards.map((c) => c.flipped = false);
        // add all cards to bottom of winners deck
        deck[player].unshift(...p1DrawnCards);
        deck[player].unshift(...p2DrawnCards);
        // clear drawn cards
        setP1DrawnCards(null);
        setP2DrawnCards(null);
        // check for a winner at end of every hand
        if (deck.p1.length === 0) gameOver('p2');
        if (deck.p2.length === 0) gameOver('p1');

        setCardsInPlay(false);
    };

    function checkCardsForWinner(){
        // view card on top of both decks for comparison
        const p1Card = p1DrawnCards.slice(-1);
        const p2Card = p2DrawnCards.slice(-1);

        if (p1Card[0].value === p2Card[0].value){
            // if one of the players has no cards in deck to battle, they lose
            if (deck.p1.length === 0) return winsHand('p2');
            if (deck.p2.length === 0) return winsHand('p1');

            setAlert({message: `Card Battle!`})
            setShowBattleBtn(true);
        }
        else if (p1Card[0].value === "2" && p2Card[0].value === "ACE") {
            if(activeBattle) setStats(prev => ({ ...prev, battlesWon: prev.battlesWon + 1 }));
            setAlert({message: "Major win!!"})
            winsHand('p1');
        }
        else if (CARD_RANKS[p1Card[0].value] > CARD_RANKS[p2Card[0].value]) {
            if (activeBattle) setStats(prev => ({ ...prev, battlesWon: prev.battlesWon + 1 }));
            winsHand('p1');
        }
        else if (p2Card[0].value === "2" && p1Card[0].value === "ACE") {
            setAlert({ message: "Ouch.. that one really stings" })
            winsHand('p2');
        } else {
            winsHand('p2');
        }
        setActiveBattle(false);
    };

    function battle(drawAmt){
        setStats(prev => ({ ...prev, battles: prev.battles + 1 }));

        const p1Cards = deck.p1.splice(-drawAmt);
        const p2Cards = deck.p2.splice(-drawAmt);
        setP1DrawnCards(cards => ([...cards, ...p1Cards]));
        setP2DrawnCards(cards => ([...cards, ...p2Cards]));

        setActiveBattle(true);
        setBattlePrompt(false);
        setCardsInPlay(false);
        setShowBattleBtn(false);
    };

    /** Sends game stats to API  */
    function gameOver(player) {
        if (player === 'p1') {
            setAlert({message: "You may have lost some battles but you won the WAR!"});
            setStats(prev => ({ ...prev, gamesWon: 1 }));
        };
        if (player === 'p2') {
            setAlert({ message: "Sorry.. You can't win them all." });
            setStats(prev => ({ ...prev, gamesWon: 0 }));
        }
        setDeck({ p1: null, p2: null });

        // If logged in, send game stats to API
        try{
            if(currentUser) WarApi.editUserStats(currentUser.username, stats);
        }catch (error){
            console.error(`Failed to update user stats: ${error}`);
        };
    };

    return (
        <>
            <GameTable />

            {alert && <GameAlert message={alert.message} />}

            <button onClick={startNewGame}
                    className='game-start-btn btn'>
                {(endGame || (deck && (!deck.p1 || !deck.p2)))? "New Game" : "Restart"}
            </button>

            <section id='container'>
                <div id="p2-deck">
                    {deck && deck.p2 && <>
                        <div className="card">
                            <img src={require('../images/card.jpg')} alt='Back of playing card'></img>
                        </div>
                        <h2> <span> {deck.p2.length} </span>
                            Computer
                        </h2>
                    </>}
                </div>

                <div id='p2-card-container'>
                    <ul>
                        {p2DrawnCards && p2DrawnCards.map((c) => (c.flipped) ? <p>Card: {c.code}</p> : <p>Blank</p>)}
                    </ul>
                </div>

                <div id="p1-card-container">
                    <ul>
                        {p1DrawnCards && p1DrawnCards.map((c) => (c.flipped) ? <p>Card: {c.code}</p> : <p>Blank</p>)}
                    </ul>
                </div>

                <div id="p1-deck">
                    <h1 className="heading p1-heading">
                        {(currentUser) ? currentUser.username : "Guest"}
                        {deck && deck.p1 && <span> {deck.p1.length} </span>}
                    </h1>
                    {deck && deck.p1 &&
                        <div className="card"
                            /** conditionally applying onclick to card, if no cards already in play you can draw */
                            {...(!cardsAreInPlay && !showBattleBtn && { onClick: p1DrawCard })}>
                            <img src={require('../images/card.jpg')} alt='Back of playing card'></img>
                        </div>
                    }
                </div>
            </section>



            {showBattleBtn && !battlePrompt && <button onClick={()=>setBattlePrompt(true)}> Battle </button>}
            {battlePrompt && showBattleBtn && <BattlePrompt battle={battle} deck={deck} draw={p1DrawCard}/>}
        </>
    )
}

export default Game;
