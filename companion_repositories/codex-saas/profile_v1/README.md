<!-- CAF_TRACE: generated_by=Contura Architecture Framework (CAF) | task_id=TG-92-tech-writer-readme | capability=repo_documentation | instance=codex-saas | trace_anchor=pattern_obligation_id:OBL-REPO-README -->
# codex-saas Operator README

## Overview

- Instance: `codex-saas`
- Profile: `profile_v1`
- Runtime: Python + FastAPI
- Packaging: `docker_compose`
- Database: PostgreSQL

This repository is a local candidate scaffold for Control Plane (CP), Application Plane (AP), UI, and Postgres wiring.

## Prerequisites

1. Docker Desktop with `docker compose`
2. Optional local Python 3.12 for running unit tests outside containers

## Quickstart

1. Review environment defaults in [`.env`](/c:/data/contura/caf-dev/companion_repositories/codex-saas/profile_v1/.env)
2. Start the candidate stack:
   `docker compose --env-file ./.env -f docker/compose.candidate.yaml up --build`
3. Access services:
   - UI: `http://localhost:8080`
   - AP health: `http://localhost:8000/health`
   - CP health: `http://localhost:7000/health`

## Environment Variables

The compose wiring reads from [`.env`](/c:/data/contura/caf-dev/companion_repositories/codex-saas/profile_v1/.env) and [infrastructure/postgres.env.example](/c:/data/contura/caf-dev/companion_repositories/codex-saas/profile_v1/infrastructure/postgres.env.example).

Required contract surface:
- `DATABASE_URL`
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_HOST`
- `POSTGRES_PORT`
- `CP_POLICY_URL` (provided in compose AP service environment)

## Unit Tests

Run tests locally from repository root:

`python -m pytest tests/unit -q`

Current unit tests validate:
- widget service ID generation and tenant scoping
- policy engine allow and deny behavior

## Task completion evidence

### Claims
- README is grounded to pinned runtime, packaging, and database choices.
- Quickstart and environment sections reference actual generated runtime wiring files.
- Unit test instructions align to the repository test layout.

### Evidence anchors
- `companion_repositories/codex-saas/profile_v1/README.md:L1-L46` - supports Claim 1
- `companion_repositories/codex-saas/profile_v1/docker/compose.candidate.yaml:L1-L63` - supports Claim 2
- `companion_repositories/codex-saas/profile_v1/tests/unit/test_widget_service.py:L1-L26` - supports Claim 3
