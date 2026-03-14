import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ErrorLoggerService } from '../common/error-logger.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import {
  getDayBounds,
  getWeekBounds,
  parseDateToStartOfDay,
  timesOverlap,
} from './reservations.utils';

const CONTEXT = 'ReservationsService';
const MAX_RESERVATIONS_PER_WEEK = 3;

@Injectable()
export class ReservationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorLogger: ErrorLoggerService,
  ) {}

  async create(dto: CreateReservationDto) {
    try {
      if (dto.startTime >= dto.endTime) {
        throw new BadRequestException('endTime must be after startTime');
      }

      const space = await this.prisma.space.findUnique({ where: { id: dto.spaceId } });
      if (!space) throw new NotFoundException('Space not found');

      const startOfDay = parseDateToStartOfDay(dto.reservationDate);
      const { startOfDay: dayStart, endOfDayExclusive: dayEnd } = getDayBounds(dto.reservationDate);

      const existingSameDay = await this.prisma.reservation.findMany({
        where: {
          spaceId: dto.spaceId,
          reservationDate: { gte: dayStart, lt: dayEnd },
        },
      });
      const hasOverlap = existingSameDay.some((reservation) =>
        timesOverlap(dto.startTime, dto.endTime, reservation.startTime, reservation.endTime),
      );
      if (hasOverlap) {
        throw new ConflictException('Space already reserved in this time slot');
      }

      const { weekStart, weekEnd } = getWeekBounds(startOfDay);
      const countSameWeek = await this.prisma.reservation.count({
        where: {
          clientEmail: dto.clientEmail,
          reservationDate: { gte: weekStart, lt: weekEnd },
        },
      });
      if (countSameWeek >= MAX_RESERVATIONS_PER_WEEK) {
        throw new ConflictException('Maximum 3 reservations per week allowed for this client');
      }

      const placeId = dto.placeId ?? space.placeId;
      return await this.prisma.reservation.create({
        data: {
          spaceId: dto.spaceId,
          placeId,
          clientEmail: dto.clientEmail,
          reservationDate: startOfDay,
          startTime: dto.startTime,
          endTime: dto.endTime,
        },
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.errorLogger.logError(`${CONTEXT}.create`, error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') throw new NotFoundException('Space or place not found');
        if (error.code === 'P2002') throw new ConflictException('Reservation conflict');
      }
      throw new InternalServerErrorException('Failed to create reservation');
    }
  }

  async findAll(query: PaginationQueryDto) {
    try {
      const page = query.page ?? 1;
      const size = query.size ?? 10;
      const skip = (page - 1) * size;

      const [data, total] = await Promise.all([
        this.prisma.reservation.findMany({
          skip,
          take: size,
          orderBy: [{ reservationDate: 'desc' }, { startTime: 'asc' }],
        }),
        this.prisma.reservation.count(),
      ]);

      return { data, page, size, total };
    } catch (error) {
      this.errorLogger.logError(`${CONTEXT}.findAll`, error);
      throw new InternalServerErrorException('Failed to list reservations');
    }
  }

  async findOne(id: string) {
    try {
      const reservation = await this.prisma.reservation.findUnique({ where: { id } });
      if (!reservation) throw new NotFoundException(`Reservation with id ${id} not found`);
      return reservation;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.errorLogger.logError(`${CONTEXT}.findOne`, error);
      throw new InternalServerErrorException('Failed to get reservation');
    }
  }

  async update(id: string, dto: UpdateReservationDto) {
    try {
      const existing = await this.findOne(id);

      const spaceId = dto.spaceId ?? existing.spaceId;
      const startTime = dto.startTime ?? existing.startTime;
      const endTime = dto.endTime ?? existing.endTime;
      const clientEmail = dto.clientEmail ?? existing.clientEmail;

      if (startTime >= endTime) {
        throw new BadRequestException('endTime must be after startTime');
      }

      const startOfDay = dto.reservationDate
        ? parseDateToStartOfDay(dto.reservationDate)
        : existing.reservationDate;
      const { startOfDay: dayStart, endOfDayExclusive: dayEnd } =
        'reservationDate' in dto && dto.reservationDate
          ? getDayBounds(dto.reservationDate)
          : getDayBounds(existing.reservationDate.toISOString().slice(0, 10));

      const existingSameDay = await this.prisma.reservation.findMany({
        where: {
          spaceId,
          reservationDate: { gte: dayStart, lt: dayEnd },
          id: { not: id },
        },
      });
      const hasOverlap = existingSameDay.some((reservation) =>
        timesOverlap(startTime, endTime, reservation.startTime, reservation.endTime),
      );
      if (hasOverlap) {
        throw new ConflictException('Space already reserved in this time slot');
      }

      const { weekStart, weekEnd } = getWeekBounds(startOfDay);
      const countSameWeek = await this.prisma.reservation.count({
        where: {
          clientEmail,
          reservationDate: { gte: weekStart, lt: weekEnd },
          id: { not: id },
        },
      });
      if (countSameWeek >= MAX_RESERVATIONS_PER_WEEK) {
        throw new ConflictException('Maximum 3 reservations per week allowed for this client');
      }

      const updateData: Prisma.ReservationUncheckedUpdateInput = {
        ...(dto.spaceId !== undefined && { spaceId: dto.spaceId }),
        ...(dto.placeId !== undefined && { placeId: dto.placeId }),
        ...(dto.clientEmail !== undefined && { clientEmail: dto.clientEmail }),
        ...(dto.reservationDate !== undefined && {
          reservationDate: parseDateToStartOfDay(dto.reservationDate),
        }),
        ...(dto.startTime !== undefined && { startTime: dto.startTime }),
        ...(dto.endTime !== undefined && { endTime: dto.endTime }),
      };

      return await this.prisma.reservation.update({
        where: { id },
        data: updateData,
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.errorLogger.logError(`${CONTEXT}.update`, error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') throw new NotFoundException(`Reservation with id ${id} not found`);
        if (error.code === 'P2003') throw new NotFoundException('Space or place not found');
        if (error.code === 'P2002') throw new ConflictException('Reservation conflict');
      }
      throw new InternalServerErrorException('Failed to update reservation');
    }
  }

  async remove(id: string) {
    try {
      await this.findOne(id);
      await this.prisma.reservation.delete({ where: { id } });
      return { message: 'Reservation deleted' };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.errorLogger.logError(`${CONTEXT}.remove`, error);
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Reservation with id ${id} not found`);
      }
      throw new InternalServerErrorException('Failed to delete reservation');
    }
  }
}
