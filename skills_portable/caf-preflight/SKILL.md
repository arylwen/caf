---
name: caf-preflight
description: >
  Environment preflight for a CAF reference architecture instance.
  Checks local toolchain prerequisites needed to run candidate enforcement checks (tests/smoke) and
  prevents thrash. Instruction-only: no scripts.
  Fail-closed; write feedback packets to disk.
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.


# caf-preflight

## Purpose

Prevent wasted iteration when local prerequisites are missing (e.g., missing container runtime, missing language toolchain).

Rule: treat any technology/tooling requirement as **disallowed unless pinned by platform pins (technology atoms)** in the guardrails.

This skill performs a **deterministic, fail-closed** preflight based on:

- `reference_architectures/<name>/spec/guardrails/profile_parameters_resolved.yaml` (derived view)
  - `platform spine pins (infra_target/packaging/runtime_language/database_engine)`
  - `lifecycle.generation_phase`
  - `runnable_code_approved`
  - `candidate_enforcement_bar.test_policy`
  - `candidate_enforcement_bar.runnable_policy` (if present)
- `architecture_library/phase_8/99_phase_8_technology_atom_capabilities_v1.yaml` (platform-pin technology atoms → capability mapping + probes)

Preflight is required only when the derived **candidate enforcement bar** requires executing tests/smoke/contract checks, or when the bar declares runnable-entrypoint requirements.

## Inputs (fail-closed)

- `instance_name` (the reference architecture instance folder name)

## Authoritative inputs (fail-closed)

Read:

1) Derived view
- `reference_architectures/<name>/spec/guardrails/profile_parameters_resolved.yaml`

2) Platform pins (technology atoms) capability mapping (YAML)
- `architecture_library/phase_8/99_phase_8_technology_atom_capabilities_v1.yaml`

3) (Optional) Syntactic check probes registry (YAML)
- `architecture_library/phase_8/83_phase_8_syntactic_checks_registry_v1.yaml`

- `architecture_library/phase_8/99_phase_8_technology_atom_capabilities_v1.yaml`

## Preconditions (fail-closed)

1) Validate `reference_architectures/<name>/` exists.
2) Validate derived view exists at:
   - `reference_architectures/<name>/spec/guardrails/profile_parameters_resolved.yaml`

## What to check (deterministic)

### A) Determine whether preflight is required

1) Read from the derived view:
   - `candidate_enforcement_bar.test_policy.require_unit`
   - `candidate_enforcement_bar.test_policy.require_smoke`
   - `candidate_enforcement_bar.test_policy.require_contract`
   - `candidate_enforcement_bar.runnable_policy` (if present)

2) If all of these are true:
   - `require_unit == false`
   - `require_smoke == false`
   - `require_contract == false`
   - and `runnable_policy` is missing (or does not require an executable entrypoint)

Then exit successfully (no preflight required for this run).

### B) Determine required toolchain capabilities

Toolchain requirements are derived from:
- the pinned platform spine (`platform spine pins (infra_target/packaging/runtime_language/database_engine)`)
- the the atom→capability mapping catalog
- the atom→capability mapping catalog (for **staleness validation** and probe definitions)
- the current `lifecycle.generation_phase` and the derived enforcement bar (to decide which capabilities are activated for this run)

#### B1) Load pinned platform pins (technology atoms) and compute the base capability set (fail-closed)

1) Read platform pins (technology atoms) from:
   - `reference_architectures/<instance_name>/spec/guardrails/profile_parameters_resolved.yaml`

   Required pins:
   - `platform.infra_target`
   - `platform.packaging`
   - `platform.runtime_language`
   - `platform.database_engine`

2) Load the atom→capability mapping catalog (authoritative):
   - `architecture_library/phase_8/99_phase_8_technology_atom_capabilities_v1.yaml`

3) Compute `base_caps` deterministically from the pinned atoms using the catalog rules.

Fail-closed if any pinned atom is unknown to the catalog **and** no deterministic default exists.
- Minimal fix: extend the catalog mapping (and/or the approved atoms/schema) for the missing atom, then rerun `caf-preflight`.

#### B2) Validate the capability mapping is complete for this run (fail-closed)

For each capability in `base_caps`:
- Fail-closed if the catalog does not define a probe (or deterministic check) for that capability.

Rationale: preflight is mechanical; if CAF cannot probe a required capability deterministically, it must stop rather than guess.

#### B3) Compute the effective capability set for this run (phase + bar activated)

1) Read from the derived view:
- `lifecycle.generation_phase`
- `candidate_enforcement_bar.test_policy` (`require_unit`, `require_smoke`, `require_contract`)
- `candidate_enforcement_bar.runnable_policy` (if present)

2) If **no execution** is required by the enforcement bar:
- If all of these are false/missing:
  - `require_unit == false`
  - `require_smoke == false`
  - `require_contract == false`
  - and the bar indicates no runnable entrypoint requirement (or runnable policy is absent)
then:
- exit successfully (no probes required for this run).

3) Otherwise, start from the computed base set:
- `effective_caps = base_caps`

4) Phase-gate IaC / provider CLI checks (deterministic, no pack-id heuristics):
- If `lifecycle.generation_phase` is **not** one of:
  - `pre_production`
  - `production_hardening`
then remove these capabilities from `effective_caps` (if present):
- `terraform_available`
- `aws_cli_available`
- `gcloud_cli_available`
- `azure_cli_available`

Rationale: early phases should not thrash on cloud/IaC tooling unless the phase is explicitly about integration/hardening.

The resulting `effective_caps` is the capability set that must be satisfied by the environment probes in this run.


### Minimal fix guidance (v1)

- If `caf-preflight` fails due to an unknown pinned platform atom:
  - Add the atom to the approved atoms/schema (if applicable), and
  - Extend `99_phase_8_technology_atom_capabilities_v1.yaml` with deterministic capability/probe mappings for that atom.

- If `caf-preflight` fails due to a missing probe for a required capability:
  - Extend `99_phase_8_technology_atom_capabilities_v1.yaml` to include a probe definition for that capability.

- If Python is missing, recommend setting `CAF_PYTHON_CMD` (examples):
  - `export CAF_PYTHON_CMD="python3"`
  - `export CAF_PYTHON_CMD="conda run -n <env> python"`
  - `export CAF_PYTHON_CMD="/absolute/path/to/python"`

Runner-specific configuration references (documentation only):
- Antigravity: `.agent/runtime/runtime_environment.md`
- Codex: `.codex/runtime/runtime_environment.md`

Note: these are environment variables; setting values in a markdown file does not change the runtime environment.

- If Docker/Podman is missing, recommend installing the runtime and ensuring the command is on PATH.

Do not proceed to candidate generation when preflight fails.


## Success output constraints

On success, print only:
- One line: `Preflight OK for <instance_name>`

Never print “Next steps”.
Never echo file contents.
