import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Reservation entity as returned by the API. */
export class ReservationResponseDto {
  @ApiProperty({ example: 'clx123abc456def789', description: 'Unique reservation ID (CUID).' })
  id!: string;

  @ApiProperty({ example: 'clx456def789ghi012', description: 'Space ID (CUID).' })
  spaceId!: string;

  @ApiPropertyOptional({ example: 'clx789ghi012jkl345', description: 'Place ID (CUID, optional).' })
  placeId!: string | null;

  @ApiProperty({ example: 'client@example.com', description: 'Client email.' })
  clientEmail!: string;

  @ApiProperty({ example: '2025-03-15T00:00:00.000Z', description: 'Reservation date (ISO).' })
  reservationDate!: string;

  @ApiProperty({ example: '10:00', description: 'Start time.' })
  startTime!: string;

  @ApiProperty({ example: '12:00', description: 'End time.' })
  endTime!: string;
}
