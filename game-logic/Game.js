import Board from './Board.js';
import Player from './Player';

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
export default Game;