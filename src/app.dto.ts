import { ApiProperty } from '@nestjs/swagger';

/** Health check response. */
export class HealthResponseDto {
  @ApiProperty({ example: 'ok', description: 'Service status.' })
  status!: string;
}

/** Protected resource response. */
export class ProtectedResponseDto {
  @ApiProperty({ example: 'Protected resource', description: 'Confirmation message.' })
  message!: string;
}
