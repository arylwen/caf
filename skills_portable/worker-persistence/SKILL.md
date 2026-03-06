---
name: worker-persistence
description: >
  Worker skill that implements persistence_implementation capability by generating a tenant-scoped
  persistence boundary per Task Graph. Bounded to companion repo write rails.
status: active
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.


# worker-persistence

## Capabilities

- persistence_implementation

## Inputs

Required (copied into companion repo by `caf-build-candidate` Step 0):
- `caf/application_spec_v1.md`
- `caf/profile_parameters_resolved.yaml` (resolved persistence rails; if absent, read from reference_architectures/...)
- `caf/tbp_resolution_v1.yaml` (resolved TBPs; if absent, read from reference_architectures/...)

## Outputs

This worker is **task-driven**, not output-declaration-driven.

It supports any Task Graph task where:
- `required_capabilities` contains `persistence_implementation`, and

- either:
  - `task_id` matches: `TG-40-persistence-<resource_key>` (resource-scoped), or
  - `task_id` matches: `TG-10-OPTIONS-persistence_implementation` (cross-cutting option task)

Deterministic resource extraction:

- If the task_id matches `TG-40-persistence-<resource_key>`, parse `<resource_key>`.
- If the task_id matches `TG-10-OPTIONS-persistence_implementation`, treat the task as cross-cutting and do not invent a resource key.
- Otherwise → fail closed.

Input discipline (required):
- You MUST open and use the assigned task object (steps + DoD + semantic_review).
- You MUST open and use the resolved rails (`profile_parameters_resolved.yaml`) and TBP resolution (`tbp_resolution_v1.yaml`) to avoid in-memory-only runtime persistence when a DB engine is resolved.

Rails rule (non-negotiable):

Backend selection rule (deterministic):
- Read `caf/profile_parameters_resolved.yaml` and determine the resolved `database.engine` / `platform.database_engine`.
- If Postgres is resolved AND there are TBP role-binding expectations for the Postgres adapter surface (role_binding_key: `postgres_adapter_module`), you MUST generate a Postgres-backed repository implementation for the resource, in addition to any in-memory fallback.
- Postgres repository naming convention (python): `code/ap/persistence/postgres_<resource_key>_repository.py`
- Postgres repository naming convention (ts): `code/ap/persistence/postgres_<resource_key>_repository.ts`
- Repository factory ownership: the resource-scoped persistence task MUST own `code/ap/persistence/repository_factory.*` and MUST NOT defer that to the Postgres wiring worker.
- Default behavior for local determinism: if `DATABASE_URL` is missing/empty, repository_factory should return the in-memory repository; if it is present and postgres-prefixed, return the Postgres repository.

- DO NOT instantiate an in-memory repository directly inside AP runtime routes/handlers.
- Provide an injectable repository wiring surface (factory/provider) so runtime can select the appropriate backend based on resolved rails + environment.
- If DB-specific adapter code is produced by a TBP task, your persistence work MUST still provide the integration seam (imports/injection points) required to adopt that adapter without rewrites.

- You MUST open and use every `task.inputs[]` where `required: true`.
- In your task report, include an **Inputs consumed** section listing each required input and what you derived from it.
- You MUST treat `trace_anchors[]` as binding constraints (follow adopted options/intent recorded in design inputs; fail closed if unclear).
- Use `task.steps` as the authoritative step list. Use `semantic_review.constraints_notes` for story/context, constraints, and references.

Write rails:
- Only write within the companion repo Guardrails rails.
- Place persistence modules under the Application Plane code root, using the repo’s established persistence layout (create minimal structure if absent).
- Any file you create or substantially rewrite MUST include a `CAF_TRACE:` header block at the top (see CAF Operating Contract: "CAF trace headers").


Persistence boundary minimum invariants (generic; no tech stack assumptions):
- Every persistence operation MUST be tenant-scoped (accept a `tenant_id` parameter or operate within a tenant context object if the contract scaffolder declared one and the Task Graph includes it as an input).
- Do not import transport adapter modules (HTTP routers, event consumers, CLI entrypoints).
- Provide a minimal interface that supports the operations declared in `caf/application_spec_v1.md` for the resource.

## Definition of Done alignment (semantic)

- Treat `task.definition_of_done[]` as the authoritative acceptance criteria.
- Treat any TBP role-binding evidence hints (e.g., `evidence_contains`) as *implementation cues*, not as script-like checks.
- Do not invent additional acceptance checks beyond the Task Graph.
- Ensure persistence operations remain tenant-scoped (per the Task Graph and adopted contract inputs).
- Ensure outputs contain no placeholder tokens (TBD/TODO/UNKNOWN/{{ }}).

## Fail-closed conditions

- Refuse if any intended write is outside the derived allowed write paths for the instance.
- Refuse if any output artifact class is not in the derived allowed artifact classes.
- Refuse if forbidden actions would be violated (for example generating production code).




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
