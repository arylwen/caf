<!-- CAF_TRACE: generated_by=Contura Architecture Framework (CAF) -->
<!-- CAF_TRACE: task_id=TG-92-tech-writer-readme -->
<!-- CAF_TRACE: capability=repo_documentation -->
<!-- CAF_TRACE: instance=codex-saas -->
<!-- CAF_TRACE: trace_anchor=pattern_obligation_id:OBL-REPO-README -->

# Codex SaaS Candidate Operator Guide

## Overview

- Instance: `codex-saas`
- Profile: `profile_v1`
- Runtime rails: Python + FastAPI + PostgreSQL (`sqlalchemy_orm`)
- Packaging rail: `docker_compose`
- Auth rail: `mock` Authorization/Bearer claim contract

This repository is a bounded candidate scaffold for local compose runs and unit-test feedback loops.

## Prerequisites

- Docker with Compose v2 (`docker compose`)
- Python 3.11+ (for direct local test invocation)

## Quickstart (compose-first)

1. Copy and customize env values:
   - `cp infrastructure/postgres.env.example .env`
2. Start the candidate stack:
   - `docker compose --env-file ./.env -f docker/compose.candidate.yaml up --build`
3. Verify service health endpoints:
   - AP: `http://localhost:8000/ap/health`
   - CP: `http://localhost:8001/cp/health`
   - UI: `http://localhost:8080`

Compose topology is declared in `docker/compose.candidate.yaml` with service-local PostgreSQL DNS (`postgres`) and health-gated startup dependencies.

## Environment variables

Required variables (see `infrastructure/postgres.env.example`):

- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_HOST`
- `POSTGRES_PORT`
- `DATABASE_URL`

Notes:

- Host-local helpers use `DATABASE_URL` values like `postgresql+psycopg://...@localhost:5432/...`.
- AP/CP containers override `DATABASE_URL` to the compose-internal host `postgres`.
- Runtime auth expectations use:
  - `AUTH_MODE=mock`
  - `TENANT_CLAIM_KEY` (claim key selector for tenant context resolution).

## Unit tests

Run unit tests from repository root with Python stdlib unittest:

- `python -m unittest discover -s tests -p "test_*.py"`

Current unit tests validate:

- mock bearer claim decoding and claim/header conflict handling
- AP auth-context resolution behavior
- AP service facade operation gating and delegation seams

## Local auth debugging

Mock auth contract is explicit Authorization/Bearer:

- Primary carrier: `Authorization: Bearer mock.<base64-json>.token`
- Canonical claim keys: `tenant_id`, `principal_id`, `policy_version`
- Alternate headers (`X-Tenant-Context-Check`, `X-Principal-Context-Check`) are conflict-check carriers only; claim remains authoritative.

Debug flow:

1. Tail AP logs:
   - `docker compose -f docker/compose.candidate.yaml logs -f ap`
2. Call AP assumptions endpoint with a mock bearer:
   - `curl -H "Authorization: Bearer mock.<base64-json>.token" -H "X-Tenant-Context-Check: tenant-alpha" http://localhost:8000/ap/runtime/assumptions`
3. If headers conflict with claim payload, AP should return HTTP 401 with explicit conflict detail.

## Troubleshooting

- AP/CP fail at startup with DB errors:
  - Check postgres health in compose logs and confirm `.env` has valid `POSTGRES_*` and `DATABASE_URL` values.
- UI can load but API calls fail:
  - Inspect `docker/nginx.ui.conf` proxy routes and confirm AP/CP services are healthy.
- Auth failures in AP calls:
  - Verify bearer payload contains all canonical keys and that conflict-check headers do not disagree.

## Task completion evidence

### Claims
- This README now documents compose startup, env configuration, tests, mock-auth behavior, and troubleshooting for the current candidate stack.
- Operator instructions are grounded in produced runtime files (`docker/compose.candidate.yaml`, `infrastructure/postgres.env.example`, and `tests/`).

### Evidence anchors
- `README.md:L1-L96` - supports Claim 1
- `docker/compose.candidate.yaml:L1-L88` - supports Claim 2
- `infrastructure/postgres.env.example:L1-L11` - supports Claim 2
- `tests/test_mock_claims.py:L1-L35` - supports Claim 2
