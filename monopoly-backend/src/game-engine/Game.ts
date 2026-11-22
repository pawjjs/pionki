import Board from './Board.js';
import Deck from './Deck.js';
import Player from './Player.js';

/*
    STANY GRY:
        1. WAITING_FOR_ROLL - rzut kości przez gracza, przesunięcie znacznika na dane pole
        2. FIELD_CHECKING - sprawdzamy co to za pole na, którym gracz stanął właśnie i co trzeba zrobić (jaką akcje wykonać)
        3. END_TURN - podsumowanie tury, sprawdzenie czy gracz ma dodatkowy ruch za dublet, zmiana gracza na następnego
        4. GAME_OVER - koniec gry

    STANY DECYZJI GRACZA PODCZAS TURY:
        1. WAITING_FOR_BUY_DECISION - gracz stanął na wolnym polu, silnik czeka na decyzję dotyczącą zakupu przez gracza
        2. IN_PRISON_DECISION - gracz zaczyna turę w więzieniu, zanim będzie mógł normalnie zagrać, serwer czeka na decyzję czy opłaca wyjście, czy używa kartę (jeśli dostępna) czy próbuje wyrzucić dublet
        3. DRAWING_CARD - jeśli gracz stanie na polu szansa dobiera kartę i wykonuje jej efekt
 */

export interface GameEvent {
    type: string;
    message: string;
}

export default class Game {
    board: Board;
    deck: Deck;
    players: Player[];
    currentPlayerIndex: number;
    dublets_in_a_row: number;
    state: string;
    extraTurn: boolean;
    events: GameEvent[];

    constructor() {
        this.board = new Board();
        this.deck = new Deck();
        this.players = [];
        this.currentPlayerIndex = 0;
        this.dublets_in_a_row = 0;
        this.state = "WAITING_FOR_ROLL";
        this.extraTurn = false;
        this.events = [];
    }

    private emit(message: string): void {
        this.events.push({ type: "info", message });
    }

    cleanEvents(): GameEvent[] {
        const flushed = [...this.events];
        this.events = [];
        return flushed;
    }

    endTurn(): void {
        if (this.extraTurn === false) {
            this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        }
        this.extraTurn = false;
        const activePlayer = this.players[this.currentPlayerIndex];

        if (activePlayer.inPrison === true) {
            this.state = "IN_PRISON_DECISION";
        }
        else if (activePlayer.bankruptcy === true) {
            this.endTurn();
        }
        else {
            this.state = "WAITING_FOR_ROLL";
        }
    }

    handlePrisonDecision(action: string): void {
        if (this.state === "IN_PRISON_DECISION") {
            const activePlayer = this.players[this.currentPlayerIndex];

            switch (action) {
                case "PAY":
                    if (activePlayer.accountBalance >= 50) {
                        activePlayer.accountBalance -= 50;
                        activePlayer.inPrison = false;
                        activePlayer.turnsInPrison = 0;
                        this.emit(`Gracz: ${activePlayer.name} płaci 50$ kary dyscyplinarnej i pomyślnie opuszcza Komisję`);
                        this.state = "WAITING_FOR_ROLL";
                    } else {
                        this.emit(`Gracz: ${activePlayer.name} nie ma wystarczająco pieniędzy, by opłacić karę`);
                    }
                    break;

                case "CARD":
                    if (activePlayer.hasOutOfPrisonCard === true) {
                        activePlayer.hasOutOfPrisonCard = false;
                        activePlayer.inPrison = false;
                        activePlayer.turnsInPrison = 0;
                        this.emit(`Gracz: ${activePlayer.name} używa znajomości i wychodzi wolno z Komisji Dyscyplinarnej!`);
                        this.state = "WAITING_FOR_ROLL";
                    } else {
                        this.emit(`Gracz: ${activePlayer.name} próbował użyć karty wyjścia z Komisji, ale jej nie posiada!`);
                    }
                    break;

                case "ROLL":
                    let dice1: number, dice2: number;
                    dice1 = Math.floor(Math.random() * 6) + 1;
                    dice2 = Math.floor(Math.random() * 6) + 1;
                    const totalRoll = dice1 + dice2;

                    if (dice1 === dice2) {
                        activePlayer.position = (activePlayer.position + totalRoll) % 40;
                        activePlayer.turnsInPrison = 0;
                        activePlayer.inPrison = false;
                        this.emit(`Gracz: ${activePlayer.name} wyrzuca dublet. Przesuwa się o: ${totalRoll} pola. Nowa pozycja: ${activePlayer.position}`);
                        this.state = "FIELD_CHECKING";
                        this.checkSpace();
                    }
                    else if (activePlayer.turnsInPrison === 2) {
                        if (activePlayer.accountBalance >= 50) {
                            activePlayer.accountBalance -= 50;
                            activePlayer.turnsInPrison = 0;
                            activePlayer.inPrison = false;
                            this.emit(`Gracz: ${activePlayer.name} płaci 50$ kary dyscyplinarnej i pomyślnie opuszcza Komisję`);
                            activePlayer.position = (activePlayer.position + totalRoll) % 40;
                            this.state = "FIELD_CHECKING";
                            this.checkSpace();
                        } else {
                            this.emit(`Gracz: ${activePlayer.name} nie ma wystarczająco pieniędzy, by opłacić karę`);
                        }
                    }
                    else {
                        activePlayer.turnsInPrison++;
                        this.endTurn()
                    }
                    break;


                default:
                    this.emit("Nieznana akcja");
                    break;
            }
        }
    }

    buyProperty(wantsToBuy: boolean): void {
        if (this.state === "WAITING_FOR_BUY_DECISION") {
            const activePlayer = this.players[this.currentPlayerIndex];
            const currentSpace = this.board.spaces[activePlayer.position]

            if (wantsToBuy === true) {
                activePlayer.accountBalance -= currentSpace.price;
                this.emit(`Gracz: ${activePlayer.name} płaci za kierunek: ${currentSpace.name} zapłacił: ${currentSpace.price}`);
                currentSpace.ownerID = activePlayer.id;
                this.endTurn();
            }
            else {
                this.emit(`Gracz ${activePlayer.name} nie kupuje kierunku ${currentSpace.name}`);
                this.endTurn();
            }
        }
    }

    checkSpace(): void {
        if (this.state === "FIELD_CHECKING") {
            const activePlayer = this.players[this.currentPlayerIndex];
            const currentSpace = this.board.spaces[activePlayer.position]
            switch (currentSpace.type) {
                case "START":
                    activePlayer.accountBalance += currentSpace.baseRent;
                    this.emit(`Gracz: ${activePlayer.name} rozpoczyna nowy semestr. Dziekanat wypłaca stypendium w wysokości ${currentSpace.baseRent}`);
                    this.endTurn();
                    break;

                case "PROPERTY":
                    if (currentSpace.ownerID != null) {
                        let totalInGroup = 0;
                        let ownedByPlayer = 0;
                        let monopol = false;

                        const owner = this.getPlayerOfThrow(currentSpace.ownerID);

                        for (let i = 0; i < this.board.spaces.length; i++) {
                            const space = this.board.spaces[i];

                            if (space.colour === currentSpace.colour) {
                                totalInGroup++;
                                if (space.ownerID === currentSpace.ownerID) {
                                    ownedByPlayer++;
                                }
                            }
                        }
                        if (totalInGroup > 0 && totalInGroup === ownedByPlayer) {
                            monopol = true;
                        }

                        if (monopol === true) {
                            let rent = currentSpace.baseRent * 2;
                            if (activePlayer.accountBalance >= rent) {
                                activePlayer.accountBalance -= rent;
                                owner.accountBalance += rent;
                                this.emit(`Gracz ${activePlayer.name} staje na kierunku ${currentSpace.name}, gracz ${owner.name} kontroluje cały wydział. Gracz ${activePlayer.name} opłaca podwójną opłatę warunkową: ${rent}`);
                                this.endTurn();
                            } else {
                                this.declareBankruptcy(activePlayer, owner);
                            }
                        }
                        else {
                            let rent = currentSpace.baseRent;
                            if (activePlayer.accountBalance >= rent) {
                                activePlayer.accountBalance -= rent;
                                owner.accountBalance += rent;
                                this.emit(`Gracz ${activePlayer.name} staje na kierunku ${currentSpace.name}, które należy do gracza ${owner.name}. Gracz ${activePlayer.name} opłaca warunek: ${rent}`);
                                this.endTurn();
                            } else {
                                this.declareBankruptcy(activePlayer, owner);
                            }
                        }
                    }
                    else {
                        if (activePlayer.accountBalance >= currentSpace.price) {
                            this.state = "WAITING_FOR_BUY_DECISION";
                        }
                        else {
                            this.emit(`Gracz ${activePlayer.name} ma za mało pieniędzy by opłacić naukę na kierunku: ${currentSpace.name}`);
                            this.endTurn();
                        }
                    }
                    break;

                case "STATION":
                    if (currentSpace.ownerID != null) {
                        let ownedByPlayer = 0;
                        const owner = this.getPlayerOfThrow(currentSpace.ownerID);

                        for (let i = 0; i < this.board.spaces.length; i++) {
                            const space = this.board.spaces[i];

                            if (space.type === currentSpace.type && space.ownerID === owner.id) {
                                ownedByPlayer++;
                            }
                        }

                        let rent = currentSpace.baseRent * Math.pow(2, ownedByPlayer - 1); // wzór na podwajanie sumy 25 -> 50 -> 100 -> 200 zależnie od ilości posiadanych dworców

                        if (activePlayer.accountBalance >= rent) {
                            activePlayer.accountBalance -= rent;
                            owner.accountBalance += rent;
                            this.emit(`Gracz ${activePlayer.name} staje na miejscówce ${currentSpace.name}, gracz ${owner.name} posiada ${ownedByPlayer} miejscówek. Gracz ${activePlayer.name} płaci kwotę w wysokości ${rent}`);
                            this.endTurn();
                        } else {
                            this.declareBankruptcy(activePlayer, owner);
                        }
                    }
                    else {
                        if (activePlayer.accountBalance >= currentSpace.price) {
                            this.state = "WAITING_FOR_BUY_DECISION";
                        }
                        else {
                            this.emit(`Gracz ${activePlayer.name} ma za mało pieniędzy by kupić pole: ${currentSpace.name}`);
                            this.endTurn();
                        }
                    }
                    break;

                case "GO_TO_PRISON":
                    this.emit(`Gracz: ${activePlayer.name} zostaje przyłapany na ściąganiu i trafia prosto do Komisji Dyscyplinarnej`);
                    activePlayer.position = 10;
                    activePlayer.inPrison = true;
                    this.extraTurn = false;
                    this.endTurn();
                    break;

                case "PRISON":
                    this.emit(`Gracz: ${activePlayer.name} tylko przechodzi obok Komisji Dyscyplinarnej, nic się nie dzieje`)
                    this.endTurn();
                    break;

                case "TAX":
                    if (activePlayer.accountBalance >= currentSpace.baseRent) {
                        activePlayer.accountBalance -= currentSpace.baseRent;
                        this.emit(`Odjęto ${currentSpace.baseRent} z konta gracza: ${activePlayer.name}`);
                        this.endTurn();
                    } else {
                        this.declareBankruptcy(activePlayer, null);
                    }
                    break;

                case "CHANCE":
                    const card = this.deck.drawCard();
                    if (!card) {
                        this.emit("Talia jest pusta!");
                        this.endTurn();
                        break;
                    }
                    this.emit(`Gracz ${activePlayer.name} wyciąga kartę: ${card.text}`);
                    switch (card.type) {
                        case "ADD_MONEY":
                            activePlayer.accountBalance += card.value;
                            this.endTurn();
                            break;

                        case "SUBTRACT_MONEY":
                            if (activePlayer.accountBalance >= card.value) {
                                activePlayer.accountBalance -= card.value;
                                this.endTurn();
                            } else {
                                this.declareBankruptcy(activePlayer, null);
                            }
                            break;

                        case "MOVE_TO_SPACE":
                            activePlayer.position = card.value;
                            this.emit(`Gracz ${activePlayer.name} przenosi się na pole ${card.value}`);
                            this.checkSpace();
                            break;

                        case "MOVE_RELATIVE":
                            activePlayer.position = (activePlayer.position + card.value + 40) % 40;
                            this.emit(`Gracz ${activePlayer.name} przesuwa się na pozycję ${activePlayer.position}`);
                            this.checkSpace();
                            break;

                        case "GO_TO_PRISON":
                            activePlayer.position = 10;
                            activePlayer.inPrison = true;
                            this.extraTurn = false;
                            this.emit(`Gracz ${activePlayer.name} zostaje odesłany do Komisji Dyscyplinarnej!`);
                            this.endTurn();
                            break;

                        case "OUT_OF_PRISON":
                            activePlayer.hasOutOfPrisonCard = true;
                            this.emit(`Gracz ${activePlayer.name} zachowuje kartę wyjścia z Komisji!`);
                            this.endTurn();
                            break;
                    }
                    break;
                default:
                    this.emit(`Gracz: ${activePlayer.name} stanął na polu ${currentSpace.type}, które nie jest jeszcze obsługiwane.`);
                    this.endTurn();
                    break;
            }
        }
    }

    declareBankruptcy(bankruptPlayer: Player, creditor: Player | null = null): void {
        this.emit(`Gracz ${bankruptPlayer.name} nie wytrzymał presji, brakuje mu środków i rzuca studia`);
        bankruptPlayer.bankruptcy = true;

        // wszystkie wydziały i stacje ZAWSZE wracają do uczelni czyli naszego banku
        for (let i = 0; i < this.board.spaces.length; i++) {
            if (this.board.spaces[i].ownerID === bankruptPlayer.id) {
                this.board.spaces[i].ownerID = null;
                this.emit(`Pole ${this.board.spaces[i]?.name || "nieznane"} wraca pod władze uczelni`);
            }
        }

        // reszta gotówki, którą gracz posiadał zostaje przeniesiona do gracza, który go wyeliminował
        if (creditor !== null) {
            creditor.accountBalance += bankruptPlayer.accountBalance;
        }
        bankruptPlayer.accountBalance = 0;

        this.checkWinCondition();
    }

    checkWinCondition(): void {
        const activePlayers = this.players.filter(p => p.bankruptcy === false);

        if (activePlayers.length === 1) {
            this.emit(`Koniec gry! Zwycięża i dyplom zgarnia: ${activePlayers[0].name}!`);
            this.state = "GAME_OVER";
        } else {
            this.endTurn();
        }
    }

    rollDice(): void {
        if (this.state === "WAITING_FOR_ROLL") {
            const activePlayer = this.players[this.currentPlayerIndex];

            if (activePlayer.inPrison === true) {
                this.state = "IN_PRISON_DECISION";
            }

            let dice1: number, dice2: number;
            dice1 = Math.floor(Math.random() * 6) + 1;
            dice2 = Math.floor(Math.random() * 6) + 1;
            const totalRoll = dice1 + dice2;

            if (dice1 === dice2) {
                this.dublets_in_a_row++;
                this.extraTurn = true;
            }
            else {
                this.dublets_in_a_row = 0;
            }
            if (this.dublets_in_a_row === 3) {
                activePlayer.position = 10;
                activePlayer.inPrison = true;
                this.extraTurn = false;
                this.dublets_in_a_row = 0;
                this.emit(`Gracz: ${activePlayer.name} oszukiwał na studiach (3 dublety pod rząd). Rektor wysyła go do Komisji Dyscyplinarnej`);
                this.endTurn();
                return;
            }
            else {
                activePlayer.position = (activePlayer.position + totalRoll) % 40;
            }
            this.emit(`Gracz: ${activePlayer.name} wyrzuca ${totalRoll}. Nowa pozycja: ${activePlayer.position}`);
            this.state = "FIELD_CHECKING";
            this.checkSpace();
        }
    }


    private getPlayerOfThrow(ownerID: number) {
        const owner = this.players.find(p => p.id === ownerID);
        if (!owner) {
            throw new Error("owner powinnien istnieć!")
        }
        return owner;
    }

}
