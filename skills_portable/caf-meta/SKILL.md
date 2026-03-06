---
name: caf-meta
description: >
  Portable CAF meta command surface (instruction-only).
  Must not run scripts in this mode.
status: active
---

# /caf-meta (portable)

This command surface is **instruction-only**.

## Subcommands

- `/caf-meta help`
- `/caf-meta audit <command|csv|all>`
- `/caf-meta score-playbook <instance_name>`
- `/caf-meta add-atom <atom_path> <atom_value>`
- `/caf-meta add-skill <capability_id> [worker_id]`

## Behavior

- Do **not** run any scripts.
- Perform mechanical file edits only.

## audit / score-playbook (portable note)

In portable mode, do not run helpers.
Instead, explain which deterministic helper would be run in a scripted environment and where outputs would be written.

Scripted equivalents (non-portable):
- Audit wrapper: `tools/caf-meta/caf_meta_audit_v1.mjs`
  - writes under `architecture_library/__meta/caf_library__evals/audits/`
- Score playbook: `tools/caf-meta/score_playbook_v1.mjs`
  - writes under `architecture_library/__meta/caf_library__evals/playbook_scores/<instance>/`

## add-atom (portable)

Usage:

- `/caf-meta add-atom <atom_path> <atom_value>`

Where `atom_path` is one of:
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

Procedure (mechanical):

1) Validate `atom_value` uses `[a-z][a-z0-9_]*`.
2) Edit:
   - `architecture_library/phase_8/86_phase_8_approved_technology_atoms_schema_v1.yaml`
3) Locate the `enum:` list that matches `atom_path`.
4) If `atom_value` already exists, stop (idempotent).
5) Otherwise, add it to the `enum` list using the existing quoting/style.

## add-skill (portable)

Usage:

- `/caf-meta add-skill <capability_id> [worker_id]`

Defaults:
- If `worker_id` is omitted, use: `worker-<capability_id>` with `_` replaced by `-`.

Procedure (mechanical; no scripts):

1) Update catalog:
   - `architecture_library/phase_8/80_phase_8_worker_capability_catalog_v1.yaml`
   - If `capability_id` exists, require `worker_id` matches (fail-closed on conflicts).
   - Else append a new entry with:
     - `capability_id`, `worker_id`, `role_kind: worker`, `status: active`
2) Create skill skeletons:
   - `skills/<worker_id>/SKILL.md`
   - `skills_portable/<worker_id>/SKILL.md`

Skeleton must include:
- YAML header (`name`, `description`, `status`)
- `## Capabilities`
- `## Inputs`
- `## Outputs`
- `## Acceptance Checks`
- `## Fail-closed conditions`

Rules:
- Do not modify `architecture_library/__meta/caf_operating_contract_v1.md`.
- Do not touch instance artifacts.
