import React, {useState, useEffect} from "react";
import BattlePrompt from "../forms/BattlePrompt";
import GameTable from "./GameTable";
import CardsApi from "../apis/CardsApi";

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

function Game(){
    const [stats, setStats] = useState({ gamesPlayed: null, gamesWon: null, battles: null, battlesWon: null });
    const [deck, setDeck] = useState({ p1: null, p2: null });
    const [p1DrawnCards, setP1DrawnCards] = useState(null);
    const [p2DrawnCards, setP2DrawnCards] = useState(null);
    const [cardBattle, setCardBattle] = useState(null);
    const [cardsInPlay, setCardsInPlay] = useState(false);
    const [battlePrompt, setBattlePrompt] = useState(false);
    const [endGame, setEndGame] = useState(null);

    useEffect(()=> {        // get LS values on refresh
        console.log('checking LS')
        setEndGame(JSON.parse(localStorage.getItem('game')));
        setStats(JSON.parse(localStorage.getItem('stats')));
        setP1DrawnCards(JSON.parse(localStorage.getItem(P1_KEY)));
        setP2DrawnCards(JSON.parse(localStorage.getItem(P2_KEY)));
        setDeck(JSON.parse(localStorage.getItem(DECK_KEY)));
        setCardBattle(JSON.parse(localStorage.getItem('battle')));
    }, []);

    useEffect(() => {       // refresh LS with every set of drawn cards
        console.log('refreshing LS')
        localStorage.setItem('game', endGame);
        localStorage.setItem('stats', JSON.stringify(stats));
        localStorage.setItem('battle', cardBattle);
        localStorage.setItem(P1_KEY, JSON.stringify(p1DrawnCards));
        localStorage.setItem(P2_KEY, JSON.stringify(p2DrawnCards));
        localStorage.setItem(DECK_KEY, JSON.stringify(deck));
    }, [p2DrawnCards, cardBattle, stats]);

    useEffect(()=> {        // compare p1 and p2 cards 3s after p2 draws
        if (cardsInPlay) setTimeout(()=> checkCardsForWinner(), 1000);
    }, [cardsInPlay])

    /** Get new shuffled deck to split between players */
    async function startNewGame(){
        const cards = await CardsApi.startGame();
        const middleIndex = Math.ceil(cards.length / 2);
        setDeck({   p1: cards.slice(0, middleIndex),
                    p2: cards.slice(-middleIndex)
                });
        setStats({ gamesPlayed: 1, gamesWon: null, battles: null, battlesWon: null });
        // reset state
        setP1DrawnCards(null);
        setP2DrawnCards(null);
        setCardsInPlay(false);
        setEndGame(false);
        setCardBattle(false); // cardBattle is last to reset LS in useEffect
        console.log('started new game', stats)
    };

    /** Player draws card, flips up and stores in drawn card state */
    function p1DrawCard() {
        if(deck.p1 && deck.p1.length > 0) {
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
            // if cards match but one player is unable to battle because
            // they have no more cards in the deck, they lose the hand/game
            if (deck.p1.length === 0) return winsHand('p2');
            if (deck.p2.length === 0) return winsHand('p1');

            alert(`BATTLE!!! ${deck.p1.length}, ${deck.p2.length}`);
            setCardBattle(true);
        }
        else if (p1Card[0].value === "2" && p2Card[0].value === "ACE") return winsHand('p1');
        else if (p2Card[0].value === "2" && p1Card[0].value === "ACE") return winsHand('p2');
        else if (CARD_RANKS[p1Card[0].value] > CARD_RANKS[p2Card[0].value]) return winsHand('p1');
        else return winsHand('p2');
    };

    function battle(drawAmt){
        setStats(prev => ({ ...prev, battles: prev.battles + 1 }));

        const p1Cards = deck.p1.splice(-drawAmt);
        const p2Cards = deck.p2.splice(-drawAmt);
        setP1DrawnCards(cards => ([...cards, ...p1Cards]));
        setP2DrawnCards(cards => ([...cards, ...p2Cards]));

        setCardBattle(false);
        setCardsInPlay(false);
    };

    /** Sends game stats to API  */
    function gameOver(player) {
        // who won?
        if (player === 'p1') {
            alert("You win!");
            setStats(prev => ({ ...prev, gamesWon: 1 }));
        };
        if (player === 'p2') {
            alert("You lost! Better luck next time!");
            setStats(prev => ({ ...prev, gamesWon: 0 }));

        }
        console.log('The game is over....', stats.current);

        // API call to store stats

    };

    return (
        <>
            <GameTable />

            <button onClick={startNewGame}> {(endGame || !deck.p1)? "New Game" : "Restart"} </button>
            {(!cardsInPlay && !cardBattle) && <button onClick={()=>p1DrawCard()}> Draw </button>}
            {cardBattle && <button onClick={()=>setBattlePrompt(true)}> Battle </button>}
            {battlePrompt && cardBattle && <BattlePrompt battle={battle} deck={deck}/>}

            <h1>Player 1</h1>
            {deck && deck.p1 && <p>Cards in Deck: {deck.p1.length }</p>}
            <ul>
                {p1DrawnCards && p1DrawnCards.map((c)=> (c.flipped)? <p>Card: {c.code}</p> : <p>Blank</p> )}
            </ul>
            <h1>Player 2</h1>
            {deck && deck.p2 && <p>Cards in Deck: {deck.p2.length}</p>}
            <ul>
                {p2DrawnCards && p2DrawnCards.map((c) => (c.flipped) ? <p>Card: {c.code}</p> : <p>Blank</p>)}
            </ul>
        </>
    )
}

export default Game;
