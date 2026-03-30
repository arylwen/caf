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
- `caf/application_domain_model_v1.yaml`
- `caf/system_domain_model_v1.yaml`
- `caf/abp_pbp_resolution_v1.yaml`
- `caf/profile_parameters_resolved.yaml` (resolved persistence rails; if absent, read from reference_architectures/...)
- `caf/tbp_resolution_v1.yaml` (resolved TBPs; if absent, read from reference_architectures/...)

## Outputs

This worker is **task-driven**, not output-declaration-driven.

It supports any Task Graph task where:
- `required_capabilities` contains `persistence_implementation`, and

- either:
  - `task_id` matches: `TG-40-persistence-<resource_key>` (application resource-scoped), or
  - `task_id` matches: `TG-40-persistence-cp-<aggregate_key>` (control-plane/system aggregate-scoped), or
  - `task_id` matches: `TG-10-OPTIONS-persistence_implementation` (cross-cutting option task)

Deterministic scope extraction:

- If the task_id matches `TG-40-persistence-<resource_key>`, treat it as an application-plane persistence task and parse `<resource_key>`.
- If the task_id matches `TG-40-persistence-cp-<aggregate_key>`, treat it as a control-plane persistence task and parse `<aggregate_key>`.
- If the task_id matches `TG-10-OPTIONS-persistence_implementation`, treat the task as cross-cutting and do not invent a resource key.
- Otherwise → fail closed.

Input discipline (required):
- You MUST open and use the assigned task object (steps + DoD + semantic_review).
- You MUST open and use the resolved rails (`profile_parameters_resolved.yaml`) and TBP resolution (`tbp_resolution_v1.yaml`) to avoid in-memory-only runtime persistence when a DB engine is resolved.
- You MUST treat `caf/tbp_resolution_v1.yaml` as the resolved TBP id set only. Do NOT assume it inlines role-binding maps.
- When you need a TBP-declared adapter surface, resolve it deterministically from the resolved TBP manifests via:
  - `node tools/caf/resolve_tbp_role_binding_key_v1.mjs <instance_name> --role-binding-key <key>`

Rails rule (non-negotiable):
- If resolved rails require a database engine, you MUST NOT ship an in-memory-only implementation.
- If resolved rails disallow a backend, you MUST NOT generate or wire it.

Backend posture selection rule (deterministic; minimize tech-specific DoD):
- Read `caf/profile_parameters_resolved.yaml` and determine the resolved `database.engine` / `platform.database_engine`.
- Read `persistence.orm` / `platform.persistence_orm` from `caf/profile_parameters_resolved.yaml` and preserve that realization choice explicitly in production persistence code.
- Normalize the engine to `engine_key` (lowercase, use `_` for separators). Examples: `postgres`, `mysql`, `sqlite`.
- Derive the expected adapter surface role binding key: `${engine_key}_adapter_module`.
- If a database engine is resolved (non-empty / not `none`):
  - Run `node tools/caf/resolve_tbp_role_binding_key_v1.mjs <instance_name> --role-binding-key ${engine_key}_adapter_module`.
  - If the helper returns exactly one match, you MUST generate an engine-backed repository implementation for the resource by **adopting** that adapter surface (import + delegation).
  - If the helper returns zero matches, fail closed (this indicates missing TBP role binding coverage for the resolved engine in the resolved TBP set).
  - If the helper returns more than one match, fail closed (ambiguous TBP role binding ownership).
- Engine-backed repository naming convention:
  - application-plane python: `code/ap/persistence/<engine_key>_<resource_key>_repository.py`
  - control-plane python: `code/cp/persistence/<engine_key>_<aggregate_key>_repository.py`
  - application-plane typescript: `code/ap/persistence/<engine_key>_<resource_key>_repository.ts`
  - control-plane typescript: `code/cp/persistence/<engine_key>_<aggregate_key>_repository.ts`
- Repository factory ownership:
  - application-plane tasks own `code/ap/persistence/repository_factory.*`
  - control-plane tasks own `code/cp/persistence/repository_factory.*`
  - do not defer repository factory ownership to an engine wiring worker.
- Default behavior for runtime selection when a DB engine is resolved:
  - If `DATABASE_URL` is missing/empty, repository_factory MUST fail closed with a clear runtime error explaining that the resolved engine requires DB wiring.
  - If `DATABASE_URL` is present, repository_factory selects the engine-backed repository only when the shared runtime helper accepts it for the resolved engine (for postgres: canonical SQLAlchemy PostgreSQL URLs such as `postgresql+psycopg://...`, while legacy compatibility forms like `postgresql://...` or `postgres://...` may be normalized by the shared helper).
  - If the URL scheme does not match the resolved engine, repository_factory MUST fail closed.
  - Do not silently return an in-memory/demo/default repository from production code paths.

- Test doubles belong under `tests/**`, not under production runtime modules.
- DO NOT materialize `InMemory*`, `Demo*`, `Fake*`, or similar fallback repositories under `code/ap/**` or `code/cp/**` when rails require a real database engine.
- DO NOT instantiate an in-memory repository directly inside AP runtime routes/handlers.
- Provide an injectable repository wiring surface (factory/provider) so runtime can select the appropriate backend based on resolved rails + environment.
- If DB-specific adapter code is produced by a TBP task, your persistence work MUST still provide the integration interface and injection points required to adopt that adapter without rewrites.

Persistence ORM realization rule (non-negotiable):
- If `persistence.orm == sqlalchemy_orm`, production persistence code MUST realize ORM-backed surfaces explicitly.
  - Acceptable signals include SQLAlchemy engine/session/model/bootstrap surfaces (for example `create_engine`, `Session`/`sessionmaker`, mapped models, or metadata bootstrap hooks).
  - Do NOT satisfy ORM-backed rails with raw `psycopg`/cursor-only repository logic in production modules.
  - If `schema_management_strategy == code_bootstrap`, the ORM-backed persistence boundary MUST expose a deterministic bootstrap hook (for example metadata create-all), and the runtime composition root MUST invoke it before serving traffic without leaking transport concerns. Repository factories and request-scoped handlers MUST NOT be the primary schema-materialization path.
- If `persistence.orm == raw_sql`, direct driver/cursor delegation may be used, but the repository boundary and fail-closed runtime selection rules above still apply.
- If the selected ORM cannot be realized from the available TBP/adapter surfaces, FAIL-CLOSED instead of silently degrading to a different persistence posture.

- You MUST open and use every `task.inputs[]` where `required: true`.
- In your task report, include an **Inputs consumed** section listing each required input and what you derived from it.
- You MUST treat `trace_anchors[]` as binding constraints (follow adopted options/intent recorded in design inputs; fail closed if unclear).
- Use `task.steps` as the authoritative step list. Use `semantic_review.constraints_notes` for story/context, constraints, and references.

Write rails:
- Only write within the companion repo Guardrails rails.
- Place persistence modules under the plane-local code root implied by the task id (`code/ap/...` for application-plane tasks, `code/cp/...` for control-plane tasks), using the repo’s established persistence layout (create minimal structure if absent).
- Any file you create or substantially rewrite MUST include a `CAF_TRACE:` header block at the top (see CAF Operating Contract: "CAF trace headers").


Persistence boundary minimum invariants (generic; no tech stack assumptions):
- Every persistence operation MUST be tenant-scoped (accept a `tenant_id` parameter or operate within a tenant context object if the contract scaffolder declared one and the Task Graph includes it as an input).
- Do not import transport adapter modules (HTTP routers, event consumers, CLI entrypoints).
- Provide a minimal interface that supports the operations declared in `caf/application_spec_v1.md` for the resource.

Operation completeness invariants (generic; avoid combinatorial sprawl):
- For the resource key in scope, enumerate the persistence operations implied by `caf/application_spec_v1.md` (CRUD, list, search, etc.).
- For EACH operation, you MUST implement a **non-stub** method in the selected backend(s).
  - A method is a stub if it only returns a constant empty value (e.g., `[]`, `{}`, `None`/`null`) without any backend call, or if it contains only `pass`, `...`, `NotImplementedError`, or placeholder comments.
  - Preferred implementation style (when an adapter role binding exists): import the adapter module (via `${engine_key}_adapter_module`) and delegate backend I/O through that surface.
- If you cannot implement an operation due to missing adapter surface, missing schema, or unclear constraints → fail closed (do not ship a stub).

Schema management strategy alignment (generic):
- Read `schema_management_strategy` from `caf/profile_parameters_resolved.yaml`.
- If `schema_management_strategy: code_bootstrap`:
  - Ensure there is a deterministic schema initialization hook within the persistence boundary (either provided by the adapter surface or implemented in persistence code).
  - Runtime composition roots MUST invoke that hook before serving traffic; do not treat repository factories, route handlers, or first-request code paths as the primary schema-materialization path.
  - When `persistence.orm` is ORM-backed, the bootstrap hook MUST remain ORM-owned (for example metadata/bootstrap surfaces), not a raw driver-only cursor bootstrap.
  - A request-path fallback is only acceptable as a secondary convergence guard when it is synchronized and does not replace startup/bootstrap ownership.
- If `schema_management_strategy` indicates migrations (e.g., `alembic_migrations`):
  - Do not silently bootstrap schema at runtime.
  - Ensure the persistence boundary is compatible with migrations posture (the schema init hook must be absent or a no-op, and the companion repo includes clear entrypoints/docs for applying migrations per the TBP).

Multi-writer prevention (generic):
- If you touch `code/ap/persistence/repository_factory.*`, it MUST end with exactly one `CAF_TRACE:` task_id (the current task), and it MUST NOT contain task_ids from unrelated TBP wiring tasks.
- If you detect multi-writer drift in an existing file header, resolve it by consolidating ownership under the current task and document the consolidation in the task report.


## Definition of Done alignment (semantic)

- Treat `task.definition_of_done[]` as the authoritative acceptance criteria.
- Treat any TBP role-binding evidence hints (e.g., `evidence_contains`) as *implementation cues*, not as script-like checks.
- Do not invent tech-specific acceptance checks beyond the Task Graph.
  - You MUST still enforce the generic invariants defined in this SKILL (tenant-scoping, backend adoption via role binding, non-stub operation completeness, no placeholder tokens).
- Ensure persistence operations remain tenant-scoped (per the Task Graph and adopted contract inputs).
- Ensure outputs contain no placeholder tokens (TBD/TODO/UNKNOWN/{{ }}).

## Fail-closed conditions

- Refuse if any intended write is outside the derived allowed write paths for the instance.
- Refuse if any output artifact class is not in the derived allowed artifact classes.
- Refuse if forbidden actions would be violated (for example generating production code).
- Refuse if selected ORM/auth realization choices in `caf/profile_parameters_resolved.yaml` would be silently degraded in production code (for example `sqlalchemy_orm` emitted as raw cursor-only repositories).




## Task completion evidence (required)

You MUST write a task report to: `caf/task_reports/<task_id>.md`.

Task report requirements (persistence-specific):
- Include **Claims** and **Evidence anchors** (same structure as below).
- Ensure every persistence operation you implemented (per the application spec) is covered by at least one evidence anchor pointing into the concrete method body.
- If a backend adapter surface was adopted (via `${engine_key}_adapter_module`), include at least one evidence anchor showing the import + delegation call site.

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

- If `caf/interface_binding_contracts_v1.yaml` contains an entry whose `provider.task_id` matches the current task, satisfy that required interface explicitly.
- Emit or preserve the concrete provider hook named by the interface binding contract (factory, adapter builder, registration hook, or equivalent).
- Do not assume assembler work will infer the provider relationship unless the interface binding contract makes it explicit.
