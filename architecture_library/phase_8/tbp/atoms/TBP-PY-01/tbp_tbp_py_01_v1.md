TBP_ID: TBP-PY-01
NAME: Python service structure + configuration binding
INTENT: Bind CMP-01 and CFG-01 roles to a conventional Python package layout and configuration mechanism for a single-service repo.
SCOPE: Project
APPLIES_WHEN: runtime.language == python
EXTENDS_CORE_PATTERNS: CMP-01; CFG-01
BINDS_MODULE_ROLES: app_composition_root; application_boundary; domain_core; infrastructure_adapters; config_registry; config_model; config_provider

ROLE_BINDINGS:
- app_composition_root: A top-level Python module that wires the service together and exposes the primary entry objects (e.g., ASGI app) and DI wiring (e.g., `app/main.py`).
- application_boundary: A Python package holding boundary adapters (e.g., HTTP controllers), typically `app/api/`.
- domain_core: A Python package holding domain logic (pure business rules), typically `app/domain/`. No framework imports here.
- infrastructure_adapters: A Python package holding external-system adapters (DB, HTTP clients), typically `app/infrastructure/`.
- config_registry: A repository-level dependency/config specification file (`pyproject.toml` or `requirements*.txt`) plus a config module/package (e.g., `app/config/`).
- config_model: A strongly-typed config object (commonly a Pydantic BaseSettings model) representing runtime settings loaded from env.
- config_provider: A single place responsible for loading config from env/.env and making it available to composition root and adapters.

ADDS_EVIDENCE_HOOKS:
- E-TBP-PY-01-01: `pyproject.toml` OR `requirements.txt` exists at repo root.
- E-TBP-PY-01-02: Repository contains an importable Python package for the service (e.g., `app/__init__.py`).
- E-TBP-PY-01-03: Presence of a composition-root module (e.g., `app/main.py`) that imports the boundary layer and wires dependencies.

ADDS_STRUCTURAL_VALIDATIONS:
- V-TBP-PY-01-01: Exactly one dependency specification exists at repo root (`pyproject.toml` OR `requirements.txt` OR `requirements.lock`); if multiple exist, the selected canonical file is declared in `config_registry` docs.
- V-TBP-PY-01-02: Python packages used for application code contain `__init__.py` (no implicit namespace packages for core service code in v1).
- V-TBP-PY-01-03: `domain_core` contains no imports from the chosen web framework TBP (e.g., no `fastapi`, `django`).
- V-TBP-PY-01-04: Config is read via a config_provider (env-backed) rather than hard-coded literals for runtime endpoints/credentials.

REQUIRES_TBPS: None
CONFLICTS_WITH_TBPS: None
FORBIDDEN: None

SOURCES_USED:
- 02_contura_document_output_standards_v2.md — formatting rules
- pattern_cmp_01_v1.md — CMP-01 roles
- pattern_cfg_01_v1.md — CFG-01 roles
- tbp_sources_python_pep8_v1.md — external references
