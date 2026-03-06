# CAF Pattern Schema v1

This document defines the **canonical, machine-readable schema** for CAF architecture pattern files.

The goals are:

- **Determinism:** tooling can parse and validate pattern files reliably.
- **Stability:** keys and IDs are stable across time (no renaming).
- **Fail-closed:** if a required key is missing or malformed, validation must fail.

## Schema keys

Every standalone pattern file **must** contain the following keys, **in this exact order** (case-sensitive):

1. `PATTERN_ID`
2. `NAME`
3. `CATEGORY`
4. `INTENT`
5. `APPLIES_WHEN`
6. `INTRODUCES_MODULE_ROLES`
7. `ALLOWED_DEPENDENCIES`
8. `ASSEMBLY_CONTRACT`
9. `REQUIRED_EVIDENCE_HOOKS`
10. `STRUCTURAL_VALIDATIONS`
11. `PLAN_STEP_ARCHETYPES`
12. `JUSTIFICATION`

## Formatting rules

- **Key format:** `KEY: <value>` (a colon followed by a single space).
- **Multi-line values:** subsequent lines are indented (recommended: 4 spaces).
- **List values:** use `-` bullets under the key (indented).
- **IDs inside lists:** keep labels stable (e.g., `E1`, `E2`, `V1`, `V2`); do not renumber casually.
- **No ad-hoc keys:** do not add new top-level keys in v1 pattern files. If a new key is needed, it must be added via a schema version bump.

## Heading conventions

Each pattern file must start with a single level-one heading:

`# <Pattern Name> (<PATTERN_ID>)`

- This must be the **only** level-one heading in the file.
- Avoid additional section headings; the schema keys provide the structure.

## Do-not-rename rules

- The schema keys above are **locked** and must not be renamed (e.g., do not change `PATTERN_ID` → `ID`).
- Pattern IDs are **stable identifiers**. If semantics change materially, create a new versioned pattern ID/file rather than mutating meaning under the same ID.

## Example (format illustration)

```text
# Example Pattern (EXP-01)

PATTERN_ID: EXP-01
NAME: Example Pattern
CATEGORY: CategoryName
INTENT: Short statement of the pattern’s purpose or problem it solves.
APPLIES_WHEN: Description of scenarios or preconditions where this pattern applies.
INTRODUCES_MODULE_ROLES:
    - Role1: brief role description
    - Role2: brief role description
ALLOWED_DEPENDENCIES: Explain which modules may depend on which (and which may not).
ASSEMBLY_CONTRACT: Describe assembly-time invariants or wiring rules this pattern imposes.
REQUIRED_EVIDENCE_HOOKS:
    - E1: Evidence the design must provide (file/section/diagram commitment).
    - E2: Additional required evidence.
STRUCTURAL_VALIDATIONS:
    - V1: Static check to enforce the pattern (fail-closed).
    - V2: Additional static check.
PLAN_STEP_ARCHETYPES:
    - Typical plan step to realize the pattern (e.g., generate interface + stub).
    - Another typical step.
JUSTIFICATION: Why this pattern matters and why it belongs in the inventory/core set.
```

## Compatibility note

Core pattern summaries (catalogs, inventories) may present pattern content in a narrative or tabular form. **Only** standalone pattern definition files must follow the strict schema above.
