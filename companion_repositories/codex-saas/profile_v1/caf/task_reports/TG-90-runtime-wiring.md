# Task Report — TG-90-runtime-wiring

## Task Spec Digest
- task_id: `TG-90-runtime-wiring`
- title: `Assemble runtime wiring for CP, AP, UI, and compose stack`
- primary capability: `runtime_wiring`
- task graph source: `companion_repositories/codex-saas/profile_v1/caf/task_graph_v1.yaml`

## Inputs declared by task
- required: `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- required: `reference_architectures/codex-saas/design/playbook/contract_declarations_v1.yaml`
- required: `reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml`
- required: `reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml`

## Inputs consumed
- `companion_repositories/codex-saas/profile_v1/caf/profile_parameters_resolved.yaml` — confirmed `docker_compose`, `manual_composition_root`, `sqlalchemy_orm`, stack name `codex-saas`, and module roots `code.ap` / `code.cp`.
- `companion_repositories/codex-saas/profile_v1/caf/contract_declarations_v1.yaml` — validated CP/AP contract boundary context for runtime wiring.
- `companion_repositories/codex-saas/profile_v1/caf/tbp_resolution_v1.yaml` — confirmed resolved TBPs for compose, postgres, sqlalchemy, and react/vite UI runtime surfaces.
- `companion_repositories/codex-saas/profile_v1/caf/interface_binding_contracts_v1.yaml` — identified interface bindings assembled by this task (`BIND-AP-*`) and closed them with binding reports.
- `node tools/caf/resolve_tbp_role_bindings_v1.mjs codex-saas --capability runtime_wiring` output — used as authoritative artifact path/evidence contract for compose, Dockerfiles, env file, gitignore, and UI proxy surfaces.

## Step execution evidence
- `Assemble CP/AP runtime integration and cross-plane contract wiring.`  
  Added compose wiring for CP/AP/UI/Postgres and emitted AP interface binding closure reports in `caf/binding_reports/BIND-AP-*.yaml`.
- `Materialize compose wiring, CP/AP Dockerfiles, env-file surfaces, and ignore rules.`  
  Created `docker/compose.candidate.yaml`, `docker/Dockerfile.cp`, `docker/Dockerfile.ap`, `.env`, and `.gitignore`.
- `Wire UI build container, nginx proxy, and compose UI service for same-origin AP calls.`  
  Created `docker/Dockerfile.ui` and `docker/nginx.ui.conf`; routed `/api/*` to `ap:8000` and `/cp/*` to `cp:8001` with same-origin proxying.
- `Preserve auth_claim tenant carrier semantics and claim-over-header conflict behavior in runtime paths.`  
  Kept existing AP/CP runtime and boundary code unchanged (auth claim parsing and fail-closed behavior already implemented in AP/CP entry surfaces).
- `Keep runtime env contracts aligned with sqlalchemy_orm persistence rails and postgres wiring contracts.`  
  Added `.env` with SQLAlchemy-compatible `DATABASE_URL=postgresql+psycopg://...@postgres:5432/...` plus `POSTGRES_*` values aligned with in-network compose service DNS.

## Outputs produced
- `companion_repositories/codex-saas/profile_v1/docker/compose.candidate.yaml`
- `companion_repositories/codex-saas/profile_v1/docker/Dockerfile.cp`
- `companion_repositories/codex-saas/profile_v1/docker/Dockerfile.ap`
- `companion_repositories/codex-saas/profile_v1/docker/Dockerfile.ui`
- `companion_repositories/codex-saas/profile_v1/docker/nginx.ui.conf`
- `companion_repositories/codex-saas/profile_v1/.env`
- `companion_repositories/codex-saas/profile_v1/.gitignore`
- `companion_repositories/codex-saas/profile_v1/caf/binding_reports/BIND-AP-reports.yaml`
- `companion_repositories/codex-saas/profile_v1/caf/binding_reports/BIND-AP-reviews.yaml`
- `companion_repositories/codex-saas/profile_v1/caf/binding_reports/BIND-AP-submissions.yaml`
- `companion_repositories/codex-saas/profile_v1/caf/binding_reports/BIND-AP-workspaces.yaml`

## Rails and TBP satisfaction
- Rails respected: all writes are under `companion_repositories/codex-saas/profile_v1/`.
- TBP role-bindings satisfied via runtime-wiring expectations:
  - `compose_candidate` → `docker/compose.candidate.yaml`
  - `dockerfile_cp` → `docker/Dockerfile.cp`
  - `dockerfile_ap` → `docker/Dockerfile.ap`
  - `env_file` and `sqlalchemy_runtime_env_contract` → `.env`
  - `gitignore` → `.gitignore`
  - `ui_dockerfile` → `docker/Dockerfile.ui`
  - `ui_nginx_proxy_conf` → `docker/nginx.ui.conf`
  - `ui_compose_service` evidence retained in compose (`ui:`, `Dockerfile.ui`, `nginx.ui.conf`, `/api`)

## Task completion evidence

### Claims
- Compose runtime wiring now materializes CP, AP, UI, and Postgres services under stack name `codex-saas`.
- CP/AP/UI Dockerfiles are present and CP/AP install dependencies from canonical `requirements.txt`.
- Same-origin UI proxy wiring is present for both `/api/*` and `/cp/*`.
- Runtime env wiring externalizes `DATABASE_URL` and `POSTGRES_*` with SQLAlchemy-compatible URL form.
- AP interface bindings declared for this assembler task are closed with binding reports.

### Evidence anchors
- `companion_repositories/codex-saas/profile_v1/docker/compose.candidate.yaml:L1-L66` — supports Claim 1
- `companion_repositories/codex-saas/profile_v1/docker/Dockerfile.cp:L1-L16` — supports Claim 2
- `companion_repositories/codex-saas/profile_v1/docker/Dockerfile.ap:L1-L16` — supports Claim 2
- `companion_repositories/codex-saas/profile_v1/docker/Dockerfile.ui:L1-L22` — supports Claim 3
- `companion_repositories/codex-saas/profile_v1/docker/nginx.ui.conf:L1-L32` — supports Claim 3
- `companion_repositories/codex-saas/profile_v1/.env:L1-L15` — supports Claim 4
- `companion_repositories/codex-saas/profile_v1/caf/binding_reports/BIND-AP-reports.yaml:L1-L17` — supports Claim 5
- `companion_repositories/codex-saas/profile_v1/caf/binding_reports/BIND-AP-reviews.yaml:L1-L17` — supports Claim 5
- `companion_repositories/codex-saas/profile_v1/caf/binding_reports/BIND-AP-submissions.yaml:L1-L17` — supports Claim 5
- `companion_repositories/codex-saas/profile_v1/caf/binding_reports/BIND-AP-workspaces.yaml:L1-L17` — supports Claim 5

