import Board from './Board.js';
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

class Game {
    constructor() {
        this.board = new Board();
        this.deck = new Deck();
        this.players = [];
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
                        console.log(`Gracz: ${activePlayer.name} płaci 50$ kary dyscyplinarnej i pomyślnie opuszcza Komisję`);
                        this.state = "WAITING_FOR_ROLL";
                    } else {
                        console.log(`Gracz: ${activePlayer.name} nie ma wystarczająco pieniędzy, by opłacić karę`);
                    }
                    break;

                case "CARD":
                    if (activePlayer.hasOutOfPrisonCard === true) {
                        activePlayer.hasOutOfPrisonCard = false;
                        activePlayer.inPrison = false;
                        activePlayer.turnsInPrison = 0;
                        console.log(`Gracz: ${activePlayer.name} używa znajomości i wychodzi wolno z Komisji Dyscyplinarnej!`);
                        this.state = "WAITING_FOR_ROLL";
                    } else {
                        console.log(`Gracz: ${activePlayer.name} próbował użyć karty wyjścia z Komisji, ale jej nie posiada!`);
                    }
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
                            console.log(`Gracz: ${activePlayer.name} płaci 50$ kary dyscyplinarnej i pomyślnie opuszcza Komisję`);
                            activePlayer.position = (activePlayer.position + totalRoll)%40;
                            this.state = "FIELD_CHECKING";
                            this.checkSpace();
                        } else {
                            console.log(`Gracz: ${activePlayer.name} nie ma wystarczająco pieniędzy, by opłacić karę`);
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
                console.log(`Gracz: ${activePlayer.name} płaci za kierunek: ${currentSpace.text} zapłacił: ${currentSpace.price}`);
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
                    console.log(`Gracz: ${activePlayer.name} rozpoczyna nowy semestr. Dziekanat wypłaca stypendium w wysokości ${currentSpace.baseRent}`);
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
                            if (activePlayer.accountBalance >= rent) {
                                activePlayer.accountBalance -= rent;
                                owner.accountBalance += rent;
                                console.log(`Gracz ${activePlayer.name} staje na kierunku ${currentSpace.text}, gracz ${owner.name} kontroluje cały wydział. Gracz ${activePlayer.name} opłaca podwójną opłatę warunkową: ${rent}`);
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
                                console.log(`Gracz ${activePlayer.name} staje na kierunku ${currentSpace.text}, które należy do gracza ${owner.name}. Gracz ${activePlayer.name} opłaca warunek: ${rent}`);
                                this.endTurn();
                            } else {
                                this.declareBankruptcy(activePlayer, owner);
                            }
                        }
                    }
                    else {
                        if (activePlayer.accountBalance >= currentSpace.price){
                            this.state = "WAITING_FOR_BUY_DECISION";
                        }
                        else {
                            console.log(`Gracz ${activePlayer.name} ma za mało pieniędzy by opłacić naukę na kierunku: ${currentSpace.name}`);
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

                        if (activePlayer.accountBalance >= rent) {
                            activePlayer.accountBalance -= rent;
                            owner.accountBalance += rent;
                            console.log(`Gracz ${activePlayer.name} staje na miejscówce ${currentSpace.text}, gracz ${owner.name} posiada ${ownedByPlayer} miejscówek. Gracz ${activePlayer.name} płaci kwotę w wysokości ${rent}`);
                            this.endTurn();
                        } else {
                            this.declareBankruptcy(activePlayer, owner);
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

                case "GO_TO_PRISON":
                    console.log(`Gracz: ${activePlayer.name} zostaje przyłapany na ściąganiu i trafia prosto do Komisji Dyscyplinarnej`);
                    activePlayer.position = 10;
                    activePlayer.inPrison = true;
                    this.extraTurn = false;
                    this.endTurn();
                    break;

                case "PRISON":
                    console.log(`Gracz: ${activePlayer.name} tylko przechodzi obok Komisji Dyscyplinarnej, nic się nie dzieje`)
                    this.endTurn();
                    break;

                case "TAX":
                    if (activePlayer.accountBalance >= currentSpace.baseRent) {
                        activePlayer.accountBalance -= currentSpace.baseRent;
                        console.log(`Odjęto ${currentSpace.baseRent} z konta gracza: ${activePlayer.name}`);
                        this.endTurn();
                    } else {
                        this.declareBankruptcy(activePlayer, null);
                    }
                    break;

                case "CHANCE":
                    const card = this.deck.drawCard();
                    if (!card) {
                        console.log("Talia jest pusta!");
                        this.endTurn();
                        break;
                    }
                    console.log(`Gracz ${activePlayer.name} wyciąga kartę: ${card.text}`);
                    switch (card.type) {
                        case "ADD_MONEY": // dodanie kasy
                            activePlayer.accountBalance += card.value;
                            this.endTurn();
                            break;

                        case "SUBTRACT_MONEY": // odjęcie kasy
                            if (activePlayer.accountBalance >= card.value) {
                                activePlayer.accountBalance -= card.value;
                                this.endTurn();
                            } else {
                                this.declareBankruptcy(activePlayer, null);
                            }
                            break;

                        case "MOVE_TO_SPACE": // przeniesienie na pole
                            activePlayer.position = card.value;
                            console.log(`Gracz ${activePlayer.name} przenosi się na pole ${card.value}`);
                            this.checkSpace();
                            break;

                        case "MOVE_RELATIVE": // przesunięcie o x pól
                            activePlayer.position = (activePlayer.position + card.value + 40) % 40; // Dodajemy +40 przed modulo żeby cofanie o 3 pola nie cofało nas na pola ujemne np pole nr 2-3=-1 -> 2+40-=39
                            console.log(`Gracz ${activePlayer.name} przesuwa się na pozycję ${activePlayer.position}`);
                            this.checkSpace();
                            break;

                        case "GO_TO_PRISON": // idź do więzienia
                            activePlayer.position = 10;
                            activePlayer.inPrison = true;
                            this.extraTurn = false;
                            console.log(`Gracz ${activePlayer.name} zostaje odesłany do Komisji Dyscyplinarnej!`);
                            this.endTurn();
                            break;

                        case "OUT_OF_PRISON": // karta wyjście z więzienia
                            activePlayer.hasOutOfPrisonCard = true;
                            console.log(`Gracz ${activePlayer.name} zachowuje kartę wyjścia z Komisji!`);
                            this.endTurn();
                            break;
                    }
                    break;
                default:
                    console.log(`Gracz: ${activePlayer.name} stanął na polu ${currentSpace.type}, które nie jest jeszcze obsługiwane.`);
                    this.endTurn();
                    break;
            }
        }
    }

    declareBankruptcy(bankruptPlayer, creditor = null) {
        console.log(`Gracz ${bankruptPlayer.name} nie wytrzymał presji, brakuje mu środków i rzuca studia`);
        bankruptPlayer.bankruptcy = true;

        // wszystkie wydziały i stacje ZAWSZE wracają do uczelni czyli naszego banku
        for (let i = 0; i < this.board.spaces.length; i++) {
            if (this.board.spaces[i].ownerID === bankruptPlayer.id) {
                this.board.spaces[i].ownerID = null;
                console.log(`Pole ${this.board.spaces[i]?.name || "nieznane"} wraca pod władze uczelni`);
            }
        }

        // reszta gotówki, którą gracz posiadał zostaje przeniesiona do gracza, który go wyeliminował
        if (creditor !== null) {
            creditor.accountBalance += bankruptPlayer.accountBalance;
        }
        bankruptPlayer.accountBalance = 0;

        this.checkWinCondition();
    }

    checkWinCondition() {
        const activePlayers = this.players.filter(p => p.bankruptcy === false);

        if (activePlayers.length === 1) {
            console.log(`Koniec gry! Zwycięża i dyplom zgarnia: ${activePlayers[0].name}!`);
            this.state = "GAME_OVER";
        } else {
            this.endTurn();
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
                console.log(`Gracz: ${activePlayer.name} oszukiwał na studiach (3 dublety pod rząd). Rektor wysyła go do Komisji Dyscyplinarnej`);
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