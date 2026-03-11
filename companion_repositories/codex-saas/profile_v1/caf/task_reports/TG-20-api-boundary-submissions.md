## Task Spec Digest
- task_id: `TG-20-api-boundary-submissions`
- title: `Implement API boundary for submissions`
- primary capability: `api_boundary_implementation`
- task graph source: `caf/task_graph_v1.yaml`

## Inputs declared by task
- required: `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`
- required: `reference_architectures/codex-saas/design/playbook/application_design_v1.md`
- required: `reference_architectures/codex-saas/design/playbook/contract_declarations_v1.yaml`

## Inputs consumed
- `caf/application_domain_model_v1.yaml`: consumed `submissions` operations (`list`, `create`, `update`) and workflow status vocabulary.
- `caf/application_design_v1.md`: followed AP boundary/service seam requirement and avoided persistence coupling.
- `caf/contract_declarations_v1.yaml`: enforced tenant/principal propagation at ingress for CP/AP contract compatibility.

## Step execution evidence
- Read submissions workflow intent and operation set from domain model constraints.
- Added submission handlers in `code/AP/interfaces/inbound/submissions_router.py` for list/create/update only.
- Enforced ingress context (tenant/principal) on every submission route.
- Delegated orchestration to service methods in `code/AP/application/resource_services.py` and kept route code transport-only.
- Added explicit validation/error mapping semantics (400/403/404/502) without introducing new endpoints.

## Outputs produced
- `code/AP/interfaces/inbound/submissions_router.py`
- `code/AP/application/resource_services.py`
- `code/AP/interfaces/inbound/http_router.py`

## Rails and TBP satisfaction
- All writes stayed within `companion_repositories/codex-saas/profile_v1/code/**`.
- Submission create does not accept client-supplied `submission_id`; IDs are generated server-side in service layer.
- TBP role binding for `api_boundary_implementation` remains satisfied at `code/AP/main.py`.
