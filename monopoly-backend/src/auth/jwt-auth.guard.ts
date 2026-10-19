import {CanActivate, ExecutionContext, Injectable, UnauthorizedException} from '@nestjs/common';
import type {Request} from 'express';
import {TokenService} from './token.service.js';
import type {TokenPayload} from './token-payload.interface.js';

export interface AuthenticatedRequest extends Request {
    user: TokenPayload;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private readonly tokenService: TokenService) {}

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
        const [type, token] = request.headers.authorization?.split(' ') ?? [];

        if (type !== 'Bearer' || !token) {
            throw new UnauthorizedException('Missing bearer token');
        }

        request.user = this.tokenService.verifyToken(token);

        return true;
    }
}
