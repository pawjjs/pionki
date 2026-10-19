export const MAX_PLAYERS_IN_ROOM = 4;

export class PlayersRoom {
    constructor(
        public readonly id: string,
        public readonly owner: string,
        public readonly players: string[],
    ) {}
}
