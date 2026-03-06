# Technology Binding Pattern Schema (v1)

This schema is used to parse TBP atom files stored under `architecture_library/phase_8/tbp/atoms/`.

## Required fields (case-sensitive)

Each TBP file MUST include all fields below, in any order, exactly once:

- `TBP_ID:`
- `NAME:`
- `INTENT:`
- `SCOPE:`
- `APPLIES_WHEN:`
- `EXTENDS_CORE_PATTERNS:`
- `BINDS_MODULE_ROLES:`
- `ROLE_BINDINGS:`
- `ADDS_EVIDENCE_HOOKS:`
- `ADDS_STRUCTURAL_VALIDATIONS:`
- `REQUIRES_TBPS:`
- `CONFLICTS_WITH_TBPS:`
- `FORBIDDEN:`
- `SOURCES_USED:`

## Value formats

- Single-line string fields:
  - `TBP_ID`, `NAME`, `INTENT`, `SCOPE`, `APPLIES_WHEN`, `FORBIDDEN`
- Semicolon-separated lists on one line:
  - `EXTENDS_CORE_PATTERNS: <ID>; <ID>; ...`
  - `BINDS_MODULE_ROLES: <role>; <role>; ...`
  - `REQUIRES_TBPS: None` OR `REQUIRES_TBPS: <TBP_ID>; <TBP_ID>; ...`
  - `CONFLICTS_WITH_TBPS: None` OR `CONFLICTS_WITH_TBPS: <TBP_ID>; <TBP_ID>; ...`

- Bullet lists under the field:
  - `ROLE_BINDINGS:` (each item is `- <role>: <binding description>`)
  - `ADDS_EVIDENCE_HOOKS:` (each item starts with `- E-<TBP_ID>-NN:`)
  - `ADDS_STRUCTURAL_VALIDATIONS:` (each item starts with `- V-<TBP_ID>-NN:`)
  - `SOURCES_USED:` (each item is a reference to an internal doc or external source file)

## File naming (normative)

- Directory: `atoms/<TBP_ID>/`
- Filename: `tbp_<tbp_id_lowercase_with_underscores>_v1.md`
  - Example: `TBP-PY-01` -> `tbp_tbp_py_01_v1.md`

The `TBP_ID:` field must match the directory name.

## Parsing constraints

- Field labels are case-sensitive.
- Each field must appear exactly once.
- One blank line between fields is recommended; parsers should at least tolerate single blank lines and treat continuous text under a field as that field’s body until the next label.
- No placeholders (e.g., `<...>`, `TODO`, `UNKNOWN`) are allowed in atom files.
