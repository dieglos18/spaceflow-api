# Use of AI in this project

This document describes how artificial intelligence (AI) was used in the development of the SpaceFlow API backend, as requested in the challenge delivery guidelines.

## Tool used

**Cursor** (editor with integrated AI assistance).

## How it was used

1. **Planning**  
   Cursor was used to define and refine plans before implementing: module structure, endpoints, business rules (reservations, pagination), and MQTT integration. Plans were reviewed and adjusted in conversation before coding.

2. **Architecture review**  
   It was used to review architecture decisions (NestJS, Prisma, folder organization, DTOs, error handling) and to validate that the separation of concerns (controllers, services, guards, validation) was consistent with the challenge requirements.

3. **Execution**  
   It was used to generate and modify code from those plans: CRUDs (Places, Spaces, Reservations), DTOs, unit and integration tests, Docker setup, documentation (README, docs), and targeted fixes (routes, Prisma, response formats).

## Scope

AI did not replace design decisions or final code review. Functional requirements, the choice of stack (NestJS, PostgreSQL, Prisma, MQTT), and validation that the project meets the challenge remained my  responsibility.
