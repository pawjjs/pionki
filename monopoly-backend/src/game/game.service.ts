import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import Game from '../game-engine/Game.js';
import Player from '../game-engine/Player.js';
import type { GameResponse, GameStateSnapshot } from './interfaces/game-state.interface.js';

const PLAYER_COLORS = ['red', 'blue', 'green', 'yellow'];

@Injectable()
export class GameService {
  private readonly games = new Map<string, Game>();

  createGame(gameId: string, playerNicknames: string[]): GameResponse {
    if (this.games.has(gameId)) {
      throw new BadRequestException('Gra o tym ID już istnieje');
    }

    const players = playerNicknames.map((nickname, index) => new Player(index, nickname, PLAYER_COLORS[index]))
    const game = new Game(players);

    this.games.set(gameId, game);
    return this.toResponse(gameId, game);
  }

  getGame(gameId: string): Game {
    const game = this.games.get(gameId);
    if (!game) {
      throw new NotFoundException('Gra nie została znaleziona');
    }
    return game;
  }

  getGameState(gameId: string): GameResponse {
    const game = this.getGame(gameId);
    return this.toResponse(gameId, game);
  }

  rollDice(gameId: string, playerNickname: string): GameResponse {
    const game = this.getGameForActivePlayer(gameId, playerNickname);
    game.rollDice();
    return this.toResponse(gameId, game)
  }

  buyDecision(gameId: string, playerNickname: string, wantsToBuy: boolean): GameResponse {
    const game = this.getGameForActivePlayer(gameId, playerNickname);
    game.buyProperty(wantsToBuy);
    return this.toResponse(gameId, game)
  }

  prisonDecision(gameId: string, playerNickname: string, action: string): GameResponse {
    const game = this.getGameForActivePlayer(gameId, playerNickname);
    game.handlePrisonDecision(action);
    return this.toResponse(gameId, game)
  }

  private toResponse(gameId: string, game: Game): GameResponse {
    const events = game.cleanEvents();
    const state: GameStateSnapshot = {
      gameId,
      state: game.state,
      currentPlayerIndex: game.currentPlayerIndex,
      extraTurn: game.extraTurn,
      players: game.players,
      spaces: game.board.spaces,
    };

    return { events, state };
  }

  private getGameForActivePlayer(gameId: string, playerNickname: string): Game {
    const game = this.getGame(gameId)
    const activePlayer = game.players[game.currentPlayerIndex];
    if (activePlayer.name !== playerNickname) {
      throw new ForbiddenException('To nie Twoja tura!');
    }

    return game;
  }
}
