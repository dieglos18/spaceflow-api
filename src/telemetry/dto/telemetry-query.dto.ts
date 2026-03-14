import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

/** Query params for paginated telemetry list (GET /telemetry). */
export class TelemetryQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number (1-based).', default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, description: 'Page size.', default: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  size?: number = 10;

  @ApiPropertyOptional({ example: 'clx456def789ghi012', description: 'Filter by space ID (CUID).' })
  @IsOptional()
  @IsString()
  spaceId?: string;
}
