import { PartialType } from '@nestjs/swagger';
import { CreatePlaceDto } from './create-place.dto';

/** DTO for updating a place; all fields optional. */
export class UpdatePlaceDto extends PartialType(CreatePlaceDto) {}
