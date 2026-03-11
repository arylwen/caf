## Task Spec Digest
- task_id: `TG-40-persistence-submissions`
- title: `Implement persistence boundary for submissions`
- primary capability: `persistence_implementation`
- task graph source: `caf/task_graph_v1.yaml`

## Inputs declared by task
- required: `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`
- required: `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- required: `reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml`
- required: `reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml`

## Inputs consumed
- `caf/application_domain_model_v1.yaml`: used submissions operations (`list`, `create`, `update`) and submission state fields.
- `caf/profile_parameters_resolved.yaml`: enforced postgres engine posture and code-bootstrap schema strategy.
- `caf/tbp_resolution_v1.yaml`: used resolved TBP posture for postgres-backed persistence.
- `caf/interface_binding_contracts_v1.yaml`: satisfied provider contract for `BIND-AP-submissions` (`provider.task_id: TG-40-persistence-submissions`).
- `node tools/caf/resolve_tbp_role_binding_key_v1.mjs codex-saas --role-binding-key postgres_adapter_module`: confirmed adapter ownership path used by AP persistence.

## Step execution evidence
- Step 1 (Define submission repository boundary): implemented `PostgresSubmissionsRepository` as the submission persistence boundary.
- Step 2 (Tenant-scoped lifecycle semantics): every mutation and read operation enforces tenant context and tenant-filtered SQL predicates.
- Step 3 (Submission state mapping): mapped submission lifecycle fields (`submission_id`, `workspace_id`, `tenant_id`, `title`, `status`) through `SubmissionRecord`.
- Step 4 (Expose service-facing operations): implemented `list_submissions`, `create_submission`, and `update_submission_status` for AP service-facade integration.
- Step 5 (Consistency/failure handling): updates use `RETURNING` and fail closed with `KeyError` when the tenant-scoped record does not exist.

## Outputs produced
- `code/ap/persistence/postgres_submissions_repository.py`

## Rails/TBP satisfaction
- Writes are inside the companion repo allowed path under `code/ap/persistence/`.
- No production in-memory fallback paths are introduced.
- Postgres adapter adoption is explicit through shared AP adapter surface.

## Claims
- Implemented a tenant-scoped postgres submissions repository with non-stub list/create/update lifecycle operations.
- Enforced fail-closed semantics for missing tenant context and missing submission rows on updates.
- Mapped submission workflow fields to concrete persistence records aligned with AP service facade needs.

## Evidence anchors
- `companion_repositories/codex-saas/profile_v1/code/ap/persistence/postgres_submissions_repository.py:L19-L115` - submission repository boundary and concrete CRUD-aligned operations.
- `companion_repositories/codex-saas/profile_v1/code/ap/persistence/postgres_submissions_repository.py:L39-L109` - tenant enforcement and fail-closed missing-record behavior.
- `companion_repositories/codex-saas/profile_v1/code/ap/persistence/postgres_adapter.py:L8-L24` - postgres adapter validation and runtime fail-closed checks used by this repository.
