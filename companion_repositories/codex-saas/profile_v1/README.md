<!-- CAF_TRACE: generated_by=Contura Architecture Framework (CAF) -->
<!-- CAF_TRACE: task_id=UX-TG-95-ux-operator-notes -->
<!-- CAF_TRACE: capability=repo_documentation -->
<!-- CAF_TRACE: instance=codex-saas -->
<!-- CAF_TRACE: trace_anchor=pattern_id:UX-LANE:operator_handoff -->

# codex-saas companion repository

## Overview

- Instance: `codex-saas`
- Profile: `profile_v1`
- Runtime: Python + FastAPI, SQLAlchemy, PostgreSQL
- Packaging: `docker_compose`
- UI lanes:
  - Smoke-test lane: `code/ui/` served by `ui` service (port `8080`)
  - Rich UX lane: `code/ux/` served by `ux` service (port `8081`)

This repository contains the main AP/CP runtime plus two separate web frontends. The richer UX lane is additive and does not replace the smoke-test lane.

## Prerequisites

- Docker Engine with Compose v2 (`docker compose`)
- Python 3.11+ (for local tests)

## Quickstart

1. Prepare environment file if needed:
   - Linux/macOS: `cp infrastructure/postgres.env.example .env`
   - PowerShell: `Copy-Item infrastructure/postgres.env.example .env`
2. Start full stack with both UI lanes:
   - `docker compose --env-file ./.env -f docker/compose.candidate.yaml up --build`
3. Validate core health routes:
   - AP direct: `curl http://localhost:8000/ap/health`
   - CP direct: `curl http://localhost:8001/cp/health`
4. Validate lane routing:
   - Smoke-test UI AP proxy: `curl http://localhost:8080/api/health`
   - Rich UX lane AP proxy: `curl http://localhost:8081/api/health`

## Service boundaries

- `ap` (`:8000`): Application-plane REST APIs under `/ap/*`.
- `cp` (`:8001`): Control-plane APIs and policy decision endpoint.
- `ui` (`:8080`): smoke-test UI lane, unchanged by UX build lane.
- `ux` (`:8081`): richer UX lane using `code/ux/` assets and `docker/nginx.ux.conf`.
- `postgres` (`:5432`): shared persistence for AP/CP runtime.

## Environment variables

The compose stack expects at least:

- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `DATABASE_URL`
- `CP_POLICY_BASE_URL`

Reference files:

- `infrastructure/postgres.env.example`
- `.env`
- `docker/compose.candidate.yaml`

`DATABASE_URL` should remain SQLAlchemy-compatible (`postgresql+psycopg://...`).

## Unit tests

Run unit tests from repo root:

- `python -m pytest tests`

Current tests cover mock-auth claim handling and policy decision seams.

## UX lane operator notes

### Run/build expectations

- UX lane source root: `code/ux/`
- UX Dockerfile: `docker/Dockerfile.ux`
- UX Nginx routing: `docker/nginx.ux.conf`
- UX compose service: `ux` in `docker/compose.candidate.yaml`
- UX lane proxies AP and CP through `/api/*` and `/cp/*` on port `8081`

### Surface coverage and preserved primary actions

- Dashboard: shell context + runtime health posture
- Widgets: catalog + detail editor; preserved action `Create widget`
- Collections: curation workspace; preserved action `New collection`
- Sharing/Published: permission review surface; preserved action `Publish`
- Admin: user-role + tenant settings; preserved action `Manage roles`
- Activity: actor-action-target timeline filters

### Troubleshooting posture

- If AP/CP probes fail in UX lane, inspect service logs first:
  - `docker compose -f docker/compose.candidate.yaml logs -f ap cp ux`
- If mutation calls fail with auth/tenant errors, validate mock bearer claims and avoid conflicting tenant headers.
- If UX lane loads but API calls fail, confirm `ux` service can resolve `ap` and `cp` by compose service name.

## Local auth debugging

Resolved auth mode is `mock` with claim-over-header posture.

Primary carrier:

- `Authorization: Bearer mock.<base64-json>.token`

Canonical claim keys:

- `tenant_id`
- `principal_id`
- `policy_version`

Conflict-detection headers (`X-Tenant-Id`, `X-Principal-Id`, `X-Policy-Version`) are not the happy-path identity carrier.

## UX regression checklist

- Tenant context remains visible in top bar for all primary surfaces.
- `Create widget`, `New collection`, `Publish`, and `Manage roles` remain visible one-click actions.
- Publish and role-change flows require explicit confirmation before high-impact mutation.
- Empty/loading/error/retry surfaces provide clear recovery path without hiding prior committed state.
- Activity timeline remains readable with actor/action/target/timestamp cues.

## Task completion evidence

### Claims
- UX operator notes now define separate smoke-test and richer UX lane boundaries, run commands, and service ownership.
- Documentation now includes explicit verification coverage for `Create widget`, `New collection`, `Publish`, and `Manage roles`.
- Handoff guidance now includes recovery and troubleshooting checks for tenant visibility, publish/admin safety, and UX timeline trust.

### Evidence anchors
- `README.md:L1-L138` - supports Claims 1-3
- `docker/compose.candidate.yaml:L1-L90` - supports Claim 1
- `docker/Dockerfile.ux:L1-L17` - supports Claim 1
- `docker/nginx.ux.conf:L1-L29` - supports Claims 1 and 3
