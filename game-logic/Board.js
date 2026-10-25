import spacesData from './spaces_pl.json' with { type: 'json' };
import Space from './Space.js';

class Board {
    constructor() {
        this.spaces = spacesData.map(data => new Space(data.id, data.name, data.colour, data.type, data.price, data.baseRent));
    }
}
export default Board;