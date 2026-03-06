# Phase 8 Contract Scaffolding Enforcement Bar (v1)

status: normative  
bar_id: `contract_scaffolding_bar_v1`

## Purpose

Define the **minimum, fail-closed enforcement bar** for `generation_phase: architecture_scaffolding`.

This bar is intentionally **contract-heavy and code-thin**:

- no runnable entrypoint required
- no runtime wiring required
- no test execution required

It exists to make early-stage outputs **unambiguous and recoverable** for later phases, without forcing a runnable stack.

This bar is selected by the Phase 8 profile derivation policy matrix and written into:
- `reference_architectures/<instance_name>/guardrails/profile_parameters_resolved.yaml` → `candidate_enforcement_bar`

## What “pass” means

When `contract_scaffolding_bar_v1` is selected:

A) Tests
- No tests are required.
- No smoke tests are required.
- No contract tests are required.

B) Runtime wiring
- No `infrastructure/` runtime wiring is required.
- No `infrastructure/README.md` is required.

C) Placeholders
- Obvious placeholder tokens MUST NOT be introduced in generated outputs where CAF intends definitive content.
- Minimum forbidden token set (v1): `<...>`

Notes:
- Safe TODO comments are allowed when they are explicit and do not pretend to be complete.
- Later phases should replace TODOs with concrete implementations and tests under stricter bars.

## Relationship to candidate runnable bars

- Runnable candidate code is governed by: `candidate_bar_v1` (see `91_phase_8_candidate_code_enforcement_bar_v1.md`).
- `contract_scaffolding_bar_v1` is for early scaffolding only and should not be used to claim runnable behavior.

