<!-- CAF_TRACE: generated_by=Contura Architecture Framework (CAF); task_id=TG-00-CONTRACT-BND-CP-AP-01-CP; capability=contract_scaffolding; instance=codex-saas; trace_anchor=pattern_obligation_id:OBL-CONTRACT-BND-CP-AP-01-CP -->
---
task_id: TG-00-CONTRACT-BND-CP-AP-01-CP
boundary_id: BND-CP-AP-01
plane: CP
contract_surface: mixed
trace_anchors:
  - pattern_obligation_id:OBL-CONTRACT-BND-CP-AP-01-CP
  - contract_boundary_id:BND-CP-AP-01
  - contract_ref_path:reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md
  - contract_ref_section:Plane Integration Contract (CP <-> AP)
  - contract_surface:mixed
---

# CP contract scaffold for CP/AP boundary

This CP-side scaffold covers the declared mixed contract surface:
- synchronous HTTP provider seam for AP policy/safety checks
- async event envelope seam for policy lifecycle and audit propagation

Context carrier fields are explicit and mandatory in every envelope:
- tenant_id
- principal_id
- correlation_id
- payload (opaque dict)

This stub intentionally contains only the envelope fields required by the contract.
Extend by adding fields in a backward-compatible way.

## Task completion evidence

### Claims
- CP boundary stubs now include deterministic envelope dataclasses with tenant/principal/correlation context.
- CP synchronous boundary stub accepts contract requests and returns context-preserving response envelopes.
- CP async boundary stub can publish and consume contract events using the same contract envelope.

### Evidence anchors
- companion_repositories/codex-saas/profile_v1/code/CP/contracts/BND-CP-AP-01/envelope.py:L1-L26 - supports Claim 1
- companion_repositories/codex-saas/profile_v1/code/CP/contracts/BND-CP-AP-01/http_server.py:L1-L11 - supports Claim 2
- companion_repositories/codex-saas/profile_v1/code/CP/contracts/BND-CP-AP-01/events.py:L1-L25 - supports Claim 3
