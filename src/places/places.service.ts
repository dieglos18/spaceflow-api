import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { ErrorLoggerService } from '../common/error-logger.service';
import { PrismaService } from '../prisma/prisma.service';

const CONTEXT = 'PlacesService';

@Injectable()
export class PlacesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorLogger: ErrorLoggerService,
  ) { }

  async create(dto: CreatePlaceDto) {
    try {
      return await this.prisma.place.create({
        data: { name: dto.name, location: dto.location },
      });
    } catch (error) {
      this.errorLogger.logError(`${CONTEXT}.create`, error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') throw new ConflictException('A place with this name already exists');
      }
      throw new InternalServerErrorException('Failed to create place');
    }
  }

  async findAll() {
    try {
      return await this.prisma.place.findMany({ orderBy: { name: 'asc' } });
    } catch (error) {
      this.errorLogger.logError(`${CONTEXT}.findAll`, error);
      throw new InternalServerErrorException('Failed to list places');
    }
  }

  async findOne(id: string) {
    try {
      const place = await this.prisma.place.findUnique({ where: { id } });
      if (!place) throw new NotFoundException(`Place with id ${id} not found`);
      return place;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.errorLogger.logError(`${CONTEXT}.findOne`, error);
      throw new InternalServerErrorException('Failed to get place');
    }
  }

  async update(id: string, dto: UpdatePlaceDto) {
    try {
      await this.findOne(id);
      return await this.prisma.place.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.errorLogger.logError(`${CONTEXT}.update`, error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') throw new NotFoundException(`Place with id ${id} not found`);
        if (error.code === 'P2002') throw new ConflictException('A place with this name already exists');
      }
      throw new InternalServerErrorException('Failed to update place');
    }
  }

  async remove(id: string) {
    try {
      await this.findOne(id);
      await this.prisma.place.delete({ where: { id } });
      return { message: 'Place deleted' };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.errorLogger.logError(`${CONTEXT}.remove`, error);
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Place with id ${id} not found`);
      }
      throw new InternalServerErrorException('Failed to delete place');
    }
  }
}
