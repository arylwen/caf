# TG-40-persistence-reviews Semantic Code Review

## Scope
- Task: `TG-40-persistence-reviews` - Implement persistence for reviews resource
- Severity threshold: `blocker`
- Reviewer mode: semantic-only (code + declarations + task report)

## Rubric Selection
Auto-selected rubrics from resolved pins/task metadata:
- `RR-PY-GENERAL-01`
- `RR-PY-TESTS-01`
- `RR-COMPOSE-01`
- `RR-FASTAPI-SVC-01`
- `RR-WEB-SPA-01` (selected by `ui.kind: web_spa` in resolved profile)
- `RR-TASK-REPORT-01`
- `RR-TBP-ROLE-BINDINGS-01`

## Rubric Evaluation
| check_id | PASS/FAIL | Evidence |
| --- | --- | --- |
| RR-PY-SEC-01 | PASS | No hardcoded credentials observed in touched persistence/runtime surfaces: `code/ap/persistence/postgres_reviews_repository.py`, `code/ap/persistence/repository_factory.py`, `code/ap/composition/root.py`. |
| RR-PY-CORR-01 | PASS | Imports in touched files resolve to existing modules (`code/ap/persistence/models.py`, `code/ap/persistence/postgres_adapter.py`, `code/ap/service/resource_services.py`). |
| RR-PY-CORR-01A | PASS | Python package markers present at required roots: `code/__init__.py`, `code/ap/__init__.py`, `code/cp/__init__.py`. |
| RR-PY-CORR-02 | PASS | No bare `except:` or silent exception suppression in touched files; explicit fail-closed RuntimeError and typed handling are used. |
| RR-PY-PERF-01 | PASS | Repository methods perform single targeted SQLAlchemy queries by tenant/review IDs; no N+1/request-loop boundary calls detected in touched code. |
| RR-TST-BLOCK-01 | PASS | No placeholder/tautological tests found for this task (no test artifacts introduced under `tests/`). |
| RR-TST-HIGH-01 | FAIL | No task-aligned unit tests found asserting observable review persistence behavior (no `tests/` files present in target repo). |
| RR-TST-HIGH-02 | FAIL | No negative-path tests found for review persistence/policy failure modes (no `tests/` files present in target repo). |
| RR-COMP-CORR-01 | FAIL | Expected compose artifact `docker/compose.candidate.yaml` is missing under companion repo; AP/CP/env wiring cannot be semantically verified there. |
| RR-COMP-BUILD-01 | FAIL | Compose/Dockerfile/env-file surfaces required by rubric are absent (`docker/compose.candidate.yaml`, `docker/Dockerfile.ap`, `docker/Dockerfile.cp`, repo `.env`). |
| RR-COMP-SEC-01 | FAIL | Compose security posture cannot be evaluated because expected compose surface is missing. |
| RR-FA-CORR-01 | PASS | FastAPI app includes router wiring: `app.include_router(router)` and `app.include_router(api_router)` in `code/ap/main.py`. |
| RR-FA-SEC-01 | PASS | Route inputs use typed Pydantic request models (`code/ap/api/models.py`; handlers in `code/ap/api/resources.py`). |
| RR-FA-BOUNDARY-ERR-01 | PASS | Permission/policy failure paths are translated to explicit HTTP responses via `enforce_policy` and exception handlers (`code/ap/api/dependencies.py`, `code/ap/main.py`). |
| RR-FA-SCHEMA-BOOTSTRAP-01 | PASS | Runtime startup invokes schema bootstrap before serving traffic via FastAPI lifespan (`code/ap/main.py` -> `code/ap/runtime/bootstrap.py` -> `bootstrap_reports_schema`). |
| RR-FA-ARCH-01 | PASS | Route handlers delegate to service layer (`runtime_context.*_service`) and keep persistence/policy logic out of handlers (`code/ap/api/resources.py`). |
| RR-SPA-WIRE-01 | PASS | UI shell/pages show implemented interaction wiring (state, handlers, API calls) in `code/ui/src/App.jsx`, `code/ui/src/api.js`, `code/ui/src/pages/reviews.jsx`. |
| RR-SPA-WIRE-02 | PASS | Reviews page is reachable via shell navigation (`NAV_ITEMS` + `activeNav === "reviews"` branch in `code/ui/src/App.jsx`). |
| RR-SPA-WIRE-03 | PASS | Reviews page uses shared API helper (`getReview`, `updateReview` imported from `code/ui/src/api.js`) rather than ad hoc fetch. |
| RR-SPA-STATE-01 | PASS | Reviews page exposes loading/success/failure states for lookup and update flows (`lookupStatus`, `updateStatus` branches in `code/ui/src/pages/reviews.jsx`). |
| RR-SPA-ERR-DETAIL-01 | PASS | Shared helper preserves backend error details via JSON/text parsing before throw (`parseErrorDetail` in `code/ui/src/api.js`). |
| RR-SPA-FORM-01 | PASS | Update form is state-bound with concrete submit path invoking `updateReview` (`code/ui/src/pages/reviews.jsx`). |
| RR-SPA-CONTRACT-01 | PASS | Reviews UI language and API usage align with declared review get/update contract; no unsupported CRUD claims detected (`code/ui/src/pages/reviews.jsx`, `code/ui/src/api.js`). |
| RR-SPA-HANDOFF-01 | PASS | Page visibly surfaces review/submission identifiers and supports handoff context for downstream report workflows (`code/ui/src/pages/reviews.jsx`). |
| RR-TR-STRUCT-01 | FAIL | Task report exists but omits rubric-required explicit sections (`Task Spec Digest`, `Inputs declared by task`, `Outputs produced`, `Rails/TBP satisfaction`) in `caf/task_reports/TG-40-persistence-reviews.md`. |
| RR-TR-STEP-01 | FAIL | Step evidence is present but not explicitly mapped step-by-step to each task_graph step or omissions; required-input declaration section is also missing. |
| RR-TBP-RB-01 | PASS | `node tools/caf/resolve_tbp_role_bindings_v1.mjs codex-saas --capability persistence_implementation` resolved three expectations; all required paths exist and contain required evidence strings: `code/common/persistence/sqlalchemy_runtime.py` (`DATABASE_URL`, `create_engine`, `sessionmaker`), `code/common/persistence/sqlalchemy_metadata.py` (`DeclarativeBase`, `MetaData`), `code/common/persistence/sqlalchemy_schema_bootstrap.py` (`metadata.create_all`). |

## Semantic Review Questions
- Is review persistence tenant-scoped and consistent with policy assumptions? **Yes.** Repository queries/mutations are tenant-filtered (`tenant_id` predicates in `code/ap/persistence/postgres_reviews_repository.py`) and AP boundary enforces policy before service calls (`code/ap/api/resources.py`).
- Are ORM and schema bootstrap constraints reflected in adapter design? **Yes.** SQLAlchemy runtime/session + mapped `ReviewModel` + startup bootstrap path are present (`code/common/persistence/*.py`, `code/ap/persistence/models.py`, `code/ap/main.py`).
- Do persisted review outputs preserve identifiers needed by reports flows? **Yes.** Persistence payload includes `review_id`, `submission_id`, and review decision metadata (`code/ap/persistence/postgres_reviews_repository.py`).
- TBP Gate (PG seam realization): Does implementation realize seam vs bypass? **Yes.** Runtime composition consumes persistence providers from repository factory (`code/ap/composition/root.py`, `code/ap/persistence/repository_factory.py`).
- TBP Gate (PG seam coherence across persistence tasks): **Yes.** Shared postgres adapter/session surfaces are used (`code/ap/persistence/postgres_adapter.py`, `code/common/persistence/sqlalchemy_runtime.py`).
- TBP Gate (SQLAlchemy ORM realization; engine/session adoption): **Yes.** Repository code uses SQLAlchemy sessions/select and mapped models (`code/ap/persistence/postgres_reviews_repository.py`, `code/ap/persistence/models.py`).
- TBP Gate (metadata ownership): **Yes.** Models are owned in AP persistence module and registered via shared metadata base (`code/ap/persistence/models.py`, `code/common/persistence/sqlalchemy_metadata.py`).
- TBP Gate (DATABASE_URL contract coherence): **Yes (task-local surfaces).** Factory fail-closes on missing `DATABASE_URL` and normalizes through shared runtime helper (`code/ap/persistence/repository_factory.py`, `code/common/persistence/sqlalchemy_runtime.py`).
- TBP Gate (register mapped models before bootstrap): **Yes.** Bootstrap calls SQLAlchemy schema helper with `register_ap_models` registrar (`code/ap/persistence/repository_factory.py`).
- TBP Gate (schema_management_strategy alignment): **Yes.** Code path follows code-bootstrap strategy through startup bootstrap invocation (`code/ap/main.py`, `code/ap/runtime/bootstrap.py`).

## Issue List
### High
- `RR-TST-HIGH-01`: Missing tests that assert observable behavior for touched review persistence/service paths.
- `RR-TST-HIGH-02`: Missing negative-path tests for review persistence/policy failure behavior.
- `RR-COMP-CORR-01`: Missing compose artifact surface required for semantic compose wiring verification.
- `RR-COMP-BUILD-01`: Missing compose/docker/env-file build surfaces required by compose rubric.
- `RR-TR-STRUCT-01`: Task report does not follow required section structure.

### Medium
- `RR-TR-STEP-01`: Task report step evidence is not explicitly mapped to each task step and required-input declarations.

### Low
- None.

## Summary
Task-local persistence implementation for reviews is semantically coherent with tenant scoping, SQLAlchemy ORM usage, and persistence seam wiring. Cross-cutting quality gaps remain in test coverage, compose artifact presence, and strict task-report structure.

No issues at or above the configured threshold (`blocker`) were found.
