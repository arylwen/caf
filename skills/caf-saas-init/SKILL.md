> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.

> **Tools guardrail:** During routed workflows, treat `tools/**` as read-only. Do NOT modify scripts or other producer surfaces (`skills/**`, `architecture_library/**`) while executing this command. If a change seems required, fail-closed with a feedback packet describing the needed producer-side fix.

=============================================================================
FILE: skills/caf-saas-init/SKILL.md
=============================================================================
---
name: caf-saas-init
description: >
  Initialize a reference architecture instance by copying Phase 8 profile template inputs into
  spec/playbook and spec/guardrails. Optionally seed a fully-filled PRD sample if provided by the
  selected profile template pack. Fail-closed; write feedback packets to disk.
---

# caf-saas-init

## Purpose

Create:

- `reference_architectures` if it does not exist
- `reference_architectures/<instance_name>/spec/playbook/`
- `reference_architectures/<instance_name>/spec/guardrails/`
- `reference_architectures/<instance_name>/spec/caf_meta/`
- `reference_architectures/<instance_name>/spec/playbook/`
- `reference_architectures/<instance_name>/feedback_packets/`

Then copy **ONLY** the YAML template files from:

- `architecture_library/phase_8/profile_templates/<profile_template_id>/`

into the instance, applying only minimal safe substitutions.

If the selected profile template pack includes fully-filled PRD samples, seed them:

- Product PRD sample (PM-owned):
  - source: `architecture_library/phase_8/profile_templates/<profile_template_id>/prd_v1.sample.md`
  - destination: `reference_architectures/<instance_name>/product/PRD.md`

- Platform posture brief sample (architect-owned; file name is stable):
  - source: `architecture_library/phase_8/profile_templates/<profile_template_id>/platform_prd_v1.sample.md`
  - destination: `reference_architectures/<instance_name>/product/PLATFORM_PRD.md`

These seeds are mechanical only and must pass CAF placeholder hygiene (no `<`, TBD, TODO, UNKNOWN).

## Inputs

- instance_name (required)
- profile_template_id (required)
- overwrite (optional, default: false)

## Authoritative sources (must exist)

- `architecture_library/phase_8/profile_templates/<profile_template_id>/architecture_shape_parameters_template_v1.yaml`
- `architecture_library/phase_8/profile_templates/<profile_template_id>/profile_parameters_template_v1.yaml`

## Optional sources (copied only if present)

- `architecture_library/phase_8/profile_templates/<profile_template_id>/prd_v1.sample.md`
- `architecture_library/phase_8/profile_templates/<profile_template_id>/platform_prd_v1.sample.md`

## Outputs

- `reference_architectures/<instance_name>/spec/playbook/architecture_shape_parameters.yaml`
- `reference_architectures/<instance_name>/spec/guardrails/profile_parameters.yaml`

If optional PRD samples exist:

- `reference_architectures/<instance_name>/product/PRD.md`
- `reference_architectures/<instance_name>/product/PLATFORM_PRD.md`

## Minimal safe substitutions (instance-name only)

Allowed substitutions are strict, literal string replacements:

### Playbook file substitutions
- Replace `{{instance_name}}` with `<instance_name>` if present.
- Replace `"intentionally_boring_saas"` with `<instance_name>` if present.
  (This is a compatibility shim for older templates that accidentally hard-code the example name.)

Do NOT insert or synthesize timestamps.

After performing the allowed substitutions above, run a strict placeholder scan:
- If any placeholder token of the form `<...>` remains anywhere in either destination file,
  FAIL-CLOSED and emit a feedback packet. Do NOT guess replacement values.

No other replacements are permitted.

### Guardrails file substitutions
- Replace `<REFERENCE_ARCHITECTURE_NAME>` with `<instance_name>` if present.
- Replace `<name>` with `<instance_name>` if present.
- Replace `{{instance_name}}` with `<instance_name>` if present.

### Guardrails metadata defaults (deterministic, safe)

If the template includes optional `meta` fields with empty-string values, fill them with deterministic, non-empty defaults:

- Replace `change_reason: ""` with `change_reason: "initial_instance_creation"` if present.
- Replace `notes: ""` with `notes: "Initialized by caf-saas-init."` if present.

No other replacements are permitted.

## Preconditions (fail-closed)

Before creating anything:

1) Validate instance_name and profile_template_id match:
   `^[a-z][a-z0-9]*(?:[-_][a-z0-9]+)*$`

2) Validate both source YAML files exist exactly at the authoritative paths.

3) If overwrite=false:
   - Fail if either destination file already exists.

If any precondition fails: do not create directories or files.

## Procedure

### Preferred scripted path (token-saver; mechanical only)

If `node` is available and the helper exists at:

- `tools/caf/seed_saas_v1.mjs`

Then run it to perform the initialization mechanically:

- `node tools/caf/seed_saas_v1.mjs <instance_name> <profile_template_id> [--overwrite]`

Constraints:
- Do **not** print the command invocation.
- Do **not** open/read template YAML contents unless the script fails.
- After the script completes successfully, verify the two destination files exist.

If the script fails and wrote a feedback packet under the instance, do not print its contents.

### No portable fallback in this skillpack (fail-closed)

If the helper cannot be invoked in your environment, STOP and write a feedback packet requesting the instruction-only skillpack (or restore the helper).

## Success output constraints

On success, print the following (in order). After that, append the required Next steps section below:

- `Initialized reference_architectures/<instance_name>`
- The two destination file paths (paths only)

Never print runtime commands.
Never echo template contents.


## Next steps (required)
After initialization, include a short 'Next steps' section that:
- tells the user the seeded shape is only the bootstrap default, not the final lifecycle-ready shape
- tells the user to run `/caf prd <instance_name>` before the first `/caf arch <instance_name>` in the default workflow
- keeps the normal user guidance command-only: `/caf prd <instance_name>` before the first `/caf arch <instance_name>`
Do NOT include concrete command examples beyond the exact `/caf ...` router surface.
