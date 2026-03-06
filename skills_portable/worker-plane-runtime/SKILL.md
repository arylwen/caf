---
name: worker-plane-runtime
description: >
  Materialize plane runtime scaffold artifacts declared by the Task Graph, without assuming frameworks.
  Writes runtime scaffolding needed to satisfy the task Definition of Done and trace anchors. Fail-closed.
status: active
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.


# worker-plane-runtime

## Capabilities

- plane_runtime_scaffolding

## Purpose

Produce **plane runtime scaffold** artifacts for a given plane, as declared in `task_graph_v1.yaml`.

This worker is **framework-agnostic**. It does not assume FastAPI, ASGI, HTTP, queues, or vendors.
Those choices must come from declarations (patterns/options) and (later) TBPs/PBPs.

## Inputs (authoritative)

- `companion_repositories/<name>/profile_*/caf/task_graph_v1.yaml` (or the reference_architectures copy)
- The assigned Task Graph task for this worker

## Task eligibility

A task is eligible if:

- `required_capabilities` contains `plane_runtime_scaffolding`.

If a task does not meet eligibility, refuse.

## Execution rules (non-negotiable)

- You MUST open and use every `task.inputs[]` entry where `required: true`.
  - If any required input is missing → fail closed with a feedback packet.
  - In your task report, include an **Inputs consumed** section listing each required input and what you derived from it.

- You MUST treat `trace_anchors[]` as binding constraints.
  - If a trace anchor references a CAF/core/external pattern id (e.g., `CAF-TCTX-01`), you MUST follow the adopted option as recorded in the design inputs.
  - If the design does not clearly record the adopted option → fail closed (do not guess).

- Use the task's **Definition of Done** as the completion contract, but interpret it in the full instance context (inputs + trace anchors).
  - Do not introduce new framework/vendor choices unless the inputs/trace anchors require them.

- You MAY create any files/directories needed to satisfy the Definition of Done, but ONLY within Guardrails rails.

- You MUST write a task report to `caf/task_reports/<task_id>.md` listing:
  - inputs consumed
  - decisions derived (with citations to inputs)
  - files touched
  - how to validate (semantic guidance; no brittle path assertions)

- Any file you create or substantially rewrite MUST include a `CAF_TRACE:` header block at the top, using the correct comment syntax for the file type (see CAF Operating Contract: "CAF trace headers").

- Placeholder hygiene: generated files must not contain `TBD`, `TODO`, `REPLACE_ME`, `FIXME`, `<?`, `??`.

## Content rules (semantic-only)

Typical artifacts (when warranted by the task's Definition of Done):

### `runtime/README.md`

Must state:

- the plane identifier (from the output path context)
- the selected runtime shape (if the Task Graph provides it in task metadata; otherwise state "runtime shape selected by planner" without inventing details)
- the intended ingress class in words (HTTP API, event worker, embedded library, custom)
- what this scaffold provides (module boundary + documentation only)
- what it intentionally does **not** provide (framework wiring, deployment config), and that those come from TBPs/PBPs.

### `asgi.py`

If an output path ends with `/asgi.py`, produce a minimal ASGI export file that:

- Uses a **package-relative** import:
  - `from .main import app`
- Exposes `app` as the ASGI callable.

This is scaffolding-only and must not claim production readiness.


## Failure modes

- Any placeholder token detected → fail closed.
- Any acceptance check cannot be evaluated deterministically → fail closed.
- Any required output cannot be written within rails → fail closed.
