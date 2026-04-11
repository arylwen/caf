<!-- CAF_TRACE: generated_by=Contura Architecture Framework (CAF) -->
<!-- CAF_TRACE: task_id=TG-00-CONTRACT-BND-CP-AP-01-AP -->
<!-- CAF_TRACE: capability=semantic_code_review -->
<!-- CAF_TRACE: instance=codex-saas -->

# Review Note: TG-00-CONTRACT-BND-CP-AP-01-AP

Threshold: `blocker`

Selected rubrics:
- `RR-PY-GENERAL-01`
- `RR-PY-TESTS-01`
- `RR-COMPOSE-01`
- `RR-FASTAPI-SVC-01`
- `RR-TASK-REPORT-01`
- `RR-TBP-ROLE-BINDINGS-01`

| check_id | PASS/FAIL | Evidence |
| --- | --- | --- |
| RR-PY-SEC-01 | PASS | No secrets in AP contract scaffold files: `code/ap/contracts/bnd_cp_ap_01/http_client.py`, `envelope.py`, `events.py`. |
| RR-PY-CORR-01 | PASS | Imports resolve under canonical `code` root; AP client uses `from ....common.auth.mock_claims import decode_mock_bearer_token` and local envelope import in `code/ap/contracts/bnd_cp_ap_01/http_client.py`. |
| RR-PY-CORR-01A | PASS | Package markers exist for contract package: `code/__init__.py`, `code/ap/__init__.py`, `code/ap/contracts/__init__.py`, `code/ap/contracts/bnd_cp_ap_01/__init__.py`. |
| RR-PY-CORR-02 | PASS | Explicit `PermissionError` raise paths for tenant/principal conflict checks in `code/ap/contracts/bnd_cp_ap_01/http_client.py`. |
| RR-PY-PERF-01 | PASS | Contract client/events are bounded stubs; no per-item external loops added. |
| RR-TST-BLOCK-01 | PASS | Existing tests contain no tautological placeholders (`tests/test_ap_auth_context.py`, `tests/test_mock_claims.py`). |
| RR-TST-HIGH-01 | FAIL | No task-specific tests directly exercise `code/ap/contracts/bnd_cp_ap_01/http_client.py` call/serialization behavior. |
| RR-TST-HIGH-02 | PASS | Negative conflict/rejection behavior exists in `tests/test_ap_auth_context.py` and `tests/test_mock_claims.py`. |
| RR-COMP-CORR-01 | PASS | Compose declares AP/CP services and API ports in `docker/compose.candidate.yaml`. |
| RR-COMP-BUILD-01 | PASS | AP/CP services use Dockerfile builds and `.env` wiring (`docker/compose.candidate.yaml`, `docker/Dockerfile.ap`, `docker/Dockerfile.cp`). |
| RR-COMP-RDY-01 | PASS | `postgres` healthcheck and AP/CP `depends_on.postgres.condition: service_healthy` are present in `docker/compose.candidate.yaml`. |
| RR-COMP-SEC-01 | PASS | No privileged mode, docker socket mount, or host network wiring in `docker/compose.candidate.yaml`. |
| RR-FA-CORR-01 | PASS | AP/CP routers are wired from composition roots (`code/ap/main.py`, `code/cp/main.py`). |
| RR-FA-SEC-01 | PASS | FastAPI route payload models are typed (`PolicyDecisionRequest` in `code/cp/api/routes.py`). |
| RR-FA-BOUNDARY-ERR-01 | PASS | Permission/value errors are translated at FastAPI boundary (`code/ap/main.py`, `code/cp/main.py`). |
| RR-FA-SCHEMA-BOOTSTRAP-01 | PASS | AP/CP startup handlers invoke schema bootstrap (`code/ap/main.py`, `code/cp/main.py`). |
| RR-FA-ARCH-01 | PASS | Contract endpoint delegates processing via envelope handler (`code/cp/api/routes.py`, `code/cp/contracts/bnd_cp_ap_01/http_server.py`). |
| RR-TR-STRUCT-01 | PASS | Task report contains required sections in `caf/task_reports/TG-00-CONTRACT-BND-CP-AP-01-AP.md`. |
| RR-TR-STEP-01 | PASS | Report addresses all task steps and required inputs. |
| RR-TR-UX-COVERAGE-01 | PASS | Non-UI capability; UX coverage matrix not required. |
| RR-TBP-RB-01 | PASS | `resolve_tbp_role_bindings_v1` for `contract_scaffolding` returns `expectations: []`; no missing role-bound artifacts for this capability. |

Summary:
- AP contract scaffold for `BND-CP-AP-01` is coherent with adopted tenant-carrier and conflict semantics.
- No blocker findings were identified.

Issues:
- High:
  - `RR-TST-HIGH-01`: AP contract client stub lacks dedicated unit tests.
- Medium: none.
- Low: none.

No issues at or above the configured threshold (`blocker`) were found.

