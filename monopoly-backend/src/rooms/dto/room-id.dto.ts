import {ApiProperty} from '@nestjs/swagger';

export class RoomIdDto {
    @ApiProperty({
        description: 'Identyfikator pokoju, w którym znajduje się użytkownik',
        example: '3d6f0f34-9f2e-4f5f-8f5a-2e1d4c3b2a10',
    })
    id!: string;
}
