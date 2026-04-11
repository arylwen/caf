---
trace_anchors:
  - contract_boundary_id:BND-CP-AP-01
  - contract_ref_path:reference_architectures/codex-saas/design/playbook/contract_declarations_v1.yaml
  - contract_ref_section:BND-CP-AP-01
  - decision_option:CAF-TCTX-01/Q-CPAP-TENANT-CARRIER-01/auth_claim
  - decision_option:CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header
  - decision_option:CAF-PLANE-01/Q-CP-AP-SURFACE-01/mixed
---

# BND-CP-AP-01 AP Contract Scaffold

This scaffold captures the AP consumer side of the CP<->AP contract boundary.

## Surface summary
- Synchronous contract path: `POST /cp/policy-decisions/evaluate`
- Asynchronous contract posture: lifecycle/audit event envelopes are materialized in `events.py`
- Tenant and principal context carrier: Authorization Bearer mock claim contract
- Conflict rule: claim-over-header with explicit rejection on mismatch

The stubs intentionally keep payload schemas minimal so downstream provider and assembler tasks can add resource-specific fields without rewriting boundary ownership.

## Task completion evidence

### Claims
- AP consumer contract envelopes are scaffolded with explicit tenant/principal/correlation context carriers.
- AP synchronous client stub calls the CP policy decision endpoint with Authorization/Bearer contract semantics.
- Claim-over-header conflict handling is explicit and fail-closed for tenant/principal mismatches.
- Async lifecycle/audit event envelope stubs are present for the mixed CP<->AP contract surface.

### Evidence anchors
- `code/ap/contracts/bnd_cp_ap_01/envelope.py:L1-L34` - supports Claims 1 and 4
- `code/ap/contracts/bnd_cp_ap_01/http_client.py:L1-L67` - supports Claims 2 and 3
- `code/ap/contracts/bnd_cp_ap_01/events.py:L1-L35` - supports Claim 4
