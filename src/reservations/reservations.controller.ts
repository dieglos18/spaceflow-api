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
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthBearer } from '../auth/auth-bearer.decorator';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { PaginatedReservationsResponseDto } from './dto/paginated-reservations-response.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { ReservationResponseDto } from './dto/reservation-response.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { ReservationsService } from './reservations.service';

@ApiTags('Reservations')
@Controller('reservations')
@AuthBearer()
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a reservation',
    description:
      'Creates a new reservation. Validates time overlap (same space/date) and max 3 reservations per week per client. Requires Bearer token.',
  })
  @ApiBody({ type: CreateReservationDto })
  @ApiResponse({ status: 201, description: 'Reservation created successfully.', type: ReservationResponseDto })
  @ApiResponse({ status: 400, description: 'Validation failed or endTime before startTime.' })
  @ApiResponse({ status: 401, description: 'Missing or invalid Bearer token.' })
  @ApiResponse({ status: 404, description: 'Space not found.' })
  @ApiResponse({ status: 409, description: 'Space already reserved in this time slot or client exceeds 3 reservations per week.' })
  create(@Body() dto: CreateReservationDto) {
    return this.reservationsService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List reservations (paginated)',
    description: 'Returns reservations with pagination. Query: ?page=1&size=10. Requires Bearer token.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (1-based)', example: 1 })
  @ApiQuery({ name: 'size', required: false, type: Number, description: 'Page size (max 100)', example: 10 })
  @ApiResponse({ status: 200, description: 'Paginated list.', type: PaginatedReservationsResponseDto })
  @ApiResponse({ status: 401, description: 'Missing or invalid Bearer token.' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.reservationsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a reservation by id',
    description: 'Returns a single reservation by its CUID. Requires Bearer token.',
  })
  @ApiParam({ name: 'id', description: 'Reservation ID (CUID)', example: 'clx123abc456def789' })
  @ApiResponse({ status: 200, description: 'Reservation found.', type: ReservationResponseDto })
  @ApiResponse({ status: 404, description: 'Reservation not found.' })
  @ApiResponse({ status: 401, description: 'Missing or invalid Bearer token.' })
  findOne(@Param('id') id: string) {
    return this.reservationsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update a reservation by id',
    description:
      'Updates an existing reservation. Re-validates overlap and 3-per-week limit if date/space/email change. Requires Bearer token.',
  })
  @ApiParam({ name: 'id', description: 'Reservation ID (CUID)', example: 'clx123abc456def789' })
  @ApiBody({ type: UpdateReservationDto })
  @ApiResponse({ status: 200, description: 'Reservation updated successfully.', type: ReservationResponseDto })
  @ApiResponse({ status: 400, description: 'Validation failed or endTime before startTime.' })
  @ApiResponse({ status: 401, description: 'Missing or invalid Bearer token.' })
  @ApiResponse({ status: 404, description: 'Reservation or space not found.' })
  @ApiResponse({ status: 409, description: 'Space already reserved in this time slot or client exceeds 3 reservations per week.' })
  update(@Param('id') id: string, @Body() dto: UpdateReservationDto) {
    return this.reservationsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a reservation by id',
    description: 'Deletes a reservation by its CUID. Requires Bearer token.',
  })
  @ApiParam({ name: 'id', description: 'Reservation ID (CUID)', example: 'clx123abc456def789' })
  @ApiResponse({ status: 200, description: 'Reservation deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Reservation not found.' })
  @ApiResponse({ status: 401, description: 'Missing or invalid Bearer token.' })
  remove(@Param('id') id: string) {
    return this.reservationsService.remove(id);
  }
}
