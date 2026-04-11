<!-- CAF_TRACE: generated_by=Contura Architecture Framework (CAF) -->
<!-- CAF_TRACE: task_id=TG-85-observability-and-config -->
<!-- CAF_TRACE: capability=semantic_code_review -->
<!-- CAF_TRACE: instance=codex-saas -->

# Review Note: TG-85-observability-and-config

Threshold: `blocker`

Selected rubrics:
- `RR-PY-GENERAL-01`
- `RR-PY-TESTS-01`
- `RR-COMPOSE-01`
- `RR-FASTAPI-SVC-01`
- `RR-PY-DEPENDENCY-MANIFEST-01`
- `RR-TASK-REPORT-01`
- `RR-TBP-ROLE-BINDINGS-01`

| check_id | PASS/FAIL | Evidence |
| --- | --- | --- |
| RR-PY-SEC-01 | PASS | No hardcoded credential secrets in observability/config files (`requirements.txt`, `code/common/observability.py`, `docker/compose.candidate.yaml`). |
| RR-PY-CORR-01 | PASS | Python imports remain coherent across AP/CP/common modules (no pseudo-package imports). |
| RR-PY-CORR-01A | PASS | Package markers for candidate code packages remain present under `code/`, `code/ap`, `code/cp`, and `code/common`. |
| RR-PY-CORR-02 | PASS | Runtime boundary error handling remains explicit via AP/CP exception handlers. |
| RR-PY-PERF-01 | PASS | Observability helper is lightweight and request-scoped; no expensive boundary loops introduced. |
| RR-TST-BLOCK-01 | PASS | No placeholder tests detected in existing suite. |
| RR-TST-HIGH-01 | FAIL | No dedicated tests assert observability event payload shape or manifest-to-runtime dependency install behavior. |
| RR-TST-HIGH-02 | PASS | Negative auth/context conflict paths are covered by existing unit tests (`tests/test_ap_auth_context.py`, `tests/test_mock_claims.py`). |
| RR-COMP-CORR-01 | PASS | Compose wiring includes AP/CP/postgres services, API ports, and required env contracts in `docker/compose.candidate.yaml`. |
| RR-COMP-BUILD-01 | PASS | AP/CP use Dockerfile builds and env files; Dockerfiles install from canonical requirements manifest (`docker/Dockerfile.ap`, `docker/Dockerfile.cp`). |
| RR-COMP-RDY-01 | PASS | Postgres healthcheck and `service_healthy` dependencies are configured for AP/CP services. |
| RR-COMP-SEC-01 | PASS | Compose avoids privileged containers and docker socket mounts. |
| RR-FA-CORR-01 | PASS | AP/CP router registration remains complete in composition roots. |
| RR-FA-SEC-01 | PASS | Typed request models remain in FastAPI boundaries (`code/ap/api/routes.py`, `code/cp/api/routes.py`). |
| RR-FA-BOUNDARY-ERR-01 | PASS | Fail-closed auth/policy exception handling remains explicit at API boundaries. |
| RR-FA-SCHEMA-BOOTSTRAP-01 | PASS | AP/CP startup bootstraps schema before serving traffic (`code/ap/main.py`, `code/cp/main.py`). |
| RR-FA-ARCH-01 | PASS | Route handlers remain thin and delegate to services/facades. |
| RR-PY-DEP-01 | PASS | Canonical manifest exists at `requirements.txt` with all required dependency markers (`fastapi`, `uvicorn`, `sqlalchemy`, `psycopg[binary]`, `pydantic-settings`, `# CAF_TRACE:`). |
| RR-PY-DEP-02 | PASS | Runtime containers install from canonical manifest via `pip install -r requirements.txt` in both AP/CP Dockerfiles. |
| RR-TR-STRUCT-01 | PASS | Task report includes required sections in `caf/task_reports/TG-85-observability-and-config.md`. |
| RR-TR-STEP-01 | PASS | Report addresses each task step and both required inputs. |
| RR-TR-UX-COVERAGE-01 | PASS | Non-UI capability; UX matrix not required. |
| RR-TBP-RB-01 | PASS | `resolve_tbp_role_bindings_v1` expectations for `observability_and_config` are satisfied by canonical `requirements.txt` markers and runtime wiring. |

Summary:
- Canonical Python dependency/config contract is coherent and manifest-driven, with compose/runtime surfaces consuming `requirements.txt`.
- No blocker findings were identified.

Issues:
- High:
  - `RR-TST-HIGH-01`: missing dedicated tests for observability payload and dependency manifest wiring behavior.
- Medium: none.
- Low: none.

No issues at or above the configured threshold (`blocker`) were found.

