---
boundary_id: BND-CP-AP-01
plane: AP
contract_surface: synchronous_http
tenant_context_carrier: auth_claim
tenant_context_conflict_rule: claim_over_header
trace_anchors:
  - contract_boundary_id:BND-CP-AP-01
  - contract_ref_path:reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md
  - contract_ref_section:Plane Integration Contract (CP ↔ AP)
  - contract_surface:cp_ap_contract_surface
---

# AP contract scaffold for BND-CP-AP-01

This scaffold makes the AP consumer contract explicit for the CP policy decision boundary.
The surface is intentionally thin and keeps transport choices aligned to the declared synchronous HTTP contract.

## Contract surface summary

- Consumer module: `code/ap/contracts/bnd_cp_ap_01/http_client.py`
- Envelope module: `code/ap/contracts/bnd_cp_ap_01/envelope.py`
- Carrier expectations:
  - canonical: `Authorization: Bearer tenant_id=...;principal_id=...;policy_version=v1`
  - conflict detection: `X-Tenant-Id` is passed so claim-over-header validation can reject mismatch.

## Extension guidance

This scaffold intentionally contains only contract envelope fields required by the declared boundary.
Extend by adding backward-compatible payload attributes while preserving tenant and principal context fields.

## Task completion evidence

### Claims

- The AP-side boundary package and namespace for `BND-CP-AP-01` were created for deterministic contract imports.
- Contract request/response/event envelopes carry `tenant_id`, `principal_id`, `correlation_id`, and `payload` exactly.
- AP consumer HTTP call scaffolding targets the CP policy-evaluation path and preserves auth-claim plus conflict-detection headers.
- The scaffold documents extension seams without introducing additional transport or architecture decisions.

### Evidence anchors

- companion_repositories/codex-saas/profile_v1/code/ap/contracts/bnd_cp_ap_01/__init__.py:L1-L1 — supports Claim 1
- companion_repositories/codex-saas/profile_v1/code/ap/contracts/bnd_cp_ap_01/envelope.py:L1-L24 — supports Claim 2
- companion_repositories/codex-saas/profile_v1/code/ap/contracts/bnd_cp_ap_01/http_client.py:L1-L34 — supports Claim 3
- companion_repositories/codex-saas/profile_v1/code/ap/contracts/bnd_cp_ap_01/README.md:L1-L42 — supports Claim 4

