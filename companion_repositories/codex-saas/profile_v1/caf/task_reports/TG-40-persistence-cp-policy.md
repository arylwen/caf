## Task Spec Digest
- task_id: `TG-40-persistence-cp-policy`
- title: `Implement CP persistence boundary for policy aggregate`
- primary capability: `persistence_implementation`
- task graph source: `caf/task_graph_v1.yaml`

## Inputs declared by task
- required: `reference_architectures/codex-saas/design/playbook/system_domain_model_v1.yaml`
- required: `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- required: `reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml`

## Inputs consumed
- `caf/system_domain_model_v1.yaml`: implemented policy version and approval decision persistence seams for CP ownership.
- `caf/profile_parameters_resolved.yaml`: enforced postgres engine posture and `DATABASE_URL` fail-closed runtime behavior.
- `caf/tbp_resolution_v1.yaml`: used resolved TBP set for persistence posture.
- `node tools/caf/resolve_tbp_role_binding_key_v1.mjs codex-saas --role-binding-key postgres_adapter_module`: resolved adapter surface expectation and adopted postgres adapter seam.
- `node tools/caf/resolve_tbp_role_bindings_v1.mjs codex-saas --capability persistence_implementation`: confirmed no additional path-template obligations for this capability.

## Claims
- Implemented a CP policy persistence port with policy-version and approval-decision operations.
- Implemented a postgres-backed CP policy repository with tenant-scoped queries and writes.
- Added code-bootstrap schema initialization for policy versions and approval decisions.
- Added repository factory fail-closed behavior that requires valid postgres `DATABASE_URL`.

## Evidence anchors
- `code/CP/application/ports/policy_persistence_port.py:L7-L24` - CP policy persistence port contract.
- `code/CP/persistence/postgres_policy_repository.py:L28-L165` - postgres repository operations and tenant-scoped persistence behavior.
- `code/CP/persistence/postgres_policy_repository.py:L37-L57` - code-bootstrap schema initialization hooks.
- `code/CP/persistence/postgres_adapter.py:L8-L24` - `DATABASE_URL` and postgres scheme fail-closed enforcement.
- `code/CP/persistence/repository_factory.py:L8-L10` - factory-level fail-closed repository construction.
