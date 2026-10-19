import {Injectable, UnauthorizedException} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import type {TokenPayload} from './token-payload.interface.js';

const TOKEN_EXPIRES_IN = '12h';

@Injectable()
export class TokenService {
    constructor(private readonly jwtService: JwtService) {}

    generateToken(payload: TokenPayload): string {
        return this.jwtService.sign(payload, {expiresIn: TOKEN_EXPIRES_IN});
    }

    verifyToken(token: string): TokenPayload {
        try {
            return this.jwtService.verify<TokenPayload>(token);
        } catch {
            throw new UnauthorizedException('Invalid or expired token');
        }
    }
}
