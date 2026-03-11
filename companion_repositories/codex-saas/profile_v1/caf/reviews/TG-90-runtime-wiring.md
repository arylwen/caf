## Review Scope
- task_id: `TG-90-runtime-wiring`
- capability: `runtime_wiring`
- severity_threshold: `high` (from `caf/task_graph_v1.yaml`)
- task report: `caf/task_reports/TG-90-runtime-wiring.md`

## Rubric Evaluation
| check_id | PASS/FAIL | Evidence |
| --- | --- | --- |
| RR-PY-SEC-01 | PASS | Runtime credentials and endpoints are externalized to compose env surfaces, not hardcoded in service code (`docker/compose.candidate.yaml`, `.env`, `code/AP/application/policy_client.py`). |
| RR-PY-CORR-01 | PASS | AP runtime wiring imports resolve to existing modules and concrete providers (`code/AP/bootstrap/runtime_wiring.py`, `code/AP/interfaces/inbound/*.py`). |
| RR-PY-CORR-01A | PASS | Python package markers remain present (`code/__init__.py`, `code/AP/__init__.py`, `code/CP/__init__.py`). |
| RR-PY-CORR-02 | PASS | No bare `except`; error handling maps typed exceptions to explicit HTTP statuses in routers (`code/AP/interfaces/inbound/reports_router.py`, `submissions_router.py`, `workspaces_router.py`). |
| RR-PY-PERF-01 | PASS | Composition is initialized once and re-used; no repeated per-request provider construction in route handlers (`code/AP/bootstrap/runtime_wiring.py`). |
| RR-TST-BLOCK-01 | PASS | Task scope is runtime wiring; no broken placeholder tests introduced. |
| RR-TST-HIGH-01 | PASS | Runtime behavior changes stay aligned with existing resource route contracts (`code/AP/interfaces/inbound/*.py`). |
| RR-TST-HIGH-02 | PASS | Policy/persistence paths preserve existing negative-path behavior via explicit exception mapping. |
| RR-COMP-CORR-01 | PASS | Compose defines coherent CP/AP/UI/Postgres services, dependencies, and runtime ports (`docker/compose.candidate.yaml`). |
| RR-COMP-BUILD-01 | PASS | Compose uses Dockerfile-based builds with `env_file` configuration and concrete AP/CP/UI Dockerfiles (`docker/compose.candidate.yaml`, `docker/Dockerfile.ap`, `docker/Dockerfile.cp`, `docker/Dockerfile.ui`). |
| RR-COMP-SEC-01 | PASS | Compose contains no privileged host-level escalation flags or unsafe host mounts. |
| RR-FA-CORR-01 | PASS | AP routes are assembled through runtime composition and call service facades that enforce policy context (`code/AP/bootstrap/runtime_wiring.py`, `code/AP/interfaces/inbound/*.py`). |
| RR-FA-SEC-01 | PASS | Inbound handlers continue using explicit headers and structured models; policy failures map to non-success HTTP status (`code/AP/interfaces/inbound/*.py`). |
| RR-FA-ARCH-01 | PASS | Runtime assembly now closes required consumer-provider seams through composition root rather than local in-memory fallback (`code/AP/bootstrap/runtime_wiring.py`, `caf/binding_reports/*.yaml`). |
| RR-TR-STRUCT-01 | PASS | Task report includes digest, inputs, step evidence, outputs, rails/TBP, validation, and completion evidence (`caf/task_reports/TG-90-runtime-wiring.md`). |
| RR-TR-STEP-01 | PASS | Task report explicitly maps each task step to concrete outputs and evidence. |
| RR-TBP-RB-01 | PASS | `runtime_wiring` role-binding expectations are materialized: `docker/compose.candidate.yaml`, `docker/Dockerfile.cp`, `docker/Dockerfile.ap`, `.env`, `.gitignore`, `docker/Dockerfile.ui`, `docker/nginx.ui.conf`. |

## Task Semantic Review Questions
- Q1: Does runtime wiring externalize configuration and avoid embedded credentials?
  Answer: Yes. Runtime values are provided by `.env` and compose environment declarations; no credentials are embedded in AP route/runtime code.
- Q2: Are compose service roles and boundaries aligned with CP/AP contract intent?
  Answer: Yes. CP/AP remain separate services and AP policy enforcement is wired to CP via `CP_POLICY_BASE_URL`, with UI reverse proxying AP via `/api`.
- Q3: Does runtime wiring include UI build/proxy/service surfaces required by resolved UI pins?
  Answer: Yes. `docker/Dockerfile.ui`, `docker/nginx.ui.conf`, and `ui` compose service wiring are present and role-binding aligned.

## Findings
- High: none
- Medium: none
- Low: none

No issues at or above the configured threshold (`high`) were found.
