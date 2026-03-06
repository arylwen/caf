---
name: caf-validate
description: >
  Basic, instruction-only structural validation (fail-closed) for a CAF reference architecture instance.
  Validator tasks may reference this capability as `structural_validation`.
---

# caf-validate

## Goal

Provide a minimal, deterministic, **fail-closed** validation pass for an instance:

- pinned inputs exist and do not contain obvious placeholders
- resolved TBP extension obligations are reflected in `pattern_obligations_v1.yaml`
- every obligation in `pattern_obligations_v1.yaml` is trace-anchored by at least one task in `task_graph_v1.yaml`

This is instruction-only: **no scripts** and **no protocol blocks**.

## Inputs

- instance_name (required): folder name under `reference_architectures/` (kebab-case or snake_case)

## Authoritative sources (must exist)

Library:
- `architecture_library/09_contura_instance_derivation_process_6_to_8_v1b2.md`
- `architecture_library/06_contura_architecture_shape_parameters_schema_v1.yaml`
- `architecture_library/phase_8/84_phase_8_profile_parameters_schema_v1.yaml`

Instance (minimum):
- `reference_architectures/<name>/spec/playbook/architecture_shape_parameters.yaml`
- `reference_architectures/<name>/spec/guardrails/profile_parameters.yaml`

## Optional inputs (when present, validate; fail-closed on inconsistencies)

- `reference_architectures/<name>/spec/guardrails/tbp_resolution_v1.yaml`
- `reference_architectures/<name>/design/playbook/pattern_obligations_v1.yaml`
- `reference_architectures/<name>/design/playbook/task_graph_v1.yaml`

## Procedure

1) Validate instance_name format matches:
   `^[a-z][a-z0-9]*(?:[-_][a-z0-9]+)*$`

2) Check presence of pinned inputs:
   - `reference_architectures/<name>/spec/playbook/architecture_shape_parameters.yaml`
   - `reference_architectures/<name>/spec/guardrails/profile_parameters.yaml`

3) Check for obvious placeholders in both pinned files (fail-closed if any):
   - `TBD`, `TODO`, `UNKNOWN` (case-insensitive)
   - `{{...}}` token fragments
   - `<...>` placeholder fragments

4) If `tbp_resolution_v1.yaml` exists AND `pattern_obligations_v1.yaml` exists:

   4.1) Collect `resolved_tbps[]` from `tbp_resolution_v1.yaml`.

   4.2) For each `tbp_id` in `resolved_tbps`:
   - Open `architecture_library/phase_8/tbp/atoms/<tbp_id>/tbp_manifest_v1.yaml` if it exists.
   - Collect `extensions.obligations[].obligation_id` (if any).

   4.3) Collect all obligation ids present in `pattern_obligations_v1.yaml`:
   - include both pattern obligations and TBP obligations (e.g. `O-TBP-...`).

   4.4) Fail-closed if any TBP extension obligation_id from 4.2 is missing from 4.3.

5) If `pattern_obligations_v1.yaml` exists AND `task_graph_v1.yaml` exists:

   5.1) Collect all obligation ids from `pattern_obligations_v1.yaml`.

   5.2) Collect all trace-anchored obligation references from `task_graph_v1.yaml`:
   - any `tasks[].trace_anchors[].pattern_id` that starts with `pattern_obligation_id:`

   5.3) Fail-closed if any obligation id from 5.1 is not referenced by at least one task trace anchor.

6) On any failure, write a feedback packet and stop.

7) On success, print a short success summary (1–3 lines):
   - instance_name
   - which optional validations were executed (tbp coverage, trace-anchor coverage)

## Feedback packet (on failure)

Write a feedback packet to:

- `reference_architectures/<name>/feedback_packets/BP-YYYYMMDD-validate-<slug>.md`

Minimum fields:
- Stuck At
- Required Capability (`structural_validation`)
- Observed Constraint
- Gap Type (Missing input | Missing mapping | Spec inconsistency)
- Minimal Fix Proposal
- Evidence

Do not print the feedback packet contents in chat.

## Output constraints

- Never print protocol blocks.
- Never echo file contents.
