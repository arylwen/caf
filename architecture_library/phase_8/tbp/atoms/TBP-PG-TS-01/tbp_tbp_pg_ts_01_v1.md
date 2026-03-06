# TBP-PG-TS-01 — PostgreSQL binding (TypeScript)

## Binds to

- `database.engine: postgresql`
- `runtime.language: typescript`

## Intent

Provide deterministic **PostgreSQL wiring expectations** for TypeScript stacks:

- compose service wiring evidence hook (`docker/compose.candidate.yaml`)
- local env contract examples (`infrastructure/postgres.env.example`)
- a minimal app-plane persistence adapter hook (placeholder-level) that proves:
  - `DATABASE_URL` is consumed
  - the stack uses a standard Postgres client (`pg`)

Non-goals:
- selecting an ORM
- choosing migrations tooling
- writing production-ready persistence code
