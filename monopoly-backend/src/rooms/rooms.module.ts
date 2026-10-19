import {Module} from '@nestjs/common';
import {AuthModule} from '../auth/auth.module.js';
import {JwtAuthGuard} from '../auth/jwt-auth.guard.js';
import {RoomsCache} from './rooms.cache.js';
import {RoomsController} from './rooms.controller.js';
import {RoomsService} from './rooms.service.js';

@Module({
    imports: [AuthModule],
    controllers: [RoomsController],
    providers: [RoomsService, RoomsCache, JwtAuthGuard],
    exports: [],
})
export class RoomsModule {}
