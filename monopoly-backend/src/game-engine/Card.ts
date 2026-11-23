export default class Card {
    id: number;
    text: string;
    type: string;
    value: number;
    ownerID: number | null;

    constructor(id: number, text: string, type: string, value: number) {
        this.id = id;
        this.text = text;
        this.type = type;
        this.value = value;
        this.ownerID = null;
    }
}
