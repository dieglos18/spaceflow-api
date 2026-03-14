import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { BearerAuthGuard } from '../auth/bearer-auth.guard';
import { ErrorLoggerService } from '../common/error-logger.service';
import { PrismaService } from '../prisma/prisma.service';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';

type SupertestAgent = (app: object) => request.SuperTest<request.Test>;

describe('ReservationsController (integration)', () => {
  let app: INestApplication;

  const mockSpace = {
    id: 'space-1',
    placeId: 'place-1',
    name: 'Room A',
    reference: 'ROOM-A',
    capacity: 10,
    description: null,
  };

  beforeEach(async () => {
    const mockPrisma = {
      space: {
        findUnique: jest.fn().mockResolvedValue(mockSpace),
      },
      reservation: {
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
        create: jest.fn().mockResolvedValue({
          id: 'res-1',
          spaceId: 'space-1',
          placeId: 'place-1',
          clientEmail: 'client@example.com',
          reservationDate: new Date('2025-03-15T00:00:00.000Z'),
          startTime: '10:00',
          endTime: '12:00',
        }),
      },
    };

    const mockErrorLogger = { logError: jest.fn() };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ReservationsController],
      providers: [
        ReservationsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ErrorLoggerService, useValue: mockErrorLogger },
      ],
    })
      .overrideGuard(BearerAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /reservations returns 201 and reservation body', async () => {
    const body = {
      spaceId: 'space-1',
      clientEmail: 'client@example.com',
      reservationDate: '2025-03-15',
      startTime: '10:00',
      endTime: '12:00',
    };

    const req: SupertestAgent =
      (request as typeof request & { default?: SupertestAgent }).default ?? (request as unknown as SupertestAgent);
    const response = await req(app.getHttpServer())
      .post('/reservations')
      .set('Authorization', 'Bearer any')
      .send(body)
      .expect(201);

    expect(response.body).toHaveProperty('id', 'res-1');
    expect(response.body).toHaveProperty('spaceId', 'space-1');
    expect(response.body).toHaveProperty('clientEmail', 'client@example.com');
    expect(response.body).toHaveProperty('startTime', '10:00');
    expect(response.body).toHaveProperty('endTime', '12:00');
    expect(response.body).toHaveProperty('reservationDate');
  });
});
