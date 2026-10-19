import {Injectable} from '@nestjs/common';
import {PlayersRoom} from './rooms.entities.js';

@Injectable()
export class RoomsCache {
    private readonly rooms: PlayersRoom[] = [];
    private readonly playerRooms = new Map<string, PlayersRoom>();

    findAll(): readonly PlayersRoom[] {
        return this.rooms;
    }

    findById(id: string): PlayersRoom | undefined {
        return this.rooms.find((room) => room.id === id);
    }

    findByPlayer(nickname: string): PlayersRoom | undefined {
        return this.playerRooms.get(nickname);
    }

    save(room: PlayersRoom): void {
        if (!this.rooms.includes(room)) {
            this.rooms.push(room);
        }

        for (const player of room.players) {
            this.playerRooms.set(player, room);
        }
    }

    delete(room: PlayersRoom): void {
        const index = this.rooms.indexOf(room);

        if (index !== -1) {
            this.rooms.splice(index, 1);
        }

        for (const player of room.players) {
            if (this.playerRooms.get(player) === room) {
                this.playerRooms.delete(player);
            }
        }
    }

    addPlayer(room: PlayersRoom, nickname: string): void {
        if (!room.players.includes(nickname)) {
            room.players.push(nickname);
        }

        this.playerRooms.set(nickname, room);
    }

    removePlayer(room: PlayersRoom, nickname: string): void {
        const index = room.players.indexOf(nickname);

        if (index !== -1) {
            room.players.splice(index, 1);
        }

        if (this.playerRooms.get(nickname) === room) {
            this.playerRooms.delete(nickname);
        }
    }
}
