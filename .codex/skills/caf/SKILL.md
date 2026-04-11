---
name: caf
description: Runner shim that resolves the active CAF skillpack and delegates to the canonical /caf router.
status: active
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.

# /caf (runner shim)

This file exists only to select the correct skillpack (default vs portable) at runtime.

## Resolution (deterministic)

- Default: `skills/caf/SKILL.md`
- If `tools/caf-state/active_skillpack.json` contains `"active_pack": "portable"`: `skills_portable/caf/SKILL.md`

When invoked, execute the resolved router skill **verbatim** (no extra steps, no alternate flows).

## Codex runner hard stop

If this session already carries `CAF_ACTIVE_RUNNER_SESSION=1` and `CAF_ACTIVE_RUNNER_NAME=codex`, stay in the CURRENT Codex session.

- Do NOT shell out to `codex`, `codex exec`, another `/caf ...` command, or any other nested runner just to continue CAF.
- For `/caf build ...` and `/caf ux build ...`, current-session worker/reviewer dispatch is mandatory when `CAF_CURRENT_SESSION_DISPATCH_REQUIRED=1`.
- If you think nested runner execution is required, treat that as a fail-closed blocker and follow the canonical build/ux-build skill guidance. Do not try nested `codex exec` first.
