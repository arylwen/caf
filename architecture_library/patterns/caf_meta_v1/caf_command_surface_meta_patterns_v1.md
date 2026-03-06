# CAF Command Surface Meta-Patterns v1

This document replaces the former `CAF-CMD-*` entries that previously lived under:

- `architecture_library/patterns/caf_v1/definitions_v1/CAF-CMD-*.yaml`

Those were CAF **meta-patterns** (framework/tooling UX and drift rules), not CAF **domain patterns**.
They are consolidated here to avoid treating command UX conventions as architectural “domain patterns”.

## Sources to reconcile (keep in sync)

CAF is evolving, and multiple shims exist. Before assuming any single artifact is authoritative, **flag discrepancies** across the following sources and reconcile intentionally:

- **Skills (canonical implementation):** `skills/`
- **Codex shim:** `.codex/` (entry skills are thin shims that delegate to `skills/` or `skills_portable/`; must not fork behavior)
- **Claude Code shim:** `.claude/` (entry skills are thin shims that delegate to `skills/` or `skills_portable/`; must not fork behavior)
- **Agent workflows:** `.agent/workflows/` (usage/how-to; may lag or drift)
- **Agent runtime permissions:** repo-root `AGENTS.md` and the companion template used by `caf-companion-init`
- **Command surface docs (human-facing):** `architecture_library/14_contura_command_surface_standard_v1.md`
- **Command inventory (machine-facing):** `architecture_library/15_contura_command_surface_inventory_v1.yaml`

### Discrepancy policy (fail-closed for drift)

If these sources disagree:

1. **Do not treat any single source as automatically authoritative.**
2. Write a **drift note** capturing the mismatch and the proposed resolution.
3. Update the relevant sources together (inventory + docs + shims) so they converge.

The goal is: **one coherent command surface**, with shims (`.codex/`, `.agent/`) staying mechanically aligned with `skills/`.

## Meta-pattern CMD-01: One inventory, kept in sync

**Rule:** Maintain a single command inventory file (`architecture_library/15_contura_command_surface_inventory_v1.yaml`) as the **intended registry**, but **do not assume it is correct by default**. Reconcile it with `skills/`, `.codex/`, `.agent/workflows/`, and `AGENTS.md` when discrepancies are found.

Docs and help output must **reference** this inventory; they must not re-state or fork it.

### Drift check (recommended)

A drift evaluator should fail if:

- a documented command exists that is not in the inventory, or
- an inventory command is missing from `/caf-help` output, or
- the `skill:` path in the inventory points to a missing file.

## Meta-pattern CMD-02: Runner invocation mappings are derived, not authored

**Rule:** Runner invocation syntax (slash commands, aliases, UX surfaces) must be derived from:

- inventory entries + runner conventions

The inventory must not depend on implementation details of a specific runner. The runner may provide aliases, but aliases must map back to canonical `command_id`s.

## Meta-pattern CMD-03: Help presentation is stable and lint-friendly

**Rule:** `/caf-help` output:

- groups commands by `ux_surface`
- shows `command_id`, `summary`, and `args` (name/required/kind)
- avoids normative language like “recommended” unless it is a *user choice* and explicitly framed as such
- must remain stable under reruns (deterministic ordering)

## Meta-pattern CMD-04: Commands are a UX surface, not a decision registry

**Rule:** The existence of a command must not imply architectural decisions.
Commands dispatch to skills; decisions remain in:

- `ARCHITECT_EDIT_BLOCK`s (human signals)
- CAF-managed derived views (Layer 8 resolved)
- contract declarations / inventories where applicable

## Staleness note

CAF is iterating quickly. If any content in `14_contura_command_surface_standard_v1.md` conflicts with:

- the current command inventory (`15_contura_command_surface_inventory_v1.yaml`), or
- current agent workflows (`.agent/workflows/`),
treat the inventory/workflows as authoritative and update the docs accordingly.


## Maintainer-only note

`/caf-meta` is a maintainer surface (library hygiene and audits). It may exist in runner shims, but must not be advertised in end-user onboarding docs unless clearly labeled as maintainer-only.
