import React, {useState, useEffect} from "react";
import {Button} from "reactstrap";
import BattlePrompt from "./BattlePrompt";
import GameTable from "./GameTable";
import GameAlert from "./GameAlert";
import PlayingDeck from "./PlayingDeck";
import DrawnCard from "./DrawnCard";
import getAngle from "./GetAngle";
import CardsApi from "../apis/CardsApi";
import { WarApi } from "../apis/WarAPI";
import "./Game.css";

const DELAY = (process.env.NODE_ENV === 'test') ? 0 : 2500;
const ALERT_DELAY = (process.env.NODE_ENV === 'test') ? 0 : 2800;

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

    useEffect(()=> {        // compare p1 and p2 cards after timeout
        if (cardsAreInPlay) {
            const winner = checkCardsForWinner();
            if(winner) setTimeout(()=> winsHand(winner), DELAY);
        };
    }, [cardsAreInPlay]);

    useEffect(()=>{         // remove alert after timeout
        if(alert.message) setTimeout(()=> setAlert({message: null}), ALERT_DELAY);
    }, [alert]);

    useEffect(()=> {        // send stats to API if logged in user
        if(endGame && currentUser){
            WarApi.editUserStats(currentUser.username, stats)
        }
    }, [endGame])

    /** Get new shuffled deck to split between players */
    async function startNewGame(){
        const cards = await CardsApi.startGame();
        cards.map(card=> card.angle = getAngle());

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
        setActiveBattle(false);
    };

    function checkCardsForWinner(){
        // view card on top of both decks for comparison
        const p1Card = p1DrawnCards.slice(-1);
        const p2Card = p2DrawnCards.slice(-1);

        if (p1Card[0].value === p2Card[0].value){
            // if one of the players has no cards in deck to battle, they lose
            if (deck.p1.length === 0) return 'p2';
            if (deck.p2.length === 0) return 'p1';

            setAlert({message: `Card Battle!`})
            setShowBattleBtn(true);
        }
        else if (p1Card[0].value === "2" && p2Card[0].value === "ACE") {
            if(activeBattle) {
                console.log("active battle", activeBattle," add one to battlesWon", stats)
                setStats(prev => ({ ...prev, battlesWon: prev.battlesWon + 1 }));
            }
            setAlert({message: "Major win!!"})
            return 'p1';
        }
        else if (p2Card[0].value === "2" && p1Card[0].value === "ACE") {
            setAlert({ message: "Ouch.. that one really stings" })
            return 'p2';
        }
        else if (CARD_RANKS[p1Card[0].value] > CARD_RANKS[p2Card[0].value]) {
            if (activeBattle) setStats(prev => ({ ...prev, battlesWon: prev.battlesWon + 1 }));
            return 'p1';
        }
        else {
            return 'p2';
        }
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
            setStats(prev => ({ ...prev, gamesWon: 1 }));
            setAlert({ message: "You win!" });
        };
        if (player === 'p2') {
            setAlert({ message: "You can't win them all." });
        }
        setDeck({ p1: null, p2: null });
        setEndGame(true);
    };

    return (
        <>
            <GameTable />

            {alert && alert.message && <GameAlert message={alert.message} />}

            <Button onClick={startNewGame} color='success' className='game-start-btn'>
                {(endGame || (deck && (!deck.p1 || !deck.p2)))? "New Game" : "Restart"}
            </Button>

            {showBattleBtn && !battlePrompt &&
                <Button onClick={() => setBattlePrompt(true)}
                        color='warning'
                        size='lg'
                        className="Battle-btn">
                    Battle
                </Button>}

            {battlePrompt && showBattleBtn &&
                <BattlePrompt battle={battle} deck={deck} draw={p1DrawCard} />}

            <section id='Game-container'>
                {deck && deck.p2 &&
                    <PlayingDeck player={"Computer"} deck={deck.p2} />}

                <div id='p2-card-col'>
                    {p2DrawnCards && p2DrawnCards.map((c, i) =>
                        <DrawnCard  card={c}
                                    key={c.code}
                                    offset={i}
                                    player="Computer"
                                    {...(activeBattle && {position: "50%"}) }/>
                    )}
                </div>

                <div id="p1-card-col">
                    {p1DrawnCards &&
                        p1DrawnCards.map((c, i) =>
                            <DrawnCard  card={c}
                                        key={c.code}
                                        offset={i}
                                        player="Player 1"
                                        {...(activeBattle && { position: "50%" })} />
                    )}
                </div>

                {deck && deck.p1 &&
                    <PlayingDeck deck={deck.p1}
                                 id='p1'
                                 {...((!cardsAreInPlay && !showBattleBtn)? {draw: p1DrawCard} : null )}
                        />
                }
            </section>
        </>
    )
}

export default Game;
