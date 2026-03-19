# Review Note — TG-90-runtime-wiring

| check_id | PASS/FAIL | Evidence |
| --- | --- | --- |
| RR-PY-SEC-01 | PASS | No new secrets in Python surfaces; env defaults only in `.env` / `infrastructure/postgres.env.example`. |
| RR-PY-CORR-01 | PASS | Existing AP/CP imports unchanged; new runtime files are compose/docker/env only. |
| RR-PY-CORR-01A | PASS | Package markers remain present: `code/__init__.py`, `code/ap/__init__.py`, `code/cp/__init__.py`. |
| RR-PY-CORR-02 | PASS | Existing AP/CP boundary exception mapping remains in `code/ap/main.py` and `code/cp/main.py`. |
| RR-PY-PERF-01 | PASS | No request-path Python loops introduced by this task. |
| RR-TST-BLOCK-01 | PASS | No tests were added; no placeholder tests introduced. |
| RR-TST-HIGH-01 | PASS | N/A for this task: runtime wiring/config changes only; no endpoint implementation changed. |
| RR-TST-HIGH-02 | PASS | N/A for this task: no new validation/policy code paths introduced. |
| RR-COMP-CORR-01 | PASS | `docker/compose.candidate.yaml` defines CP/AP/UI/postgres, ports, and env-file wiring. |
| RR-COMP-BUILD-01 | PASS | CP/AP use Dockerfile builds (`docker/Dockerfile.cp`, `docker/Dockerfile.ap`), compose uses `env_file`, `.env` exists, `.gitignore` ignores `.env` and `*.local`. |
| RR-COMP-SEC-01 | PASS | No privileged mode, docker socket, or host network usage in compose. |
| RR-FA-CORR-01 | PASS | AP/CP router wiring remains complete (`app.include_router(...)` in `code/ap/main.py` and `code/cp/main.py`). |
| RR-FA-SEC-01 | PASS | AP/CP handlers keep typed request models (`pydantic` in AP, typed models in CP). |
| RR-FA-BOUNDARY-ERR-01 | PASS | Permission/validation errors mapped fail-closed in AP/CP exception handlers. |
| RR-FA-SCHEMA-BOOTSTRAP-01 | PASS | AP/CP lifespan bootstraps still invoke schema bootstrap hooks. |
| RR-FA-ARCH-01 | PASS | Route-to-service delegation remains unchanged; runtime task added no inline persistence/business logic to handlers. |
| RR-SPA-WIRE-01 | PASS | UI remains fully interactive (`App.jsx` state/navigation + API helper usage). |
| RR-SPA-WIRE-02 | PASS | SPA navigation still wires policy/workspaces/submissions/reviews/reports pages from `App.jsx`. |
| RR-SPA-WIRE-03 | PASS | Shared helper `code/ui/src/api.js` uses contract paths (`/api/*`) for backend calls. |
| RR-SPA-STATE-01 | PASS | UI shell maintains loading/success/error state branches in `App.jsx`; helper throws fail-closed errors. |
| RR-SPA-ERR-DETAIL-01 | PASS | `parseErrorDetail` preserves backend error detail before throwing in `code/ui/src/api.js`. |
| RR-SPA-FORM-01 | PASS | Existing pages continue using API-driven form actions; task introduced no static-only action claims. |
| RR-SPA-CONTRACT-01 | PASS | No drift introduced between UI contract wording and implemented API-helper contract paths. |
| RR-SPA-HANDOFF-01 | PASS | Existing resource-page handoff wiring unchanged by runtime task. |
| RR-PY-DEP-01 | PASS | Canonical manifest `requirements.txt` remains present and referenced by CP/AP Dockerfiles. |
| RR-PY-DEP-02 | PASS | CP/AP Dockerfiles install from `requirements.txt`; no inline package duplication. |
| RR-TR-STRUCT-01 | PASS | Task report contains all required sections in required order. |
| RR-TR-STEP-01 | PASS | Task report addresses every task step and required inputs with concrete evidence. |
| RR-TBP-RB-01 | PASS | Runtime-wiring role-binding expectations are materialized at expected paths with required evidence strings. |

## Semantic review questions
- `Does runtime wiring preserve adopted cross-plane and gateway option decisions?` Yes; CP/AP service separation and same-origin UI proxy preserve selected gateway/runtime shape.
- `Are compose, docker, env, and UI proxy surfaces coherent for local candidate runs?` Yes; compose, Dockerfiles, `.env`, and nginx proxy are aligned and mutually referenced.
- `Is runtime env wiring aligned with persistence and auth carrier contracts?` Yes; `DATABASE_URL` + `POSTGRES_*` are externalized and AP/CP auth claim behavior remains unchanged.
- `AP tenant carrier realization (2 questions)` Yes; AP boundary and runtime surfaces remain claim-driven and fail-closed.
- `CP↔AP tenant carrier realization (2 questions)` Yes; runtime wiring preserves the existing CP/AP contract split and carrier continuity.
- `Tenant conflict precedence realization (2 questions)` Yes; no runtime change undermines existing claim-over-header conflict behavior.
- `CP↔AP surface realization (2 questions)` Yes; compose and proxy wiring preserve a coherent CP/AP split with explicit routes.
- `Principal taxonomy realization (2 questions)` Yes; AP/CP health and runtime assumptions remain consistent with the adopted taxonomy.
- `Cross-plane mode realization (2 questions)` Yes; synchronous API mode remains the only realized interaction mode.
- `API gateway boundary realization (2 questions)` Yes; UI uses proxy routes while CP/AP remain service-owned.
- `TBP-COMPOSE config externalization (2 questions)` Yes; configuration is env-file based and service DNS names are used (`ap`, `cp`, `postgres`).
- `TBP-COMPOSE service roles` Yes; CP/AP/UI/postgres roles are explicit and match plane boundaries.
- `TBP-PY module-root coherence (2 questions)` Yes; runtime entrypoints use `code.ap.asgi:app` and `code.cp.asgi:app`, consistent with resolved module roots.
- `TBP-PY-PACKAGING canonical manifest (2 questions)` Yes; Dockerfiles install from root `requirements.txt`.

## Summary
- No issues at or above `blocker` threshold were found.

## Issues
- High: none
- Medium: none
- Low: none

