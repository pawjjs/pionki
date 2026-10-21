class Player {
    constructor(id, name, colour) {
        // Dane przekazywane z zewnątrz
        this.id = id;
        this.name = name;
        this.colour = colour;
        // Wartości startowe (zawsze takie same na początku gry)
        this.account_balance = 1500;
        this.bankruptcy = false;
        this.position = 0;
        this.in_prison = false;
    }
}
export default Player;