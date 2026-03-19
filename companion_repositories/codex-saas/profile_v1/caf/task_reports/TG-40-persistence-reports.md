# Task Report: TG-40-persistence-reports

## Inputs consumed
- `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`: consumed resolved rails (`platform.database_engine=postgres`, `database.engine=postgresql`, `persistence.orm=sqlalchemy_orm`, `schema_management_strategy=code_bootstrap`) and enforced fail-closed `DATABASE_URL` runtime selection.
- `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`: consumed `REPORT` entity fields and reports API operations (`list`, `get`, `create`) to implement complete tenant-scoped persistence methods.
- `reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml`: consumed resolved TBP set including `TBP-PG-01` and `TBP-SQLALCHEMY-01`; resolved adapter role binding with `node tools/caf/resolve_tbp_role_binding_key_v1.mjs codex-saas --role-binding-key postgres_adapter_module`.
- `reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml`: consumed `BIND-AP-reports` and emitted AP provider hook for `ReportsAccessInterface`.

## Claims
- Reports persistence now provides non-stub tenant-scoped `list`, `get`, and `create` operations in a postgres/sqlalchemy repository boundary.
- The reports persistence boundary adopts the resolved postgres adapter module and delegates session/runtime wiring through it.
- AP reports provider hook is exposed for `ReportsAccessInterface` and AP composition now binds reports service to that provider implementation.
- Code-bootstrap schema strategy is realized with deterministic SQLAlchemy model registration and runtime bootstrap invocation before traffic handling.
- Runtime selection fails closed when `DATABASE_URL` is missing or invalid for resolved postgres/sqlalchemy rails.

## Evidence anchors
- companion_repositories/codex-saas/profile_v1/code/ap/persistence/postgres_reports_repository.py:L15-L21 — supports Claim 1
- companion_repositories/codex-saas/profile_v1/code/ap/persistence/postgres_reports_repository.py:L23-L33 — supports Claim 1
- companion_repositories/codex-saas/profile_v1/code/ap/persistence/postgres_reports_repository.py:L35-L50 — supports Claim 1
- companion_repositories/codex-saas/profile_v1/code/ap/persistence/repository_factory.py:L9-L10 — supports Claim 2
- companion_repositories/codex-saas/profile_v1/code/ap/persistence/repository_factory.py:L22-L24 — supports Claim 2
- companion_repositories/codex-saas/profile_v1/code/ap/persistence/repository_factory.py:L22-L24 — supports Claim 3
- companion_repositories/codex-saas/profile_v1/code/ap/composition/root.py:L17-L17 — supports Claim 3
- companion_repositories/codex-saas/profile_v1/code/ap/composition/root.py:L71-L79 — supports Claim 3
- companion_repositories/codex-saas/profile_v1/code/ap/persistence/models.py:L9-L21 — supports Claim 4
- companion_repositories/codex-saas/profile_v1/code/ap/persistence/repository_factory.py:L27-L30 — supports Claim 4
- companion_repositories/codex-saas/profile_v1/code/ap/runtime/bootstrap.py:L13-L15 — supports Claim 4
- companion_repositories/codex-saas/profile_v1/code/ap/persistence/repository_factory.py:L13-L19 — supports Claim 5
