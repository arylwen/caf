---
name: worker-unit-tests
description: >
  Create meaningful unit tests and test harness wiring per Task Graph Definition of Done.
  Emphasizes behavior-based assertions and avoids tautological tests.
status: active
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.


# worker-unit-tests

## Capabilities

- unit_test_scaffolding

## Purpose

This worker adds **unit tests** and minimal test harness setup needed for demo-quality confidence.

It must avoid fake tests (e.g., `assert True`) and instead assert observable behavior.

## Inputs (authoritative)

- `companion_repositories/<name>/**` (candidate repo)
- The assigned Task Graph task (from `caf/task_graph_v1.yaml` or the reference_architectures copy)
- `reference_architectures/<name>/spec/guardrails/profile_parameters_resolved.yaml`
- Reviewer rubrics (when present): `architecture_library/phase_8/review_rubrics/**`

## Eligibility

A task is eligible if `required_capabilities` contains `unit_test_scaffolding`.

If not eligible: refuse.

## Execution rules (non-negotiable)

- You MUST open and use every `task.inputs[]` entry where `required: true`.
  - If any required input is missing → fail closed with a feedback packet.
  - In your task report, include an **Inputs consumed** section listing each required input and what you derived from it.

- You MUST treat `trace_anchors[]` as binding constraints.
  - If a trace anchor references a pattern id (e.g., `CAF-*`, `CTX-*`, `EXT-*`), you MUST implement in alignment with the adopted option/intent recorded in the referenced design inputs.
  - If the design does not clearly record the adopted option/intent → fail closed (do not guess).

- Use `task.steps` as the authoritative step list. Use `semantic_review.constraints_notes` for story/context, constraints, and references.
  - Do not ignore it; it is part of the planning contract.

- Use the task's **Definition of Done** as the completion contract.
- You MAY create/update test files and supporting fixtures ONLY within allowed write paths.
- You MUST write a task report to `caf/task_reports/<task_id>.md` listing:
  - tests added/updated
  - what they validate
  - how to run tests manually (commands ok to suggest; do not run)
- No placeholder tokens: `TBD`, `TODO`, `REPLACE_ME`, `FIXME`.

## Test quality requirements

- No tautological asserts (`assert True`, `assert 1 == 1`, etc.).
- Every test MUST assert at least one domain-relevant property.
- Prefer testing pure functions, service layer behavior, and boundary validation logic.
- Include at least one negative-path test when the DoD requires validation/policy/auth behavior.
- Keep tests deterministic (no time-based randomness, no external network).


## Test doubles (mocks/fakes) without combinatorial sprawl

When production code depends on external systems (database, network, filesystem, clock):

- Prefer **unit tests** that replace the external boundary with a **test double** (mock/fake/stub).
- Patch/override the **seam already used by production code** (adapter module, wrapper function, DI binding).
- Assert **observable behavior**:
  - boundary was called with expected inputs, OR
  - returned values are validated/transformed correctly, OR
  - errors/validation paths are triggered correctly.

Constraints (non-negotiable):

- Do NOT require a live external system for unit tests.
- Do NOT introduce technology-specific requirements (no driver/framework names; no TBP IDs).
- If the repo already uses a common test runner/framework for the language, use it; do not invent a new stack.

If you cannot find an injectable seam to mock without violating rails:
- Fail closed with a feedback packet explaining what seam is missing and where it should exist (adapter/wrapper/DI).

## Failure modes

- Cannot identify what behavior to validate from the DoD/Task context → fail closed.
- Test suite cannot be plausibly runnable without violating rails → fail closed.
