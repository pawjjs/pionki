import {ConflictException, ForbiddenException, Injectable, NotFoundException} from '@nestjs/common';
import {randomUUID} from 'node:crypto';
import {RoomsCache} from './rooms.cache.js';
import {MAX_PLAYERS_IN_ROOM, PlayersRoom} from './rooms.entities.js';
import {RoomSummaryDto} from './dto/room-summary.dto.js';
import {RoomDetailsDto} from './dto/room-details.dto.js';
import {RoomIdDto} from './dto/room-id.dto.js';

@Injectable()
export class RoomsService {
    constructor(private readonly cache: RoomsCache) {}

    openRoom(nickname: string): RoomDetailsDto {
        if (this.cache.findByPlayer(nickname)) {
            throw new ConflictException('You are already in a room');
        }

        const room = new PlayersRoom(randomUUID(), nickname, [nickname]);
        this.cache.save(room);

        return this.toDetails(room);
    }

    getAvailableRooms(nickname: string): RoomSummaryDto[] {
        const ownRoom = this.cache.findByPlayer(nickname);

        return this.cache
            .findAll()
            .filter((room) => room.id !== ownRoom?.id)
            .filter((room) => room.players.length < MAX_PLAYERS_IN_ROOM)
            .map((room) => this.toSummary(room));
    }

    getMyRoom(nickname: string): RoomIdDto {
        const room = this.cache.findByPlayer(nickname);

        if (!room) {
            throw new NotFoundException('You are not in a room');
        }

        return {id: room.id};
    }

    joinRoom(roomId: string, nickname: string): RoomDetailsDto {
        const room = this.getRoomOrThrow(roomId);

        if (room.players.includes(nickname)) {
            throw new ConflictException('You are already in this room');
        }

        if (room.players.length >= MAX_PLAYERS_IN_ROOM) {
            throw new ConflictException('Room is full');
        }

        const currentRoom = this.cache.findByPlayer(nickname);

        if (currentRoom) {
            this.removePlayer(currentRoom, nickname);
        }

        this.cache.addPlayer(room, nickname);

        return this.toDetails(room);
    }

    leaveRoom(roomId: string, nickname: string): void {
        const room = this.getRoomOrThrow(roomId);

        if (!room.players.includes(nickname)) {
            throw new ForbiddenException('You are not a member of this room');
        }

        this.removePlayer(room, nickname);
    }

    startGame(roomId: string, nickname: string): void {
        const room = this.getRoomOrThrow(roomId);

        if (room.owner !== nickname) {
            throw new ForbiddenException('Only the room owner can start the game');
        }

        this.cache.delete(room);
    }

    private getRoomOrThrow(id: string): PlayersRoom {
        const room = this.cache.findById(id);

        if (!room) {
            throw new NotFoundException('Room not found');
        }

        return room;
    }

    private removePlayer(room: PlayersRoom, nickname: string): void {
        if (room.owner === nickname) {
            this.cache.delete(room);

            return;
        }

        this.cache.removePlayer(room, nickname);
    }

    private toSummary(room: PlayersRoom): RoomSummaryDto {
        return {
            id: room.id,
            owner: room.owner,
            playersCount: room.players.length,
        };
    }

    private toDetails(room: PlayersRoom): RoomDetailsDto {
        return {
            id: room.id,
            owner: room.owner,
            players: [...room.players],
        };
    }
}
