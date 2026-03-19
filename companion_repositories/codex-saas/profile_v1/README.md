# codex-saas Operator README

This companion repository contains the local candidate stack for instance `codex-saas` (`profile_v1`).

Pinned profile/runtime summary:
- Runtime language/framework: Python + FastAPI
- Packaging/deployment: docker compose
- Database: PostgreSQL via SQLAlchemy (`DATABASE_URL` required)
- UI: React/Vite SPA served as a separate service
- Auth mode: mock Authorization Bearer claim contract

## Prerequisites

- Docker with `docker compose` available
- Python 3.12+ with dependencies from `requirements.txt` (for local unit-test runs)
- Open local ports: `8000` (AP), `8001` (CP), `8080` (UI), `5432` (Postgres)

Optional:
- Podman compose can be used for equivalent compose flows, but pinned examples use Docker compose first.

## Quickstart

From `companion_repositories/codex-saas/profile_v1`:

```bash
docker compose --env-file ./.env -f docker/compose.candidate.yaml up --build
```

Useful follow-ups:

```bash
docker compose --env-file ./.env -f docker/compose.candidate.yaml ps
docker compose --env-file ./.env -f docker/compose.candidate.yaml logs -f ap cp ui postgres
docker compose --env-file ./.env -f docker/compose.candidate.yaml down
```

## Environment Variables

Primary runtime env file: `.env`  
Reference example: `infrastructure/postgres.env.example`

Required database contract variables:
- `DATABASE_URL` (must be PostgreSQL SQLAlchemy style, for example `postgresql+psycopg://...`)
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_HOST` (compose default is `postgres`)
- `POSTGRES_PORT`

Service ports:
- `AP_PORT` (default `8000`)
- `CP_PORT` (default `8001`)
- `UI_PORT` (default `8080`)

## Unit Tests

From `companion_repositories/codex-saas/profile_v1`:

```bash
pytest -q tests/unit
```

Targeted suites:
- `tests/unit/common/auth` for mock claim parsing and tenant-header conflict handling
- `tests/unit/cp` for CP auth-context + policy enforcement semantics
- `tests/unit/ap` for AP policy bridge behavior
- `tests/unit/common/persistence` for `DATABASE_URL` contract normalization/validation

## Local Auth Debugging

Mock auth is claim-based and fail-closed.

Primary carrier:
- `Authorization: Bearer tenant_id=<...>;principal_id=<...>;policy_version=<...>`

Canonical mock claim keys:
- `tenant_id`
- `principal_id`
- `policy_version`

Alternate conflict-detection header:
- `X-Tenant-Id` may be present, but claim-over-header semantics are enforced.  
  If `X-Tenant-Id` disagrees with claim `tenant_id`, AP/CP fail closed with a tenant-context conflict.

Local diagnosis steps:
1. Follow service logs while issuing requests:
   ```bash
   docker compose --env-file ./.env -f docker/compose.candidate.yaml logs -f ap cp
   ```
2. Probe AP policy with an explicit claim:
   ```bash
   curl -sS http://localhost:8000/api/policy/probe \
     -H "Authorization: Bearer tenant_id=tenant-demo;principal_id=operator-demo;policy_version=v1" \
     -H "X-Tenant-Id: tenant-demo" \
     -H "Content-Type: application/json" \
     -d "{\"action\":\"list\",\"resource\":\"workspaces\"}"
   ```
3. If you see `tenant context conflict`, check that `X-Tenant-Id` matches the Bearer claim `tenant_id`.

## Troubleshooting

- UI loads but API calls fail:
  - Confirm AP/CP are healthy and reachable through compose.
  - Check `docker/nginx.ui.conf` proxy targets and AP/CP logs.
- DB bootstrap or persistence errors:
  - Verify `.env` has a valid `DATABASE_URL` and `POSTGRES_*` values.
  - Confirm Postgres container is healthy in compose status/logs.
- Policy denies writes unexpectedly:
  - Write actions require an operator-style principal (`principal_id` containing `operator`) and `policy_version=v1`.
- Auth/tenant failures:
  - Ensure Authorization Bearer claims include all required keys and no claim/header tenant mismatch exists.

## Extension Guidance

When adding resources/endpoints:
- Keep AP/CP boundary split and policy enforcement fail-closed behavior.
- Keep `code` package/module roots aligned with existing `code.ap` and `code.cp` structure.
- Add/extend tests under `tests/unit` for boundary, service, and persistence seams.
- Update API helper and UI pages through shared contract paths (`/api/*`, `/cp/*`) instead of ad hoc direct backend URLs.

## Task completion evidence

### Claims
- The README now provides operator-ready compose startup/shutdown/log workflows grounded in produced runtime wiring artifacts.
- Environment variable guidance documents `DATABASE_URL` and `POSTGRES_*` contracts aligned to generated env/compose surfaces.
- Unit-test execution guidance is present for the Python toolchain and generated wave-7 test suites.
- Mock-auth debugging guidance is explicit about Authorization Bearer claim keys, primary carrier semantics, and claim-over-header conflict handling.
- Troubleshooting and extension guidance are tied to the current AP/CP/UI/runtime structure without introducing unpinned tooling.

### Evidence anchors
- `companion_repositories/codex-saas/profile_v1/README.md:L1-L122` - supports Claims 1, 2, 3, 4, and 5
- `companion_repositories/codex-saas/profile_v1/docker/compose.candidate.yaml:L1-L66` - supports Claim 1
- `companion_repositories/codex-saas/profile_v1/.env:L1-L15` - supports Claim 2
- `companion_repositories/codex-saas/profile_v1/infrastructure/postgres.env.example:L1-L11` - supports Claim 2
- `companion_repositories/codex-saas/profile_v1/tests/unit/common/auth/test_mock_claims.py:L1-L42` - supports Claim 4
- `companion_repositories/codex-saas/profile_v1/code/ui/src/auth/mockAuth.js:L1-L23` - supports Claim 4
- `companion_repositories/codex-saas/profile_v1/code/ui/src/api.js:L1-L147` - supports Claims 4 and 5
