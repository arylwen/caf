# Task Report - TG-92-tech-writer-readme

## Task Spec Digest
- task_id: `TG-92-tech-writer-readme`
- title: `Author companion operator README for local stack usage`
- primary capability: `repo_documentation`
- task graph source: `companion_repositories/codex-saas/profile_v1/caf/task_graph_v1.yaml`

## Inputs declared by task
- required: `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- required: `reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml`
- required: `reference_architectures/codex-saas/design/playbook/task_graph_v1.yaml`
- required: `reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml`

## Inputs consumed
- `companion_repositories/codex-saas/profile_v1/caf/profile_parameters_resolved.yaml` - confirmed pinned runtime (`python` + `fastapi`), packaging (`docker_compose`), database (`postgres`), and auth mode (`mock`).
- `companion_repositories/codex-saas/profile_v1/caf/tbp_resolution_v1.yaml` - confirmed resolved TBPs for compose, postgres/sqlalchemy, fastapi/asgi, and react/vite UI.
- `companion_repositories/codex-saas/profile_v1/caf/task_graph_v1.yaml` - grounded README scope to wave outputs and runtime usage expectations, including test/run/troubleshooting flows.
- `companion_repositories/codex-saas/profile_v1/caf/interface_binding_contracts_v1.yaml` - preserved AP binding context and avoided introducing undocumented cross-plane behavior.
- Produced companion artifacts inspected for accuracy: `.env`, `docker/compose.candidate.yaml`, `docker/Dockerfile.ap`, `docker/Dockerfile.cp`, `docker/Dockerfile.ui`, `infrastructure/postgres.env.example`, `code/ui/src/auth/mockAuth.js`, `code/ui/src/api.js`, and `tests/unit/**`.

## Step execution evidence
- `Document local compose startup flow for CP/AP/UI stack wiring.`  
  Added `docker compose --env-file ./.env -f docker/compose.candidate.yaml up --build` quickstart plus lifecycle commands (`ps`, `logs`, `down`).
- `Describe required and optional environment variables including DATABASE_URL contracts.`  
  Documented `DATABASE_URL` + `POSTGRES_*` contracts, service ports, and env file locations (`.env`, `infrastructure/postgres.env.example`).
- `Document unit-test execution flow for the pinned python toolchain.`  
  Added `pytest -q tests/unit` command and mapped generated test suites by seam.
- `Explain troubleshooting paths for policy, tenant context, and runtime wiring failures.`  
  Added troubleshooting guidance for UI/API wiring, DB bootstrap/env issues, policy denies, and auth/tenant mismatch failures.
- `Capture extension guidance for adding resources without architecture drift.`  
  Added extension section that keeps AP/CP boundaries, shared API-helper contract paths, and unit-test expansion aligned with current design.

## Outputs produced
- `companion_repositories/codex-saas/profile_v1/README.md`
- `companion_repositories/codex-saas/profile_v1/caf/task_reports/TG-92-tech-writer-readme.md`

## Rails/TBP satisfaction
- Rails respected: all writes are under `companion_repositories/codex-saas/profile_v1/`.
- Documentation remains grounded in pinned/runtime-generated artifacts; no new unpinned frameworks/tools were introduced.
- `node tools/caf/resolve_tbp_role_bindings_v1.mjs codex-saas --capability repo_documentation` returned no binding expectations; no additional role-binding-owned artifacts were required for this capability.

## Task completion evidence

### Claims
- README now provides runnable local stack instructions for CP/AP/UI/Postgres using the produced compose candidate surfaces.
- README documents database/runtime env contracts including `DATABASE_URL` and `POSTGRES_*` values grounded in generated env files.
- README includes Python unit-test run guidance aligned to the generated test structure.
- README includes local mock-auth debugging guidance with explicit Bearer claim key contract and claim-over-header conflict semantics.
- README includes practical troubleshooting and extension guidance anchored to existing AP/CP/UI/runtime artifacts.

### Evidence anchors
- `companion_repositories/codex-saas/profile_v1/README.md:L1-L122` - supports Claims 1, 2, 3, 4, and 5
- `companion_repositories/codex-saas/profile_v1/docker/compose.candidate.yaml:L1-L66` - supports Claim 1
- `companion_repositories/codex-saas/profile_v1/.env:L1-L15` - supports Claim 2
- `companion_repositories/codex-saas/profile_v1/infrastructure/postgres.env.example:L1-L11` - supports Claim 2
- `companion_repositories/codex-saas/profile_v1/code/ui/src/auth/mockAuth.js:L1-L23` - supports Claim 4
- `companion_repositories/codex-saas/profile_v1/code/ui/src/api.js:L1-L147` - supports Claims 4 and 5
