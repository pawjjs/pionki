import type Player from '../../game-engine/Player.js';
import type Space from '../../game-engine/Space.js';
import type { GameEvent } from '../../game-engine/Game.js';

export interface GameStateSnapshot {
  gameId: string;
  state: string;
  currentPlayerIndex: number;
  extraTurn: boolean;
  players: Player[];
  spaces: Space[];
}

export interface GameResponse {
  events: GameEvent[];
  state: GameStateSnapshot;
}

export type { GameEvent };
