import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthBearer } from '../auth/auth-bearer.decorator';
import { PaginatedTelemetryResponseDto } from './dto/paginated-telemetry-response.dto';
import { TelemetryQueryDto } from './dto/telemetry-query.dto';
import { TelemetryResponseDto } from './dto/telemetry-response.dto';
import { TelemetryService } from './telemetry.service';

@ApiTags('Telemetry')
@Controller('telemetry')
@AuthBearer()
export class TelemetryController {
  constructor(private readonly telemetryService: TelemetryService) {}

  @Get()
  @ApiOperation({
    summary: 'List telemetry (paginated)',
    description:
      'Returns telemetry records with pagination. Optional filter by spaceId. Data is ingested from MQTT. Requires Bearer token.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (1-based)', example: 1 })
  @ApiQuery({ name: 'size', required: false, type: Number, description: 'Page size (max 100)', example: 10 })
  @ApiQuery({ name: 'spaceId', required: false, type: String, description: 'Filter by space ID (CUID)' })
  @ApiResponse({ status: 200, description: 'Paginated list.', type: PaginatedTelemetryResponseDto })
  @ApiResponse({ status: 401, description: 'Missing or invalid Bearer token.' })
  findAll(@Query() query: TelemetryQueryDto) {
    return this.telemetryService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get telemetry by id',
    description: 'Returns a single telemetry record by its CUID. Requires Bearer token.',
  })
  @ApiParam({ name: 'id', description: 'Telemetry ID (CUID)', example: 'clx123abc456def789' })
  @ApiResponse({ status: 200, description: 'Telemetry record found.', type: TelemetryResponseDto })
  @ApiResponse({ status: 404, description: 'Telemetry record not found.' })
  @ApiResponse({ status: 401, description: 'Missing or invalid Bearer token.' })
  findOne(@Param('id') id: string) {
    return this.telemetryService.findOne(id);
  }
}
