# Review: TG-40-persistence-workspaces

## Rubric evaluation
| check_id | PASS/FAIL | Evidence |
| --- | --- | --- |
| RR-PY-SEC-01 | PASS | No hardcoded secret/token patterns in touched persistence files: `code/ap/persistence/postgres_workspaces_repository.py`, `code/ap/persistence/repository_factory.py`, `code/ap/persistence/models.py`. |
| RR-PY-CORR-01 | PASS | Imports in touched files resolve to existing modules, including `code/ap/persistence/postgres_adapter.py` and `code/common/persistence/sqlalchemy_runtime.py`. |
| RR-PY-CORR-01A | PASS | Python package markers are present, including `code/__init__.py`, `code/ap/__init__.py`, `code/cp/__init__.py`, and subpackage `__init__.py` files. |
| RR-PY-CORR-02 | PASS | No bare `except:`/silent error swallowing found in AP persistence/runtime code paths; boundary enforcement uses explicit exceptions. |
| RR-PY-PERF-01 | PASS | Repository methods use scoped SQLAlchemy queries (`select(...).where(...)`) and avoid per-row external boundary calls in loops. |
| RR-TST-BLOCK-01 | PASS | No placeholder/tautological test files found. |
| RR-TST-HIGH-01 | FAIL | Companion repo has no test suite covering touched workspace persistence paths (`code/ap/persistence/postgres_workspaces_repository.py`, `code/ap/persistence/repository_factory.py`). |
| RR-TST-HIGH-02 | FAIL | No negative-path tests for tenant/policy/persistence error behavior were provided for this task. |
| RR-COMP-CORR-01 | FAIL | `docker/compose.candidate.yaml` is absent under `companion_repositories/codex-saas/profile_v1`, so AP/CP service/env wiring cannot be verified. |
| RR-COMP-BUILD-01 | FAIL | Compose and Docker build surfaces (`docker/compose.candidate.yaml`, `docker/Dockerfile.ap`, `docker/Dockerfile.cp`) are absent, so Dockerfile/env-file wiring checks cannot pass. |
| RR-COMP-SEC-01 | FAIL | Compose file is missing, so privileged/mount/network safety posture cannot be evaluated from declared packaging surface. |
| RR-FA-CORR-01 | PASS | FastAPI app includes router wiring from entrypoint: `code/ap/main.py` calls `app.include_router(router)` and `app.include_router(api_router)`. |
| RR-FA-SEC-01 | PASS | API boundary uses Pydantic request models in route signatures (for example `WorkspaceCreateRequest`, `WorkspaceUpdateRequest` in `code/ap/api/resources.py`). |
| RR-FA-BOUNDARY-ERR-01 | PASS | Policy denial is translated to explicit 403 at API boundary (`code/ap/api/dependencies.py`), with explicit 404 mapping in resource handlers. |
| RR-FA-SCHEMA-BOOTSTRAP-01 | PASS | AP startup invokes schema bootstrap in lifespan (`code/ap/main.py` -> `bootstrap_schema`), and persistence bootstrap calls shared SQLAlchemy bootstrap hook (`code/ap/runtime/bootstrap.py`, `code/ap/persistence/repository_factory.py`). |
| RR-FA-ARCH-01 | PASS | Route handlers remain thin and delegate to services (`runtime_context.workspaces_service.*`) instead of inline persistence logic. |
| RR-TR-STRUCT-01 | FAIL | `caf/task_reports/TG-40-persistence-workspaces.md` exists but does not contain required sections: Task Spec Digest, Inputs declared by task, Step execution evidence, Outputs produced, Rails/TBP satisfaction. |
| RR-TR-STEP-01 | FAIL | Task report does not map evidence to each task step from `caf/task_graph_v1.yaml` and lacks explicit per-step N/A/coverage statements. |
| RR-TBP-RB-01 | PASS | Required resolver executed once: `node tools/caf/resolve_tbp_role_bindings_v1.mjs codex-saas --capability persistence_implementation`; all expected path templates exist and contain required evidence strings under `code/common/persistence/sqlalchemy_{runtime,metadata,schema_bootstrap}.py`. |
| RR-SPA-WIRE-01 | PASS | SPA shell and pages are interactive (state/effects/forms) in `code/ui/src/App.jsx` and `code/ui/src/pages/*.jsx`; no static-only implementation claims detected. |
| RR-SPA-WIRE-02 | PASS | Resource/admin pages are reachable through shell navigation in `code/ui/src/App.jsx` (`workspaces`, `submissions`, `reviews`, `reports`, `settings`). |
| RR-SPA-WIRE-03 | PASS | SPA pages use shared helper in `code/ui/src/api.js` instead of ad hoc raw fetch inside pages. |
| RR-SPA-STATE-01 | PASS | API-backed pages expose loading/empty/success/failure states (for example workspaces/submissions/reports/reviews pages). |
| RR-SPA-ERR-DETAIL-01 | PASS | Shared API helper preserves backend error detail via `parseErrorDetail()` before throwing (`code/ui/src/api.js`). |
| RR-SPA-FORM-01 | PASS | Create/update/admin forms use controlled state and bound submit handlers across workspace/submission/review/report/policy pages. |
| RR-SPA-CONTRACT-01 | PASS | Policy admin page is framed as probe/evaluation surface and resource pages map to declared AP contract endpoints in `code/ui/src/api.js`. |
| RR-SPA-HANDOFF-01 | PASS | Workspace/submission/report pages surface identifiers and provide visible handoff controls (`workspace_id`, `submission_id`, `report_id`). |

## Semantic review questions
1. Does workspace persistence implementation preserve tenant isolation semantics?
   - Yes. Tenant scoping is enforced in list/get/update queries via `WorkspaceModel.tenant_id == tenant_id`, and create writes tenant ID from the caller path.
2. Are sqlalchemy_orm and code_bootstrap rails reflected in adapter behavior?
   - Yes. Workspace persistence uses SQLAlchemy ORM model/session surfaces and shared bootstrap hook (`bootstrap_sqlalchemy_schema`) under startup wiring.
3. Is persistence wiring compatible with service-facade contracts and runtime assembly?
   - Yes. `build_workspaces_access()` returns `PostgresWorkspacesRepository` implementing `WorkspacesAccessInterface`, consumed by AP composition root.
4. TBP-PG seam realization checks (both questions)
   - Pass. Storage interaction is inside persistence adapters; service/boundary code consumes interfaces rather than direct DB calls.
5. TBP-SQLALCHEMY ORM realization checks (all three questions)
   - Pass. Engine/session factory and mapped model metadata are SQLAlchemy-owned, and `DATABASE_URL` contract remains aligned to shared runtime helper.
6. TBP-SQLALCHEMY schema strategy alignment checks (both questions)
   - Pass. Runtime startup invokes bootstrap, and bootstrap path registers model module import surface before `metadata.create_all`.

## Summary
Workspace persistence implementation is semantically coherent for tenant-scoped SQLAlchemy-backed repository behavior and AP runtime/service wiring. No blocker-severity defects were found for this task.

## Issues
### High
- Missing tests for touched workspace persistence behavior and negative paths (`RR-TST-HIGH-01`, `RR-TST-HIGH-02`).
- Missing compose/build surfaces required by selected packaging rubric (`RR-COMP-CORR-01`, `RR-COMP-BUILD-01`).
- Task report missing required structured sections (`RR-TR-STRUCT-01`).

### Medium
- Task report does not provide explicit step-by-step evidence coverage (`RR-TR-STEP-01`).
- Compose security posture cannot be evaluated without compose surface (`RR-COMP-SEC-01`).

### Low
- None.

No issues at or above the configured threshold (`blocker`) were found.