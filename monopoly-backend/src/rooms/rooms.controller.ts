import {
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Redirect,
    Req,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiConflictResponse,
    ApiCreatedResponse,
    ApiForbiddenResponse,
    ApiFoundResponse,
    ApiNoContentResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {JwtAuthGuard} from '../auth/jwt-auth.guard.js';
import type {AuthenticatedRequest} from '../auth/jwt-auth.guard.js';
import {RoomsService} from './rooms.service.js';
import {RoomDetailsDto} from './dto/room-details.dto.js';
import {RoomSummaryDto} from './dto/room-summary.dto.js';
import {RoomIdDto} from './dto/room-id.dto.js';

const GAME_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

@ApiTags('rooms')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('rooms')
export class RoomsController {
    constructor(private readonly roomsService: RoomsService) {}

    @Get()
    @ApiOperation({
        summary: 'Pobierz dostępne pokoje',
        description:
            'Zwraca pokoje, do których można dołączyć (mniej niż 4 graczy), z wyłączeniem pokoju bieżącego użytkownika.',
    })
    @ApiOkResponse({
        description: 'Lista dostępnych pokoi',
        type: [RoomSummaryDto],
    })
    @ApiUnauthorizedResponse({
        description: 'Brak tokena, token jest nieprawidłowy lub wygasł',
    })
    getAvailableRooms(@Req() request: AuthenticatedRequest): RoomSummaryDto[] {
        return this.roomsService.getAvailableRooms(request.user.sub);
    }

    @Get('mine')
    @ApiOperation({
        summary: 'Pobierz identyfikator własnego pokoju',
        description: 'Zwraca identyfikator pokoju, w którym aktualnie znajduje się użytkownik.',
    })
    @ApiOkResponse({
        description: 'Identyfikator pokoju użytkownika',
        type: RoomIdDto,
    })
    @ApiNotFoundResponse({
        description: 'Użytkownik nie znajduje się w żadnym pokoju',
    })
    @ApiUnauthorizedResponse({
        description: 'Brak tokena, token jest nieprawidłowy lub wygasł',
    })
    getMyRoom(@Req() request: AuthenticatedRequest): RoomIdDto {
        return this.roomsService.getMyRoom(request.user.sub);
    }

    @Post()
    @ApiOperation({
        summary: 'Otwórz pokój',
        description:
            'Tworzy nowy pokój, którego właścicielem zostaje użytkownik z tokena JWT. Właściciel automatycznie trafia do pokoju.',
    })
    @ApiCreatedResponse({
        description: 'Pokój został utworzony',
        type: RoomDetailsDto,
    })
    @ApiConflictResponse({
        description: 'Użytkownik już znajduje się w pokoju',
    })
    @ApiUnauthorizedResponse({
        description: 'Brak tokena, token jest nieprawidłowy lub wygasł',
    })
    openRoom(@Req() request: AuthenticatedRequest): RoomDetailsDto {
        return this.roomsService.openRoom(request.user.sub);
    }

    @Post(':id/join')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Dołącz do pokoju',
        description:
            'Dodaje użytkownika z tokena JWT do pokoju. Jeśli użytkownik był w innym pokoju, opuszcza go. Maksymalnie 4 graczy.',
    })
    @ApiOkResponse({
        description: 'Użytkownik dołączył do pokoju',
        type: RoomDetailsDto,
    })
    @ApiConflictResponse({
        description: 'Użytkownik już jest w tym pokoju lub pokój jest pełny',
    })
    @ApiNotFoundResponse({
        description: 'Pokój nie został znaleziony',
    })
    @ApiUnauthorizedResponse({
        description: 'Brak tokena, token jest nieprawidłowy lub wygasł',
    })
    joinRoom(
        @Param('id') id: string,
        @Req() request: AuthenticatedRequest,
    ): RoomDetailsDto {
        return this.roomsService.joinRoom(id, request.user.sub);
    }

    @Post(':id/leave')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Opuść pokój',
        description:
            'Usuwa użytkownika z tokena JWT z pokoju. Jeśli pokój opuszcza właściciel, pokój jest usuwany wraz ze wszystkimi graczami.',
    })
    @ApiNoContentResponse({
        description: 'Użytkownik opuścił pokój',
    })
    @ApiForbiddenResponse({
        description: 'Użytkownik nie jest członkiem tego pokoju',
    })
    @ApiNotFoundResponse({
        description: 'Pokój nie został znaleziony',
    })
    @ApiUnauthorizedResponse({
        description: 'Brak tokena, token jest nieprawidłowy lub wygasł',
    })
    leaveRoom(
        @Param('id') id: string,
        @Req() request: AuthenticatedRequest,
    ): void {
        this.roomsService.leaveRoom(id, request.user.sub);
    }

    @Post(':id/start')
    @Redirect(GAME_URL, HttpStatus.FOUND)
    @ApiOperation({
        summary: 'Rozpocznij grę',
        description:
            'Może wywołać wyłącznie właściciel pokoju. Po rozpoczęciu pokój jest usuwany, a klient jest przekierowywany do gry.',
    })
    @ApiFoundResponse({
        description: 'Przekierowanie do uruchomionej gry',
        headers: {
            Location: {
                description: GAME_URL,
                schema: {type: 'string', example: GAME_URL},
            },
        },
    })
    @ApiForbiddenResponse({
        description: 'Tylko właściciel pokoju może rozpocząć grę',
    })
    @ApiNotFoundResponse({
        description: 'Pokój nie został znaleziony',
    })
    @ApiUnauthorizedResponse({
        description: 'Brak tokena, token jest nieprawidłowy lub wygasł',
    })
    startGame(
        @Param('id') id: string,
        @Req() request: AuthenticatedRequest,
    ): void {
        this.roomsService.startGame(id, request.user.sub);
    }
}
