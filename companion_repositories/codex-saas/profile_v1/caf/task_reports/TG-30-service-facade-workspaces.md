## Task Spec Digest
- task_id: `TG-30-service-facade-workspaces`
- title: `Implement service facade for workspaces`
- primary capability: `service_facade_implementation`
- task graph source: `caf/task_graph_v1.yaml`

## Inputs declared by task
- required: `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`
- required: `reference_architectures/codex-saas/design/playbook/application_design_v1.md`
- required: `reference_architectures/codex-saas/spec/playbook/system_spec_v1.md`
- required: `reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml`

## Inputs consumed
- `caf/application_domain_model_v1.yaml`: used workspace operation scope and tenant-keyed posture.
- `caf/application_design_v1.md`: preserved service-facade abstraction and transport independence.
- `caf/system_spec_v1.md`: enforced tenant/principal preconditions and policy gate requirements.
- `caf/interface_binding_contracts_v1.yaml`: consumed `BIND-AP-workspaces` and required `WorkspacesAccessInterface`.
- `node tools/caf/resolve_tbp_role_bindings_v1.mjs codex-saas --capability service_facade_implementation`: confirmed no additional TBP path expectations for this task.

## Claims
- Declared `WorkspacesAccessInterface` as the required consumer-side interface for workspaces service facade.
- Implemented list/create/update workspace orchestration methods with explicit context and policy gating.
- Kept persistence access behind port interfaces and avoided transport coupling.

## Evidence anchors
- `code/AP/application/ports/resource_access_interfaces.py:L32-L37` - `WorkspacesAccessInterface` contract.
- `code/AP/application/resource_service_facades.py:L107-L131` - workspace facade methods with policy preconditions.
- `code/AP/application/resource_service_facades.py:L50-L58` - shared policy enforcement checkpoint.
