---
boundary_id: BND-CP-AP-01
plane: CP
contract_surface: synchronous_http
tenant_context_carrier: auth_claim
tenant_context_conflict_rule: claim_over_header
trace_anchors:
  - contract_boundary_id:BND-CP-AP-01
  - contract_ref_path:reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md
  - contract_ref_section:Plane Integration Contract (CP ↔ AP)
  - contract_surface:cp_ap_contract_surface
---

# CP contract scaffold for BND-CP-AP-01

This scaffold makes the CP provider-side policy decision contract explicit for AP consumption.
The surface stays on the declared synchronous HTTP boundary and keeps response mapping seams deterministic.

## Contract surface summary

- Provider module: `code/cp/contracts/bnd_cp_ap_01/http_server.py`
- Envelope module: `code/cp/contracts/bnd_cp_ap_01/envelope.py`
- Carrier expectations:
  - canonical carrier: Authorization Bearer claim with `tenant_id`, `principal_id`, `policy_version`
  - conflict rule: `claim_over_header` semantics are preserved by keeping tenant/principal fields explicit in envelopes.

## Extension guidance

This scaffold intentionally contains only the envelope fields required by the declared boundary.
Extend provider payload semantics in backward-compatible form while preserving tenant, principal, and correlation identifiers.

## Task completion evidence

### Claims

- The CP-side boundary package and namespace for `BND-CP-AP-01` were created for deterministic provider imports.
- Contract request/response/event envelopes carry `tenant_id`, `principal_id`, `correlation_id`, and `payload` exactly.
- CP provider HTTP handler scaffold returns a context-preserving contract response envelope for AP consumers.
- The scaffold documents extension seams without introducing unapproved runtime or transport decisions.

### Evidence anchors

- companion_repositories/codex-saas/profile_v1/code/cp/contracts/bnd_cp_ap_01/__init__.py:L1-L1 — supports Claim 1
- companion_repositories/codex-saas/profile_v1/code/cp/contracts/bnd_cp_ap_01/envelope.py:L1-L24 — supports Claim 2
- companion_repositories/codex-saas/profile_v1/code/cp/contracts/bnd_cp_ap_01/http_server.py:L1-L10 — supports Claim 3
- companion_repositories/codex-saas/profile_v1/code/cp/contracts/bnd_cp_ap_01/README.md:L1-L42 — supports Claim 4

