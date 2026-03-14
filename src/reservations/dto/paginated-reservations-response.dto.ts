import { ApiProperty } from '@nestjs/swagger';
import { ReservationResponseDto } from './reservation-response.dto';

/** Paginated reservations response. */
export class PaginatedReservationsResponseDto {
  @ApiProperty({ type: [ReservationResponseDto], description: 'List of reservations.' })
  data!: ReservationResponseDto[];

  @ApiProperty({ example: 1, description: 'Current page (1-based).' })
  page!: number;

  @ApiProperty({ example: 10, description: 'Page size.' })
  size!: number;

  @ApiProperty({ example: 50, description: 'Total number of reservations.' })
  total!: number;
}
