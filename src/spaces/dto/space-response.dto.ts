import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Space entity as returned by the API. */
export class SpaceResponseDto {
  @ApiProperty({ example: 'clx123abc456def789', description: 'Unique space ID (CUID).' })
  id!: string;

  @ApiProperty({ example: 'clx456def789ghi012', description: 'Place ID (CUID) this space belongs to.' })
  placeId!: string;

  @ApiProperty({ example: 'Meeting Room A', description: 'Space name.' })
  name!: string;

  @ApiProperty({ example: 'ROOM-A1', description: 'Room or space reference code.' })
  reference!: string;

  @ApiPropertyOptional({ example: 10, description: 'Maximum capacity.' })
  capacity?: number | null;

  @ApiPropertyOptional({ example: 'Quiet room with whiteboard', description: 'Space description.' })
  description?: string | null;
}
