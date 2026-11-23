export default class Player {
    id: number;
    name: string;
    colour: string;
    accountBalance: number;
    bankruptcy: boolean;
    position: number;
    inPrison: boolean;
    turnsInPrison: number;
    hasOutOfPrisonCard: boolean;

    constructor(id: number, name: string, colour: string) {
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
        this.hasOutOfPrisonCard = false;
    }
}
