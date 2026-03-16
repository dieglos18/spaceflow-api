# SpaceFlow API

Backend for coworking space reservations and IoT telemetry (NestJS, Prisma, PostgreSQL, MQTT).

## Run the project

### Option A: Full stack in Docker

1. **Env**
   ```bash
   cp .env.example .env
   ```
   Set at least `AUTH_BEARER_TOKEN`.

2. **Build and run**
   ```bash
   docker compose up -d --build
   ```

3. **Migrations (first time or after schema changes)**
   ```bash
   docker compose run --rm api npx prisma migrate deploy
   ```
   API: `http://localhost:3000` · Swagger: `http://localhost:3000/api`

---

### Option B: Development (API on your machine)

1. **Dependencies and env**
   ```bash
   npm install
   cp .env.example .env
   ```
   Edit `.env`: `DATABASE_URL` must match the Postgres credentials below (e.g. `postgresql://user:password@localhost:5432/spaceflow`).

2. **Start Postgres and MQTT**
   ```bash
   docker compose up -d postgres mosquitto
   ```

3. **Migrations**
   ```bash
   npx prisma migrate dev
   ```

4. **Start the API**
   ```bash
   npm run start:dev
   ```
   API: `http://localhost:3000` · Swagger: `http://localhost:3000/api`

---

## Seed

Populates the DB with one place (Darien Technology Coworking), five spaces, one reservation per space, and publishes one MQTT telemetry message per space. Run migrations first, then:

```bash
npx prisma db seed
```

Or: `npm run prisma:seed`. For telemetry rows to be stored, the MQTT broker (and the API) must be running when you run the seed so the API consumer can persist the messages.

---

Protected endpoints need `Authorization: Bearer <AUTH_BEARER_TOKEN>` (see `.env.example`).

## Tests

- **Unit & integration** (Jest):  
  ```bash
  npm run test
  ```

- **E2E** (full flow against the app):  
  ```bash
  npm run test:e2e
  ```

## Docs

- [Database Schema](docs/database-schema.md) — Tables, relations, ER diagram.
- [Request Flow & Security](docs/request-flow-and-security.md) — How a request is handled and security settings.