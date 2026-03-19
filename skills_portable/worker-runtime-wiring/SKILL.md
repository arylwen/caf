---
name: worker-runtime-wiring
description: >
  Wire plane runtimes into a runnable candidate shape per Task Graph Definition of Done.
  Focuses on integration wiring (routers, app entrypoints, compose wiring) without running scripts.
status: active
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.


# worker-runtime-wiring

## Capabilities

- runtime_wiring

## Purpose

This worker performs **runtime wiring** work required for a runnable candidate demo:

- Ensure AP/CP runtime scaffolds are wired into clear entrypoints.
- Ensure HTTP routing is connected (e.g., router registration) when the runtime shape is HTTP API.
- Ensure packaging wiring is coherent for local runs (e.g., compose service commands/env) when required by the task DoD.

This worker is **not** responsible for production hardening.

## Inputs (authoritative)

- `companion_repositories/<name>/**` (candidate repo)
- The assigned Task Graph task (from `caf/task_graph_v1.yaml` or the reference_architectures copy)
- `reference_architectures/<name>/spec/guardrails/profile_parameters_resolved.yaml` (pins + allowed write paths)
- `caf/interface_binding_contracts_v1.yaml` when present

## TBP role-binding enforcement (mandatory)

Before writing or relocating any runtime wiring artifacts, you MUST resolve TBP role bindings for this capability and obey the manifest-declared paths.

Run (from repo root):
- `node tools/caf/resolve_tbp_role_bindings_v1.mjs <instance_name> --capability runtime_wiring`

Then:
- For each returned expectation, materialize the artifact at `path_template` (relative to the companion repo root), and ensure the file contains the listed `evidence_contains` strings.
- Do NOT invent alternate directory layouts (e.g., do not place Dockerfiles at repo root) unless the TBP manifest path_template explicitly requires it.
- If expectations are non-empty but you cannot satisfy them within write rails: FAIL-CLOSED with a feedback packet.

## Eligibility

A task is eligible if `required_capabilities` contains `runtime_wiring`.

If not eligible: refuse.

## Execution rules (non-negotiable)

- Use the task's **Definition of Done** as the completion contract.
- You MAY create/update any files needed to satisfy the DoD, but ONLY within allowed write paths.
- You MUST write a task report to `caf/task_reports/<task_id>.md` listing:
  - files touched
  - how to validate manually (commands are OK to suggest, but do not run them)
- Do not introduce placeholder tokens: `TBD`, `TODO`, `REPLACE_ME`, `FIXME`.

- Any file you create or substantially rewrite MUST include a `CAF_TRACE:` header block at the top, using the correct comment syntax for the file type (see CAF Operating Contract: "CAF trace headers").

## Guidance (semantic)

When wiring an HTTP API service:

- Ensure the main application registers all routers.
- Ensure the service entrypoint is clear (e.g., `main.py` exports `app`).
- Ensure there is a coherent local run path (uvicorn invocation or equivalent) if the DoD requires runnable behavior.

When wiring compose:

- Ensure AP and CP services are both present when required.
- Ensure service dependencies are declared (e.g., AP depends_on CP when needed).
- Ensure environment variables are consistent (ports, hostnames, DB connection strings) without inventing secrets.
- Ensure deployment/IaC identity is stable and Guardrails-owned:
  - Read `deployment.stack_name` from `profile_parameters_resolved.yaml` and use that canonical value for any IaC surface you materialize.
  - For compose packaging, top-level `name:` MUST equal `deployment.stack_name`.

Compose ownership rule (tight leash):
- `docker/compose.candidate.yaml` is owned by this capability (`runtime_wiring`).
- Other workers MUST NOT rewrite compose; if you detect prior compose drift, fix it here and keep the file coherent.

Support service wiring (instance-driven):
- If the instance task graph contains a task requiring `postgres_persistence_wiring`, compose MUST include a `postgres` service and AP MUST be wired with `DATABASE_URL` (or equivalent) for in-network connectivity.
- When PostgreSQL + SQLAlchemy rails are resolved, the emitted instance `.env` MUST satisfy the SQLAlchemy role-binding contract for accepted DATABASE_URL shapes; prefer the canonical form `postgresql+psycopg://...` and keep runtime wiring coherent with the shared persistence helper and env examples.
- For local compose runs, the `postgres` service MUST expose the container port on the host for developer testing:
  - Add `ports: ["${POSTGRES_PORT:-5432}:5432"]` (or YAML list form) on the `postgres` service.
  - Use the instance `.env` `POSTGRES_PORT` default of 5432 when present.
  - Keep in-network AP connectivity via `POSTGRES_HOST=postgres` / `DATABASE_URL` unchanged.
- If the instance task graph contains a task requiring `ui_frontend_scaffolding`, compose MUST include a `ui` service and keep the UI wiring consistent with the UI Dockerfile + nginx config declared by role bindings for the UI capability.
- When the resolved UI TBP is `TBP-UI-REACT-VITE-01`, `docker/Dockerfile.ui` MUST realize an explicit Vite build path in the image build surface (for example `npm exec vite build` or equivalent) rather than relying on an opaque generic build step alone. The Dockerfile and task report MUST satisfy the resolved `ui_dockerfile` role binding evidence before claiming completion.

UI config mount policy (portability + podman/docker parity):
- Compose MUST NOT bind-mount `nginx.ui.conf` (or other UI server config) by default.
  - Reason: the UI Dockerfile already bakes the config into the image; bind-mounts are a frequent cross-platform foot-gun (WSL/Podman path resolution).
- If a bind-mount is explicitly required for local debug iteration, the host path MUST be:
  - relative to the directory containing `docker/compose.candidate.yaml`, and
  - resolvable on disk (no `./docker/...` double-prefix mistakes; use `./nginx.ui.conf` when compose is in `docker/`).

Compose command override policy (portability + podman/docker parity):
- Prefer the Dockerfile `CMD` for CP/AP/UI containers; do NOT set `command:` in compose unless an override is explicitly required.
- Compose `command:` MUST NOT rely on `${...}` interpolation (including `CAF_*_RUNTIME_CMD` patterns).
  - Reason: compose variable interpolation is evaluated by the compose CLI from the host environment at parse time; `env_file:` does not supply values for interpolation.
  - This is a common cross-platform foot-gun that can start containers with an empty command and yield confusing 502/connection errors.
- If an override is required for local debug, use an explicit command string/array with no `${...}` variables.

YAML validity invariant:
- Under `services:`, every service key MUST map to an object (not null).
- Do not introduce placeholder keys like `ui: null` under `services:`. If a role-binding marker is desired, place it under a dedicated top-level extension key (e.g., `x-caf-role-bindings:`), not inside `services:`.

Compose project naming invariant:
- `docker/compose.candidate.yaml` MUST include a top-level `name:` field equal to `deployment.stack_name` from the resolved guardrails view.

Compose-based packaging (docker_compose or podman_compose) standard outputs:

- `docker/compose.candidate.yaml`
  - MUST use `build:` for CP/AP (Dockerfile-based builds; no local pip prerequisite)
  - MUST use `env_file: ../.env` (or `${VAR}` interpolation) for configuration externalization
- `docker/Dockerfile.cp` and `docker/Dockerfile.ap`
  - MUST install dependencies in-image from the canonical dependency manifest when the task DoD / resolved role-binding expectations establish one, so runtime does not require local Python tooling
- `.env` (real local defaults; no secrets)
- `.gitignore` ignores `.env` and `*.local`

## Failure modes

- Any required input missing or outside rails → fail closed.
- Ambiguous runtime shape not declared by planner → fail closed.


## Interface binding evidence (mandatory when present)

- If `caf/interface_binding_contracts_v1.yaml` contains an entry whose `assembler.task_id` matches the current task, you MUST close that interface binding explicitly in the runtime composition boundary.
- Do not mark a binding closed if the consumer still keeps a silent production fallback to a local demo/in-memory/default provider.
- For each closed interface binding, write `caf/binding_reports/<binding_id>.yaml` with:
  - `schema_version: caf_interface_binding_report_v1`
  - `binding_id`
  - `status: closed`
  - `closed_by.task_id`
  - `evidence.consumer_artifact_paths[]`
  - `evidence.provider_artifact_paths[]`
  - `evidence.assembler_artifact_paths[]`
- Wave order alone is not evidence of binding closure.
