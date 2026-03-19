---
name: worker-service-facade
description: >
  Worker skill that implements service_facade_implementation capability by generating a transport-free
  service facade per Task Graph. Bounded to companion repo write rails.
status: active
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.


# worker-service-facade

## Capabilities

- service_facade_implementation

## Inputs

Required (copied into companion repo by `caf-build-candidate` Step 0):
- `caf/application_spec_v1.md`

## Outputs

This worker is **task-driven**, not output-declaration-driven.

It supports any Task Graph task where:
- `required_capabilities` contains `service_facade_implementation`, and

- either:
  - `task_id` matches: `TG-30-service-facade-<resource_key>` (resource-scoped), or
  - `task_id` matches: `TG-10-OPTIONS-service_facade_implementation` (cross-cutting option task)

Deterministic resource extraction:

- If the task_id matches `TG-30-service-facade-<resource_key>`, parse `<resource_key>`.
- If the task_id matches `TG-10-OPTIONS-service_facade_implementation`, treat the task as cross-cutting and do not invent a resource key.
- Otherwise → fail closed.

Input discipline (required):
- You MUST open and use every `task.inputs[]` where `required: true`.
- In your task report, include an **Inputs consumed** section listing each required input and what you derived from it.
- You MUST treat `trace_anchors[]` as binding constraints (follow adopted options/intent recorded in design inputs; fail closed if unclear).
- Use `task.steps` as the authoritative step list. Use `semantic_review.constraints_notes` for story/context, constraints, and references.

Write rails:
- Only write within the companion repo Guardrails rails.
- Place the service facade under the Application Plane code root, using the repo’s established layout for services (create minimal structure if absent).
- Any file you create or substantially rewrite MUST include a `CAF_TRACE:` header block at the top (see CAF Operating Contract: "CAF trace headers").

Resolved TBP module conventions (mandatory when present):
- Before choosing Python import/module paths, read `tbp_conventions.module_conventions` from `reference_architectures/<name>/spec/guardrails/profile_parameters_resolved.yaml`.
- Treat `plane_module_roots.ap` / `plane_module_roots.cp` as the canonical absolute module roots for generated Python imports.
- Prefer `intra_package_import_style=explicit_relative_preferred` for imports within the same package subtree.
- Do NOT invent alternate bare roots like `ap...` when the resolved Application Plane root is `code.ap`.


Service facade minimum invariants (generic; no tech stack assumptions):
- Transport-free: do not import API boundary / transport adapter modules.
- Coordinate domain + persistence boundaries for the resource and enforce tenant scoping.
- **Identifier posture (default):** generate resource ids server-side on create, unless the authoritative app spec explicitly declares client-supplied ids.
  - Create operations should accept a payload without an id and return a payload with an assigned id.
  - Update operations should enforce the id from the function parameter/path, not from the payload.
- Implement only operations declared for the resource in `caf/application_spec_v1.md`.

## Definition of Done alignment (semantic)

- Treat `task.definition_of_done[]` as the authoritative acceptance criteria.
- Treat any TBP role-binding evidence hints (e.g., `evidence_contains`) as *implementation cues*, not as script-like checks.
- Do not invent additional acceptance checks beyond the Task Graph.
- Maintain transport-free service boundaries (no imports from API boundary modules).
- Keep service imports coherent with the resolved module convention surface; same-package imports should prefer explicit relative form when `explicit_relative_preferred` is selected.
- Ensure outputs contain no placeholder tokens (TBD/TODO/UNKNOWN/{{ }}).

## Fail-closed conditions

- Refuse if any intended write is outside the derived allowed write paths for the instance.
- Refuse if any output artifact class is not in the derived allowed artifact classes.
- Refuse if forbidden actions would be violated (for example introducing new architecture choices).




## Task completion evidence (required)

For any generated README that represents the completion of a Task Graph task (including contract and boundary READMEs), you MUST include the following section verbatim:

## Task completion evidence

### Claims
- (1–5 bullets) What you implemented in this task. Claims must be concrete and testable.

### Evidence anchors
- `<relative_path>:L<start>-L<end>` — supports Claim N

Rules:
- Evidence anchors MUST point to paths under `companion_repositories/<instance>/profile_v1/` and include line ranges.
- Every claim MUST have at least one evidence anchor.
- Do not include placeholders (TBD/TODO/etc.).


## Interface binding contract handling (mandatory when present)

- If `caf/interface_binding_contracts_v1.yaml` contains an entry whose `required_interface.consumer.task_id` matches the current task, treat it as required-interface implementation input.
- Declare the required interface explicitly in the service output (constructor parameter, port interface, or equivalent injectable boundary).
- Do not leave stub/demo return paths in place when the interface binding contract says the service must be satisfied later by a provider and assembler task.
- Do not silently instantiate local in-memory/demo/default providers once that contract applies.
- If temporary test-only scaffolding is unavoidable, mark it explicitly with `CAF_TEST_ONLY`.
