---
name: caf
description: Runner shim that resolves the active CAF skillpack and delegates to the canonical /caf router.
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.

# /caf (runner shim)

This file exists only to select the correct skillpack (default vs portable) at runtime.

## Resolution (deterministic)

- Default: `skills/caf/SKILL.md`
- If `tools/caf-state/active_skillpack.json` contains `"active_pack": "portable"`: `skills_portable/caf/SKILL.md`

When invoked, execute the resolved router skill **verbatim** (no extra steps, no alternate flows).
