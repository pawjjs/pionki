const Board = require('./Board');
const Player = require('./Player');

class Game {
    constructor() {
        this.board = new Board()
        this.players = [
            new Player(1, "Oliwia", "red"),
            new Player(2, "Karolina", "green")
        ];
        this.currentPlayerIndex = 0;
    }
}

module.exports = Game;