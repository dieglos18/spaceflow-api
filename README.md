# SpaceFlow API

Backend system for managing coworking space reservations with IoT telemetry integration.

## Features

- Place management
- Space management
- Reservation system
- Conflict detection
- API key authentication
- MQTT telemetry ingestion
- Pagination
- Unit and integration tests

## Tech Stack

- NestJS
- TypeScript
- PostgreSQL
- Prisma ORM
- Swagger (OpenAPI)
- MQTT
- Docker

## Setup

1. Install dependencies

   ```bash
   npm install
   ```

2. Copy environment file and set your `DATABASE_URL` (must match docker-compose credentials):

   ```bash
   cp .env.example .env
   ```

3. Run PostgreSQL and MQTT broker with Docker

   ```bash
   docker compose up -d
   ```

   This starts Postgres (port 5432) and Eclipse Mosquitto (port 1883). Set `MQTT_BROKER_URL=mqtt://localhost:1883` in `.env` to consume telemetry (optional).

4. Run database migrations

   ```bash
   npx prisma migrate dev
   ```

   Or for a quick dev setup without migration history: `npx prisma db push`

5. Start the server

   ```bash
   npm run start:dev
   ```

   The API will be available at `http://localhost:3000`. Use `GET /` or `GET /health` to check that it is running. OpenAPI (Swagger) docs: `http://localhost:3000/api`.

## API Authentication

Protected endpoints require a Bearer token. Set `AUTH_BEARER_TOKEN` in your `.env` (see `.env.example`). Send it in the request header:

```
Authorization: Bearer <AUTH_BEARER_TOKEN>
```

Example protected route: `GET /protected`.

## Running Tests

npm run test