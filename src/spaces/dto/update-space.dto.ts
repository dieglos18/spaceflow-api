import { PartialType } from '@nestjs/swagger';
import { CreateSpaceDto } from './create-space.dto';

/** DTO for updating a space; all fields optional. */
export class UpdateSpaceDto extends PartialType(CreateSpaceDto) {}
