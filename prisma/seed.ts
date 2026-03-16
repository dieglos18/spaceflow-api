import { PrismaClient } from '@prisma/client';
import { connect } from 'mqtt';

const PLACE_NAME = 'Darien Technology Coworking';
const PLACE_LOCATION = 'Calle 50, Torre BCT, Ciudad de Panamá';
const RESERVATION_DATE = new Date('2025-03-17T00:00:00.000Z');

const SPACES = [
  { name: 'Meeting Room', reference: 'ROOM-A1', capacity: 8, description: 'Compact meeting room with TV screen' },
  { name: 'Open Workspace', reference: 'OPEN-WS1', capacity: 20, description: 'Shared open workspace with desks and power outlets' },
  { name: 'Focus Booth', reference: 'FOCUS-B1', capacity: 1, description: 'Private booth designed for focused individual work' },
  { name: 'Conference Room', reference: 'CONF-C1', capacity: 15, description: 'Large conference room with projector and video conferencing setup' },
  { name: 'Creative Lounge', reference: 'LOUNGE-CR1', capacity: 6, description: 'Casual lounge area ideal for brainstorming sessions' },
] as const;

/** Non-overlapping time slots for reservations (max 3 per client per week). */
const TIME_SLOTS: [string, string][] = [
  ['08:00', '09:00'],
  ['09:00', '10:00'],
  ['10:00', '11:00'],
  ['11:00', '12:00'],
  ['12:00', '13:00'],
  ['13:00', '14:00'],
  ['14:00', '15:00'],
  ['15:00', '16:00'],
  ['16:00', '17:00'],
  ['17:00', '18:00'],
  ['18:00', '19:00'],
  ['19:00', '20:00'],
  ['20:00', '21:00'],
  ['21:00', '22:00'],
  ['07:00', '08:00'],
];

/** Per space: 2 or 3 reservations. Each entry: [slotIndex, clientEmailIndex]. Client emails: seed1..seed5 (max 3 per week each). */
const RESERVATIONS_PER_SPACE: { slotIndices: number[]; clientEmailIndices: number[] }[] = [
  { slotIndices: [0, 1, 2], clientEmailIndices: [0, 1, 0] },
  { slotIndices: [3, 4, 5], clientEmailIndices: [1, 2, 1] },
  { slotIndices: [6, 7], clientEmailIndices: [2, 3] },
  { slotIndices: [8, 9, 10], clientEmailIndices: [3, 4, 3] },
  { slotIndices: [11, 12], clientEmailIndices: [4, 0] },
];
const CLIENT_EMAILS = ['seed1@example.com', 'seed2@example.com', 'seed3@example.com', 'seed4@example.com', 'seed5@example.com'];

const TELEMETRY_PAYLOAD = {
  ts: '2025-03-16T14:30:00.000Z',
  occupancy: 2,
  temp_c: 24.1,
  humidity_pct: 49,
  co2_ppm: 930,
};

async function seed() {
  const prisma = new PrismaClient();

  let place = await prisma.place.findFirst({
    where: { name: PLACE_NAME },
  });
  if (!place) {
    place = await prisma.place.create({
      data: { name: PLACE_NAME, location: PLACE_LOCATION },
    });
  }

  const spaceIds: string[] = [];
  for (let i = 0; i < SPACES.length; i++) {
    const s = SPACES[i];
    let space = await prisma.space.findFirst({
      where: { placeId: place.id, name: s.name },
    });
    if (!space) {
      space = await prisma.space.create({
        data: {
          placeId: place.id,
          name: s.name,
          reference: s.reference,
          capacity: s.capacity,
          description: s.description,
        },
      });
    }
    spaceIds.push(space.id);
  }

  await prisma.reservation.deleteMany({
    where: { clientEmail: { in: CLIENT_EMAILS }, reservationDate: RESERVATION_DATE },
  });
  let reservationCount = 0;
  for (let spaceIdx = 0; spaceIdx < spaceIds.length; spaceIdx++) {
    const { slotIndices, clientEmailIndices } = RESERVATIONS_PER_SPACE[spaceIdx];
    for (let r = 0; r < slotIndices.length; r++) {
      const [startTime, endTime] = TIME_SLOTS[slotIndices[r]];
      await prisma.reservation.create({
        data: {
          spaceId: spaceIds[spaceIdx],
          placeId: place.id,
          clientEmail: CLIENT_EMAILS[clientEmailIndices[r]],
          reservationDate: RESERVATION_DATE,
          startTime,
          endTime,
        },
      });
      reservationCount++;
    }
  }

  const brokerUrl = process.env.MQTT_BROKER_URL;
  if (!brokerUrl) {
    console.warn('MQTT_BROKER_URL not set; skipping telemetry publish. Start broker and API, then run seed again or publish manually.');
  } else {
    const client = connect(brokerUrl, { clientId: 'spaceflow-seed' });
    await new Promise<void>((resolve, reject) => {
      client.on('connect', () => {
        let published = 0;
        const done = () => {
          published++;
          if (published === spaceIds.length) {
            client.end();
            resolve();
          }
        };
        for (const spaceId of spaceIds) {
          const topic = `sites/main/offices/${spaceId}/telemetry`;
          client.publish(topic, JSON.stringify(TELEMETRY_PAYLOAD), { qos: 1 }, (err) => {
            if (err) reject(err);
            else done();
          });
        }
      });
      client.on('error', reject);
    });
  }

  console.log('\n--- Seed summary ---');
  console.log('1 place');
  console.log(`${spaceIds.length} spaces`);
  console.log(`${reservationCount} reservations`);
  console.log('--------------------\n');

  await prisma.$disconnect();
}

seed()
  .then(() => {
    console.log('Seed completed.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
