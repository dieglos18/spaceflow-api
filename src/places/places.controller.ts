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
import { CreatePlaceDto } from './dto/create-place.dto';
import { PlaceResponseDto } from './dto/place-response.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { PlacesService } from './places.service';

@ApiTags('Places')
@Controller('places')
@AuthBearer()
export class PlacesController {
  constructor(private readonly placesService: PlacesService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a place',
    description: 'Creates a new place. Requires Bearer token.',
  })
  @ApiBody({ type: CreatePlaceDto })
  @ApiResponse({ status: 201, description: 'Place created successfully.', type: PlaceResponseDto })
  @ApiResponse({ status: 400, description: 'Validation failed.' })
  @ApiResponse({ status: 401, description: 'Missing or invalid Bearer token.' })
  create(@Body() dto: CreatePlaceDto) {
    return this.placesService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List all places',
    description: 'Returns all places ordered by name. Requires Bearer token.',
  })
  @ApiResponse({ status: 200, description: 'List of places.', type: [PlaceResponseDto] })
  @ApiResponse({ status: 401, description: 'Missing or invalid Bearer token.' })
  findAll() {
    return this.placesService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a place by id',
    description: 'Returns a single place by its CUID. Requires Bearer token.',
  })
  @ApiParam({ name: 'id', description: 'Place ID (CUID)', example: 'clx123abc456def789' })
  @ApiResponse({ status: 200, description: 'Place found.', type: PlaceResponseDto })
  @ApiResponse({ status: 404, description: 'Place not found.' })
  @ApiResponse({ status: 401, description: 'Missing or invalid Bearer token.' })
  findOne(@Param('id') id: string) {
    return this.placesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update a place by id',
    description: 'Updates an existing place. Partial body allowed. Requires Bearer token.',
  })
  @ApiParam({ name: 'id', description: 'Place ID (CUID)', example: 'clx123abc456def789' })
  @ApiBody({ type: UpdatePlaceDto })
  @ApiResponse({ status: 200, description: 'Place updated successfully.', type: PlaceResponseDto })
  @ApiResponse({ status: 400, description: 'Validation failed.' })
  @ApiResponse({ status: 404, description: 'Place not found.' })
  @ApiResponse({ status: 401, description: 'Missing or invalid Bearer token.' })
  update(@Param('id') id: string, @Body() dto: UpdatePlaceDto) {
    return this.placesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a place by id',
    description: 'Deletes a place by its CUID. Cascades to spaces. Requires Bearer token.',
  })
  @ApiParam({ name: 'id', description: 'Place ID (CUID)', example: 'clx123abc456def789' })
  @ApiResponse({ status: 200, description: 'Place deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Place not found.' })
  @ApiResponse({ status: 401, description: 'Missing or invalid Bearer token.' })
  remove(@Param('id') id: string) {
    return this.placesService.remove(id);
  }
}
