TBP_ID: TBP-RAW-SQL-01
NAME: Raw SQL persistence binding
INTENT: Bind PST-01 persistence realization to explicit SQL-owned runtime and schema-bootstrap surfaces when `persistence.orm == raw_sql`.
SCOPE: Application
APPLIES_WHEN: persistence.orm == raw_sql AND runtime.language == python
EXTENDS_CORE_PATTERNS: PST-01
BINDS_MODULE_ROLES: repository_ports; persistence_adapters; persistence_models

ROLE_BINDINGS:

NOTE (ownership): TBP-RAW-SQL-01 owns the explicit SQL runtime/bootstrap seam for persistence implementation. Database-engine TBPs (for example `TBP-PG-01`) still own driver/config/service wiring concerns.
NOTE (boundary): Raw SQL realization keeps SQL execution, transaction helpers, row mapping, and schema bootstrap inside the persistence boundary rather than scattering SQL across service or boundary layers.
- repository_ports: Defined as Python interfaces/protocols used by domain/application layers to access persistence.
- persistence_adapters: Concrete adapters that use explicit SQL execution helpers rather than ORM sessions or mapped metadata.
- persistence_models: Persistence-level row mapping / DTO helpers that remain distinct from domain models when applicable.

ADDS_EVIDENCE_HOOKS:
- E-TBP-RAW-SQL-01-01: Shared raw-SQL runtime helpers are present (for example connection acquisition, execute/fetch helpers, or transaction wrapper surfaces).
- E-TBP-RAW-SQL-01-02: Schema bootstrap remains deterministic and explicit when `schema_management_strategy == code_bootstrap`.
- E-TBP-RAW-SQL-01-03: Production persistence modules rely on the raw-SQL runtime seam rather than importing ORM session/metadata/bootstrap helpers.

ADDS_STRUCTURAL_VALIDATIONS:
- V-TBP-RAW-SQL-01-01: SQL execution remains inside the persistence boundary; service/boundary layers do not issue direct SQL.
- V-TBP-RAW-SQL-01-02: Schema bootstrap SQL is owned by a deterministic persistence hook, not scattered ad hoc across runtime modules.
- V-TBP-RAW-SQL-01-03: `raw_sql` realization does not silently drift into ORM-owned runtime semantics.

REQUIRES_TBPS: TBP-PY-01
CONFLICTS_WITH_TBPS: TBP-SQLALCHEMY-01
FORBIDDEN: Silently realizing `raw_sql` selections through ORM-owned runtime/bootstrap helpers.

SOURCES_USED:
- pattern_pst_01_v1.md — PST-01 roles
- tbp_sources_postgresql_v1.md — complementary DB wiring context for Python/Postgres baselines
