import spacesData from './spaces_pl.json' with { type: 'json' };

class Board {
    constructor() {
        this.spaces = spacesData.map(data => data.id, data.name, data.colour, data.type, data.price, data.baseRent);
    }
}
export default Board;