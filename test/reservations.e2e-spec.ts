import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as supertest from 'supertest';
import { AuthModule } from '../src/auth/auth.module';
import { BearerAuthGuard } from '../src/auth/bearer-auth.guard';
import { CommonModule } from '../src/common/common.module';
import { ErrorLoggerService } from '../src/common/error-logger.service';
import { PrismaModule } from '../src/prisma/prisma.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { PlacesModule } from '../src/places/places.module';
import { ReservationsModule } from '../src/reservations/reservations.module';
import { SpacesModule } from '../src/spaces/spaces.module';

type SupertestAgent = (app: object) => supertest.SuperTest<supertest.Test>;

describe('Reservations E2E', () => {
  let app: INestApplication;

  const placeId = 'place-e2e-1';
  const spaceId = 'space-e2e-1';

  beforeEach(async () => {
    const reservationFindMany = jest
      .fn()
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        { id: 'res-1', spaceId, startTime: '10:00', endTime: '12:00' },
      ]);

    const mockPrisma = {
      place: {
        create: jest.fn().mockResolvedValue({
          id: placeId,
          name: 'E2E Place',
          location: 'E2E Location',
        }),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      space: {
        create: jest.fn().mockResolvedValue({
          id: spaceId,
          placeId,
          name: 'E2E Room',
          reference: 'E2E-1',
          capacity: 5,
          description: null,
        }),
        findUnique: jest.fn().mockResolvedValue({
          id: spaceId,
          placeId,
          name: 'E2E Room',
          reference: 'E2E-1',
          capacity: 5,
          description: null,
        }),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      reservation: {
        findMany: reservationFindMany,
        count: jest.fn().mockResolvedValue(0),
        create: jest.fn().mockResolvedValue({
          id: 'res-e2e-1',
          spaceId,
          placeId,
          clientEmail: 'e2e@example.com',
          reservationDate: new Date('2025-03-20T00:00:00.000Z'),
          startTime: '10:00',
          endTime: '12:00',
        }),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const mockErrorLogger = { logError: jest.fn() };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule, AuthModule, CommonModule, PlacesModule, SpacesModule, ReservationsModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .overrideProvider(ErrorLoggerService)
      .useValue(mockErrorLogger)
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

  it('full flow: create place, space, reservation, then conflicting reservation returns 409', async () => {
    const req: SupertestAgent =
      (supertest as typeof supertest & { default?: SupertestAgent }).default ?? (supertest as unknown as SupertestAgent);
    const server = req(app.getHttpServer());
    const auth = { Authorization: 'Bearer any' };

    const placeRes = await server
      .post('/places')
      .set(auth)
      .send({ name: 'E2E Place', location: 'E2E Location' })
      .expect(201);
    expect(placeRes.body.id).toBe(placeId);

    const spaceRes = await server
      .post('/spaces')
      .set(auth)
      .send({
        placeId: placeRes.body.id,
        name: 'E2E Room',
        reference: 'E2E-1',
        capacity: 5,
      })
      .expect(201);
    expect(spaceRes.body.id).toBe(spaceId);

    await server
      .post('/reservations')
      .set(auth)
      .send({
        spaceId: spaceRes.body.id,
        clientEmail: 'e2e@example.com',
        reservationDate: '2025-03-20',
        startTime: '10:00',
        endTime: '12:00',
      })
      .expect(201);

    const conflictRes = await server
      .post('/reservations')
      .set(auth)
      .send({
        spaceId: spaceRes.body.id,
        clientEmail: 'other@example.com',
        reservationDate: '2025-03-20',
        startTime: '11:00',
        endTime: '13:00',
      })
      .expect(409);

    expect(conflictRes.body.message).toBe('Space already reserved in this time slot');
  });
});
