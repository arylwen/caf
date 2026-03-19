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

## Resolved TBP module conventions (mandatory when present)

Before choosing Python import/module paths, read `tbp_conventions.module_conventions` from `reference_architectures/<name>/spec/guardrails/profile_parameters_resolved.yaml`.

Required behavior when this surface is present:
- Treat `plane_module_roots.ap` / `plane_module_roots.cp` as the canonical absolute module roots for generated Python imports and dotted runtime entrypoints.
- Keep dotted runtime entrypoints and in-code imports coherent with the same resolved module root (for example, do not generate a `code.ap...` entrypoint while authoring imports as `ap...`).
- Prefer `intra_package_import_style=explicit_relative_preferred` for imports within the same package subtree.
- Use resolved absolute module roots only when crossing package boundaries or when the framework/runtime surface requires an absolute dotted path.
- Do NOT invent alternate bare roots like `ap...` / `cp...` when the resolved plane root is `code.ap` / `code.cp`.

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
  - MUST install dependencies in-image from the canonical dependency manifest when task DoD / resolved role-binding expectations establish one; do not duplicate inline package lists when the contract selects a shared manifest.
- `.env` (real local defaults; no secrets)
- `.gitignore` ignores `.env` and `*.local`

## Dependency wiring mode selection (mandatory when interface bindings apply)

Before deciding where to close a declared interface binding, read `platform.dependency_wiring_mode` from `reference_architectures/<name>/spec/guardrails/profile_parameters_resolved.yaml`.

Backward-compatibility default:
- If the field is absent, treat it as `manual_composition_root`.

Mode handling:
- `manual_composition_root`
  - Close each binding explicitly in composition/bootstrap code.
  - Prefer the TBP-declared composition-root path when a `composition_root` role binding exists.
  - Keep the binding closure concentrated in a clear assembly surface; do not scatter manual provider selection across unrelated runtime modules.
- `framework_managed`
  - Close each binding in an existing framework-managed assembly boundary already supported by the selected runtime stack/TBP/task inputs.
  - Valid examples include an application bootstrap module, provider-registration module, dependency module, or equivalent assembly file that already belongs to the stack.
  - Prefer a TBP-declared `dependency_provider_boundary` role binding when one exists; use that boundary as the primary closure surface for framework-managed binding evidence.
  - Keep the application bootstrap/composition file as bootstrap glue only when the stack already exposes a dedicated dependency-provider boundary; do not duplicate provider selection in both places.
  - Do NOT introduce a new DI container, registry product, lifetime model, or framework-specific registration topology just because this mode was selected.
  - Do NOT create a duplicate manual composition root solely to satisfy interface binding evidence when the stack already has a framework-managed assembly surface.
- If `framework_managed` is selected but the runtime stack/TBP inputs do not expose a clear supported assembly surface, FAIL-CLOSED instead of inventing one.

## Failure modes

- Any required input missing or outside rails → fail closed.
- Ambiguous runtime shape not declared by planner → fail closed.
- `platform.dependency_wiring_mode=framework_managed` but no existing framework-managed assembly surface is available → fail closed.
- `platform.dependency_wiring_mode=framework_managed` and the resolved TBP declares `dependency_provider_boundary`, but the worker cannot point closure evidence to that TBP-declared boundary (or an equivalent declared framework-managed surface) → fail closed.


## Interface binding evidence (mandatory when present)

- If `caf/interface_binding_contracts_v1.yaml` contains an entry whose `assembler.task_id` matches the current task, you MUST close that interface binding explicitly in the runtime assembly boundary selected by `platform.dependency_wiring_mode`.
- Do not mark a binding closed if the consumer still keeps a silent production fallback to a local demo/in-memory/default provider.
- For each closed interface binding, write `caf/binding_reports/<binding_id>.yaml` with:
  - `schema_version: caf_interface_binding_report_v1`
  - `binding_id`
  - `status: closed`
  - `closed_by.task_id`
  - `evidence.consumer_artifact_paths[]`
  - `evidence.provider_artifact_paths[]`
  - `evidence.assembler_artifact_paths[]`
- `evidence.assembler_artifact_paths[]` MUST point to the actual assembly artifact(s) that realize the selected mode:
  - manual composition/bootstrap file(s) for `manual_composition_root`, or
  - existing framework-managed registration/bootstrap file(s) for `framework_managed`.
- When a resolved TBP role binding such as `dependency_provider_boundary` exists, prefer that TBP-declared file as the assembler evidence path for `framework_managed` rather than only the application bootstrap file.
- Unless an artifact truly lives outside the companion repo, record those evidence paths relative to the companion repo root (for example `code/AP/main.py`, not a repo-absolute path).
- Router imports, service imports, or wave order alone are not evidence of binding closure unless they are the actual selected assembly boundary.
