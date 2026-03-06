---
name: caf-companion-init
description: >
  Initialize a minimal Phase 8 companion repository target for a reference architecture instance
  using companion_repo_target from guardrails/profile_parameters_resolved.yaml.
  Fail-closed; write feedback packets to disk.
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.

> **Tools guardrail:** During routed workflows, treat `tools/**` as read-only. Do NOT modify scripts or other producer surfaces (`skills/**`, `architecture_library/**`) while executing this command. If a change seems required, fail-closed with a feedback packet describing the needed producer-side fix.


# caf-companion-init

## Purpose

Create the **companion repository target** at the path derived and pinned in:
- `reference_architectures/<name>/spec/guardrails/profile_parameters_resolved.yaml` -> `companion_repo_target`

This skill intentionally creates a **minimal target**.

It creates only:
- the target directory
- two seed files: `AGENTS.md`, `README.md`

All other subtrees (e.g., `caf/`, `architecture/`, code folders) are created on demand by downstream skills and workers.

This skill must not generate runnable production code.

## Inputs

- instance_name (required): folder name under `reference_architectures/` (kebab-case or snake_case)
- overwrite (optional, default: false)

## Authoritative inputs

Required:
- `reference_architectures/<name>/spec/guardrails/profile_parameters_resolved.yaml`

Reference-only:
- `architecture_library/phase_8/82_phase_8_directory_and_naming_conventions_v1.md`
- `architecture_library/09_contura_instance_derivation_process_6_to_8_v1b2.md`
## Artifacts

Creates (or validates) the directory pinned by:
- `companion_repo_target`

Within that directory, creates only:
- `AGENTS.md`
- `README.md`

No other files or directories are created by this skill.

## Seed files (static, auditable)

Use only:
- `skills/caf-companion-init/templates/AGENTS.md`
- `skills/caf-companion-init/templates/README.md`

## Allowed substitutions (token-based only)

You may only replace these tokens in the seed files:
- `{{INSTANCE_NAME}}`
- `{{PROFILE_VERSION}}`
- `{{COMPANION_REPO_TARGET}}`
- `{{DATE_YYYY_MM_DD}}`

No other replacements are permitted.

## Fail-closed preconditions

Before writing any artifacts:

1) Validate `instance_name` format matches:
   `^[a-z][a-z0-9]*(?:[-_][a-z0-9]+)*$`

2) Validate required input exists:
   - `reference_architectures/<name>/spec/guardrails/profile_parameters_resolved.yaml`

3) Parse `profile_parameters_resolved.yaml` as YAML and require:
   - `instance_name` equals `<name>`
   - `profile_version` is a non-empty string
   - `companion_repo_target` is a non-empty string
   - `lifecycle.allowed_write_paths` is a non-empty list

4) Require `companion_repo_target` is within the derived write boundary:
   - Normalize both paths before checking:
     - treat path separators as `/`
     - ensure each `allowed_write_path` ends with `/`
     - ensure `companion_repo_target` ends with `/` for the comparison only
   - Then require that `companion_repo_target` has a prefix matching one of the normalized `lifecycle.allowed_write_paths`.
   - Accept the common case where the policy matrix lists a trailing `/` but the target omits it.

5) Reject obvious placeholders in these required fields:
   - instance_name, profile_version, companion_repo_target
   Reject if they contain: `TBD`, `TODO`, `UNKNOWN`, `{{...}}`, `<...>`

6) Safety path constraint (hard rule):
   - `companion_repo_target` MUST start with `companion_repositories/`
   - it MUST NOT contain `..` path segments

7) Overwrite policy:
   - If overwrite=false:
     - The skill MUST be rerunnable and MUST NOT require manual deletion.
     - If the target directory exists (empty or non-empty): proceed.
     - For seed files, if a file already exists at the target path, do NOT modify it.
       (Preserve human edits and prior CAF runs.)
   - If overwrite=true:
     - Proceed even if the target directory exists.
     - Seed files MAY be replaced (overwritten) at their target paths.

If any precondition fails: write a feedback packet and stop.

## Feedback packet (on failure)

Write a feedback packet to:
- `reference_architectures/<name>/feedback_packets/BP-YYYYMMDD-<slug>.md`

Minimum fields:
- Stuck At
- Required Capability
- Observed Constraint
- Gap Type (Missing input | Spec inconsistency)
- Minimal Fix Proposal
- Evidence

Do not print the feedback packet contents in chat.

## Deterministic generation procedure

### Preferred scripted path (token-saver; mechanical only)

If `node` is available and the helper exists at:

- `tools/caf/companion_init_v1.mjs`

Then run it to perform the initialization mechanically:

- `node tools/caf/companion_init_v1.mjs <instance_name> [--overwrite]`

Constraints:
- Do **not** print the command invocation.
- Do **not** open/read template contents unless the script fails.
- After the script completes successfully, verify the target directory exists and that seed files exist.

If the script fails and wrote a feedback packet under the instance, do not print its contents.

### No portable fallback in this skillpack (fail-closed)

If the helper cannot be invoked in your environment, STOP and write a feedback packet requesting the instruction-only skillpack (or restore the helper).

## Success output constraints

On success, print only:
- One line: `Initialized minimal companion repository target at <companion_repo_target>`
- Then the list of paths created (paths only)

Never print “Next steps”.
Never echo file contents.
