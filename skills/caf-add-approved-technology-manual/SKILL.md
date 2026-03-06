---
name: caf-add-approved-technology-manual
description: >
  Propose (and optionally materialize) CAF changes to add approved technology atoms and/or platform-pin enum updates (technology atoms) from an explicit
  author-provided manifest. No web lookup. Fail-closed if required fields are missing.
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.


# caf-add-approved-technology-manual

## Purpose
Add a new approved technology **without web research** by requiring an explicit author-provided manifest.
This is the safe path for internal/niche/poorly documented technologies.

Instruction-only; no scripts.

## Inputs
Required:
- A **Technology addition request manifest** (YAML), provided either:
  - as a file path in the repo, or
  - as inline YAML text

The manifest format is defined in:
- `architecture_library/phase_8/88_phase_8_add_approved_technology_atom_v1.md`

## Source of truth (local files)

NOTE: CAF no longer uses a technology-profile catalog for technology selection.
Pinning happens via **platform pins (technology atoms)** + TBPs.

- `architecture_library/phase_8/86_phase_8_approved_technology_atoms_schema_v1.yaml`
- `architecture_library/phase_8/84_phase_8_profile_parameters_schema_v1.yaml` (platform pin enums)
- `architecture_library/phase_8/99_phase_8_technology_atom_capabilities_v1.yaml` (atom → capability mapping)
- TBP catalog/manifests under `architecture_library/phase_8/tbp/` (when adding stack bindings)

## Procedure

### Step 1 — Parse and validate the manifest
Fail-closed if any of the following are missing when required by `kind`:
- request_id
- kind
- atoms[*] fields (when kind includes approved_atom)
- platform pin fields (when kind includes platform_pins)
- runbook.local_run_command + runbook.generated_paths (when scaffolding changes are implied)

### Step 2 — Determine required CAF edits
Based on the manifest:
- if atoms are added:
  - propose exact enum additions to the atoms schema
  - propose any matching enum additions to the platform pin schema (profile parameters)
- if platform pin support is added:
  - propose updates to pin enums and/or a new profile template (copy-and-modify where possible)

### Step 3 — Catalog integrity checks
Verify every referenced platform pin value is either:
- already present in the approved atoms schema, or
- being added by the same manifest

If not, fail-closed and list the missing atom values.

### Step 4 — Output patches or feedback packet
If all checks pass:
- output a patch plan and suggested diffs
If any check fails:
- output a feedback packet describing:
  - missing fields
  - inconsistent atom usage
  - required file edits

## Feedback packet (always)

Write a feedback packet to:
- `reference_architectures/<name>/feedback_packets/BP-YYYYMMDD-add-approved-tech-<slug>.md`

Minimum fields:
- Decision (`PROPOSE_PATCH` | `FAIL_CLOSED`)
- Stuck At
- Required Capability
- Observed Constraint
- Gap Type (Missing input | Spec inconsistency)
- Minimal Fix Proposal
- Evidence (cite local files/paths; do not use web sources)

Do not print the feedback packet contents in chat.

If the decision is `PROPOSE_PATCH`, include suggested diffs (unified diff preferred) for the exact files to edit.
