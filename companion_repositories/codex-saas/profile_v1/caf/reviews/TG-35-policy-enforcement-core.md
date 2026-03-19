# Review Note: TG-35-policy-enforcement-core

## Rubric evaluation

| check_id | PASS/FAIL | Evidence |
| --- | --- | --- |
| RR-PY-SEC-01 | PASS | No secrets introduced; mock claim handling uses explicit demo contract fields only (`code/common/auth/mock_claims.py`). |
| RR-PY-CORR-01 | PASS | New Python imports resolve within existing package roots (`code.common`, `code.ap`, `code.cp`). |
| RR-PY-CORR-01A | PASS | Package markers exist for all referenced package roots including new `code/common/__init__.py` and `code/common/auth/__init__.py`. |
| RR-PY-CORR-02 | PASS | Fail-closed errors use explicit `PermissionError` and are mapped in AP/CP FastAPI boundaries. |
| RR-PY-PERF-01 | PASS | No unbounded external-boundary loops introduced in request paths. |
| RR-TST-BLOCK-01 | PASS | No placeholder tests were added. |
| RR-TST-HIGH-01 | FAIL | Task introduces/changes AP and CP policy endpoint behavior (`code/ap/main.py`, `code/cp/main.py`, `code/cp/service/policy_service.py`) without accompanying behavior assertions in `tests/**`. |
| RR-TST-HIGH-02 | FAIL | Negative-path behavior (claim/header conflict and policy deny paths) is implemented but not covered by explicit tests. |
| RR-COMP-CORR-01 | PASS | Compose wiring not changed; existing AP/CP services remain in current candidate composition surfaces. |
| RR-COMP-BUILD-01 | PASS | No compose/Dockerfile wiring regressions introduced by this task. |
| RR-COMP-SEC-01 | PASS | No privileged container settings or host socket mounts introduced. |
| RR-FA-CORR-01 | PASS | AP and CP routers remain reachable from app entrypoints; new AP policy probe route is included in AP router registration. |
| RR-FA-SEC-01 | PASS | Policy route payloads use typed Pydantic models (`PolicyProbeRequest`, `PolicyDecisionRequestModel`). |
| RR-FA-BOUNDARY-ERR-01 | PASS | Permission errors remain fail-closed and mapped to explicit HTTP responses in both AP and CP mains. |
| RR-FA-SCHEMA-BOOTSTRAP-01 | PASS | AP startup bootstrap call remains in place; task does not regress code_bootstrap wiring. |
| RR-FA-ARCH-01 | PASS | Route handlers remain thin and delegate policy decisions to service/composition layers. |
| RR-SPA-WIRE-01 | PASS | Existing SPA task surfaces remain interactive; this task does not regress `code/ui/src/App.jsx` or workspace page interaction wiring. |
| RR-SPA-WIRE-02 | PASS | Shell route reachability remains intact for implemented pages. |
| RR-SPA-WIRE-03 | PASS | API-backed SPA interactions remain routed through shared helper (`code/ui/src/api.js`). |
| RR-SPA-STATE-01 | PASS | Existing UI pages continue to expose explicit loading/success/empty/failure states. |
| RR-SPA-ERR-DETAIL-01 | PASS | Shared UI helper still preserves backend detail for non-2xx responses. |
| RR-SPA-FORM-01 | PASS | Existing action forms remain state-bound with concrete submit paths. |
| RR-SPA-CONTRACT-01 | PASS | UI contract wording/behavior remains aligned to currently scaffolded contract surfaces. |
| RR-SPA-HANDOFF-01 | PASS | Workspace identifier handoff behavior remains visible and usable. |
| RR-AUTH-MOCK-01 | PASS | One coherent Bearer claim contract is enforced across shared parser (`code/common/auth/mock_claims.py`), AP/CP boundary adapters, and existing UI helper surfaces (`code/ui/src/auth/mockAuth.js`, `code/ui/src/api.js`). |
| RR-AUTH-MOCK-02 | PASS | Claim-over-header precedence is explicit and fail-closed in shared parser; `X-Tenant-Id` remains conflict-detection only. |
| RR-TR-STRUCT-01 | PASS | Task report exists at `caf/task_reports/TG-35-policy-enforcement-core.md` with required sections. |
| RR-TR-STEP-01 | PASS | Report maps all task steps and required inputs to concrete file evidence. |
| RR-TBP-RB-01 | PASS | Ran `node tools/caf/resolve_tbp_role_bindings_v1.mjs codex-saas --capability policy_enforcement`; required role-binding path `code/common/auth/mock_claims.py` exists and contains `Authorization`, `Bearer`, `tenant_id`, `principal_id`, and `policy_version`. |

## Summary

Policy enforcement scaffolding is coherent with CP-governs/AP-enforces posture and explicit mock-claim contract handling, with shared auth parsing and deterministic conflict/deny semantics.

## Issues

- High: Missing tests for new policy endpoint/service behavior (positive and negative paths).
- Medium: none
- Low: none

No issues at or above the configured threshold (blocker) were found.
