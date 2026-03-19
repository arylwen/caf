# Review Note: TG-25-ui-page-reports

## Rubric evaluation
| check_id | PASS/FAIL | Evidence |
| --- | --- | --- |
| RR-PY-SEC-01 | PASS | No hardcoded secrets observed in reviewed auth/runtime surfaces (`code/common/auth/mock_claims.py`, `code/ui/src/auth/mockAuth.js`, `code/ap/main.py`). |
| RR-PY-CORR-01 | PASS | Python imports in AP runtime/boundary surfaces resolve to present modules (`code/ap/main.py`, `code/ap/api/resources.py`, `code/ap/boundary/auth_context.py`, `code/common/auth/mock_claims.py`). |
| RR-PY-CORR-01A | PASS | Package markers exist for resolved module roots (`code/__init__.py`, `code/ap/__init__.py`, `code/cp/__init__.py`). |
| RR-PY-CORR-02 | PASS | Reviewed Python boundary/runtime files use explicit exception handling; no bare `except:` patterns found in inspected AP auth/policy paths. |
| RR-PY-PERF-01 | PASS | No obvious N+1 or unbounded external-boundary loops in inspected request-path logic (`code/ap/api/resources.py`). |
| RR-TST-BLOCK-01 | PASS | No tautological placeholder tests found in repo-scanned test paths for this task scope. |
| RR-TST-HIGH-01 | PASS | This task is UI-only (`code/ui/src/App.jsx`, `code/ui/src/pages/reports.jsx`, `code/ui/src/api.js`) and does not implement new Python endpoint/service paths requiring new Python assertions. |
| RR-TST-HIGH-02 | PASS | No new Python validation/policy boundary implementation introduced by this task; negative-path Python test obligation not newly triggered by task-local code changes. |
| RR-COMP-CORR-01 | FAIL | Expected compose wiring artifact is not present in companion repo (no `docker/compose.candidate.yaml` located under `companion_repositories/codex-saas/profile_v1`). |
| RR-COMP-BUILD-01 | FAIL | Docker build/env wiring artifacts required by compose rubric are not present (`docker/Dockerfile.ap`, `docker/Dockerfile.cp`, compose env_file targets not found). |
| RR-COMP-SEC-01 | FAIL | Compose security posture cannot be verified because compose manifest is absent in companion repo task surfaces. |
| RR-FA-CORR-01 | PASS | AP entrypoint includes router wiring for boundary surfaces (`app.include_router(router)` and `app.include_router(api_router)` in `code/ap/main.py`). |
| RR-FA-SEC-01 | PASS | FastAPI route payloads are model-validated using Pydantic request models (`code/ap/api/models.py`, `code/ap/api/resources.py`). |
| RR-FA-BOUNDARY-ERR-01 | PASS | Auth/policy fail-closed paths are translated to HTTP boundary responses (`code/ap/api/auth_context.py`, `code/ap/api/dependencies.py`, handlers in `code/ap/main.py`). |
| RR-FA-SCHEMA-BOOTSTRAP-01 | PASS | Code-bootstrap hook is invoked at startup via FastAPI lifespan (`bootstrap_schema(context)` in `code/ap/main.py`). |
| RR-FA-ARCH-01 | PASS | Route handlers remain thin and delegate behavior to runtime/service surfaces (`runtime_context.*_service` usage in `code/ap/api/resources.py`). |
| RR-SPA-WIRE-01 | PASS | Reports page is interaction-backed (list/filter, lookup, create handlers) and not static prose (`code/ui/src/pages/reports.jsx`). |
| RR-SPA-WIRE-02 | PASS | Reports page is reachable from shell navigation (`NAV_ITEMS` + `activeNav === "reports"` rendering in `code/ui/src/App.jsx`). |
| RR-SPA-WIRE-03 | PASS | Page uses shared API helper contract (`listReports`, `getReport`, `createReport` from `code/ui/src/api.js`). |
| RR-SPA-STATE-01 | PASS | Explicit loading/empty/success/failure branches exist for list/lookup/create flows (`code/ui/src/pages/reports.jsx`). |
| RR-SPA-ERR-DETAIL-01 | PASS | Shared helper preserves backend error detail via JSON detail/text extraction before throw (`parseErrorDetail` in `code/ui/src/api.js`). |
| RR-SPA-FORM-01 | PASS | Create flow has controlled form state and submit action bound to real API call (`createForm` + `handleCreateSubmit` in `code/ui/src/pages/reports.jsx`). |
| RR-SPA-CONTRACT-01 | PASS | UI contract usage matches declared reports operations (`GET /api/reports`, `GET /api/reports/{report_id}`, `POST /api/reports`) without extra CRUD claims (`code/ui/src/api.js`, `code/ui/src/pages/reports.jsx`, `caf/task_reports/TG-20-api-boundary-reports.md`). |
| RR-SPA-HANDOFF-01 | PASS | Required `submission_id` is visible and handed off across list/create flows; create requires and reuses it (`code/ui/src/pages/reports.jsx`). |
| RR-AUTH-MOCK-01 | PASS | UI claim builder + API helper + AP boundary/shared auth surfaces maintain coherent Bearer claim contract with `tenant_id`, `principal_id`, `policy_version` (`code/ui/src/auth/mockAuth.js`, `code/ui/src/api.js`, `code/common/auth/mock_claims.py`, `code/ap/api/auth_context.py`). |
| RR-AUTH-MOCK-02 | PASS | Claim-over-header conflict handling is explicit fail-closed (`tenant context conflict`) while Authorization/Bearer remains primary (`code/common/auth/mock_claims.py`, `code/ui/src/api.js`). |
| RR-TR-STRUCT-01 | FAIL | Task report exists but required rubric sections are missing (no `Task Spec Digest`, `Inputs declared by task`, `Step execution evidence`, `Outputs produced`, `Rails/TBP satisfaction`) in `caf/task_reports/TG-25-ui-page-reports.md`. |
| RR-TR-STEP-01 | FAIL | Report does not map evidence to each task step from `caf/task_graph_v1.yaml` and does not provide per-step N/A handling. |
| RR-TBP-RB-01 | PASS | Ran `node tools/caf/resolve_tbp_role_bindings_v1.mjs codex-saas --capability ui_frontend_scaffolding`; all resolved path templates exist and contain required evidence strings (`code/ui/src/auth/mockAuth.js`, `code/ui/src/api.js`, `code/ui/package.json`). |

## Semantic review questions
1. Does the reports page align with declared operations and reporting intent? PASS. It implements list/get/create report interactions and report inspection in UI.
2. Are tenant and dependency identifiers propagated into report requests? PASS. Bearer claim carries tenant/principal/policy and `submission_id` is required for create/filter flows.
3. Are report outputs presented in a way that supports operator workflows? PASS. List/detail/create states are visible with identifiers and timestamps.
4. Do AP/runtime entrypoints and policy seams name the selected mock auth contract explicitly? PASS. Shared and boundary auth surfaces enforce Authorization/Bearer contract.
5. If `auth_claim` is adopted, do UI claim-builder and UI API helper issue coherent payload (`tenant_id`, `principal_id`, `policy_version`)? PASS.
6. If create/admin operations exist, is demo persona posture explicit in UI auth helper surfaces? PASS. Persona presets are explicit in `code/ui/src/auth/mockAuth.js` and selected in shell UI.
7. Do boundary/helper implementations preserve case-insensitive HTTP header resolution? PASS. Header lookup is case-insensitive in shared parser.
8. If claim-over-header is adopted, is precedence preserved consistently? PASS. Header conflict rejects mismatched tenant header; claim remains source of truth.
9. Are missing/malformed mock auth inputs handled explicitly? PASS. Missing/invalid auth raises explicit `PermissionError` mapped to HTTP 403.
10. Does UI run end-to-end via compose stack without host-manual build steps? FAIL (non-blocking at threshold). Compose artifacts required to verify this are absent.
11. Are UI backend calls made via stable local contract surfaces instead of hard-coded localhost ports? PASS. Calls use `/api/*` paths via shared helper.
12. Does the page match resource operations declared in the spec (no missing/extra operations)? PASS. Implemented operations are list/get/create for reports.
13. Does UI avoid inventing fields/domain rules not grounded in spec/design? PASS. Fields remain report/submission/format/timestamps/published_by.
14. Is tenant scoping mandatory in UI calls? PASS. Auth headers are always attached through shared helper.
15. When downstream flows depend on identifiers, is handoff visible and usable? PASS. `submission_id` is required and propagated across controls.

## Summary
Reports UI semantic wiring is implemented and reachable, with coherent shared API/auth contract usage and explicit operator-visible state handling. No blocker findings were identified.

## Issues
### High
- Missing compose artifacts needed for compose rubric verification (`RR-COMP-CORR-01`, `RR-COMP-BUILD-01`, `RR-COMP-SEC-01`).
- Task report structure is incomplete against rubric-required sections (`RR-TR-STRUCT-01`).
- Step-level execution evidence does not map to every task step (`RR-TR-STEP-01`).

### Medium
- None.

### Low
- None.

No issues at or above the configured threshold (`blocker`) were found.
