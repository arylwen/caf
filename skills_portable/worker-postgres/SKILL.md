---
name: worker-postgres
description: >
  Worker skill that implements postgres_persistence_wiring capability by materializing PostgreSQL
  runtime wiring surfaces (compose service + env contract + minimal adapter hook) in the companion repo.
status: active
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.


# worker-postgres

## Capabilities

- postgres_persistence_wiring

## Task compatibility

This worker supports any Task Graph task where:

- `required_capabilities` contains `postgres_persistence_wiring`, and
- the task is either:
  - TBP-derived (`task_id` starts with `TG-TBP-`), or
  - option-derived (`task_id` starts with `TG-10-OPTIONS-`).

If the task requires `postgres_persistence_wiring` but does not match either form: fail closed.

## Required inputs
## TBP role-binding enforcement (mandatory)

This capability is TBP-driven. Do NOT invent output paths.

Run (from repo root):
- `node tools/caf/resolve_tbp_role_bindings_v1.mjs <instance_name> --capability postgres_persistence_wiring`

Then:
- For each returned expectation, materialize the artifact at `path_template` (relative to the companion repo root), and ensure the file contains the listed `evidence_contains` strings.
- If expectations are empty: fail closed (this indicates TBP resolution drift).


Workers MUST open every `task.inputs[]` where `required: true`.

For this capability, tasks are expected to include (required=true):

- `caf/profile_parameters_resolved.yaml`
- `caf/tbp_resolution_v1.yaml`
- `architecture_library/phase_8/tbp/atoms/*/tbp_manifest_v1.yaml` (the resolved TBP manifest for this capability)

The worker MAY additionally read (if present):

- `<companion_repo_target>/docker/compose.candidate.yaml`
- `<companion_repo_target>/code/ap/persistence/*`
- `<companion_repo_target>/code/ap/api/*`

## Outputs

Ownership rule (non-negotiable):
- This worker MUST NOT create resource-specific repositories (e.g., postgres_<resource>_repository).
- This worker MUST NOT write or rewrite repository selection factories (e.g., repository_factory.py).
  Resource-scoped persistence wiring is owned by persistence_implementation tasks (TG-40-...).

This worker is task-driven.

Minimum outputs to materialize when PostgreSQL is resolved:

1) Compose wiring update
- Add a `postgres` service to the candidate compose file.
- Ensure application-plane service exports a `DATABASE_URL` environment variable (and/or the `POSTGRES_*` atoms) suitable for in-network connectivity.

2) Env contract surface
- Create `infrastructure/postgres.env.example` documenting `DATABASE_URL` and the `POSTGRES_*` variables.

3) Minimal DB adapter surface (global; reusable)
- Materialize a small Postgres adapter module at the TBP role binding path for `postgres_adapter_module`.
- It MUST consume `DATABASE_URL` (or POSTGRES_* + derived URL) and expose a minimal API that resource repositories can call (e.g., get_connection()/get_pool()).
- It MUST NOT import resource modules and MUST NOT implement a resource repository.

## Behavioral requirements

- Do not hardcode a generic worker branch like “if postgres …” in other workers.
  This worker exists specifically to realize the PostgreSQL capability.

- Externalize configuration:
  - No credentials embedded in source code.
  - Use environment variables and/or env files.

- Keep changes minimal:
  - No structural refactors.
  - Do not redesign existing module boundaries.

- Any file you create or substantially rewrite MUST include a `CAF_TRACE:` header block at the top (see CAF Operating Contract: "CAF trace headers").

## Fail-closed conditions

- If TBP role-binding expectations for this capability are empty, STOP (capability/task drift).
- If any intended write is outside `lifecycle.allowed_write_paths`, STOP.
- If any intended output artifact class is outside `lifecycle.allowed_artifact_classes`, STOP.
- If any output would introduce new technology choices beyond pinned profile parameters + TBPs, STOP.


## Implementation procedure (semantic; bounded)

1) Validate scope
- Read `caf/profile_parameters_resolved.yaml` and confirm `database.engine` is `postgresql` (or platform database engine indicates postgres).
- Resolve TBP role bindings for this capability:
  - `node tools/caf/resolve_tbp_role_bindings_v1.mjs <instance_name> --capability postgres_persistence_wiring`
- If expectations are empty, STOP (capability/task drift).
- Open the returned TBP manifest(s) and record their `layout.role_bindings` (paths) as the deterministic output targets.

2) Compose candidate wiring
- Open (or create if missing) `<companion_repo_target>/docker/compose.candidate.yaml`.
- Add a `postgres` service using a stable official image tag (e.g., `postgres:16-alpine`).
- Use env var substitution for configuration (e.g., `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`).
- Add a named volume for persistence.
- Ensure AP depends on postgres (in addition to CP where applicable).
- Ensure AP exports a `DATABASE_URL` env var (string form) for the in-repo runtime to consume.

3) Env example contract
- Create `infrastructure/postgres.env.example` with a minimal, local-dev-safe set of variables:
  - `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`
  - `POSTGRES_HOST=postgres`, `POSTGRES_PORT=5432`
  - `DATABASE_URL=postgresql://...@postgres:5432/...`

4) Minimal adapter hook
- Preserve the existing in-memory repository as the default.
- Add a PostgreSQL-backed repository implementation in:
  - `code/ap/persistence/postgres_widget_repository.py`
- Add a small factory in:
  - `code/ap/persistence/repository_factory.py`
  that selects:
  - PostgreSQL repository when `DATABASE_URL` is set and starts with `postgresql://` or `postgres://`
  - in-memory repository otherwise
- Update the AP API boundary wiring to instantiate the service using the factory (not a hard-coded in-memory repository).

5) Task report
- Write `<companion_repo_target>/caf/task_reports/<task_id>.md`.
- Include a **Task completion evidence** section with Claims + Evidence anchors.


## Task completion evidence (required)

For any generated README or report that represents the completion of a Task Graph task, include the following section verbatim:

## Task completion evidence

### Claims
- (1–5 bullets) What you implemented in this task. Claims must be concrete and testable.

### Evidence anchors
- `<relative_path>:L<start>-L<end>` — supports Claim N

Rules:
- Evidence anchors MUST point to paths under `companion_repositories/<instance>/profile_v1/` and include line ranges.
- Every claim MUST have at least one evidence anchor.
- Do not include placeholders (TBD/TODO/UNKNOWN/{{ }}).
