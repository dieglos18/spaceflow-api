import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

/** DTO for creating a place. */
export class CreatePlaceDto {
  @ApiProperty({ example: 'Downtown Cowork', description: 'Place name.', required: true, minLength: 1 })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  name!: string;

  @ApiProperty({ example: '123 Main St', description: 'Place address or location.', required: true, minLength: 1 })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  location!: string;
}
