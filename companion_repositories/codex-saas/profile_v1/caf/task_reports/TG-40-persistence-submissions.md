# Task Report: TG-40-persistence-submissions

## Inputs consumed
- `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml` (via companion mirror `caf/profile_parameters_resolved.yaml`): consumed resolved rails `platform.database_engine=postgres`, `database.engine=postgresql`, `persistence.orm=sqlalchemy_orm`, and `schema_management_strategy=code_bootstrap`; enforced fail-closed DB runtime selection (`DATABASE_URL` required, postgres SQLAlchemy URL validation delegated through shared helper).
- `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml` (via companion mirror `caf/application_domain_model_v1.yaml`): consumed `SUBMISSION` aggregate fields (`submission_id`, `tenant_id`, `workspace_id`, `title`, `source_uri`, `submitted_by`, `status`, `submitted_at`) and AP resource operations.
- `reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml` (via companion mirror `caf/tbp_resolution_v1.yaml`): consumed resolved TBP set and deterministically resolved engine adapter role binding with `node tools/caf/resolve_tbp_role_binding_key_v1.mjs codex-saas --role-binding-key postgres_adapter_module` (single match).
- `reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml` (via companion mirror `caf/interface_binding_contracts_v1.yaml`): consumed `BIND-AP-submissions` provider requirement and emitted/used `build_submissions_access` for `SubmissionsAccessInterface`.
- `caf/application_spec_v1.md`: consumed submissions API operation set (`list`, `get`, `create`, `update`) and matched persistence method coverage 1:1.
- `caf/abp_pbp_resolution_v1.yaml`: consumed AP outbound-adapter role posture for persistence implementation placement under `code/ap/persistence`.

## Claims
- Submissions persistence now implements non-stub tenant-scoped `list`, `get`, `create`, and `update` operations using SQLAlchemy session-backed postgres repository logic.
- The submissions persistence boundary adopts the resolved `postgres_adapter_module` surface and delegates adapter/session access through that module.
- SQLAlchemy metadata now includes an ORM-owned `SubmissionModel`, preserving explicit ORM realization for submissions rails.
- AP provider/runtime wiring now exposes and binds `SubmissionsAccessInterface` to the postgres submissions provider hook instead of in-memory facade fallback.
- Code-bootstrap schema strategy is preserved with deterministic SQLAlchemy bootstrap hook exposure for submissions.

## Evidence anchors
- companion_repositories/codex-saas/profile_v1/code/ap/persistence/postgres_submissions_repository.py:L15-L23 - supports Claim 1
- companion_repositories/codex-saas/profile_v1/code/ap/persistence/postgres_submissions_repository.py:L25-L35 - supports Claim 1
- companion_repositories/codex-saas/profile_v1/code/ap/persistence/postgres_submissions_repository.py:L37-L60 - supports Claim 1
- companion_repositories/codex-saas/profile_v1/code/ap/persistence/postgres_submissions_repository.py:L62-L84 - supports Claim 1
- companion_repositories/codex-saas/profile_v1/code/ap/persistence/repository_factory.py:L11-L14 - supports Claim 2
- companion_repositories/codex-saas/profile_v1/code/ap/persistence/repository_factory.py:L31-L33 - supports Claim 2
- companion_repositories/codex-saas/profile_v1/code/ap/persistence/models.py:L32-L41 - supports Claim 3
- companion_repositories/codex-saas/profile_v1/code/ap/persistence/repository_factory.py:L31-L33 - supports Claim 4
- companion_repositories/codex-saas/profile_v1/code/ap/composition/root.py:L82-L88 - supports Claim 4
- companion_repositories/codex-saas/profile_v1/code/ap/persistence/repository_factory.py:L47-L50 - supports Claim 5
