---
name: worker-policy
description: >
  Worker skill that implements the policy_enforcement capability. It scaffolds a minimal, coherent
  policy surface (CP) and policy consumption/enforcement (AP) aligned to the Task Graph Definition of Done.
  Scaffolding-only and bounded to companion repo write rails.
status: active
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.


# worker-policy

## Capabilities

- policy_enforcement

## Supported task signatures

This worker MUST accept Make-Skill requests for the following Task Graph task_ids:

Canonical combined policy task:

- `TG-35-policy-enforcement-core`

Legacy compatibility task_ids (still accepted for older throwaway instances):

- `TG-00-CP-policy-surface`
- `TG-00-AP-policy-enforcement`
- `TG-00-AP-auth-mode`

If invoked for any other task_id, refuse (fail-closed) and write a feedback packet.

## Inputs

Required (copied into companion repo by `caf-build-candidate` Step 0):

- `caf/profile_parameters_resolved.yaml`
- `caf/application_spec_v1.md`
- `caf/task_graph_v1.yaml` (for context and trace anchors)

Optional (if present, use for grounding; do not invent):

- `caf/application_design_v1.md`
- `caf/control_plane_design_v1.md`
- `caf/contract_declarations_v1.yaml`

## What to produce (semantic)

This skill is **Definition-of-Done driven**. Do NOT rely on deterministic output paths.

Implement the smallest coherent scaffolding that satisfies the task's `definition_of_done`.

Task-shape semantics:

- For canonical `TG-35-policy-enforcement-core`, implement the combined policy slice in one task:
  - CP policy surface semantics that AP can consult (even if stubbed),
  - AP policy enforcement hooks at request/workflow boundaries,
  - auth/identity binding that supplies principal + tenant context, and
  - explicit tenant-context precedence / conflict rejection behavior.
- For legacy split task_ids, implement only the slice named by that task while keeping outputs compatible with later consolidation into the combined policy slice.

Constraints:

- Do not introduce new architectural choices. Follow pins + adopted choice points.
- Keep implementation minimal but coherent (no "README-only" completion).
- Ensure any examples are realistic and do not contain placeholders (TBD/TODO/...).
- When implementing the canonical combined task, do not split responsibility back into multiple pseudo-tasks; produce one coherent policy/auth/context slice and report it under the requested `task_id`.
- Read `caf/profile_parameters_resolved.yaml` and the task's managed DoD / semantic-review lines; if they make the selected auth contract explicit, realize that contract verbatim rather than collapsing it into generic policy prose.
- When the task carries a managed claim-bearing or carrier-precedence contract, keep that contract explicit across AP/CP policy seams and treat alternate carriers only according to the declared conflict rule.

## Task report (required)

After completing the task, you MUST write a task report to:

- `<companion_repo_target>/caf/task_reports/<task_id>.md`

The report MUST include:

- Summary of work performed
- Files created/modified (repo-relative paths)
- How to validate (no scripts required; describe what to run or inspect)
- Known limitations / follow-ups

## Fail-closed conditions

- Refuse if any intended write is outside the derived allowed write paths for the instance.
- Refuse if any artifact class you would create is not allowed by guardrails.
- Refuse if any forbidden action would be violated.
- Refuse if the task's Definition of Done cannot be satisfied without inventing missing inputs.
