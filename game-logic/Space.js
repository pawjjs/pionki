class Space {
    constructor(id, name, colour, type, price, baseRent) {
        this.id = id;
        this.name = name;
        this.colour = colour;
        this.type = type;
        this.price = price;
        this.baseRent = baseRent;
        this.ownerID = null;
    }
}
export default Space;