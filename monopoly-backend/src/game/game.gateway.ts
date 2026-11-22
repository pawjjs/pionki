import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service.js';
import { TokenService } from '../auth/token.service.js';

interface JoinGamePayload {
  gameId: string;
}

interface RollDicePayload {
  gameId: string;
}

interface BuyDecisionPayload {
  gameId: string;
  wantsToBuy: boolean;
}

interface PrisonDecisionPayload {
  gameId: string;
  action: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly gameService: GameService, private readonly tokenService: TokenService) { }

  handleConnection(client: Socket): void {
    const token = client.handshake.auth?.token;
    const [type, jwtString] = token?.split(' ') ?? [];

    if (type !== 'Bearer' || !token) {
      client.emit('error', { message: 'Missing bearer token' });
      client.disconnect(true);
      return;
    }

    try {
      const tokenPayload = this.tokenService.verifyToken(jwtString);
      const nickname = tokenPayload.sub
      client.data.nickname = nickname;

      console.log(`Klient połączony: ${nickname}, ${client.id}`);
    } catch (error) {
      client.emit('error', { message: 'Invalid or expired token' });
      console.log(`Nieudany auth socketu ${client.id}`);
      client.disconnect(true);  
    }
  }

  handleDisconnect(client: Socket): void {
    console.log(`Klient rozłączony: ${client.id}`);
  }

  @SubscribeMessage('join_game')
  handleJoinGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinGamePayload,
  ): void {
    const roomName = `game:${payload.gameId}`;
    client.join(roomName);

    try {
      const response = this.gameService.getGameState(payload.gameId);

      client.emit('game_state', response); // Wysyłamy aktualny stan tylko do klienta, który właśnie dołączył/zrobił reconnect
    } catch (error: any) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('roll_dice')
  handleRollDice(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: RollDicePayload,
  ): void {
    try {
      const response = this.gameService.rollDice(payload.gameId, this.getNickname(client))
      this.server.to(`game:${payload.gameId}`).emit('game_state', response);
    } catch (error: any) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('buy_decision')
  handleBuyDecision(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: BuyDecisionPayload,
  ): void {
    try {
      const response = this.gameService.buyDecision(payload.gameId, this.getNickname(client), payload.wantsToBuy)
      this.server.to(`game:${payload.gameId}`).emit('game_state', response);
    } catch (error: any) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('prison_decision')
  handlePrisonDecision(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: PrisonDecisionPayload,
  ): void {
    try {
      const response = this.gameService.prisonDecision(payload.gameId, this.getNickname(client), payload.action)
      this.server.to(`game:${payload.gameId}`).emit('game_state', response);
    } catch (error: any) {
      client.emit('error', { message: error.message });
    }
  }

  private getNickname(client: Socket): string {
    return client.data.nickname;
  }
}
