## Task Spec Digest
- task_id: `TG-20-api-boundary-reports`
- title: `Implement API boundary for reports`
- primary capability: `api_boundary_implementation`
- task graph source: `caf/task_graph_v1.yaml`

## Inputs declared by task
- required: `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`
- required: `reference_architectures/codex-saas/design/playbook/application_design_v1.md`
- required: `reference_architectures/codex-saas/design/playbook/contract_declarations_v1.yaml`

## Inputs consumed
- `caf/application_domain_model_v1.yaml`: used `reports` API operations (`list`, `get`) and avoided write operations.
- `caf/application_design_v1.md`: used AP boundary constraint to keep route handlers transport-thin and service-delegating.
- `caf/contract_declarations_v1.yaml`: used `BND-CP-AP-01` context propagation requirements for tenant/principal policy checks.

## Step execution evidence
- Read reports resource operation scope from the domain model and limited boundary surface to `GET /ap/reports/` and `GET /ap/reports/{report_id}`.
- Added reports-focused HTTP boundary handlers in `code/AP/interfaces/inbound/reports_router.py`.
- Enforced tenant/principal ingress context and policy gate call before report access through `code/AP/application/resource_services.py`.
- Delegated report retrieval to the AP service layer and kept route handlers free of persistence logic.
- Preserved contract-aligned response semantics with explicit 403/404/502 mapping in the boundary.

## Outputs produced
- `code/AP/interfaces/inbound/reports_router.py`
- `code/AP/application/resource_services.py`
- `code/AP/interfaces/inbound/http_router.py`

## Rails and TBP satisfaction
- All writes remained under `companion_repositories/codex-saas/profile_v1/code/**`.
- No forbidden actions were invoked; changes are candidate scaffolding only.
- TBP role binding for `api_boundary_implementation` is satisfied at `code/AP/main.py` (contains `FastAPI` and `include_router`) and remains compatible with this reports boundary task.
