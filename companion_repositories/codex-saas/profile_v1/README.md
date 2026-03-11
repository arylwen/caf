# codex-saas Companion Operator Guide

## Overview

- Instance: `codex-saas`
- Profile: `profile_v1`
- Runtime: Python + FastAPI (`runtime.language: python`, `runtime.framework: fastapi`)
- Deployment mode: `docker_compose`
- Data store: PostgreSQL (`database.engine: postgresql`)
- Resolved TBPs: `TBP-ASGI-01`, `TBP-COMPOSE-01`, `TBP-FASTAPI-01`, `TBP-PG-01`, `TBP-PY-01`, `TBP-UI-REACT-VITE-01`

This repository contains the local runnable candidate for CP/AP/UI/Postgres with compose wiring and unit-test scaffolding.

## Prerequisites

1. Docker Desktop (or equivalent engine with `docker compose` support).
2. Python 3.11+ available on host if you want to run tests outside containers.
3. Local `.env` file at repository root (already scaffolded at `.env`).

Optional:
- If you prefer Podman, use `podman compose` with the same compose file and environment contract.

## Quickstart

1. Update secrets in `.env` before first run.
2. Start the stack from this directory:

```bash
docker compose --env-file ./.env -f docker/compose.candidate.yaml up --build
```

3. Service endpoints:
- CP API: `http://localhost:8000`
- AP API: `http://localhost:8001`
- UI: `http://localhost:8080`
- Postgres: `localhost:5432`

To stop:

```bash
docker compose -f docker/compose.candidate.yaml down
```

## Environment Variables

Primary runtime contract is in `.env` and `infrastructure/postgres.env.example`.

Required variables:
- `POSTGRES_DB` (default scaffold: `codex_saas`)
- `POSTGRES_USER` (default scaffold: `codex_saas`)
- `POSTGRES_PASSWORD` (set a local secret value; do not commit real credentials)
- `POSTGRES_HOST` (default: `postgres`)
- `POSTGRES_PORT` (default: `5432`)
- `DATABASE_URL` (must reference the same DB settings)
- `CP_POLICY_BASE_URL` (default internal CP URL: `http://cp:8000`)
- `UI_API_BASE_PATH` (default: `/api`)

Safe local example:

```env
POSTGRES_DB=codex_saas
POSTGRES_USER=codex_saas
POSTGRES_PASSWORD=replace-with-local-secret
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
DATABASE_URL=postgresql://codex_saas:${POSTGRES_PASSWORD}@postgres:5432/codex_saas
CP_POLICY_BASE_URL=http://cp:8000
UI_API_BASE_PATH=/api
```

## How to Run Unit Tests

Run from repository root:

```bash
python -m unittest discover -s tests -p "test_*.py" -v
```

Current unit tests are in `tests/test_unit_boundaries.py`.

## Interface Binding Orientation

`reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml` defines AP interface bindings:
- `BIND-AP-reports`: `ReportsAccessInterface` consumer (`TG-30-service-facade-reports`) to provider (`TG-40-persistence-reports`)
- `BIND-AP-submissions`: `SubmissionsAccessInterface` consumer (`TG-30-service-facade-submissions`) to provider (`TG-40-persistence-submissions`)
- `BIND-AP-workspaces`: `WorkspacesAccessInterface` consumer (`TG-30-service-facade-workspaces`) to provider (`TG-40-persistence-workspaces`)

At runtime, composition-root assembly from `TG-90-runtime-wiring` binds these required/provided interfaces.

## Task completion evidence

### Claims
- The README now documents pinned runtime, deployment, and database posture for `codex-saas` operators.
- The README provides concrete local startup and shutdown commands for the compose-based CP/AP/UI/Postgres stack.
- The README documents environment variable contract surfaces, including `DATABASE_URL`, grounded in existing `.env` and `infrastructure/postgres.env.example`.
- The README documents how to execute unit tests and where test artifacts currently live.
- The README includes operator-facing interface-binding orientation tied to the generated binding contract file.

### Evidence anchors
- `companion_repositories/codex-saas/profile_v1/README.md:L1-L14` - supports Claim 1
- `companion_repositories/codex-saas/profile_v1/README.md:L24-L42` - supports Claim 2
- `companion_repositories/codex-saas/profile_v1/README.md:L44-L73` - supports Claim 3
- `companion_repositories/codex-saas/profile_v1/README.md:L75-L83` - supports Claim 4
- `companion_repositories/codex-saas/profile_v1/README.md:L85-L94` - supports Claim 5
