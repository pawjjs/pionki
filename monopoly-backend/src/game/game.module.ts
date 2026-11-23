import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { GameService } from './game.service.js';
import { GameGateway } from './game.gateway.js';

@Module({
  imports: [AuthModule],
  providers: [GameService, GameGateway],
  exports: [GameService],
})
export class GameModule {}
