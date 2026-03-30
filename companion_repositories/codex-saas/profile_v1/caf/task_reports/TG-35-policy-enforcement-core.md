# Task Report: TG-35-policy-enforcement-core

## Summary of work performed

Implemented a combined CP/AP policy-enforcement slice aligned to the adopted `cp_governs_ap_enforces` posture and `auth_claim` tenant-context carrier.

Completed work includes:
- Materialized a CP policy decision surface exposed at `/cp/contract/BND-CP-AP-01/policy-decision`.
- Added AP policy enforcement hook behavior to consult CP decisions before returning protected runtime-health output.
- Upgraded shared mock auth handling to canonical bearer shape `Bearer mock.<base64-json>.token` while preserving fail-closed parsing and conflict rejection for alternate tenant/principal headers.
- Added cross-plane policy contract helper on AP-side contract scaffold for deterministic CP decision calls.

## Files created/modified

- `code/common/auth/mock_claims.py`
- `code/cp/application/services.py`
- `code/cp/main.py`
- `code/cp/contracts/BND-CP-AP-01/http_server.py`
- `code/ap/application/services.py`
- `code/ap/main.py`
- `code/ap/contracts/BND-CP-AP-01/http_client.py`

## How to validate

1. Inspect `code/common/auth/mock_claims.py` to confirm canonical mock bearer support and explicit required claim fields (`tenant_id`, `principal_id`, `policy_version`).
2. Inspect `code/cp/main.py` for `/cp/contract/BND-CP-AP-01/policy-decision` route and conflict checks between body context and Authorization claims.
3. Inspect `code/cp/application/services.py` for CP-owned `PolicyDecisionService` and deterministic allow/deny reasons.
4. Inspect `code/ap/application/services.py` to confirm AP calls CP policy-decision endpoint and fails closed when CP is unavailable or contract response mismatches request context.
5. Inspect `code/ap/main.py` to confirm AP runtime-health path enforces CP decision and raises `PermissionError` on deny.
6. Inspect `code/ap/contracts/BND-CP-AP-01/http_client.py` to confirm AP-side contract helper includes canonical Authorization/Bearer claim contract when calling CP policy decision route.

## Known limitations / follow-ups

- CP policy logic remains intentionally minimal scaffold logic (`policy_version` gate + simple write-action principal rule) and should be expanded by downstream resource-specific tasks.
- Existing legacy bearer shape parsing is retained for compatibility during transition; canonical emission now uses `mock.<base64-json>.token`.
- Policy enforcement is currently exercised on AP runtime-health path and reusable facade; resource endpoint-specific hooks will be added by subsequent API/service tasks.
