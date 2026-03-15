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

```bash
npm run test
```

## Docker

### Infrastructure only (development on host)

To run only Postgres and Mosquitto and develop the API on your machine:

```bash
docker compose up -d postgres mosquitto
```

Use `.env` with `DATABASE_URL=postgresql://user:password@localhost:5432/spaceflow` and `MQTT_BROKER_URL=mqtt://localhost:1883`, then `npm run start:dev`.

### Full stack (API in Docker)

To run the whole backend (API, Postgres, Mosquitto) in containers:

1. Ensure `.env` exists (e.g. `cp .env.example .env`) and contains at least `AUTH_BEARER_TOKEN`.
2. Start all services:

   ```bash
   docker compose up -d --build
   ```

3. Apply migrations (first time or after schema changes):

   ```bash
   docker compose run --rm api npx prisma migrate deploy
   ```

The API is available at `http://localhost:3000`. Swagger: `http://localhost:3000/api`.

### Shared network for frontend (other repo)

All services run on the same Docker network: **`spaceflow-network`**. A frontend app in another repo can use this network so its container can talk to the API.

1. Create the network from this repo (run at least once):

   ```bash
   docker compose up -d
   ```

2. In the frontend repo’s `docker-compose.yml`, attach the frontend service to the existing network:

   ```yaml
   services:
     front:
       # ... your front service config ...
       networks:
         - spaceflow-network

   networks:
     spaceflow-network:
       external: true
       name: spaceflow-network
   ```

3. From inside the frontend container, the API is reachable at **`http://api:3000`**. From the user’s browser, use `http://localhost:3000` if the API port is published (as in this compose).