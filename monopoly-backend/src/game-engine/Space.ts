export default class Space {
    id: number;
    name: string;
    colour: string | null;
    type: string;
    price: number;
    baseRent: number;
    ownerID: number | null;

    constructor(id: number, name: string, colour: string | null, type: string, price: number, baseRent: number) {
        this.id = id;
        this.name = name;
        this.colour = colour;
        this.type = type;
        this.price = price;
        this.baseRent = baseRent;
        this.ownerID = null;
    }
}
