import {ApiProperty} from '@nestjs/swagger';

export class LoginUserDto {
    @ApiProperty({
        description: 'Nazwa zarejestrowanego użytkownika',
        example: 'alice',
    })
    username!: string;

    @ApiProperty({
        description: 'Hasło użytkownika',
        example: 'secret-password',
        format: 'password',
        writeOnly: true,
    })
    password!: string;
}
