import {ApiProperty} from '@nestjs/swagger';

export class RoomSummaryDto {
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
        description: 'Liczba graczy znajdujących się w pokoju',
        example: 2,
        minimum: 1,
        maximum: 4,
    })
    playersCount!: number;
}
