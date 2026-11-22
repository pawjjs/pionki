import cardsData from './cards_pl.json' with { type: 'json' };
import Card from './Card.js';

interface CardData {
    id: number;
    text: string;
    type: string;
    value: number;
}

export default class Deck {
    cards: Card[];

    constructor() {
        this.cards = (cardsData).map(data => new Card(data.id, data.text, data.type, data.value));
        this.shuffle();
    }

    // tasowanie Knutha
    shuffle(): void {
        for (let i = this.cards.length - 1; i > 0; i--) { // 1. ustawiamy wskaźnik na ostatni element tablicy o długości n (i=n-1)
            const j = Math.floor(Math.random() * (i + 1)); // 2. losowanie liczby całkowitej od 0 do i
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]]; // 3. zamiana miejscami tych liczb, 4. zmniejszenie indeksu i, zapętlenie do momentun dojścia do 2 elementu tablicy
        }
    }

    drawCard(): Card {
        if (this.cards.length === 0) {
            console.log("Trzeba potasować karty");
            this.cards = (cardsData as CardData[]).map(data => new Card(data.id, data.text, data.type, data.value));
            this.shuffle();
        }
        const toReturnCard =  this.cards.shift() // zwraca pierwszą kartę z tablicy
        if (!toReturnCard) {
            throw Error("Brak karty!")
        }  
        return toReturnCard;
    }
}
