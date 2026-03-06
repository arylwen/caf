---
name: drift-eval-caf
description: >
  Evaluate semantic drift of the CAF framework itself (docs/schemas/library assets/meta indexes/skills/shims).
  Fail-closed: if any drift is detected, stop and write a feedback packet to disk (do not guess).
  Instruction-only: no scripts.
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.


# drift-eval-caf

## Purpose

Detect and report **CAF framework drift** (CAF library + scaffolding that produces instances). This is a
**repo-scoped** evaluator that validates the internal coherence of:

- `architecture_library/**` (normative docs, schemas, catalogs, producer-owned library assets)
- `skills/**` (runner-neutral skills)
- `.agent/workflows/**` (runner shims; must stay thin)
- `.codex/skills/**` (runner shims; must stay thin)
- meta indexes under `architecture_library/__meta/**`

This skill is **fail-closed**:
- If drift is detected: write a feedback packet to `technical_notes/feedback_packets/` and stop.
- If no drift: print a single-line success message.

Do **not** print packet contents.

## Inputs

User may invoke:
- `drift-eval-caf`
- `drift-eval-caf <optional freeform note>`

Treat any extra text as a note to include in the feedback packet header (optional).

## Output

Exactly one of:

A) **No drift**
- Print: `CAF drift-eval: PASS (no drift detected).`

B) **Drift detected (fail-closed)**
- Write a feedback packet:
  - `technical_notes/feedback_packets/BP-YYYYMMDD-drift-eval-caf.md`
- Print only:
  - `CAF drift-eval: FAIL (feedback packet written to <path>).`

## Feedback packet format (required)

Write markdown with this structure:

# Feedback Packet: BP-YYYYMMDD-drift-eval-caf

- Stuck At: CAF Framework Drift Evaluation
- Required Capability: Internal coherence across library/indexes/schemas/seed-artifacts/skills/shims
- Observed Constraint: <one-line summary>
- Drift Band: Misaligned (framework)
- Minimal Fix Proposal: <one-line>
- Notes: <optional user note>

## Findings (one subsection per finding)

### F-001: <title>
- Severity: ship_blocker | high | medium | low
- Observed: <what is wrong>
- Why it matters: <impact>
- Minimal fix: <smallest change>
- Evidence:
  - `<path>:Lx-Ly` (include multiple lines if needed)

## Checks (must run all)

### 1) Meta index integrity (ship blocker)
Validate that every `path:` listed in:
- `architecture_library/__meta/contura_phase_index_v1.yaml`
- `architecture_library/__meta/contura_artifact_index_v1.yaml`

exists on disk **relative to `architecture_library/`**.

Also validate:
- no duplicate `path:` entries in the artifact index
- every Phase entry references only paths present in the artifact index (or explicitly documented exceptions)

If any failure: drift.

### 2) Merge-conflict marker scan (ship blocker)
Search for any of these markers in **all tracked markdown/yaml** under the repo:
- `<<<<<<<`
- `=======`
- `>>>>>>>`

If found anywhere: drift.

### 3) Placeholder / elision drift (ship blocker)
Flag placeholders like `<...>` in any file under:
- `architecture_library/**`
- `skills/**`
- `.agent/workflows/**`
- `.codex/skills/**`
- `technical_notes/**`

**Allowed placeholder locations (only):**
- files with `template` in the filename
- `architecture_library/phase_8/profile_templates/**`

If a placeholder appears outside allowed locations: drift.

### 3b) Runner adapter shim-only integrity (ship blocker)
Validate that runner adapter files are **shims only** (no CAF semantics duplicated):

Targets:
- `.codex/skills/**/SKILL.md`
- `.agent/workflows/**`

Minimum expectations:
- The file MAY start with YAML front matter (`--- ... ---`) containing only discovery metadata.
- The first non-frontmatter heading must be a single H1 (`# ...`).
- The file must reference the canonical skill path: `skills/<skill_name>/SKILL.md`.
- The file must not contain additional sections (no `##` headings).

Forbidden content (if any are found anywhere in an adapter file: drift):
- `## Purpose`, `## Inputs`, `## Output`, `## Procedure`, `## Checks`
- `Feedback packet`
- `CAF_MANAGED_BLOCK` / `ARCHITECT_EDIT_BLOCK` / `DESIGNER_` block markers
- `fail-closed` / `Fail-closed`
- `architecture_library/` references (adapters must not couple to the library)

Adapters MAY include YAML front matter (`--- ... ---`) for runner discovery.

If any adapter violates these expectations: drift.

### 3c) No TBD tokens in CAF fundamentals (ship blocker)

Search for the token `TBD` (whole-word match) in:

- `architecture_library/patterns/caf_v1/**`
- `architecture_library/phase_8/**`

Allowed locations (only):

- any file with `template` in the filename
- `architecture_library/phase_8/profile_templates/**`

If any match is found outside allowed locations: drift.


### 3d) CAF meta-pattern compliance (ship blocker)

Validate that CAF producer skills do **not** smuggle in canonical decision inventories or canonical option lists.
The inventory of decisions/options must be **library-owned** (pattern definitions under `architecture_library/patterns/caf_v1/**`
and meta-pattern guidance under `architecture_library/patterns/caf_meta_v1/**`).

Targets (producer skills):
- `skills/caf-solution-architect/SKILL.md`
- `skills/caf-system-architect/SKILL.md`
- `skills/caf-app-designer/SKILL.md`
- `skills/caf-platform-designer/SKILL.md`

Checks:

A) **No hardcoded inventories**
- Treat as drift if any target skill contains an explicit list item like:
  - `- decision_id:` (anywhere)
  - `- question_id:` (anywhere)
  - `decisions:` populated with `- ...` entries
  - `questions:` populated with fixed topic keys
Reason: this embeds a deterministic “decision cue table” in the skill.

B) **No canonical option lists in skills**
- Treat as drift if any target skill contains an explicit non-custom option id such as:
  - `option_id: auth_claim` / `path_segment` / `opaque_server_assigned` / etc.
- Skills may include **only** a `custom` option as a fallback example, and must state that all other options are copied from
  library-owned `caf.option_sets`.

C) **Skills must reference library-owned sourcing**
- Each target skill must explicitly instruct:
  - retrieve relevant patterns (grounded by adopted patterns / anchors)
  - copy `caf.option_sets` / `caf.human_questions` from pattern definitions verbatim
  - emit blocks **only when warranted** (or emit `{}` / empty lists when nothing is warranted)

If any failure: drift.

### 4) Phase 8 profile parameters coherence (high)
Validate that the UX schema + templates agree on the “3 knobs” contract:
- `architecture_library/phase_8/84_phase_8_profile_parameters_schema_v1.yaml`
- `architecture_library/phase_8/84_phase_8_profile_parameters_template_v1.yaml`
- `architecture_library/phase_8/profile_templates/**/profile_parameters_template_v1.yaml`

Minimum expectations:
- UX input contains only: metadata + `lifecycle.{evolution_stage,generation_phase}` + `platform spine pins (infra_target/packaging/runtime_language/database_engine)`
- UX does **not** contain derived rails or derived pack sets.

If contradictory requirements exist (schema requires fields templates omit, or vice versa): drift.

### 5) Policy matrix integrity (high)
Validate:
- `architecture_library/phase_8/90_phase_8_profile_derivation_policy_matrix_v1.yaml` exists.
- Every matrix row has a stable identifier (policy_id or equivalent).
- Matching keys are deterministic: no two rows are identical on match keys.

If not: drift.

Validate that each row's `derive:` object contains the minimum Phase 8 contract fields:

- `profile_version`
- `companion_repo_target_template`
- `runnable_code_approved`
- `refusal_posture`
- `lifecycle_rails.{allowed_artifact_classes,allowed_write_paths_template,forbidden_actions}`
- `candidate_enforcement_bar.{bar_id,test_policy,required_paths,placeholder_policy,runnable_policy}`

If any row omits a required field: drift.

### 6) TBP manifest layout integrity (high)

Validate that every TBP manifest under:

- `architecture_library/phase_8/tbp/atoms/**/tbp_manifest_v1.yaml`

declares a deterministic planning surface:

Minimum expectations (fail as drift if any are violated):

- The YAML parses and contains:
  - `schema_version: phase8_tbp_manifest_v1`
  - `tbp_id`
  - `binds_to` (may be empty)
- If `binds_to` is non-empty, the manifest MUST include:
  - `layout.scaffold_directories` (may be empty list)
  - `layout.role_bindings` (non-empty mapping)
- Each `layout.role_bindings.<role_name>` MUST include:
  - `path_template` (string)
  - `artifact_class` (string)

Reason: planners (especially `caf-application-architect`) must not invent file paths.
TBPs are the deterministic source of “where artifacts live” bindings.

### 7) Technology catalog integrity (high)
Validate:
- Any `platform pins` referenced by:
  - templates
  - policy matrix
is present in the tech catalog (or explicitly documented otherwise).

If not: drift.

### 8) Shims must be thin (medium)
Validate `.agent/workflows/**` and `.codex/skills/**`:
- shims should only open and read the corresponding `skills/**/SKILL.md` and follow it.
- shims must not contain CAF theory, policy, or long prose.

If a shim contains substantial policy logic: drift (medium).

## Non-negotiables

- Fail-closed: do not guess fixes; write a feedback packet.
- Do not print feedback packet contents.
- Do not print “Next steps”.
