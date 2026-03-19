# Task Report: TG-40-persistence-workspaces

## Inputs consumed
- `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml` (consumed via companion mirror `caf/profile_parameters_resolved.yaml`): derived rails `database.engine=postgresql`, `platform.database_engine=postgres`, `persistence.orm=sqlalchemy_orm`, and `schema_management_strategy=code_bootstrap`; enforced fail-closed runtime DB URL requirement and SQLAlchemy bootstrap posture.
- `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml` (consumed via companion mirror `caf/application_domain_model_v1.yaml`): derived workspace entity fields (`workspace_id`, `tenant_id`, `name`, `description`, `status`, `created_at`) and operations (`list`, `get`, `create`, `update`) for operation-complete repository methods.
- `reference_architectures/codex-saas/design/playbook/system_domain_model_v1.yaml` (consumed via companion mirror `caf/system_domain_model_v1.yaml`): confirmed system-level tenant/governance context remains preserved by tenant-scoped repository query predicates and AP wiring seams.
- `reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml` (consumed via companion mirror `caf/tbp_resolution_v1.yaml`): confirmed resolved TBPs include `TBP-PG-01` and `TBP-SQLALCHEMY-01`; resolved engine adapter role binding with `node tools/caf/resolve_tbp_role_binding_key_v1.mjs codex-saas --role-binding-key postgres_adapter_module` to exactly one match.
- `reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml` (consumed via companion mirror `caf/interface_binding_contracts_v1.yaml`): satisfied `BIND-AP-workspaces` provider requirement by emitting provider hook `build_workspaces_access` for `WorkspacesAccessInterface` and wiring it into AP runtime composition.

## Claims
- Workspace persistence now implements non-stub, tenant-scoped `list`, `get`, `create`, and `update` repository operations using postgres/sqlalchemy.
- The workspace persistence boundary adopts the resolved `${engine_key}_adapter_module` surface (`postgres_adapter_module`) and delegates DB runtime/session creation through that adapter.
- AP persistence metadata now includes ORM-owned workspace model mapping aligned with `sqlalchemy_orm` rails.
- Runtime/provider seams now expose and bind `WorkspacesAccessInterface` through a dedicated workspace provider hook without in-memory fallback in provider wiring.
- `code/ap/persistence/repository_factory.py` multi-writer trace drift was consolidated to a single task owner (`TG-40-persistence-workspaces`) per worker-skill rule.

## Evidence anchors
- companion_repositories/codex-saas/profile_v1/code/ap/persistence/postgres_workspaces_repository.py:L15-L20 — supports Claim 1
- companion_repositories/codex-saas/profile_v1/code/ap/persistence/postgres_workspaces_repository.py:L22-L32 — supports Claim 1
- companion_repositories/codex-saas/profile_v1/code/ap/persistence/postgres_workspaces_repository.py:L34-L49 — supports Claim 1
- companion_repositories/codex-saas/profile_v1/code/ap/persistence/postgres_workspaces_repository.py:L51-L68 — supports Claim 1
- companion_repositories/codex-saas/profile_v1/code/ap/persistence/repository_factory.py:L9-L11 — supports Claim 2
- companion_repositories/codex-saas/profile_v1/code/ap/persistence/repository_factory.py:L28-L30 — supports Claim 2
- companion_repositories/codex-saas/profile_v1/code/ap/persistence/models.py:L10-L17 — supports Claim 3
- companion_repositories/codex-saas/profile_v1/code/ap/persistence/repository_factory.py:L39-L42 — supports Claim 3
- companion_repositories/codex-saas/profile_v1/code/ap/persistence/repository_factory.py:L28-L30 — supports Claim 4
- companion_repositories/codex-saas/profile_v1/code/ap/composition/root.py:L19-L19 — supports Claim 4
- companion_repositories/codex-saas/profile_v1/code/ap/composition/root.py:L73-L80 — supports Claim 4
- companion_repositories/codex-saas/profile_v1/code/ap/persistence/repository_factory.py:L1-L3 — supports Claim 5
