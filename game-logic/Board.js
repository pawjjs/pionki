class Board {
    constructor() {
        this.spaces = spacesData.map(data => data.id, data.name, data.colour, data.type, data.price, data.baseRent)
    }
}
module.exports = Board;