import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Telemetry record as returned by the API (data ingested from MQTT). */
export class TelemetryResponseDto {
  @ApiProperty({ example: 'clx123abc456def789', description: 'Unique telemetry ID (CUID).' })
  id!: string;

  @ApiProperty({ example: 'clx456def789ghi012', description: 'Space ID (CUID).' })
  spaceId!: string;

  @ApiProperty({ example: 4, description: 'People count (occupancy).' })
  peopleCount!: number;

  @ApiPropertyOptional({ example: 24.1, description: 'Temperature in Celsius.' })
  temperature!: number | null;

  @ApiPropertyOptional({ example: 49.3, description: 'Humidity percentage.' })
  humidity!: number | null;

  @ApiPropertyOptional({ example: 930, description: 'CO2 in ppm.' })
  co2!: number | null;

  @ApiPropertyOptional({ example: 85.5, description: 'Battery level.' })
  battery!: number | null;

  @ApiProperty({ example: '2025-10-08T14:30:00.000Z', description: 'Timestamp (ISO).' })
  timestamp!: string;
}
