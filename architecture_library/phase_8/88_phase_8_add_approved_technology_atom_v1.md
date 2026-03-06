# Phase 8 — How to add an approved technology (v1)

CAF distinguishes:

- **Approved technology atoms**: the *finite vocabulary* of allowed providers, runtimes, deployments, databases, IaC tools, etc.

---

## Quick decision guide

### You need to add new approved atoms

Add/extend atoms when you want to introduce a new *category value*, e.g.:

- a new deployment mode or deployment target
- a new IaC tool
- a new provider

### Define what you are adding (atoms vs profile)

Write down the intent in one sentence:

- “Add a new approved technology atom value for ____ (category: ____)”

### Use one of the helper skills described in this document.

CAF provides helper skills for adding approved technologies:

#### 1. `caf-add-approved-technology-well-known`

Use this when the technology is **well-known and publicly documented**.

Outputs:

- citations for any externally sourced claims (official docs preferred)
- a fail-closed feedback packet if sources are insufficient

#### 2. `caf-add-approved-technology-manual`

Use this when the technology is **unknown, internal, or poorly documented**.

Inputs:

- an explicit “technology addition request” manifest (see below)

Outputs:

- a proposed patch plan/diffs without guessing or inventing defaults

---

## Technology addition request manifest (for manual path)

Provide a single YAML file in the repo root (or as an inline input) with at least:

```yaml
request_id: add_tech_<short_name>_<date>
kind: approved_atom

# If kind includes approved_atom:
atoms:
  - category: deployment_mode | deployment_target | provider | runtime | database | iac | ci | observability | other
    value: <snake_case_value>
    rationale: <why this belongs in approved atoms>
    constraints: <optional: version constraints or notes>

```

Fail-closed rule: if any required field is missing, stop and emit a feedback packet rather than guessing.

## Feedback packet location

When using helper skills, write feedback packets to:

- `reference_architectures/<name>/feedback_packets/BP-YYYYMMDD-add-approved-tech-<slug>.md`

---

## Hard requirements (fail-closed invariants)

1. **Catalog integrity:** every Technology Profile Catalog entry must be expressible using only:
   - `architecture_library/phase_8/86_phase_8_approved_technology_atoms_schema_v1.yaml`
2. **Scaffolding consistency:** the companion repo scaffold and any generated skills must follow Phase 8 naming/layout conventions:
   - `architecture_library/phase_8/82_phase_8_directory_and_naming_conventions_v1.md`

---

## Procedure

### Step 1 — Define what you are adding (atoms vs profile)

Write down the intent in one sentence:

- “Add a new approved technology atom value for ____ (category: ____)”

### Step 2 — If needed: extend approved technology atoms

Edit:

- `architecture_library/phase_8/86_phase_8_approved_technology_atoms_schema_v1.yaml`

Rules:

- Prefer adding to existing enums rather than inventing new free-form fields.
- Keep values short, snake_case, and semantically unambiguous.

Rules:

- Adding a new enum value is preferred over adding a new free-form field.

### Step 3 — Validate end-to-end

Run the standard Phase 8 validation flow:

- run `/caf saas <name>` to scaffold a reference architecture
- pin the atom
- run readiness validation

If anything fails, produce a fail-closed feedback packet that points to:

- the exact file(s) and line(s) to fix
- the exact rule that failed

---
