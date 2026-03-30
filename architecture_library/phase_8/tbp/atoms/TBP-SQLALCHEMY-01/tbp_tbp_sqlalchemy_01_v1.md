TBP_ID: TBP-SQLALCHEMY-01
NAME: SQLAlchemy ORM persistence binding
INTENT: Bind ORM-backed Python persistence to SQLAlchemy-owned runtime, metadata, and schema-bootstrap surfaces without replacing the database-engine TBP.
SCOPE: Application persistence
APPLIES_WHEN: persistence.orm == sqlalchemy_orm AND runtime.language == python
EXTENDS_CORE_PATTERNS: PST-01; CFG-01
BINDS_MODULE_ROLES: persistence_models; persistence_adapters; config_provider

ROLE_BINDINGS:
- persistence_models: Shared SQLAlchemy declarative base / metadata surfaces and mapped model ownership used by ORM-backed repositories.
- persistence_adapters: Shared SQLAlchemy engine/session bootstrap helpers that resource repositories adopt instead of constructing raw driver access inline. Session lifecycle must be opened through the shared helper contract rather than treating a raw `sessionmaker` object as the request-scoped context manager.
- config_provider: ORM runtime configuration derived from environment-backed database settings (for example `DATABASE_URL`) without hard-coded credentials. SQLAlchemy owns the accepted ORM URL contract shape for ORM-backed rails; deployment/database TBPs contribute the surrounding files and service wiring but do not redefine the URL syntax.

ADDS_EVIDENCE_HOOKS:
- E-TBP-SQLALCHEMY-01-01: SQLAlchemy runtime surfaces are present (for example `create_engine`, `sessionmaker`, `DeclarativeBase`, or mapped metadata ownership).
- E-TBP-SQLALCHEMY-01-02: Repository modules adopt SQLAlchemy session/engine helpers rather than issuing raw cursor-only persistence logic.
- E-TBP-SQLALCHEMY-01-03: When schema management is `code_bootstrap`, a deterministic ORM-owned bootstrap hook is present (for example metadata bootstrap / `create_all`).
- E-TBP-SQLALCHEMY-01-04: FastAPI/ASGI composition roots invoke the SQLAlchemy bootstrap hook before serving traffic; request-path repository factories are not the primary schema materialization path.

ADDS_STRUCTURAL_VALIDATIONS:
- V-TBP-SQLALCHEMY-01-01: SQLAlchemy realization complements, but does not replace, the selected database engine TBP (for example `TBP-PG-01` still owns PostgreSQL wiring/env/service concerns).
- V-TBP-SQLALCHEMY-01-02: ORM-backed persistence modules keep SQLAlchemy ownership inside the persistence boundary and do not silently degrade to raw driver-only production code.
- V-TBP-SQLALCHEMY-01-03: Schema bootstrap behavior matches the resolved schema-management strategy.

REQUIRES_TBPS: TBP-PY-01
CONFLICTS_WITH_TBPS: None
FORBIDDEN: Silently realizing `sqlalchemy_orm` selections as raw driver/cursor-only persistence in production modules.

SOURCES_USED:
- pattern_pst_01_v1.md — PST-01 roles
- pattern_cfg_01_v1.md — CFG-01 roles
- SQLAlchemy ORM documentation (engine/session/declarative base)
