import spacesData from './spaces_pl.json' with { type: 'json' };
import Space from './Space.js';

interface SpaceData {
    id: number;
    name: string;
    colour: string | null;
    type: string;
    price: number;
    baseRent: number;
}

export default class Board {
    spaces: Space[];

    constructor() {
        this.spaces = (spacesData as SpaceData[]).map(data => new Space(data.id, data.name, data.colour, data.type, data.price, data.baseRent));
    }
}
