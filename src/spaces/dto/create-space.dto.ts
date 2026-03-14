import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateSpaceDto {
  @ApiProperty({ example: 'clx123abc456def789', description: 'Place ID (CUID) this space belongs to.', required: true, minLength: 1 })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  placeId!: string;

  @ApiProperty({ example: 'Meeting Room A', description: 'Space name.', required: true, minLength: 1 })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  name!: string;

  @ApiProperty({ example: 'ROOM-A1', description: 'Room or space reference code.', required: true, minLength: 1 })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  reference!: string;

  @ApiPropertyOptional({ example: 10, description: 'Maximum capacity (optional).', minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  capacity?: number;

  @ApiPropertyOptional({ example: 'Quiet room with whiteboard', description: 'Space description (optional).' })
  @IsOptional()
  @IsString()
  description?: string;
}
