## Task Spec Digest
- task_id: `TG-40-persistence-reports`
- title: `Implement persistence boundary for reports`
- primary capability: `persistence_implementation`
- task graph source: `caf/task_graph_v1.yaml`

## Inputs declared by task
- required: `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`
- required: `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- required: `reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml`
- required: `reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml`

## Inputs consumed
- `caf/application_domain_model_v1.yaml`: derived reports operations (`list`, `get`) and resource shape for the persistence boundary.
- `caf/profile_parameters_resolved.yaml`: enforced postgres engine + `schema_management_strategy: code_bootstrap` + fail-closed `DATABASE_URL` posture.
- `caf/tbp_resolution_v1.yaml`: confirmed resolved TBP set includes `TBP-PG-01` for postgres adapter adoption.
- `caf/interface_binding_contracts_v1.yaml`: satisfied provider contract for `BIND-AP-reports` (`provider.task_id: TG-40-persistence-reports`).
- `node tools/caf/resolve_tbp_role_binding_key_v1.mjs codex-saas --role-binding-key postgres_adapter_module`: resolved required adapter surface at `code/ap/persistence/postgres_adapter.py`.

## Step execution evidence
- Step 1 (Define report retrieval repository boundary): implemented `PostgresReportsRepository` with only report read operations (`list_reports`, `get_report`).
- Step 2 (Tenant-scoped query constraints): both operations require non-empty tenant context and filter by `tenant_id` in SQL predicates.
- Step 3 (Read-model mapping): query results are mapped into `ReportRecord` and returned as structured dictionaries.
- Step 4 (Expose service-facing operations): repository methods exactly match `ReportsAccessInterface` shape required by AP service facades.
- Step 5 (Document retrieval correctness/performance constraints): deterministic ordering (`ORDER BY report_id`) and fail-closed missing-report behavior (`KeyError`).

## Outputs produced
- `code/ap/persistence/postgres_adapter.py`
- `code/ap/persistence/postgres_reports_repository.py`

## Rails/TBP satisfaction
- Writes are scoped to `companion_repositories/codex-saas/profile_v1/code/ap/persistence/**` (allowed write root).
- No in-memory fallback repository was added; runtime requires DB adapter presence and valid postgres URL.
- TBP adapter surface evidence is present (`psycopg`, `DATABASE_URL`) in the resolved role-binding path.

## Claims
- Implemented a tenant-scoped postgres reports repository limited to declared report read operations (`list` and `get`).
- Added postgres adapter guardrails that fail closed when `DATABASE_URL` is missing/invalid or `psycopg` is unavailable.
- Preserved service-boundary compatibility by returning report records in the expected AP interface shape.

## Evidence anchors
- `companion_repositories/codex-saas/profile_v1/code/ap/persistence/postgres_reports_repository.py:L18-L91` - report repository boundary and concrete read operations.
- `companion_repositories/codex-saas/profile_v1/code/ap/persistence/postgres_reports_repository.py:L39-L84` - tenant-scoped query constraints and fail-closed missing-record behavior.
- `companion_repositories/codex-saas/profile_v1/code/ap/persistence/postgres_adapter.py:L8-L24` - postgres adapter role-binding surface (`DATABASE_URL` + `psycopg`) and fail-closed validation.
