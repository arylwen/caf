## Task Spec Digest
- task_id: `TG-35-policy-enforcement-core`
- title: `Implement cross-plane policy enforcement core`
- primary capability: `policy_enforcement`
- task graph source: `caf/task_graph_v1.yaml`

## Inputs declared by task
- required: `reference_architectures/codex-saas/spec/playbook/system_spec_v1.md`
- required: `reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md`
- required: `reference_architectures/codex-saas/design/playbook/contract_declarations_v1.yaml`

## Inputs consumed
- `reference_architectures/codex-saas/spec/playbook/system_spec_v1.md`: consumed fail-closed policy posture and tenant/principal context invariants.
- `reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md`: consumed CP/AP integration contract intent (`mixed` sync/async and CP policy authority).
- `reference_architectures/codex-saas/design/playbook/contract_declarations_v1.yaml`: consumed material boundary `BND-CP-AP-01` and context propagation expectations.

## Step execution evidence
- Implemented reusable policy decision core in `code/CP/application/policy_core.py`.
- Updated CP gate adapter in `code/CP/application/policy_gate.py` to expose AP-action evaluation with tenant-context conflict rejection.
- Added CP inbound policy enforcement routes in `code/CP/interfaces/inbound/http_router.py` for contract sync and policy evaluation.
- Updated CP contract sync handler payload semantics in `code/CP/contracts/BND-CP-AP-01/http_server.py` to return explicit allow/deny outcomes.
- Added AP consumption hook in `code/AP/application/policy_client.py` and wired policy checks into AP resource service before boundary actions.

## Outputs produced
- `code/CP/application/policy_core.py`
- `code/CP/application/policy_gate.py`
- `code/CP/interfaces/inbound/http_router.py`
- `code/CP/contracts/BND-CP-AP-01/http_server.py`
- `code/AP/application/policy_client.py`
- `code/AP/application/resource_services.py`

## Rails and TBP satisfaction
- All writes remained under `companion_repositories/codex-saas/profile_v1/code/**`.
- Fail-closed behavior is explicit for missing context and tenant-context conflicts.
- `resolve_tbp_role_bindings_v1` for `policy_enforcement` returns no additional role-binding obligations; no TBP path gaps introduced.
