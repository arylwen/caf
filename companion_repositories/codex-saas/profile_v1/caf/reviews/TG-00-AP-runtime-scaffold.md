<!-- CAF_TRACE: generated_by=Contura Architecture Framework (CAF) -->
<!-- CAF_TRACE: task_id=TG-00-AP-runtime-scaffold -->
<!-- CAF_TRACE: capability=semantic_code_review -->
<!-- CAF_TRACE: instance=codex-saas -->

# Review Note: TG-00-AP-runtime-scaffold

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
| RR-PY-SEC-01 | PASS | No secrets detected in `code/ap/main.py`, `code/ap/asgi.py`, `code/common/auth/mock_claims.py`. |
| RR-PY-CORR-01 | PASS | Imports resolve with module-root coherence: `code/ap/main.py` uses `from ..common.config import RuntimeSettings`; `code/ap/asgi.py` uses `from .main import app`. |
| RR-PY-CORR-01A | PASS | Package markers exist: `code/__init__.py`, `code/ap/__init__.py`, `code/common/__init__.py`. |
| RR-PY-CORR-02 | PASS | No bare `except`; AP boundary translates `PermissionError` and `ValueError` via exception handlers in `code/ap/main.py`. |
| RR-PY-PERF-01 | PASS | Runtime scaffold files do not add unbounded request-path scans or per-item DB/network loops. |
| RR-TST-BLOCK-01 | PASS | Test suite contains no tautological `assert True` placeholders (`tests/test_ap_auth_context.py`, `tests/test_ap_service_facade.py`, `tests/test_mock_claims.py`). |
| RR-TST-HIGH-01 | FAIL | No AP runtime composition-root specific endpoint assertions were added for this task; existing tests target auth context/service behavior, not AP runtime scaffold endpoints. |
| RR-TST-HIGH-02 | PASS | Negative-path authorization/conflict behavior is tested in `tests/test_ap_auth_context.py`. |
| RR-COMP-CORR-01 | PASS | Compose defines AP/CP services and API ports in `docker/compose.candidate.yaml`. |
| RR-COMP-BUILD-01 | PASS | AP/CP services use Dockerfile builds and `.env` via `env_file`; see `docker/compose.candidate.yaml`, `docker/Dockerfile.ap`, `docker/Dockerfile.cp`, `.env`, `.gitignore`. |
| RR-COMP-RDY-01 | PASS | `postgres` has healthcheck and AP/CP depend on `service_healthy` in `docker/compose.candidate.yaml`. |
| RR-COMP-SEC-01 | PASS | No privileged mode, docker socket mount, or host network usage in `docker/compose.candidate.yaml`. |
| RR-FA-CORR-01 | PASS | AP composition root registers router: `app.include_router(ap_router)` in `code/ap/main.py`. |
| RR-FA-SEC-01 | PASS | AP routes use typed request models (`PolicyPreviewRequest`, `ResourcePayload`) in `code/ap/api/routes.py`. |
| RR-FA-BOUNDARY-ERR-01 | PASS | Permission and value errors are explicitly mapped to 403/400 in `code/ap/main.py`; route-level policy denials map to HTTP 403 in `code/ap/api/routes.py`. |
| RR-FA-SCHEMA-BOOTSTRAP-01 | PASS | AP composition root startup event invokes bootstrap via `bootstrap_schema()` in `code/ap/main.py`. |
| RR-FA-ARCH-01 | PASS | AP route handlers delegate to service/facade dependencies in `code/ap/api/routes.py`. |
| RR-TR-STRUCT-01 | PASS | Task report contains required sections in `caf/task_reports/TG-00-AP-runtime-scaffold.md`. |
| RR-TR-STEP-01 | PASS | Report step evidence addresses all declared steps and required inputs. |
| RR-TR-UX-COVERAGE-01 | PASS | Non-UI capability (`plane_runtime_scaffolding`); UX coverage matrix not required for this task type. |
| RR-TBP-RB-01 | PASS | `node tools/caf/resolve_tbp_role_bindings_v1.mjs codex-saas --capability plane_runtime_scaffolding` returned `expectations: []`; no unresolved role-binding artifacts for this capability. |

Summary:
- AP runtime scaffold remains coherent with resolved Python/FastAPI/mock-auth pins and module-root conventions.
- No blocker findings were identified.

Issues:
- High:
  - `RR-TST-HIGH-01`: runtime-scaffold-specific endpoint behavior lacks direct unit coverage.
- Medium: none.
- Low: none.

No issues at or above the configured threshold (`blocker`) were found.
