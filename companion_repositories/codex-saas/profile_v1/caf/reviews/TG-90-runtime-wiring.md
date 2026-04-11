<!-- CAF_TRACE: generated_by=Contura Architecture Framework (CAF) -->
<!-- CAF_TRACE: task_id=TG-90-runtime-wiring -->
<!-- CAF_TRACE: capability=semantic_code_review -->
<!-- CAF_TRACE: instance=codex-saas -->

# Review Note: TG-90-runtime-wiring

Threshold: `blocker`

Selected rubrics:
- `RR-PY-GENERAL-01`
- `RR-PY-TESTS-01`
- `RR-COMPOSE-01`
- `RR-FASTAPI-SVC-01`
- `RR-WEB-SPA-01`
- `RR-PY-DEPENDENCY-MANIFEST-01`
- `RR-TASK-REPORT-01`
- `RR-TBP-ROLE-BINDINGS-01`

| check_id | PASS/FAIL | Evidence |
| --- | --- | --- |
| RR-PY-SEC-01 | PASS | Runtime wiring surfaces avoid embedded secrets; `.env` keeps local non-secret defaults and compose consumes env indirection (`.env`, `docker/compose.candidate.yaml`). |
| RR-PY-CORR-01 | PASS | AP/CP imports use module-root-coherent relative paths (for example `code/ap/main.py` imports `.api.routes`, shared helpers imported via `...common.*` in `code/ap/api/auth_context.py`). |
| RR-PY-CORR-01A | PASS | Python package markers exist at `code/__init__.py`, `code/ap/__init__.py`, `code/cp/__init__.py`, and `code/common/__init__.py`. |
| RR-PY-CORR-02 | PASS | Auth/policy failures remain explicit and fail-closed at the AP boundary (`code/ap/api/auth_context.py`) with composition-root exception mapping (`code/ap/main.py`, `code/cp/main.py`). |
| RR-PY-PERF-01 | PASS | Runtime wiring introduces no request-path N+1 loops; compose and startup wiring are constant-time configuration surfaces. |
| RR-TST-BLOCK-01 | PASS | Existing tests do not contain placeholder/tautological assertions (`tests/test_ap_auth_context.py`, `tests/test_mock_claims.py`, `tests/test_ap_service_facade.py`). |
| RR-TST-HIGH-01 | FAIL | No task-specific test evidence was added for compose assembly/startup ordering semantics in this wave task. |
| RR-TST-HIGH-02 | PASS | Negative-path auth conflict and invalid-credential behavior are covered in `tests/test_ap_auth_context.py` and `tests/test_mock_claims.py`. |
| RR-COMP-CORR-01 | PASS | Compose defines CP/AP/postgres services with explicit ports and env wiring (`docker/compose.candidate.yaml`). |
| RR-COMP-BUILD-01 | PASS | CP/AP services use Dockerfile builds and env file wiring (`docker/compose.candidate.yaml`, `docker/Dockerfile.ap`, `docker/Dockerfile.cp`, `.env`, `.gitignore`). |
| RR-COMP-RDY-01 | PASS | Postgres healthcheck is defined and CP/AP depend on postgres `condition: service_healthy` (`docker/compose.candidate.yaml`). |
| RR-COMP-SEC-01 | PASS | No privileged services, docker socket mounts, or host-network escalation in compose. |
| RR-FA-CORR-01 | PASS | AP/CP composition roots register routers (`code/ap/main.py`, `code/cp/main.py`). |
| RR-FA-SEC-01 | PASS | FastAPI boundaries use typed request/response handling already realized in AP/CP route surfaces (`code/ap/api/routes.py`, `code/cp/api/routes.py`). |
| RR-FA-BOUNDARY-ERR-01 | PASS | Permission and value errors are explicitly translated to HTTP responses at composition roots (`code/ap/main.py`, `code/cp/main.py`). |
| RR-FA-SCHEMA-BOOTSTRAP-01 | PASS | AP/CP startup events call plane-owned `bootstrap_schema()` before serving (`code/ap/main.py`, `code/cp/main.py`). |
| RR-FA-ARCH-01 | PASS | Route surfaces remain thin and delegate business semantics to application/service layers (`code/ap/api/routes.py`, `code/cp/api/routes.py`, `code/ap/application/services.py`, `code/cp/application/services.py`). |
| RR-SPA-WIRE-01 | PASS | Real shell/page interaction wiring exists (stateful shell routing and API-backed page actions) in `code/ui/src/App.jsx`, `code/ui/src/pages/ResourcePage.jsx`, `code/ui/src/api.js`. |
| RR-SPA-WIRE-02 | PASS | Resource/admin pages are reachable from shell navigation controls in `code/ui/src/App.jsx` (`widgets`, `collections`, `tenant_role_assignments`, `policy`, etc.). |
| RR-SPA-WIRE-03 | PASS | UI interactions use shared helper seam (`code/ui/src/api.js`) and same-origin `/api/*` paths rather than per-page ad hoc backend URLs. |
| RR-SPA-STATE-01 | PASS | Shared resource and admin pages expose loading/empty/success/error states (`code/ui/src/pages/ResourcePage.jsx`, `code/ui/src/pages/PolicyAdminPage.jsx`, `code/ui/src/pages/HomePage.jsx`). |
| RR-SPA-ERR-DETAIL-01 | PASS | Shared API helper preserves backend error detail by parsing body text/JSON detail before throwing (`code/ui/src/api.js`). |
| RR-SPA-FORM-01 | PASS | Create/update/admin forms bind controlled state to real submit handlers wired into shared API calls (`code/ui/src/pages/ResourcePage.jsx`, `code/ui/src/pages/PolicyAdminPage.jsx`). |
| RR-SPA-CONTRACT-01 | PASS | Admin/policy surfaces use preview/evaluation semantics where applicable and CRUD pages map to declared AP resource contract surfaces (`code/ui/src/pages/PolicyAdminPage.jsx`, `code/ui/src/pages/ResourcePage.jsx`). |
| RR-SPA-HANDOFF-01 | PASS | Resource pages expose visible ID handoff controls (`Use id`, explicit `Resource id` field) required for downstream get/update/delete actions (`code/ui/src/pages/ResourcePage.jsx`). |
| RR-SPA-ACTION-01 | PASS | Declared product actions remain reachable through shell/surface controls (`Create` in resource pages, role management in tenant-role page, collection update/publish posture via collections actions). |
| RR-SPA-ACTION-02 | PASS | Visible create/update/delete controls call coherent shared helper symbols (`createResource`, `updateResource`, `deleteResource`) with matching handler semantics in `code/ui/src/pages/ResourcePage.jsx`. |
| RR-SPA-DOC-TRUTH-01 | PASS | UX operator notes align to richer UX lane controls and helper paths (`caf/ux_operator_notes.md`, `code/ux/src/App.jsx`, `code/ux/src/api.js`). |
| RR-PY-DEP-01 | PASS | Canonical dependency manifest exists at repo root and includes required runtime markers (`requirements.txt`). |
| RR-PY-DEP-02 | PASS | CP/AP runtime Dockerfiles install from canonical manifest with `pip install -r requirements.txt` (`docker/Dockerfile.ap`, `docker/Dockerfile.cp`). |
| RR-TR-STRUCT-01 | PASS | Task report exists with required sections (`caf/task_reports/TG-90-runtime-wiring.md`). |
| RR-TR-STEP-01 | PASS | Report addresses all five task steps and all required inputs, including role-binding evidence and manual validation commands. |
| RR-TR-UX-COVERAGE-01 | PASS | Non-UI capability (`runtime_wiring`); UI/UX matrix requirement is not applicable. |
| RR-TBP-RB-01 | PASS | `resolve_tbp_role_bindings_v1` expectations for `runtime_wiring` are satisfied by artifact placement and evidence markers in compose/docker/env/gitignore/UI runtime files. |

Summary:
- Runtime wiring evidence is coherent for compose-first CP/AP/postgres assembly, mock-claim tenant context handling, and canonical manifest-driven Python packaging.
- No blocker findings were identified.

Issues:
- High:
  - `RR-TST-HIGH-01`: runtime wiring wave did not add task-specific tests for compose startup assembly semantics.
- Medium: none.
- Low: none.

No issues at or above the configured threshold (`blocker`) were found.
