import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from 'class-validator';

const TIME_PATTERN = /^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;

/** DTO for creating a reservation. */
export class CreateReservationDto {
  @ApiProperty({ example: 'clx123abc456def789', description: 'Space ID (CUID).', required: true, minLength: 1 })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  spaceId!: string;

  @ApiPropertyOptional({ example: 'clx456def789ghi012', description: 'Place ID (CUID, optional).' })
  @IsOptional()
  @IsString()
  placeId?: string;

  @ApiProperty({ example: 'client@example.com', description: 'Client email.', required: true })
  @IsEmail()
  @IsNotEmpty()
  clientEmail!: string;

  @ApiProperty({ example: '2025-03-15', description: 'Reservation date (YYYY-MM-DD).', required: true })
  @IsDateString()
  @IsNotEmpty()
  reservationDate!: string;

  @ApiProperty({ example: '10:00', description: 'Start time (HH:mm or HH:mm:ss).', required: true })
  @IsString()
  @IsNotEmpty()
  @Matches(TIME_PATTERN, { message: 'startTime must be HH:mm or HH:mm:ss' })
  startTime!: string;

  @ApiProperty({ example: '12:00', description: 'End time (HH:mm or HH:mm:ss).', required: true })
  @IsString()
  @IsNotEmpty()
  @Matches(TIME_PATTERN, { message: 'endTime must be HH:mm or HH:mm:ss' })
  endTime!: string;
}
