class Player {
    constructor(id, name, colour) {
        // Dane przekazywane z zewnątrz
        this.id = id;
        this.name = name;
        this.colour = colour;
        // Wartości startowe (zawsze takie same na początku gry)
        this.accountBalance = 1500;
        this.bankruptcy = false;
        this.position = 0;
        this.inPrison = false;
        this.turnsInPrison = 0;
    }
}
export default Player;