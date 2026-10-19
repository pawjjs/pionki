import {Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiBody,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {UsersService} from "./users.service.js";
import {RegisterUserDto} from "./dto/register-user.dto.js";
import {LoginUserDto} from "./dto/login-user.dto.js";
import {AccessTokenResponseDto, CurrentUserDto, RegisterResponseDto} from "./dto/auth-response.dto.js";
import {JwtAuthGuard} from "../auth/jwt-auth.guard.js";
import type {AuthenticatedRequest} from "../auth/jwt-auth.guard.js";

@ApiTags('users')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post('register')
    @ApiOperation({
        summary: 'Zarejestruj użytkownika',
        description: 'Tworzy użytkownika. Hasło jest hashowane algorytmem argon2 przed zapisaniem.',
    })
    @ApiBody({type: RegisterUserDto})
    @ApiCreatedResponse({
        description: 'Użytkownik został pomyślnie zarejestrowany',
        type: RegisterResponseDto,
    })
    async register(@Body() dto: RegisterUserDto) {
        const user = await this.usersService.registerUser(dto);

        return {
            username: user.username,
        };
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Pobierz JWT',
        description: 'Weryfikuje nazwę użytkownika i hasło, a następnie wydaje JWT ważny przez 12 godzin.',
    })
    @ApiBody({type: LoginUserDto})
    @ApiOkResponse({
        description: 'Uwierzytelnienie zakończone pomyślnie',
        type: AccessTokenResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: 'Nieprawidłowa nazwa użytkownika lub hasło',
    })
    async login(@Body() dto: LoginUserDto) {
        return this.usersService.login(dto);
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Pobierz bieżącego użytkownika',
        description: 'Weryfikuje JWT z nagłówka Authorization i zwraca jego payload.',
    })
    @ApiOkResponse({
        description: 'Dane ze zweryfikowanego JWT',
        type: CurrentUserDto,
    })
    @ApiUnauthorizedResponse({
        description: 'Brak tokena, token jest nieprawidłowy lub wygasł',
    })
    me(@Req() request: AuthenticatedRequest) {
        return request.user;
    }
}
