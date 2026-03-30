# Review Note: TG-35-policy-enforcement-core

## Rubric evaluation

| check_id | PASS/FAIL | Evidence |
| --- | --- | --- |
| RR-PY-SEC-01 | PASS | Auth and policy inputs fail closed on missing/malformed claims and CP response mismatch checks in `code/common/auth/mock_claims.py`, `code/ap/application/services.py`, and `code/cp/main.py`. |
| RR-PY-CORR-01 | PASS | AP policy flow now enforces CP-governed decisions with explicit deny behavior before returning protected AP runtime output in `code/ap/main.py` and `code/ap/application/services.py`. |
| RR-PY-CORR-01A | PASS | Shared helper imports target sibling package root correctly (`...common.auth.mock_claims`) with no plane-local pseudo-package usage in `code/ap/application/services.py`. |
| RR-PY-CORR-02 | PASS | CP decision endpoint enforces tenant/principal/policy-version coherence against Authorization claims in `code/cp/main.py`. |
| RR-PY-PERF-01 | PASS | Added logic is request-bounded and lightweight (simple JSON parsing + single CP call) with no unbounded loops or heavy in-memory operations. |
| RR-TST-BLOCK-01 | PASS | No blocker-level test omission identified for this scaffold task; fail-closed runtime paths are present for malformed/absent auth and unavailable CP policy surface. |
| RR-TST-HIGH-01 | FAIL | No unit tests were added for canonical mock bearer parsing, CP policy-decision endpoint conflict handling, or AP CP-response mismatch fail-closed paths. |
| RR-TST-HIGH-02 | FAIL | No regression tests exist for write-action admin gating (`.create/.update/.delete`) in CP policy service and AP enforcement integration. |
| RR-COMP-CORR-01 | PASS | No compose topology changes were introduced by this task; existing compose surfaces remain unaffected. |
| RR-COMP-BUILD-01 | PASS | No Docker/compose build-context or packaging changes were introduced. |
| RR-COMP-SEC-01 | PASS | No new compose-level security regressions introduced by this task. |
| RR-FA-CORR-01 | PASS | New CP FastAPI route uses explicit request model and deterministic response contract in `code/cp/main.py`. |
| RR-FA-SEC-01 | PASS | Policy endpoint enforces claim/body context conflict rejection and shared auth parsing in `code/cp/main.py`. |
| RR-FA-BOUNDARY-ERR-01 | PASS | Permission and validation failures map through existing exception handlers in CP/AP composition roots (`code/cp/main.py`, `code/ap/main.py`). |
| RR-FA-SCHEMA-BOOTSTRAP-01 | PASS | Schema bootstrap invocation remains intact in AP and CP app creation paths. |
| RR-FA-ARCH-01 | PASS | CP owns policy decisioning; AP consumes/enforces decision outcomes, aligned with adopted split in task DoD. |
| RR-AUTH-MOCK-01 | PASS | Canonical mock bearer contract (`Bearer mock.<base64-json>.token`) is emitted and parsed in `code/common/auth/mock_claims.py`; AP contract helper also emits canonical Authorization shape in `code/ap/contracts/BND-CP-AP-01/http_client.py`. |
| RR-AUTH-MOCK-02 | PASS | Alternate tenant/principal headers are only used for conflict detection in `parse_mock_claims_from_headers`, preserving claim-over-header precedence. |
| RR-TR-STRUCT-01 | PASS | Task report exists with required sections in `caf/task_reports/TG-35-policy-enforcement-core.md`. |
| RR-TR-STEP-01 | PASS | Task report documents concrete changed files and validation inspection steps tied to implemented surfaces. |
| RR-TR-UX-COVERAGE-01 | PASS | Not a UX-lane task; no missing UX coverage artifact requirements apply to this policy-enforcement scope. |
| RR-TBP-RB-01 | PASS | `node tools/caf/resolve_tbp_role_bindings_v1.mjs codex-saas --capability policy_enforcement` resolves `mock_auth_claims_module` to `code/common/auth/mock_claims.py`; file contains required evidence strings (`Authorization`, `Bearer`, `tenant_id`, `principal_id`, `policy_version`, `mock.`, `.token`). |

## Summary

No blocker findings detected for `TG-35-policy-enforcement-core`. CP policy decision surface, AP enforcement hook, and canonical mock claim contract are coherently implemented and traceable.

## Issues

- High: Missing unit/regression tests for new auth-claim parsing and policy-decision integration paths.

## Threshold statement

No issues at or above the configured `blocker` threshold were found.
