import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { createObserveModule } from '@nestjs/observe';
import { UsersModule } from './users/users.module.js';
import { RoomsModule } from './rooms/rooms.module.js';
import {TypeOrmModule} from "@nestjs/typeorm";

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
    ObserveModule.forRoot({
      appKey: 'YOUR_APP_KEY',
      appSecret: 'YOUR_APP_SECRET',
      serviceId: 'monopoly',
    }),
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'monopoly.sqlite',
      autoLoadEntities: true,
      synchronize: true,}),

    UsersModule,
    RoomsModule,
  ]
})
export class AppModule {}
