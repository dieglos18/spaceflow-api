import { PartialType } from '@nestjs/swagger';
import { CreateReservationDto } from './create-reservation.dto';

/** DTO for updating a reservation; all fields optional. */
export class UpdateReservationDto extends PartialType(CreateReservationDto) {}
