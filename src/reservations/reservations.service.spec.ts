import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { ErrorLoggerService } from '../common/error-logger.service';
import { PrismaService } from '../prisma/prisma.service';
import { ReservationsService } from './reservations.service';

describe('ReservationsService', () => {
  let service: ReservationsService;
  let prisma: PrismaService;

  const mockSpace = {
    id: 'space-1',
    placeId: 'place-1',
    name: 'Room A',
    reference: 'ROOM-A',
    capacity: 10,
    description: null,
  };

  const mockErrorLogger = {
    logError: jest.fn(),
  };

  beforeEach(async () => {
    const mockPrisma = {
      space: {
        findUnique: jest.fn().mockResolvedValue(mockSpace),
      },
      reservation: {
        findMany: jest.fn(),
        count: jest.fn().mockResolvedValue(0),
        create: jest.fn().mockImplementation(({ data }: { data: Prisma.ReservationUncheckedCreateInput }) =>
          Promise.resolve({
            id: 'res-1',
            spaceId: data.spaceId,
            placeId: data.placeId,
            clientEmail: data.clientEmail,
            reservationDate: data.reservationDate,
            startTime: data.startTime,
            endTime: data.endTime,
          }),
        ),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ErrorLoggerService, useValue: mockErrorLogger },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should throw ConflictException when time slot overlaps with existing reservation', async () => {
    (prisma.reservation.findMany as jest.Mock).mockResolvedValue([
      {
        id: 'existing-1',
        spaceId: 'space-1',
        startTime: '10:00',
        endTime: '12:00',
      },
    ]);

    const dto = {
      spaceId: 'space-1',
      clientEmail: 'client@example.com',
      reservationDate: '2025-03-15',
      startTime: '11:00',
      endTime: '13:00',
    };

    await expect(service.create(dto)).rejects.toThrow(ConflictException);
    await expect(service.create(dto)).rejects.toThrow(
      'Space already reserved in this time slot',
    );
  });

  it('should create reservation when no overlap exists', async () => {
    (prisma.reservation.findMany as jest.Mock).mockResolvedValue([
      {
        id: 'existing-1',
        spaceId: 'space-1',
        startTime: '10:00',
        endTime: '12:00',
      },
    ]);

    const dto = {
      spaceId: 'space-1',
      clientEmail: 'client@example.com',
      reservationDate: '2025-03-15',
      startTime: '14:00',
      endTime: '15:00',
    };

    const result = await service.create(dto);

    expect(result).toBeDefined();
    expect(result.startTime).toBe('14:00');
    expect(result.endTime).toBe('15:00');
    expect(prisma.reservation.create).toHaveBeenCalled();
  });
});
