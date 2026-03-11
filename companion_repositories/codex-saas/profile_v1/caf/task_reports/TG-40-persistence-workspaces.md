## Task Spec Digest
- task_id: `TG-40-persistence-workspaces`
- title: `Implement persistence boundary for workspaces`
- primary capability: `persistence_implementation`
- task graph source: `caf/task_graph_v1.yaml`

## Inputs declared by task
- required: `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`
- required: `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- required: `reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml`
- required: `reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml`

## Inputs consumed
- `caf/application_domain_model_v1.yaml`: derived workspaces operations (`list`, `create`, `update`) and aggregate intent.
- `caf/profile_parameters_resolved.yaml`: enforced postgres runtime posture and code-bootstrap schema initialization compatibility.
- `caf/tbp_resolution_v1.yaml`: used resolved TBP set for postgres persistence adoption.
- `caf/interface_binding_contracts_v1.yaml`: satisfied provider contract for `BIND-AP-workspaces` (`provider.task_id: TG-40-persistence-workspaces`).
- `node tools/caf/resolve_tbp_role_binding_key_v1.mjs codex-saas --role-binding-key postgres_adapter_module`: confirmed adapter path used by AP repositories.

## Step execution evidence
- Step 1 (Define workspace repository boundary): implemented `PostgresWorkspacesRepository` as the workspace persistence boundary.
- Step 2 (Tenant-scoped key/query constraints): list/update queries include tenant predicates and require non-empty tenant context.
- Step 3 (Map aggregate fields): workspace persistence model maps `workspace_id`, `tenant_id`, and `name` via `WorkspaceRecord`.
- Step 4 (Expose required operations): implemented `list_workspaces`, `create_workspace`, and `update_workspace` used by AP service facades.
- Step 5 (Transaction/error semantics): writes commit transactionally and updates fail closed when scoped records are missing.

## Outputs produced
- `code/ap/persistence/postgres_workspaces_repository.py`
- `code/ap/persistence/repository_factory.py`
- `code/ap/persistence/__init__.py`

## Rails/TBP satisfaction
- All writes are within `companion_repositories/codex-saas/profile_v1/code/ap/persistence/`.
- `repository_factory.py` has a single current-task `CAF_TRACE` owner and exposes AP provider hooks.
- Provider hooks fail closed when postgres DB wiring is missing/invalid and do not return in-memory fallbacks.

## Claims
- Implemented a tenant-scoped postgres workspaces repository with non-stub list/create/update behavior.
- Added AP repository factory provider hooks for reports, submissions, and workspaces interface binding integration.
- Enforced fail-closed runtime selection for AP persistence via shared postgres adapter validation.

## Evidence anchors
- `companion_repositories/codex-saas/profile_v1/code/ap/persistence/postgres_workspaces_repository.py:L17-L93` - workspace repository boundary and tenant-scoped operations.
- `companion_repositories/codex-saas/profile_v1/code/ap/persistence/repository_factory.py:L15-L27` - AP provider hooks for required interface bindings.
- `companion_repositories/codex-saas/profile_v1/code/ap/persistence/repository_factory.py:L9-L27` - fail-closed postgres adapter enforcement at factory boundaries.
