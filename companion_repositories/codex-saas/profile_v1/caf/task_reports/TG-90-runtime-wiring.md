## Task Spec Digest
- task_id: `TG-90-runtime-wiring`
- title: `Wire candidate runtime and compose integration`
- primary capability: `runtime_wiring`
- task graph source: `caf/task_graph_v1.yaml`

## Inputs declared by task
- required: `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- required: `reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml`
- required: `architecture_library/phase_8/tbp/atoms/TBP-COMPOSE-01/tbp_manifest_v1.yaml`
- required: `architecture_library/phase_8/tbp/atoms/TBP-UI-REACT-VITE-01/tbp_manifest_v1.yaml`
- required: `reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml`

## Inputs consumed
- `caf/profile_parameters_resolved.yaml`: confirmed `deployment.stack_name: codex-saas`, `ui.present: true`, `packaging: docker_compose`.
- `caf/tbp_resolution_v1.yaml`: confirmed resolved runtime TBPs include compose and UI obligations.
- `architecture_library/phase_8/tbp/atoms/TBP-COMPOSE-01/tbp_manifest_v1.yaml`: used role-binding targets for compose candidate, AP/CP Dockerfiles, env contract, and gitignore expectations.
- `architecture_library/phase_8/tbp/atoms/TBP-UI-REACT-VITE-01/tbp_manifest_v1.yaml`: used role-binding targets for `Dockerfile.ui`, `nginx.ui.conf`, and UI compose wiring.
- `caf/interface_binding_contracts_v1.yaml`: closed `BIND-AP-reports`, `BIND-AP-submissions`, and `BIND-AP-workspaces` where `assembler.task_id = TG-90-runtime-wiring`.
- `node tools/caf/resolve_tbp_role_bindings_v1.mjs codex-saas --capability runtime_wiring`: used as authoritative expectation set.

## Step execution evidence
- Step 1 (Assemble CP/AP runtime wiring): aligned AP runtime on container port `8000`, kept CP and AP compose service boundaries, and injected CP policy endpoint via environment contract.
- Step 2 (Integrate persistence, UI, and contract outputs): wired AP inbound routes to composed persistence-backed service facades through `code/AP/bootstrap/runtime_wiring.py`.
- Step 3 (Materialize compose candidate and runtime surfaces): updated `docker/compose.candidate.yaml`, refreshed `.env`, and kept dockerfile-based AP/CP compose build wiring.
- Step 4 (Materialize UI build/proxy/service): created `docker/Dockerfile.ui`, created `docker/nginx.ui.conf`, and added `ui` service wiring in compose.
- Step 5 (Close interface-binding seams): emitted `caf/binding_reports/*.yaml` with consumer/provider/assembler evidence for all AP resource bindings.

## Outputs produced
- `docker/compose.candidate.yaml`
- `docker/Dockerfile.ap`
- `docker/Dockerfile.ui`
- `docker/nginx.ui.conf`
- `.env`
- `code/AP/bootstrap/runtime_wiring.py`
- `code/AP/application/policy_client.py`
- `code/AP/interfaces/inbound/reports_router.py`
- `code/AP/interfaces/inbound/submissions_router.py`
- `code/AP/interfaces/inbound/workspaces_router.py`
- `caf/binding_reports/BIND-AP-reports.yaml`
- `caf/binding_reports/BIND-AP-submissions.yaml`
- `caf/binding_reports/BIND-AP-workspaces.yaml`

## Rails/TBP satisfaction
- Writes are limited to `companion_repositories/codex-saas/profile_v1/**`.
- `docker/compose.candidate.yaml` contains required role-binding evidence strings:
  - `services:`, `build:`, `env_file:`
  - `ui:`, `Dockerfile.ui`, `nginx.ui.conf`, `/api`
- `docker/Dockerfile.cp` and `docker/Dockerfile.ap` remain Dockerfile-based build entrypoints with `FROM`.
- `.env` includes `CAF_CONTAINER_RUNTIME_CMD` and keeps runtime endpoints externalized.
- No unresolved placeholder markers were introduced.

## Manual validation
- `docker compose -f docker/compose.candidate.yaml config`
- `docker compose -f docker/compose.candidate.yaml up --build`
- `curl -H "X-Tenant-Id: t1" -H "X-Principal-Id: p1" http://localhost:8001/ap/reports/`
- `curl http://localhost:8080/`

## Task completion evidence

### Claims
- Runtime wiring now composes CP/AP/Postgres/UI into a coherent candidate compose surface with externalized configuration.
- AP resource consumers are assembled against concrete provider implementations via a composition root.
- All `TG-90-runtime-wiring` interface bindings are explicitly closed with binding reports.

### Evidence anchors
- `companion_repositories/codex-saas/profile_v1/docker/compose.candidate.yaml:L1-L73` - supports Claim 1
- `companion_repositories/codex-saas/profile_v1/code/AP/bootstrap/runtime_wiring.py:L1-L42` - supports Claim 2
- `companion_repositories/codex-saas/profile_v1/caf/binding_reports/BIND-AP-reports.yaml:L1-L13` - supports Claim 3
- `companion_repositories/codex-saas/profile_v1/caf/binding_reports/BIND-AP-submissions.yaml:L1-L13` - supports Claim 3
- `companion_repositories/codex-saas/profile_v1/caf/binding_reports/BIND-AP-workspaces.yaml:L1-L13` - supports Claim 3
