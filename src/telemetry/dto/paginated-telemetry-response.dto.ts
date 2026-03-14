import { ApiProperty } from '@nestjs/swagger';
import { TelemetryResponseDto } from './telemetry-response.dto';

/** Paginated telemetry response. */
export class PaginatedTelemetryResponseDto {
  @ApiProperty({ type: [TelemetryResponseDto], description: 'List of telemetry records.' })
  data!: TelemetryResponseDto[];

  @ApiProperty({ example: 1, description: 'Current page (1-based).' })
  page!: number;

  @ApiProperty({ example: 10, description: 'Page size.' })
  size!: number;

  @ApiProperty({ example: 50, description: 'Total number of telemetry records.' })
  total!: number;
}
