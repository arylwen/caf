# Review: TG-40-persistence-submissions

## Rubric evaluation
| check_id | PASS/FAIL | Evidence |
| --- | --- | --- |
| RR-PY-SEC-01 | PASS | No hardcoded secret/token patterns found in touched persistence files: `code/ap/persistence/postgres_submissions_repository.py`, `code/ap/persistence/repository_factory.py`, `code/ap/persistence/models.py`, `code/ap/composition/root.py`. |
| RR-PY-CORR-01 | PASS | Imports in touched files resolve to existing modules, including `code/ap/persistence/postgres_adapter.py`, `code/common/persistence/sqlalchemy_runtime.py`, and `code/ap/service/resource_services.py`. |
| RR-PY-CORR-01A | PASS | Python package markers are present for candidate packages, including `code/__init__.py`, `code/ap/__init__.py`, `code/cp/__init__.py`, and subpackage markers under `code/ap`, `code/cp`, and `code/common`. |
| RR-PY-CORR-02 | PASS | No bare `except:` or silent pass patterns in touched/adjacent AP persistence and API-boundary paths; explicit exceptions are used (`RuntimeError`, `HTTPException`). |
| RR-PY-PERF-01 | PASS | Submission repository methods use bounded SQLAlchemy queries with tenant/workspace filters and do not perform per-row external calls in loops (`code/ap/persistence/postgres_submissions_repository.py`). |
| RR-TST-BLOCK-01 | PASS | No tautological/placeholder tests were found. |
| RR-TST-HIGH-01 | FAIL | No test suite is present for touched submissions persistence/runtime paths (`code/ap/persistence/postgres_submissions_repository.py`, `code/ap/persistence/repository_factory.py`, `code/ap/composition/root.py`). |
| RR-TST-HIGH-02 | FAIL | No negative-path tests were provided for submissions persistence/API policy/validation behavior. |
| RR-COMP-CORR-01 | FAIL | `docker/compose.candidate.yaml` is absent under `companion_repositories/codex-saas/profile_v1`, so AP/CP service/port/env compose wiring cannot be verified. |
| RR-COMP-BUILD-01 | FAIL | Compose/build surfaces are absent (`docker/compose.candidate.yaml`, `docker/Dockerfile.ap`, `docker/Dockerfile.cp`, `.env`), so Dockerfile/env-file wiring checks cannot pass. |
| RR-COMP-SEC-01 | FAIL | Compose artifact is missing, so privileged/mount/network safety posture cannot be evaluated from the declared packaging surface. |
| RR-FA-CORR-01 | PASS | FastAPI entrypoint wires routers from app root (`code/ap/main.py` includes both local `/ap` router and API router from `code/ap/api/resources.py`). |
| RR-FA-SEC-01 | PASS | Request validation uses Pydantic models in route signatures (`SubmissionCreateRequest`, `SubmissionUpdateRequest` and other request models in `code/ap/api/models.py` and `code/ap/api/resources.py`). |
| RR-FA-BOUNDARY-ERR-01 | PASS | Policy denial/error paths are mapped to explicit HTTP responses at the boundary (`code/ap/api/dependencies.py` catches `PermissionError` -> 403; resource handlers return explicit 404s for missing entities). |
| RR-FA-SCHEMA-BOOTSTRAP-01 | PASS | AP startup invokes schema bootstrap before serving (`lifespan` in `code/ap/main.py` calls `bootstrap_schema`; bootstrap path uses shared SQLAlchemy bootstrap hook in `code/ap/runtime/bootstrap.py` and `code/ap/persistence/repository_factory.py`). |
| RR-FA-ARCH-01 | PASS | Route handlers remain thin and delegate to service layer (`runtime_context.submissions_service.*`) in `code/ap/api/resources.py`. |
| RR-TR-STRUCT-01 | FAIL | `caf/task_reports/TG-40-persistence-submissions.md` exists but does not include required sections: Task Spec Digest, Inputs declared by task, Step execution evidence, Outputs produced, Rails/TBP satisfaction. |
| RR-TR-STEP-01 | FAIL | Task report includes claims/evidence anchors but does not explicitly map evidence to each task step from `caf/task_graph_v1.yaml` or mark any step N/A. |
| RR-TBP-RB-01 | PASS | Required resolver executed: `node tools/caf/resolve_tbp_role_bindings_v1.mjs codex-saas --capability persistence_implementation`; expected templates exist and contain required evidence strings in `code/common/persistence/sqlalchemy_runtime.py`, `sqlalchemy_metadata.py`, and `sqlalchemy_schema_bootstrap.py`. |
| RR-SPA-WIRE-01 | PASS | SPA shell/pages are interactive with state, handlers, and API calls (`code/ui/src/App.jsx`, `code/ui/src/pages/submissions.jsx` and sibling resource pages); no static-only implementation claims observed. |
| RR-SPA-WIRE-02 | PASS | Resource/admin pages are reachable from shell navigation in `code/ui/src/App.jsx` (`workspaces`, `submissions`, `reviews`, `reports`, `settings`). |
| RR-SPA-WIRE-03 | PASS | API-backed interactions use the shared helper in `code/ui/src/api.js`; pages import helper functions rather than ad hoc fetch logic. |
| RR-SPA-STATE-01 | PASS | API-backed pages expose loading/empty/success/failure states, including submissions (`code/ui/src/pages/submissions.jsx`) and other resource pages. |
| RR-SPA-ERR-DETAIL-01 | PASS | Shared API helper preserves backend error detail via `parseErrorDetail()` before throwing (`code/ui/src/api.js`). |
| RR-SPA-FORM-01 | PASS | Create/update/admin actions are bound to controlled form state and real submit handlers (`code/ui/src/pages/submissions.jsx` and related pages). |
| RR-SPA-CONTRACT-01 | PASS | UI API helper and page semantics align to declared AP contract endpoints (`/api/submissions`, `/api/reviews`, `/api/reports`, policy probe paths). |
| RR-SPA-HANDOFF-01 | PASS | Resource IDs are surfaced for handoff flows (e.g., workspace-to-submission and submission/report identifiers in `code/ui/src/App.jsx`, `code/ui/src/pages/workspaces.jsx`, `code/ui/src/pages/submissions.jsx`, `code/ui/src/pages/reports.jsx`). |

## Semantic review questions
1. Does submissions persistence preserve tenant-scoped access boundaries?
   - Yes. Submission list/get/update queries are tenant-filtered (`SubmissionModel.tenant_id == tenant_id`), and create writes tenant_id from caller context in `code/ap/persistence/postgres_submissions_repository.py`.
2. Are ORM and schema strategy constraints applied consistently?
   - Yes. Submission persistence uses SQLAlchemy model/session surfaces; shared bootstrap path invokes SQLAlchemy metadata bootstrap under startup wiring (`code/ap/main.py`, `code/ap/runtime/bootstrap.py`, `code/ap/persistence/repository_factory.py`).
3. Is adapter behavior deterministic for downstream service and runtime tasks?
   - Yes. AP composition root binds `SubmissionsService` to `build_submissions_access()` from repository factory (`code/ap/composition/root.py`, `code/ap/persistence/repository_factory.py`).
4. TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): seam realized without boundary bypass?
   - Yes. Storage interactions remain inside persistence adapters; boundary/service layers call interfaces and services.
5. TBP Gate (TBP-PG-01/G-PG-PERSISTENCE-SEAM-REALIZATION): wiring assumptions coherent with resolved persistence rails?
   - Yes. `build_submissions_access()` requires validated `DATABASE_URL` and returns the postgres SQLAlchemy-backed repository.
6. TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): SQLAlchemy surfaces adopted instead of raw driver code?
   - Yes. Repository methods use SQLAlchemy `select(...)`, mapped models, and session factory; no raw driver/cursor code in touched persistence path.
7. TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): mapped models/metadata owned coherently in persistence boundary?
   - Yes. `SubmissionModel` is declared in AP persistence models and registered through shared metadata ownership (`code/ap/persistence/models.py`, `code/common/persistence/sqlalchemy_metadata.py`).
8. TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-ORM-REALIZATION): DATABASE_URL contract aligned to ORM helper surfaces?
   - Yes. Runtime normalization/validation is centralized in `code/common/persistence/sqlalchemy_runtime.py` and enforced by repository factory precondition.
9. TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): bootstrap registers models before `create_all`?
   - Yes. `bootstrap_sqlalchemy_schema([register_ap_models])` executes registrars before `Base.metadata.create_all`.
10. TBP Gate (TBP-SQLALCHEMY-01/G-SQLALCHEMY-SCHEMA-STRATEGY-ALIGNMENT): runtime behavior matches `code_bootstrap` without silent drift?
   - Yes. AP startup executes bootstrap path during lifespan, not deferred implicit first-write behavior.

## Summary
Submissions persistence implementation is semantically coherent with tenant-scoped SQLAlchemy rails and AP runtime/service wiring. No blocker-severity issues were found for this task.

## Issues
### High
- Missing tests for touched submissions persistence behavior and negative paths (`RR-TST-HIGH-01`, `RR-TST-HIGH-02`).
- Missing compose/build artifacts required by selected packaging rubric (`RR-COMP-CORR-01`, `RR-COMP-BUILD-01`).
- Task report structure is incomplete versus rubric-required sections (`RR-TR-STRUCT-01`).

### Medium
- Task report does not provide explicit step-by-step evidence coverage (`RR-TR-STEP-01`).
- Compose security posture is unverifiable without compose artifact (`RR-COMP-SEC-01`).

### Low
- None.

No issues at or above the configured threshold (`blocker`) were found.
