import {ApiProperty} from '@nestjs/swagger';

export class RegisterUserDto {
    @ApiProperty({
        description: 'Unikalna nazwa użytkownika',
        example: 'alice',
    })
    username!: string;

    @ApiProperty({
        description: 'Hasło użytkownika.',
        example: 'secret-password',
        format: 'password',
        writeOnly: true,
    })
    password!: string;
}
