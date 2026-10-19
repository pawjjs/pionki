import {Module} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {JwtModule} from '@nestjs/jwt';
import {TokenService} from './token.service.js';

@Module({
    imports: [
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const secret = configService.get<string>('JWT_SECRET');

                if (!secret) {
                    throw new Error('JWT_SECRET environment variable is required');
                }

                return {secret};
            },
        }),
    ],
    providers: [TokenService],
    exports: [TokenService],
})
export class AuthModule {}
