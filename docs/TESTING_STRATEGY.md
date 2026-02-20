# Testing Strategy

## Unit Tests

- **Services**: Mock Prisma (or in-memory), Redis, and external APIs. Test business logic: status transitions, readiness computation, duplicate reviewer prevention.
- **Guards**: Test RBAC and JWT guards with different roles and token states.
- **Pipes/DTOs**: Test validation rules and transformation.
- **Utils**: Pure functions for formatting, permissions checks.

**Tools**: Jest. Coverage target: >80% for services and guards.

## Integration Tests

- **API**: Supertest against full app; use test DB (PostgreSQL) and test Redis. Seed roles and a test user; run flows: register → login → create PR → assign reviewer → submit review → deployment readiness.
- **Webhooks**: POST payloads with valid/invalid signatures; assert DB and audit log changes.
- **Queue**: Enqueue notification job; run worker; assert notification record and (if applicable) external call.

**Tools**: Jest, Supertest, test containers or Docker Compose for Postgres + Redis.

## E2E (Optional)

- **Critical paths**: Login → Create PR → Assign reviewer → Approve → Mark deployment ready (Playwright or Cypress against local stack).

## CI Execution

- Lint (ESLint) + typecheck (tsc).
- Unit tests (no DB).
- Integration tests (DB + Redis required; run in CI with services or containers).
- Fail pipeline on coverage drop or flaky detection.
