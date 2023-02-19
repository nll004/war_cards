import axios from "axios";

const BASE_URL = 'https://www.deckofcardsapi.com/api/deck';

class CardsApi {
    /** Get the deck id for a new shuffled deck */
    static async getNewDeck(){
        const result = await axios.get(`${BASE_URL}/new/shuffle?deck_count=1`);
        return result.data.deck_id
    };

    /** Draw one deck of 52 cards.
     *  They will be stored in LS and handled by the app
     */
    static async getCards(deckId){
        const result = await axios.get(`${BASE_URL}/${deckId}/draw/?count=52`);
        return result.data.cards
    };

    /** Get a shuffled deck of cards. Returns array of 52 cards */
    static async startGame() {
        try{
            const deckId = await CardsApi.getNewDeck();
            const cards = await CardsApi.getCards(deckId);
            const deck = cards.map(card => ({...card, flipped : false}));
            return deck
        }catch(err){
            console.error(err);
        }
    };
};

export default CardsApi;
