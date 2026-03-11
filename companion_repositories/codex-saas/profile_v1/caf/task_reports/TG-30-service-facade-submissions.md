## Task Spec Digest
- task_id: `TG-30-service-facade-submissions`
- title: `Implement service facade for submissions`
- primary capability: `service_facade_implementation`
- task graph source: `caf/task_graph_v1.yaml`

## Inputs declared by task
- required: `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`
- required: `reference_architectures/codex-saas/design/playbook/application_design_v1.md`
- required: `reference_architectures/codex-saas/spec/playbook/system_spec_v1.md`
- required: `reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml`

## Inputs consumed
- `caf/application_domain_model_v1.yaml`: used submission operation scope and workflow status posture.
- `caf/application_design_v1.md`: preserved service-layer boundary independence from transport/storage frameworks.
- `caf/system_spec_v1.md`: retained tenant/principal context and fail-closed policy preconditions.
- `caf/interface_binding_contracts_v1.yaml`: consumed `BIND-AP-submissions` and required `SubmissionsAccessInterface`.
- `node tools/caf/resolve_tbp_role_bindings_v1.mjs codex-saas --capability service_facade_implementation`: confirmed no additional TBP path expectations for this task.

## Claims
- Declared `SubmissionsAccessInterface` as the required consumer-side interface for submissions service facade.
- Implemented list/create/update submission orchestration methods with explicit context and policy checkpoints.
- Kept submission facade transport-free and delegated persistence via interface port only.

## Evidence anchors
- `code/AP/application/ports/resource_access_interfaces.py:L24-L31` - `SubmissionsAccessInterface` contract.
- `code/AP/application/resource_service_facades.py:L76-L105` - submissions facade methods and policy checkpoints.
- `code/AP/application/resource_service_facades.py:L42-L49` - mandatory context validation before orchestration.
