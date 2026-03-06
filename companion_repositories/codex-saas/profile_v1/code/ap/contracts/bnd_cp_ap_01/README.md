<!-- CAF_TRACE: generated_by=Contura Architecture Framework (CAF) | task_id=TG-00-contract-BND-CP-AP-01 | capability=contract_scaffolding | instance=codex-saas | trace_anchor=contract_boundary_id:BND-CP-AP-01 -->
# BND-CP-AP-01 Contract Scaffold

This scaffold materializes the CP to AP integration surface as synchronous HTTP.

- Boundary: `BND-CP-AP-01`
- Surface: `synchronous_http`
- Context carrier fields: `tenant_id`, `principal_id`, `correlation_id`
- Extension posture: thin envelope and transport stubs only

The envelope and call stubs are intentionally minimal while preserving explicit tenant and policy semantics.

## Task completion evidence

### Claims
- The contract envelope includes tenant, principal, correlation, and payload fields.
- HTTP client and server stubs preserve context fields across requests and responses.
- Contract files are located under a boundary-specific AP contract module.

### Evidence anchors
- `companion_repositories/codex-saas/profile_v1/code/ap/contracts/bnd_cp_ap_01/envelope.py:L1-L25` - supports Claim 1
- `companion_repositories/codex-saas/profile_v1/code/ap/contracts/bnd_cp_ap_01/http_client.py:L1-L32` - supports Claim 2
- `companion_repositories/codex-saas/profile_v1/code/ap/contracts/bnd_cp_ap_01/http_server.py:L1-L10` - supports Claim 2

