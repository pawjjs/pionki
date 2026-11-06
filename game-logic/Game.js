import Board from './Board.js';
import Player from './Player.js';

/*
    STANY GRY:
        1. WAITING_FOR_ROLL - rzut kości przez gracza, przesunięcie znacznika na dane pole
        2. FIELD_CHECKING - sprawdzamy co to za pole na, którym gracz stanął właśnie i co trzeba zrobić (jaką akcje wykonać)
        3. END_TURN - podsumowanie tury, sprawdzenie czy gracz ma dodatkowy ruch za dublet, zmiana gracza na następnego

    STANY DECYZJI GRACZA PODCZAS TURY:
        1. WAITING_FOR_BUY_DECISION - gracz stanął na wolnym polu, silnik czeka na decyzję dotyczącą zakupu przez gracza
        2. IN_PRISON_DECISION - gracz zaczyna turę w więzieniu, zanim będzie mógł normalnie zagrać, serwer czeka na decyzję czy opłaca wyjście, czy używa kartę (jeśli dostępna) czy próbuje wyrzucić dublet
        3. DRAWING_CARD - jeśli gracz stanie na polu szansa dobiera kartę i wykonuje jej efekt
 */

// aktualnie nie ma obsługi kart, bankructwa oraz zakończenia gry

class Game {
    constructor() {
        this.board = new Board()
        this.players = [
            new Player(1, "Oliwia", "red"),
            new Player(2, "Karolina", "green")
        ];
        this.currentPlayerIndex = 0;
        this.dublets_in_a_row = 0;
        this.state = "WAITING_FOR_ROLL";
        this.extraTurn = false;
    }

    endTurn(){
        if (this.extraTurn === false) {
            this.currentPlayerIndex = (this.currentPlayerIndex+1) % this.players.length;
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

    handlePrisonDecision(action) {
        if (this.state === "IN_PRISON_DECISION") {
            const activePlayer = this.players[this.currentPlayerIndex];

            switch (action) {
                case "PAY":
                    if (activePlayer.accountBalance >= 50) {
                        activePlayer.accountBalance -= 50;
                        activePlayer.inPrison = false;
                        activePlayer.turnsInPrison = 0;
                        console.log(`Gracz: ${activePlayer.name} płaci 50$ grzywny i wychodzi z więzienia`);
                        this.state = "WAITING_FOR_ROLL";
                    } else {
                        console.log(`Gracz: ${activePlayer.name} nie ma wystarczająco pieniędzy, by zapłacić grzywnę`);
                    }
                    break;

                case "CARD":
                    // Logika użycia karty wyjścia z więzienia
                    break;

                case "ROLL":
                    let dice1, dice2;
                    dice1 = Math.floor(Math.random() * 6) + 1;
                    dice2 = Math.floor(Math.random() * 6) + 1;
                    const totalRoll = dice1 + dice2;

                    if (dice1 === dice2) {
                        activePlayer.position = (activePlayer.position + totalRoll)%40;
                        activePlayer.turnsInPrison = 0;
                        activePlayer.inPrison = false;
                        console.log(`Gracz: ${activePlayer.name} wyrzuca dublet. Przesuwa się o: ${totalRoll} pola. Nowa pozycja: ${activePlayer.position}`);
                        this.state = "FIELD_CHECKING";
                        this.checkSpace();
                    }
                    else if (activePlayer.turnsInPrison === 2){
                        if (activePlayer.accountBalance >= 50) {
                            activePlayer.accountBalance -= 50;
                            activePlayer.turnsInPrison = 0;
                            activePlayer.inPrison = false;
                            console.log(`Gracz: ${activePlayer.name} płaci 50$ grzywny i wychodzi z więzienia`);
                            activePlayer.position = (activePlayer.position + totalRoll)%40;
                            this.state = "FIELD_CHECKING";
                            this.checkSpace();
                        } else {
                            console.log(`Gracz: ${activePlayer.name} nie ma wystarczająco pieniędzy, by zapłacić grzywnę`);
                        }
                    }
                    else {
                        activePlayer.turnsInPrison++;
                        this.endTurn()
                    }
                    break;


                default:
                    console.log("Nieznana akcja");
                    break;
            }
        }
    }

    buyProperty(wantsToBuy) { // wantsToBuy - true/false
        if (this.state === "WAITING_FOR_BUY_DECISION"){
            const activePlayer = this.players[this.currentPlayerIndex];
            const currentSpace = this.board.spaces[activePlayer.position]

            if (wantsToBuy === true) {
                activePlayer.accountBalance -= currentSpace.price;
                console.log(`Gracz: ${activePlayer.name} płaci za pole: ${currentSpace.text} zapłacił: ${currentSpace.price}`);
                currentSpace.ownerID = activePlayer.id;
                this.endTurn();
            }
            else {
                this.endTurn();
            }
        }
    }

    checkSpace() {
        if (this.state === "FIELD_CHECKING") {
            const activePlayer = this.players[this.currentPlayerIndex];
            const currentSpace = this.board.spaces[activePlayer.position]
            switch (currentSpace.type) {
                case "START":
                    activePlayer.accountBalance += currentSpace.baseRent;
                    console.log(`Dodano ${currentSpace.baseRent} do konta gracza: ${activePlayer.name}`);
                    this.endTurn();
                    break;
                case "PROPERTY":
                    if (currentSpace.ownerID != null) {
                        let totalInGroup = 0;
                        let ownedByPlayer = 0;
                        let monopol = false;

                        const owner = this.players.find(p => p.id === currentSpace.ownerID);

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
                            activePlayer.accountBalance -= rent;
                            owner.accountBalance += rent;
                            console.log(`Gracz ${activePlayer.name} staje na polu ${currentSpace.text}, gracz ${owner.name} ma monopol. Gracz ${activePlayer.name} płaci podwójny podatek w wysokości ${rent}`);
                            this.endTurn();
                        }
                        else {
                            let rent = currentSpace.baseRent;
                            activePlayer.accountBalance -= rent;
                            owner.accountBalance += rent;
                            console.log(`Gracz ${activePlayer.name} staje na polu ${currentSpace.text}, które należy do gracza ${owner.name}. Gracz ${activePlayer.name} płaci podatek w wysokości ${rent}`);
                            this.endTurn();
                        }
                    }
                    else {
                        if (activePlayer.accountBalance >= currentSpace.price){
                            this.state = "WAITING_FOR_BUY_DECISION";
                        }
                        else {
                            console.log(`Gracz ${activePlayer.name} ma za mało pieniędzy by kupić pole: ${currentSpace.name}`);
                            this.endTurn();
                        }
                    }
                    break;
                case "STATION":
                    if (currentSpace.ownerID != null) {
                        let ownedByPlayer = 0;
                        const owner = this.players.find(p => p.id === currentSpace.ownerID);

                        for (let i = 0; i < this.board.spaces.length; i++) {
                            const space = this.board.spaces[i];

                            if (space.type === currentSpace.type && space.ownerID === owner.id) {
                                ownedByPlayer++;
                            }
                        }

                        let rent = currentSpace.baseRent * Math.pow(2, ownedByPlayer - 1); // wzór na podwajanie sumy 25 -> 50 -> 100 -> 200 zależnie od ilości posiadanych dworców
                        activePlayer.accountBalance -= rent;
                        owner.accountBalance += rent;
                        console.log(`Gracz ${activePlayer.name} staje na stacji ${currentSpace.text}, gracz ${owner.name} posiada ${ownedByPlayer} stacje. Gracz ${activePlayer.name} płaci podatek w wysokości ${rent}`);
                        this.endTurn();
                    }
                    else {
                        if (activePlayer.accountBalance >= currentSpace.price){
                            this.state = "WAITING_FOR_BUY_DECISION";
                        }
                        else {
                            console.log(`Gracz ${activePlayer.name} ma za mało pieniędzy by kupić pole: ${currentSpace.name}`);
                            this.endTurn();
                        }
                    }
                    break;
                case "GO_TO_PRISON":
                    console.log(`Gracz: ${activePlayer.name} idzie do więzienia`);
                    activePlayer.position = 10;
                    activePlayer.inPrison = true;
                    this.extraTurn = false;
                    this.endTurn();
                    break;
                case "PRISON":
                    console.log(`Gracz: ${activePlayer.name} odwiedza więzienie nic się nie dzieje`)
                    this.endTurn();
                    break;
                case "TAX":
                    activePlayer.accountBalance -= currentSpace.baseRent;
                    console.log(`Odjęto ${currentSpace.baseRent} z konta gracza: ${activePlayer.name}`);
                    this.endTurn();
                    break;
                default: // obsługa błędu jak stanie na polu z kartami
                    console.log(`Gracz: ${activePlayer.name} stanął na polu ${currentSpace.type}, które nie jest jeszcze obsługiwane.`);
                    this.endTurn();
                    break;
            }
        }
    }

    rollDice(){
        if (this.state === "WAITING_FOR_ROLL"){
            const activePlayer = this.players[this.currentPlayerIndex];

            if (activePlayer.inPrison === true){
                this.state = "IN_PRISON_DECISION";
            }

            let dice1, dice2;
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
            if (this.dublets_in_a_row === 3){
                activePlayer.position = 10;
                activePlayer.inPrison = true;
                this.extraTurn = false;
                this.dublets_in_a_row = 0;
                // zmiana na stan w więzieniu
                console.log(`Gracz: ${activePlayer.name} wyrzuca ${this.dublets_in_a_row} dublety pod rząd. Idzie do więzienia`);
                this.endTurn();
                return;
            }
            else {
                activePlayer.position = (activePlayer.position + totalRoll)%40;
            }
            console.log(`Gracz: ${activePlayer.name} wyrzuca ${totalRoll}. Nowa pozycja: ${activePlayer.position}`);
            this.state = "FIELD_CHECKING";
            this.checkSpace();
        }
    }
}
export default Game;