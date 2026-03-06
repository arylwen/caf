---
name: caf-meta
description: >
  CAF library maintenance surface. Provides intentional audit + bounded maintainer edits.
  This is a maintainer command; it MUST NOT mutate instance artifacts.
status: active
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.

# /caf-meta

## Subcommands

- `/caf-meta help`
- `/caf-meta audit <command|csv|all>`
- `/caf-meta score-playbook <instance_name>`
- `/caf-meta add-atom <atom_path> <atom_value>`
- `/caf-meta add-skill <capability_id> [worker_id]`

## help

Print the available subcommands and stop.

## audit (heavy; intentional)

Run the deterministic audit wrapper:

- `node tools/caf-meta/caf_meta_audit_v1.mjs audit <command|csv|all>`

Notes:
- Audits write under `architecture_library/__meta/caf_library__evals/audits/`.
- This is intentionally not auto-run.

## score-playbook

Score a specific playbook instance deterministically:

- `node tools/caf-meta/score_playbook_v1.mjs <instance_name>`

Writes:
- `architecture_library/__meta/caf_library__evals/playbook_scores/<instance>/score_playbook_v1.md`

Rules:
- This is read-only on instances (except writing the score report under __meta).
- No edits to the instance outputs.

## add-atom

Add a new approved technology atom value to the Phase 8 approved atoms schema.

Usage:

- `/caf-meta add-atom <atom_path> <atom_value>`

Where:
- `atom_path` is one of:
  - `providers`
  - `runtimes.languages`
  - `runtimes.frameworks`
  - `persistence.orms`
  - `databases`
  - `deployments.modes`
  - `deployments.targets`
  - `iac_tools`
  - `ci_systems`
  - `observability_postures`

Procedure (mechanical; fail-closed on ambiguity):

1) Validate inputs:
   - `atom_value` must be a lowercase token using `[a-z][a-z0-9_]*`.
2) Edit:
   - `architecture_library/phase_8/86_phase_8_approved_technology_atoms_schema_v1.yaml`
   - Find the `enum:` list for the given `atom_path`.
   - If `atom_value` already exists, stop (idempotent; no changes).
   - Otherwise, add it to the enum list (keep existing quoting + style).
3) Do not change any other schema structure.

## add-skill

Scaffold a new worker skill for a capability, and register it in the worker capability catalog.

Usage:

- `/caf-meta add-skill <capability_id> [worker_id]`

Defaults:
- If `worker_id` is omitted, default to: `worker-<capability_id>` with `_` replaced by `-`.

Procedure (mechanical; no application code; fail-closed on conflicts):

1) Determine `worker_id` (explicit arg or default).
2) Update catalog (deterministic):
   - Open: `architecture_library/phase_8/80_phase_8_worker_capability_catalog_v1.yaml`
   - If an entry exists for `capability_id`:
     - Require `worker_id` matches (fail-closed on conflicts)
     - Ensure `status: active`
   - Else append a new entry:
     - `capability_id: <capability_id>`
     - `worker_id: <worker_id>`
     - `role_kind: worker`
     - `status: active`
3) Scaffold skills (both packs):
   - Create:
     - `skills/<worker_id>/SKILL.md`
     - `skills_portable/<worker_id>/SKILL.md`
   - Use the minimal skeleton below (fill in placeholders, keep scope bounded):

Skeleton (minimal; overwrite=true if file missing or clearly empty stub):

- YAML header:
  - `name: <worker_id>`
  - `description: Worker for <capability_id>`
  - `status: active`
- Sections (required):
  - `## Capabilities` (list only `<capability_id>`)
  - `## Inputs` (describe expected task graph fields at a high level)
  - `## Outputs` (paths must be under allowed CAF write roots)
  - `## Acceptance Checks` (objective, checkable)
  - `## Fail-closed conditions`

Rules:
- Do not modify `architecture_library/__meta/caf_operating_contract_v1.md`.
- Do not touch instance artifacts (`reference_architectures/**`, `companion_repositories/**`).
- Do not invent capabilities beyond the one requested.
