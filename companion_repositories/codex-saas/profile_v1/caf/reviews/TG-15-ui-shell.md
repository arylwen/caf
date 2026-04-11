<!-- CAF_TRACE: generated_by=Contura Architecture Framework (CAF) -->
<!-- CAF_TRACE: task_id=TG-15-ui-shell -->
<!-- CAF_TRACE: capability=semantic_code_review -->
<!-- CAF_TRACE: instance=codex-saas -->

# Review Note: TG-15-ui-shell

Threshold: `blocker`

Selected rubrics:
- `RR-PY-GENERAL-01`
- `RR-PY-TESTS-01`
- `RR-COMPOSE-01`
- `RR-FASTAPI-SVC-01`
- `RR-WEB-SPA-01`
- `RR-AUTH-MOCK-CLAIM-CONTRACT-01`
- `RR-TASK-REPORT-01`
- `RR-TBP-ROLE-BINDINGS-01`

| check_id | PASS/FAIL | Evidence |
| --- | --- | --- |
| RR-PY-SEC-01 | PASS | No secrets are hardcoded in touched UI shell/auth helper files (`code/ui/src/App.jsx`, `code/ui/src/api.js`, `code/ui/src/auth/mockAuth.js`). |
| RR-PY-CORR-01 | PASS | Python import paths remain coherent in AP/CP runtimes and shared auth helper (`code/ap/api/auth_context.py`, `code/common/auth/mock_claims.py`). |
| RR-PY-CORR-01A | PASS | Package markers are present (`code/__init__.py`, `code/ap/__init__.py`, `code/cp/__init__.py`, `code/common/__init__.py`). |
| RR-PY-CORR-02 | PASS | Boundary errors are explicit and typed at AP auth boundary (`code/ap/api/auth_context.py`). |
| RR-PY-PERF-01 | PASS | UI/API helper logic is bounded and request-scoped; no unbounded cross-boundary loops introduced. |
| RR-TST-BLOCK-01 | PASS | Existing tests contain no `assert True`/placeholder patterns (`tests/test_ap_auth_context.py`, `tests/test_mock_claims.py`). |
| RR-TST-HIGH-01 | FAIL | No dedicated UI shell unit tests for route/page wiring or helper integration are present under `tests/`. |
| RR-TST-HIGH-02 | PASS | Negative-path auth conflict behavior is covered by `tests/test_ap_auth_context.py`. |
| RR-COMP-CORR-01 | PASS | Compose includes AP/CP/UI service wiring with required env in `docker/compose.candidate.yaml`. |
| RR-COMP-BUILD-01 | PASS | Build surfaces use Dockerfiles and env files (`docker/compose.candidate.yaml`, `docker/Dockerfile.ap`, `docker/Dockerfile.cp`). |
| RR-COMP-RDY-01 | PASS | Postgres healthcheck and AP/CP `service_healthy` dependencies are present in compose. |
| RR-COMP-SEC-01 | PASS | No privileged or docker-socket host mount patterns in compose. |
| RR-FA-CORR-01 | PASS | FastAPI routers are registered in AP/CP composition roots (`code/ap/main.py`, `code/cp/main.py`). |
| RR-FA-SEC-01 | PASS | AP route inputs remain typed via Pydantic models (`code/ap/api/routes.py`). |
| RR-FA-BOUNDARY-ERR-01 | PASS | Auth/policy failures map to explicit HTTP exceptions (`code/ap/api/auth_context.py`, `code/ap/api/routes.py`). |
| RR-FA-SCHEMA-BOOTSTRAP-01 | PASS | Composition roots call bootstrap on startup (`code/ap/main.py`, `code/cp/main.py`). |
| RR-FA-ARCH-01 | PASS | AP routes delegate to service/facade seams (`code/ap/api/routes.py`, `code/ap/application/services.py`). |
| RR-SPA-WIRE-01 | PASS | UI shell and pages are interactively wired via route state + page render in `code/ui/src/App.jsx`; API-backed forms/handlers are in `code/ui/src/pages/ResourcePage.jsx` and `PolicyAdminPage.jsx`. |
| RR-SPA-WIRE-02 | PASS | Policy, widgets, collections, activity, and tenant-role pages are reachable from shell route definitions/buttons in `code/ui/src/App.jsx`. |
| RR-SPA-WIRE-03 | PASS | Shared helper path is used for API-backed interactions via `code/ui/src/api.js` and page imports (`ResourcePage.jsx`, `PolicyAdminPage.jsx`). |
| RR-SPA-STATE-01 | PASS | Loading/success/empty/failure states are rendered in `HomePage.jsx`, `PolicyAdminPage.jsx`, and `ResourcePage.jsx`. |
| RR-SPA-ERR-DETAIL-01 | PASS | Shared helper preserves backend details using response body parsing in `readErrorDetail`/`requestJson` in `code/ui/src/api.js`. |
| RR-SPA-FORM-01 | PASS | Create/update/delete forms have bound state and submit handlers in `code/ui/src/pages/ResourcePage.jsx`. |
| RR-SPA-CONTRACT-01 | PASS | Policy admin page uses preview/evaluate semantics (`previewPolicyDecision`) and resource CRUD surfaces use declared AP resource paths. |
| RR-SPA-HANDOFF-01 | PASS | `ResourcePage` exposes selected-id handoff controls (`Use id`, manual id input) for downstream get/update/delete operations. |
| RR-SPA-ACTION-01 | PASS | Primary actions are reachable through shell + page controls (`widgets`, `collections`, `tenant_role_assignments`) in `App.jsx` + `ResourcePage.jsx`. |
| RR-SPA-ACTION-02 | PASS | Action labels map to coherent shared helper calls (`createResource`, `updateResource`, `deleteResource`) from visible handlers in `ResourcePage.jsx`. |
| RR-SPA-DOC-TRUTH-01 | PASS | UI-shell task report claims match observable controls/routes and shared helper behavior. |
| RR-AUTH-MOCK-01 | PASS | Claim builder emits canonical `Bearer mock.<base64-json>.token` with `tenant_id`, `principal_id`, `policy_version`; AP boundary and shared helper align (`code/ui/src/auth/mockAuth.js`, `code/ui/src/api.js`, `code/ap/api/auth_context.py`, `code/common/auth/mock_claims.py`). |
| RR-AUTH-MOCK-02 | PASS | Claim-over-header conflict handling remains explicit (`X-Tenant-Context-Check`, `X-Principal-Context-Check`) without replacing Authorization as primary carrier (`code/ui/src/api.js`, `code/ap/api/auth_context.py`). |
| RR-TR-STRUCT-01 | PASS | Task report has required sections in `caf/task_reports/TG-15-ui-shell.md`. |
| RR-TR-STEP-01 | PASS | Report addresses declared steps and required inputs. |
| RR-TR-UX-COVERAGE-01 | PASS | Report includes interaction matrix and primary action coverage matrix grounded to product surface. |
| RR-TBP-RB-01 | PASS | Resolved UI role-binding obligations are present at expected paths and with required markers (`code/ui/src/auth/mockAuth.js`, `code/ui/src/api.js`, `code/ui/package.json`, `code/ui/vite.config.js`, `code/ui/src/main.jsx`). |

Summary:
- UI shell is wired as a real React SPA with shared API/auth helper seams and route reachability for policy and resource surfaces.
- No blocker findings were identified.

Issues:
- High:
  - `RR-TST-HIGH-01`: UI shell wiring lacks direct UI-focused automated tests.
- Medium: none.
- Low: none.

No issues at or above the configured threshold (`blocker`) were found.

