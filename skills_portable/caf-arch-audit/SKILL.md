---
name: caf-arch-audit
description: >
  Expensive architecture governance run: forces Layer 7 regeneration and rechecks
  derived views and architecture documentation. Intended to be run sparingly.
  Instruction-only: no scripts. Fail-closed; write feedback packets to disk.
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.


# caf-arch-audit

## Purpose

Run a governance-focused audit for a CAF instance.

Compared to `caf-arch`, this command:

- Forces a full Layer 7 regeneration (ADRs + validation mapping), even if cache could have been used.
- Regenerates Layer 8 derived views.
- Refreshes the companion-repo architecture document set.

This command is intended to be run **sparingly** (e.g., when you want to explicitly re-check that
architecture documentation and derived views still match current pinned inputs and policies).

## Inputs

- instance_name (required): folder name under `reference_architectures/` (kebab-case or snake_case)

## Preconditions (fail-closed)

Before attempting any generation, require:

- `reference_architectures/<name>/spec/playbook/architecture_shape_parameters.yaml` exists
- `reference_architectures/<name>/spec/guardrails/profile_parameters.yaml` exists

If any requirement fails: write a feedback packet and stop.

## Procedure

1) Validate instance_name format matches:
   `^[a-z][a-z0-9]*(?:[-_][a-z0-9]+)*$`

2) Force regenerate Layer 7 bundle (governance refresh):

   - Follow: `skills/caf-layer7/SKILL.md`
   - Use:
     - `overwrite=true`
     - `force_regenerate=true`

3) Regenerate Layer 8 derived views:

   - Follow: `skills/caf-guardrails/SKILL.md`
   - Use `overwrite=true`.

4) Refresh design briefs (rerun-safe CAF-managed blocks only):

   If `lifecycle.generation_phase == implementation_scaffolding`:

   - Follow: `skills/caf-app-designer/SKILL.md` (overwrite=true)
   - Follow: `skills/caf-platform-designer/SKILL.md` (overwrite=true)

5) Refresh companion-repo architecture docs (cache-aware pipeline):

   - Follow: `skills/caf-arch-doc/SKILL.md`

## Feedback packet (on failure)

Write a feedback packet to:

- `reference_architectures/<name>/feedback_packets/BP-YYYYMMDD-arch-audit-<slug>.md`

Minimum fields:

- Stuck At
- Required Capability
- Observed Constraint
- Gap Type (Missing input | Spec inconsistency)
- Minimal Fix Proposal
- Evidence

Do not print the feedback packet contents in chat.

## Success output constraints

On success, print only:

- One line:
  `Completed CAF architecture audit for reference_architectures/<name>`

Never print “Next steps”.
Never echo file contents.
