<!-- CAF_TRACE: generated_by=Contura Architecture Framework (CAF); task_id=TG-00-CONTRACT-BND-CP-AP-01-AP; capability=contract_scaffolding; instance=codex-saas; trace_anchor=pattern_obligation_id:OBL-CONTRACT-BND-CP-AP-01-AP -->
---
task_id: TG-00-CONTRACT-BND-CP-AP-01-AP
boundary_id: BND-CP-AP-01
plane: AP
contract_surface: mixed
trace_anchors:
  - pattern_obligation_id:OBL-CONTRACT-BND-CP-AP-01-AP
  - contract_boundary_id:BND-CP-AP-01
  - contract_ref_path:reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md
  - contract_ref_section:Plane Integration Contract (CP <-> AP)
  - contract_surface:mixed
---

# AP contract scaffold for CP/AP boundary

This AP-side scaffold covers the declared mixed contract surface:
- synchronous HTTP request/response path from AP to CP policy/safety checks
- async event envelope path for lifecycle and audit propagation

Context carrier fields are explicit and mandatory in every envelope:
- tenant_id
- principal_id
- correlation_id
- payload (opaque dict)

This stub intentionally contains only the envelope fields required by the contract.
Extend by adding fields in a backward-compatible way.

## Task completion evidence

### Claims
- AP boundary stubs now include deterministic envelope dataclasses with tenant/principal/correlation context.
- AP synchronous boundary stub is callable through a thin HTTP client path with stdlib JSON transport.
- AP async boundary stub can publish and consume contract events using the same contract envelope.

### Evidence anchors
- companion_repositories/codex-saas/profile_v1/code/AP/contracts/BND-CP-AP-01/envelope.py:L1-L26 - supports Claim 1
- companion_repositories/codex-saas/profile_v1/code/AP/contracts/BND-CP-AP-01/http_client.py:L1-L31 - supports Claim 2
- companion_repositories/codex-saas/profile_v1/code/AP/contracts/BND-CP-AP-01/events.py:L1-L25 - supports Claim 3
