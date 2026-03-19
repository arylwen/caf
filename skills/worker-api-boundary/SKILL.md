---
name: worker-api-boundary
description: >
  Worker skill that implements api_boundary_implementation capability by generating API boundary artifacts
  and main wiring per Task Graph. Bounded to companion repo write rails.
status: active
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.


# worker-api-boundary

## Capabilities

- api_boundary_implementation

## Inputs

Required (copied into companion repo by `caf-build-candidate` Step 0):
- `caf/application_spec_v1.md`

## Outputs

This worker is **task-driven**, not output-declaration-driven.

It supports any Task Graph task where:
- `required_capabilities` contains `api_boundary_implementation`, and

- either:
  - `task_id` matches: `TG-20-api-boundary-<resource_key>` (resource-scoped), or
  - `task_id` matches: `TG-10-OPTIONS-api_boundary_implementation` (cross-cutting option task), or
  - `task_id` matches a documented cross-cutting API wiring task id (planner-emitted).

Deterministic resource extraction:

- If the task_id matches `TG-20-api-boundary-<resource_key>`, parse `<resource_key>`.
- If the task_id matches `TG-10-OPTIONS-api_boundary_implementation`, treat the task as cross-cutting and do not invent a resource key.
- Otherwise, treat the task as cross-cutting only if the planner explicitly emitted it as such (it must be documented in this worker skill).
- If the task_id is neither resource-scoped nor a known cross-cutting API task → fail closed.

Input discipline (required):
- You MUST open and use every `task.inputs[]` where `required: true`.
- In your task report, include an **Inputs consumed** section listing each required input and what you derived from it.
- You MUST treat `trace_anchors[]` as binding constraints (follow adopted options/intent recorded in design inputs; fail closed if unclear).
- Use `task.steps` as the authoritative step list. Use `semantic_review.constraints_notes` for story/context, constraints, and references.

Write rails:
- Only write within the companion repo Guardrails rails.
- Place API boundary modules under the Application Plane code root, using the repo’s established API layout (create minimal structure if absent).
- Do not introduce framework specifics unless the task DoD + trace anchors require them.
- Any file you create or substantially rewrite MUST include a `CAF_TRACE:` header block at the top (see CAF Operating Contract: "CAF trace headers").

## TBP role-binding enforcement (mandatory when a TBP manifest is an input)

If `architecture_library/phase_8/tbp/atoms/*/tbp_manifest_v1.yaml` is present in `task.inputs[]` (required=true), you MUST obey the role binding paths for this capability.

Run (from repo root):
- `node tools/caf/resolve_tbp_role_bindings_v1.mjs <instance_name> --capability api_boundary_implementation`

Then:
- Materialize the composition root at the returned `path_template` for the expectation whose `role_binding_key` is `composition_root`.
- Also open the TBP manifest itself and obey its `layout.role_bindings` path_template for the API boundary module (e.g., `api_boundary.path_template`), substituting `{resource_snake}` from the task_id when resource-scoped.
- If `platform.dependency_wiring_mode=framework_managed`, resolve `dependency_provider_boundary` with `node tools/caf/resolve_tbp_role_binding_key_v1.mjs <instance_name> --role-binding-key dependency_provider_boundary`. When the selected TBP exposes that role binding, materialize that TBP-declared file too and keep framework-managed dependency-provider functions there.
- Before choosing Python import/module paths, read `tbp_conventions.module_conventions` from `reference_architectures/<name>/spec/guardrails/profile_parameters_resolved.yaml` when present.
- Treat `plane_module_roots.ap` / `plane_module_roots.cp` as the canonical absolute module roots for API-boundary imports and dotted runtime references.
- Prefer `intra_package_import_style=explicit_relative_preferred` for imports within the same package subtree.
- Do NOT invent alternate bare roots like `ap...` when the resolved Application Plane root is `code.ap`.
- Do not create alternate/duplicate composition roots (e.g., do not create both `main.py` at repo root and `code/ap/main.py`).
- If an existing legacy composition root already exists at a different path, prefer the TBP path_template and avoid adding new duplicates. If reconciliation would require broad refactors, FAIL-CLOSED.


API boundary minimum invariants (generic; no tech stack assumptions):
- Treat the API boundary as a transport adapter: keep domain imports separate from transport-specific concerns.
- Ensure tenant scoping is enforced at the boundary (minimum: accept/require a tenant identifier, and pass it to the service layer) unless the Task Graph provides a different adopted tenant carrier via inputs.
- **Identifier posture (default):** treat resource identifiers (`id`, `*_id`) as **server-generated** unless the authoritative app spec explicitly declares client-supplied ids.
  - Create endpoints MUST NOT require an id in the request body; generate the id server-side (typically in the service layer).
  - Update endpoints MUST take the id from the URL/path parameter and MUST ignore any id fields in the body.
- Do not embed persistence logic in the boundary.
- When `platform.dependency_wiring_mode=framework_managed` and the selected TBP exposes a `dependency_provider_boundary`, route modules must consume providers from that boundary instead of constructing services/repositories inline.
- Keep router/provider imports consistent with the resolved module convention surface; a framework-managed `dependency_provider_boundary` must be imported using the same resolved root or the preferred same-package relative-import style.

## Definition of Done alignment (semantic)

- Treat `task.definition_of_done[]` as the authoritative acceptance criteria.
- Treat any TBP role-binding evidence hints (e.g., `evidence_contains`) as *implementation cues*, not as script-like checks.
- Do not invent additional acceptance checks beyond the Task Graph.
- Ensure outputs contain no placeholder tokens (TBD/TODO/UNKNOWN/{{ }}).

## Fail-closed conditions

- Refuse if any intended write is outside the derived allowed write paths for the instance.
- Refuse if any output artifact class is not in the derived allowed artifact classes.
- Refuse if forbidden actions would be violated (for example bypassing refusal conditions or claiming production readiness).



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
