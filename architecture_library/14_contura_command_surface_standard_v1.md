# Contura Command Surface Standard (v1)

## Purpose

Define a **single, CAF-owned command inventory** that:
- exposes a **single router command** (`/caf`) to minimize user friction
- keeps non-canonical workflows out of the advertised surface
- keeps runner-specific invocation strings (Antigravity, Codex, etc.) as thin adapters

## Definitions

- **Core command**: primary architect workflow. Safe to recommend by default.
- **Unsupported UX surface**: a workflow/skill that exists in the repo but is **not** listed in the canonical inventory. It must not be advertised.

## Canonical inventory

The command surface is defined in:

- `architecture_library/15_contura_command_surface_inventory_v1.yaml`

This inventory is **normative**.

## Runner invocation mappings

Runner-specific invocation strings are defined outside CAF norms (runtime adapter layer). For Antigravity:

- `.agent/runtime/runtime_vocabulary.md`

For Codex:

- `.codex/runtime/runtime_vocabulary.md`

These files map each `command_id` to a runnable command string, but **do not define** what commands exist.

## `/caf help` presentation rules

`/caf help` must:

1. Use the canonical inventory to decide what exists and how it is classified.
2. Present a single happy-path command surface:
   - `/caf help`
   - `/caf saas <name>`
   - `/caf prd <name> [promote=true|false]`
   - `/caf arch <name>`
   - `/caf plan <name>`
   - `/caf next <name> [apply]`  *(omit `apply` for dry-run preview; include `apply` to checkpoint and advance)*
   - `/caf build <name>`
3. Present `/caf prd` as the normal lifecycle step between `/caf saas` and the first `/caf arch`, not as an optional side workflow.
4. Do not advertise any additional commands.

## Drift rules

If a workflow/skill exists but is not listed in the inventory, it is considered **unsupported UX surface** and must not be advertised.
