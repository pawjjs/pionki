import {ApiProperty} from '@nestjs/swagger';

export class RoomDetailsDto {
    @ApiProperty({
        description: 'Identyfikator pokoju',
        example: '3d6f0f34-9f2e-4f5f-8f5a-2e1d4c3b2a10',
    })
    id!: string;

    @ApiProperty({
        description: 'Nazwa właściciela pokoju',
        example: 'alice',
    })
    owner!: string;

    @ApiProperty({
        description: 'Nicki graczy znajdujących się w pokoju',
        example: ['alice', 'bob'],
        type: [String],
        minItems: 1,
        maxItems: 4,
    })
    players!: string[];
}
