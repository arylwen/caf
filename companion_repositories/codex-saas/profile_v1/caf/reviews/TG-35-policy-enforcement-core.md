<!-- CAF_TRACE: generated_by=Contura Architecture Framework (CAF) -->
<!-- CAF_TRACE: task_id=TG-35-policy-enforcement-core -->
<!-- CAF_TRACE: capability=semantic_code_review -->
<!-- CAF_TRACE: instance=codex-saas -->

# Review Note: TG-35-policy-enforcement-core

Threshold: `blocker`

Selected rubrics:
- `RR-PY-GENERAL-01`
- `RR-PY-TESTS-01`
- `RR-COMPOSE-01`
- `RR-FASTAPI-SVC-01`
- `RR-AUTH-MOCK-CLAIM-CONTRACT-01`
- `RR-TASK-REPORT-01`
- `RR-TBP-ROLE-BINDINGS-01`

| check_id | PASS/FAIL | Evidence |
| --- | --- | --- |
| RR-PY-SEC-01 | PASS | No hardcoded secrets in policy/auth files (`code/common/auth/mock_claims.py`, `code/ap/api/auth_context.py`, `code/cp/api/routes.py`). |
| RR-PY-CORR-01 | PASS | Shared auth helper imports resolve through canonical shared package path (`code/ap/api/auth_context.py` imports from `...common.auth.mock_claims`). |
| RR-PY-CORR-01A | PASS | Required package markers exist (`code/__init__.py`, `code/ap/__init__.py`, `code/cp/__init__.py`, `code/common/__init__.py`, `code/common/auth/__init__.py`). |
| RR-PY-CORR-02 | PASS | Permission errors are explicit and mapped to HTTP 401/403 paths in AP/CP boundaries. |
| RR-PY-PERF-01 | PASS | Policy evaluation path is request-scoped and bounded; no obvious N+1 persistence loops added. |
| RR-TST-BLOCK-01 | PASS | Existing tests contain no tautological placeholders (`tests/test_ap_auth_context.py`, `tests/test_mock_claims.py`). |
| RR-TST-HIGH-01 | FAIL | No direct CP policy endpoint tests are present for `/cp/policy-decisions/evaluate`; current tests focus on shared auth/context units. |
| RR-TST-HIGH-02 | PASS | Negative auth/tenant conflict tests exist (`tests/test_ap_auth_context.py`, `tests/test_mock_claims.py`). |
| RR-COMP-CORR-01 | PASS | Compose includes CP/AP services and env wiring in `docker/compose.candidate.yaml`. |
| RR-COMP-BUILD-01 | PASS | CP/AP runtime images are Dockerfile-built and env-file-driven (`docker/compose.candidate.yaml`, `docker/Dockerfile.ap`, `docker/Dockerfile.cp`). |
| RR-COMP-RDY-01 | PASS | Postgres healthcheck and service-healthy dependencies are configured for CP/AP in compose. |
| RR-COMP-SEC-01 | PASS | No privileged/unsafe compose posture detected. |
| RR-FA-CORR-01 | PASS | Router wiring is complete in CP/AP entrypoints (`code/cp/main.py`, `code/ap/main.py`). |
| RR-FA-SEC-01 | PASS | Policy routes use typed request models (`PolicyDecisionRequest`, `PolicyPreviewRequest`, `ResourcePayload`). |
| RR-FA-BOUNDARY-ERR-01 | PASS | Permission and validation failures are translated to explicit FastAPI responses (AP/CP routes + exception handlers). |
| RR-FA-SCHEMA-BOOTSTRAP-01 | PASS | AP/CP startup hooks invoke bootstrap schema in composition roots. |
| RR-FA-ARCH-01 | PASS | AP handlers delegate policy decisions via service layer (`ApplicationPolicyEnforcementService`) and helper seams. |
| RR-AUTH-MOCK-01 | PASS | Shared helper + AP boundary + UI helper all implement coherent mock bearer claim contract (`tenant_id`, `principal_id`, `policy_version`; `mock.<base64-json>.token`). |
| RR-AUTH-MOCK-02 | PASS | Claim-over-header precedence and explicit conflict rejection are enforced (`enforce_claim_over_header_conflict`, AP header checks). |
| RR-TR-STRUCT-01 | PASS | Task report has required sections in `caf/task_reports/TG-35-policy-enforcement-core.md`. |
| RR-TR-STEP-01 | PASS | Report covers all steps and required inputs. |
| RR-TR-UX-COVERAGE-01 | PASS | Non-UI capability; UX coverage matrix not required. |
| RR-TBP-RB-01 | PASS | `resolve_tbp_role_bindings_v1` for `policy_enforcement` expects `code/common/auth/mock_claims.py`, which exists and contains required markers. |

Summary:
- Combined CP/AP policy core preserves CP decision authority, AP enforcement, and claim-over-header tenant context semantics.
- No blocker findings were identified.

Issues:
- High:
  - `RR-TST-HIGH-01`: CP policy decision endpoint lacks direct automated endpoint-level tests.
- Medium: none.
- Low: none.

No issues at or above the configured threshold (`blocker`) were found.

