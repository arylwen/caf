---
name: worker-python-packaging
description: >
  Deterministically materialize Python package marker files (__init__.py) required
  for importable candidate code packages per TBP-PY-01.
status: active
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.


# worker-python-packaging

## Capabilities

- python_package_markers_materialization

## Purpose

Ensure candidate Python code packages are importable by materializing missing
`__init__.py` marker files under the TBP-declared Python code root (default: `code/`).

This worker is **mechanical**:
- no architecture decisions
- no framework/vendor selection
- no runtime execution

## Inputs (authoritative)

- `companion_repositories/<name>/**` (candidate repo)
- The assigned Task Graph task (from `caf/task_graph_v1.yaml` or the reference_architectures copy)
- `reference_architectures/<name>/spec/guardrails/profile_parameters_resolved.yaml` (write rails)
- `architecture_library/phase_8/tbp/atoms/TBP-PY-01/tbp_manifest_v1.yaml` (code root + obligation role bindings)

## TBP role-binding enforcement (mandatory)

Before writing any markers, resolve TBP role bindings and obey the manifest-declared paths.

Run (from repo root):
- `node tools/caf/resolve_tbp_role_bindings_v1.mjs <instance_name> --capability python_package_markers_materialization`

Then:
- Ensure the role binding path(s) exist (at minimum: `code/__init__.py`).
- Do NOT invent alternate layouts (e.g., `src/`) unless the TBP manifest declares them.

## Execution

1) Run the deterministic materializer:
- `node tools/caf/materialize_python_package_inits_v1.mjs <instance_name>`

2) Write a task report to `caf/task_reports/<task_id>.md` listing:
- files created (package markers)
- how to validate manually (commands are OK to suggest, but do not run them)

## Eligibility

A task is eligible if `required_capabilities` contains `python_package_markers_materialization`.

If not eligible: refuse.

## Failure modes

- Missing guardrails or companion repo target → fail closed.
- Any required marker path would be outside allowed write rails → fail closed.
