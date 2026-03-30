<!-- CAF_TRACE: generated_by=Contura Architecture Framework (CAF) -->
<!-- CAF_TRACE: task_id=TG-90-runtime-wiring -->
<!-- CAF_TRACE: capability=runtime_wiring -->
<!-- CAF_TRACE: instance=codex-saas -->
<!-- CAF_TRACE: trace_anchor=pattern_obligation_id:OBL-RUNTIME-WIRING -->

## Task Spec Digest
- task_id: `TG-90-runtime-wiring`
- title: Wire runtime surfaces into a runnable local stack
- primary capability: `runtime_wiring`
- task graph source: `caf/task_graph_v1.yaml`

## Inputs declared by task
- required: `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- required: `reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md`
- required: `reference_architectures/codex-saas/design/playbook/application_design_v1.md`
- required: `reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml`

## Inputs consumed
- `caf/profile_parameters_resolved.yaml`: consumed `deployment.stack_name=codex-saas`, `platform.packaging=docker_compose`, `platform.dependency_wiring_mode=manual_composition_root`, and Python module-root conventions.
- `caf/control_plane_design_v1.md`: consumed CP runtime posture and CP policy decision surface constraints.
- `caf/application_design_v1.md`: consumed AP runtime wiring posture and CP->AP policy interaction assumptions.
- `caf/interface_binding_contracts_v1.yaml`: consumed all `assembler.task_id=TG-90-runtime-wiring` bindings and closed each with explicit binding evidence.
- `node tools/caf/resolve_tbp_role_bindings_v1.mjs codex-saas --capability runtime_wiring`: consumed runtime_wiring role-binding expectations for compose/docker/env/UI runtime artifacts.

## Step execution evidence
- Assembled CP, AP, UI, and postgres runtime topology in `docker/compose.candidate.yaml` with deterministic service roles and stack identity (`name: codex-saas`).
- Wired compose/container/env contracts via `docker/Dockerfile.ap`, `docker/Dockerfile.cp`, `docker/Dockerfile.ui`, `.env`, `.gitignore`, and `infrastructure/postgres.env.example`.
- Preserved CP<->AP contract closure by correcting AP policy client default to `http://cp:8001` in `code/ap/application/services.py` and wiring nginx reverse proxy routes in `docker/nginx.ui.conf`.
- Closed interface-binding contracts with explicit assembler evidence in `caf/binding_reports/*.yaml` for all AP resource bindings.
- Materialized base UI runtime packaging surfaces required by resolved TBP obligations (`code/ui/package.json`, `code/ui/vite.config.js`, `code/ui/src/main.jsx`, `code/ui/src/auth/mockAuth.js`, `code/ui/src/api.js`).

## Outputs produced
- `.env`
- `.gitignore`
- `infrastructure/postgres.env.example`
- `docker/compose.candidate.yaml`
- `docker/Dockerfile.ap`
- `docker/Dockerfile.cp`
- `docker/Dockerfile.ui`
- `docker/nginx.ui.conf`
- `code/ui/index.html`
- `code/ui/package.json`
- `code/ui/vite.config.js`
- `code/ui/src/App.jsx`
- `code/ui/src/main.jsx`
- `code/ui/src/api.js`
- `code/ui/src/auth/mockAuth.js`
- `code/ap/application/services.py`
- `caf/binding_reports/BIND-AP-activity_events.yaml`
- `caf/binding_reports/BIND-AP-collection_permissions.yaml`
- `caf/binding_reports/BIND-AP-collections.yaml`
- `caf/binding_reports/BIND-AP-tags.yaml`
- `caf/binding_reports/BIND-AP-tenant_settings.yaml`
- `caf/binding_reports/BIND-AP-tenant_users_roles.yaml`
- `caf/binding_reports/BIND-AP-widget_versions.yaml`
- `caf/binding_reports/BIND-AP-widgets.yaml`

## Rails/TBP satisfaction
- All writes are confined to `companion_repositories/codex-saas/profile_v1/`.
- Runtime wiring role bindings are materialized at declared paths with expected evidence markers (`services`, `build`, `env_file`, `Dockerfile.ui`, `proxy_pass`, `ap:8000`, `cp:8001`, `CAF_CONTAINER_RUNTIME_CMD`, `DATABASE_URL`).
- SQLAlchemy/Postgres env contract is explicit in both `.env` and `infrastructure/postgres.env.example` with supported `postgresql+psycopg://` prefixes.
- Interface bindings are closed with `caf_interface_binding_report_v1` reports and manual composition-root assembler evidence (`code/ap/api/dependencies.py`).

## How to validate (manual)
- `docker compose -f companion_repositories/codex-saas/profile_v1/docker/compose.candidate.yaml config`
- `docker compose -f companion_repositories/codex-saas/profile_v1/docker/compose.candidate.yaml up --build`
- `curl http://localhost:8000/ap/health`
- `curl http://localhost:8001/cp/health`
- `curl http://localhost:8080/api/health`
- `curl http://localhost:8080/cp/health`
