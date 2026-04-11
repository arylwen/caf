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


## Additional compose readiness posture

When compose materializes a local `postgres` support service and AP/CP startup depends on it:

- `postgres` must expose a compose `healthcheck:`
- dependent services must use `depends_on.postgres.condition: service_healthy`
- do not rely on container creation order alone for startup/bootstrap that eagerly touches the database
