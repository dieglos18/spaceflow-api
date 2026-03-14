import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthBearer } from '../auth/auth-bearer.decorator';
import { CreateSpaceDto } from './dto/create-space.dto';
import { SpaceResponseDto } from './dto/space-response.dto';
import { UpdateSpaceDto } from './dto/update-space.dto';
import { SpacesService } from './spaces.service';

@ApiTags('Spaces')
@Controller('spaces')
@AuthBearer()
export class SpacesController {
  constructor(private readonly spacesService: SpacesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a space',
    description: 'Creates a new space under a place. Requires Bearer token.',
  })
  @ApiBody({ type: CreateSpaceDto })
  @ApiResponse({ status: 201, description: 'Space created successfully.', type: SpaceResponseDto })
  @ApiResponse({ status: 400, description: 'Validation failed.' })
  @ApiResponse({ status: 401, description: 'Missing or invalid Bearer token.' })
  @ApiResponse({ status: 404, description: 'Place not found.' })
  create(@Body() dto: CreateSpaceDto) {
    return this.spacesService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List all spaces',
    description: 'Returns all spaces ordered by place and name. Requires Bearer token.',
  })
  @ApiResponse({ status: 200, description: 'List of spaces.', type: [SpaceResponseDto] })
  @ApiResponse({ status: 401, description: 'Missing or invalid Bearer token.' })
  findAll() {
    return this.spacesService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a space by id',
    description: 'Returns a single space by its CUID. Requires Bearer token.',
  })
  @ApiParam({ name: 'id', description: 'Space ID (CUID)', example: 'clx123abc456def789' })
  @ApiResponse({ status: 200, description: 'Space found.', type: SpaceResponseDto })
  @ApiResponse({ status: 404, description: 'Space not found.' })
  @ApiResponse({ status: 401, description: 'Missing or invalid Bearer token.' })
  findOne(@Param('id') id: string) {
    return this.spacesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update a space by id',
    description: 'Updates an existing space. Partial body allowed. Requires Bearer token.',
  })
  @ApiParam({ name: 'id', description: 'Space ID (CUID)', example: 'clx123abc456def789' })
  @ApiBody({ type: UpdateSpaceDto })
  @ApiResponse({ status: 200, description: 'Space updated successfully.', type: SpaceResponseDto })
  @ApiResponse({ status: 400, description: 'Validation failed.' })
  @ApiResponse({ status: 404, description: 'Space or place not found.' })
  @ApiResponse({ status: 401, description: 'Missing or invalid Bearer token.' })
  update(@Param('id') id: string, @Body() dto: UpdateSpaceDto) {
    return this.spacesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a space by id',
    description: 'Deletes a space by its CUID. Cascades to reservations and telemetry. Requires Bearer token.',
  })
  @ApiParam({ name: 'id', description: 'Space ID (CUID)', example: 'clx123abc456def789' })
  @ApiResponse({ status: 200, description: 'Space deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Space not found.' })
  @ApiResponse({ status: 401, description: 'Missing or invalid Bearer token.' })
  remove(@Param('id') id: string) {
    return this.spacesService.remove(id);
  }
}
