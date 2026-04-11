---
trace_anchors:
  - contract_boundary_id:BND-CP-AP-01
  - contract_ref_path:reference_architectures/codex-saas/design/playbook/contract_declarations_v1.yaml
  - contract_ref_section:BND-CP-AP-01
  - decision_option:CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim
  - decision_option:CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header
  - decision_option:CAF-PLANE-01/Q-CP-AP-SURFACE-01/mixed
---

# BND-CP-AP-01 CP Contract Scaffold

This scaffold captures the CP provider side of the CP<->AP contract boundary.

## Surface summary
- Synchronous provider path: `POST /cp/policy-decisions/evaluate`
- Asynchronous posture: lifecycle/audit event envelopes are materialized in `events.py`
- Tenant and principal context carrier: Authorization Bearer mock claim contract
- Conflict rule: claim-over-header with explicit rejection on mismatch

Provider stubs intentionally keep payload semantics minimal and deterministic so later policy/resource tasks can extend fields without changing boundary ownership.

## Task completion evidence

### Claims
- CP provider envelopes are scaffolded with explicit tenant/principal/correlation context carriers and opaque payload transport.
- CP HTTP provider stub realizes policy decision semantics for sync enforcement calls from AP.
- CP async event helpers preserve mixed contract posture by round-tripping event envelopes without lane-local field invention.

### Evidence anchors
- `code/cp/contracts/bnd_cp_ap_01/envelope.py:L1-L31` - supports Claim 1
- `code/cp/contracts/bnd_cp_ap_01/http_server.py:L1-L34` - supports Claim 2
- `code/cp/contracts/bnd_cp_ap_01/events.py:L1-L32` - supports Claim 3
