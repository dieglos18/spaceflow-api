import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ErrorLoggerService } from '../common/error-logger.service';
import { PrismaService } from '../prisma/prisma.service';
import { TelemetryQueryDto } from './dto/telemetry-query.dto';

const CONTEXT = 'TelemetryService';

@Injectable()
export class TelemetryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorLogger: ErrorLoggerService,
  ) {}

  async findAll(query: TelemetryQueryDto) {
    try {
      const page = query.page ?? 1;
      const size = query.size ?? 10;
      const skip = (page - 1) * size;

      const where: Prisma.TelemetryWhereInput = {};
      if (query.spaceId) {
        where.spaceId = query.spaceId;
      }

      const [rows, total] = await Promise.all([
        this.prisma.telemetry.findMany({
          where,
          skip,
          take: size,
          orderBy: { timestamp: 'desc' },
        }),
        this.prisma.telemetry.count({ where }),
      ]);

      const data = rows.map((row) => ({
        id: row.id,
        spaceId: row.spaceId,
        peopleCount: row.peopleCount,
        temperature: row.temperature,
        humidity: row.humidity,
        co2: row.co2,
        battery: row.battery,
        timestamp: row.timestamp.toISOString(),
      }));

      return { data, page, size, total };
    } catch (error) {
      this.errorLogger.logError(`${CONTEXT}.findAll`, error);
      throw new InternalServerErrorException('Failed to list telemetry');
    }
  }

  async findOne(id: string) {
    try {
      const record = await this.prisma.telemetry.findUnique({ where: { id } });
      if (!record) throw new NotFoundException('Telemetry record not found');
      return {
        id: record.id,
        spaceId: record.spaceId,
        peopleCount: record.peopleCount,
        temperature: record.temperature,
        humidity: record.humidity,
        co2: record.co2,
        battery: record.battery,
        timestamp: record.timestamp.toISOString(),
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.errorLogger.logError(`${CONTEXT}.findOne`, error);
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('Telemetry record not found');
      }
      throw new InternalServerErrorException('Failed to get telemetry');
    }
  }
}
