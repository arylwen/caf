---
name: worker-runtime-wiring
description: >
  Wire plane runtimes into a runnable candidate shape per Task Graph Definition of Done.
  Focuses on integration wiring (routers, app entrypoints, compose wiring) without running scripts.
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.


# worker-runtime-wiring

## Capabilities

- runtime_wiring
- ux_service_packaging_wiring

## Purpose

This worker performs **runtime wiring** work required for a runnable candidate demo:

- Ensure AP/CP runtime scaffolds are wired into clear entrypoints.
- Ensure HTTP routing is connected when the runtime shape is HTTP API.
- Ensure packaging wiring is coherent for local runs when the task DoD requires runnable behavior.

This worker is **not** responsible for production hardening, and it must not invent stack-specific semantics that are not declared by framework-owned contracts, resolved role bindings, or selected TBP gates.

## Inputs (authoritative)

- `companion_repositories/<name>/**` (candidate repo)
- the assigned Task Graph task (from `caf/task_graph_v1.yaml` or the reference-architectures copy)
- `reference_architectures/<name>/spec/guardrails/profile_parameters_resolved.yaml` (pins + allowed write paths)
- `caf/interface_binding_contracts_v1.yaml` when present
- `tools/caf/contracts/runtime_wiring_compose_posture_contract_v1.md`
- `tools/caf/contracts/interface_binding_contract_v1.md` when interface bindings apply
- `tools/caf/contracts/ux_service_packaging_and_wiring_contract_v1.md` when the current capability is `ux_service_packaging_wiring`

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
- `node tools/caf/resolve_tbp_role_bindings_v1.mjs <instance_name> --capability <current_runtime_capability>`

Where `<current_runtime_capability>` is the single task capability being executed (`runtime_wiring` or `ux_service_packaging_wiring`).

Then:
- For each returned expectation, materialize the artifact at `path_template` (relative to the companion repo root), and ensure the file contains the listed `evidence_contains` strings.
- Treat resolved role bindings and their owning TBP gates as the authoritative stack/provider realization surface; do not restate those semantics from memory in worker-local logic.
- Do NOT invent alternate directory layouts unless the TBP manifest `path_template` explicitly requires them.
- If expectations are non-empty but you cannot satisfy them within write rails: FAIL-CLOSED with a feedback packet.

## Eligibility

A task is eligible if `required_capabilities` contains `runtime_wiring` or `ux_service_packaging_wiring`.

If not eligible: refuse.

## Execution rules (non-negotiable)

- Use the task's **Definition of Done** as the completion contract.
- You MAY create/update any files needed to satisfy the DoD, but ONLY within allowed write paths.
- Treat framework-owned contracts as normative for generic behavior and resolved role bindings/gates as authoritative for stack/provider-specific realization.
- Do not solve runtime-wiring drift by inventing worker-local stack lore; if the needed rule is missing from a contract, role binding, or gate, fail closed and surface the ownership gap.
- You MUST write a task report to `caf/task_reports/<task_id>.md` listing:
  - files touched
  - how to validate manually (commands are OK to suggest, but do not run them)
- For UI/UX package surfaces, do not run host-side package-manager or bundler commands in the companion repo as task validation. Dockerfiles own that build path; task reports may suggest manual commands but the worker must not execute them.
- Do not introduce placeholder tokens: `TBD`, `TODO`, `REPLACE_ME`, `FIXME`.
- When the assigned task requires `ux_service_packaging_wiring`, keep the richer UX lane additive to the existing stack; do not rewrite `code/ui/`, `docker/Dockerfile.ui`, or `docker/nginx.ui.conf` unless shared compose-file coherence requires a bounded edit in the owning assembly surface.
- Any file you create or substantially rewrite MUST include a `CAF_TRACE:` header block at the top, using the correct comment syntax for the file type (see CAF Operating Contract: "CAF trace headers").

## Guidance (semantic)

When wiring an HTTP API service:

- Ensure the main application registers all routers.
- Ensure the service entrypoint is clear (for example `main.py` exports `app`).
- Ensure there is a coherent local run path if the DoD requires runnable behavior.

When wiring compose-backed runtime surfaces:

- Read `tools/caf/contracts/runtime_wiring_compose_posture_contract_v1.md` before editing compose/Dockerfile/env surfaces.
- Treat `docker/compose.candidate.yaml` as the shared runtime assembly surface for this capability family; if prior compose drift exists, repair it here and keep the file coherent.
- Materialize the services required by the task DoD, the task graph, the applicable contracts, and the resolved role bindings.
- If shared compose must incorporate support services or browser services selected by other tasks, integrate them without taking ownership of their provider- or stack-specific contract semantics.
- Keep deployment identity Guardrails-owned: read `deployment.stack_name` from `profile_parameters_resolved.yaml` and use that canonical value for any deployment/compose identity surface you materialize.
- For Node/Vite UI or UX Dockerfiles, do not assume `code/ui/package-lock.json` or `code/ux/package-lock.json` exists unless a committed lockfile is already present in the companion repo or the same bounded task intentionally materializes it. Default to copying `package.json` and using `npm install --no-audit --no-fund`; use `npm ci` only when the matching lockfile is actually owned and copied in the same task.
- When the current capability is `ux_service_packaging_wiring`, use `tools/caf/contracts/ux_service_packaging_and_wiring_contract_v1.md` as the normative same-stack packaging posture.

When interface bindings apply:

- If `caf/interface_binding_contracts_v1.yaml` contains an entry whose `assembler.task_id` matches the current task, follow `tools/caf/contracts/interface_binding_contract_v1.md` for dependency-wiring-mode selection and closure-surface rules.
- For each closed binding, write `caf/binding_reports/<binding_id>.yaml` as the build-owned evidence artifact.
- `evidence.assembler_artifact_paths[]` must point to the actual closure surface used by the selected realization mode.
- Unless an artifact truly lives outside the companion repo, record evidence paths relative to the companion repo root.
- Wave order, imports, or incidental reachability alone are not evidence of binding closure.

## Failure modes

- Any required input missing or outside rails → fail closed.
- Ambiguous runtime shape not declared by the planner → fail closed.
- A required contract or resolved role-binding expectation for the selected runtime task is missing, contradictory, or cannot be satisfied within rails → fail closed.
- An interface binding applies but no valid closure surface can be evidenced for the selected dependency-wiring mode → fail closed.
