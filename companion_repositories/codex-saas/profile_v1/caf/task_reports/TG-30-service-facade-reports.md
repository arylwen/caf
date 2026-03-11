## Task Spec Digest
- task_id: `TG-30-service-facade-reports`
- title: `Implement service facade for reports`
- primary capability: `service_facade_implementation`
- task graph source: `caf/task_graph_v1.yaml`

## Inputs declared by task
- required: `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`
- required: `reference_architectures/codex-saas/design/playbook/application_design_v1.md`
- required: `reference_architectures/codex-saas/spec/playbook/system_spec_v1.md`
- required: `reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml`

## Inputs consumed
- `caf/application_domain_model_v1.yaml`: confirmed reports operations are list/get.
- `caf/application_design_v1.md`: kept service layer transport-free and policy-gated.
- `caf/system_spec_v1.md`: enforced tenant/principal context as mandatory preconditions.
- `caf/interface_binding_contracts_v1.yaml`: consumed `BIND-AP-reports` and required `ReportsAccessInterface`.
- `node tools/caf/resolve_tbp_role_bindings_v1.mjs codex-saas --capability service_facade_implementation`: validated no additional TBP path expectations for this capability.

## Claims
- Declared `ReportsAccessInterface` as the required consumer-side interface for reports service facade.
- Implemented transport-free reports facade operations (`list_reports`, `get_report`) with explicit context and policy checks.
- Routed reports data access through the required interface boundary instead of direct adapter usage.

## Evidence anchors
- `code/AP/application/ports/resource_access_interfaces.py:L18-L23` - `ReportsAccessInterface` contract.
- `code/AP/application/resource_service_facades.py:L60-L73` - reports service methods with context and policy enforcement.
- `code/AP/application/resource_service_facades.py:L50-L58` - shared policy precondition gate used before report access.
