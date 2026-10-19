import {ApiProperty} from '@nestjs/swagger';

export class RegisterResponseDto {
    @ApiProperty({
        description: 'Nazwa zarejestrowanego użytkownika',
        example: 'alice',
    })
    username!: string;
}

export class AccessTokenResponseDto {
    @ApiProperty({
        description: 'JWT do autoryzacji. Okres ważności — 12 godzin',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiYWxpY2UifQ.signature',
    })
    accessToken!: string;
}

export class CurrentUserDto {
    @ApiProperty({
        description: 'Identyfikator użytkownika',
        example: 1,
    })
    sub!: number;

    @ApiProperty({
        description: 'Nazwa użytkownika',
        example: 'alice',
    })
    username!: string;

    @ApiProperty({
        description: 'Czas wydania tokena (Unix timestamp)',
        example: 1792440103,
    })
    iat!: number;

    @ApiProperty({
        description: 'Czas wygaśnięcia tokena (Unix timestamp)',
        example: 1792483303,
    })
    exp!: number;
}
