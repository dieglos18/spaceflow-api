import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ErrorLoggerService } from '../common/error-logger.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSpaceDto } from './dto/create-space.dto';
import { UpdateSpaceDto } from './dto/update-space.dto';

const CONTEXT = 'SpacesService';

@Injectable()
export class SpacesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorLogger: ErrorLoggerService,
  ) {}

  async create(dto: CreateSpaceDto) {
    try {
      return await this.prisma.space.create({
        data: {
          placeId: dto.placeId,
          name: dto.name,
          reference: dto.reference,
          capacity: dto.capacity,
          description: dto.description,
        },
      });
    } catch (error) {
      this.errorLogger.logError(`${CONTEXT}.create`, error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') throw new NotFoundException('Place not found');
        if (error.code === 'P2002') throw new ConflictException('Space with same unique field already exists');
      }
      throw new InternalServerErrorException('Failed to create space');
    }
  }

  async findAll() {
    try {
      return await this.prisma.space.findMany({
        orderBy: [{ placeId: 'asc' }, { name: 'asc' }],
      });
    } catch (error) {
      this.errorLogger.logError(`${CONTEXT}.findAll`, error);
      throw new InternalServerErrorException('Failed to list spaces');
    }
  }

  async findOne(id: string) {
    try {
      const space = await this.prisma.space.findUnique({ where: { id } });
      if (!space) throw new NotFoundException(`Space with id ${id} not found`);
      return space;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.errorLogger.logError(`${CONTEXT}.findOne`, error);
      throw new InternalServerErrorException('Failed to get space');
    }
  }

  async update(id: string, dto: UpdateSpaceDto) {
    try {
      await this.findOne(id);
      return await this.prisma.space.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.errorLogger.logError(`${CONTEXT}.update`, error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') throw new NotFoundException(`Space with id ${id} not found`);
        if (error.code === 'P2003') throw new NotFoundException('Place not found');
        if (error.code === 'P2002') throw new ConflictException('Space with same unique field already exists');
      }
      throw new InternalServerErrorException('Failed to update space');
    }
  }

  async remove(id: string) {
    try {
      await this.findOne(id);
      await this.prisma.space.delete({ where: { id } });
      return { message: 'Space deleted' };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.errorLogger.logError(`${CONTEXT}.remove`, error);
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Space with id ${id} not found`);
      }
      throw new InternalServerErrorException('Failed to delete space');
    }
  }
}
