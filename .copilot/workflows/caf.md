# CAF workflow entry (Copilot)

This repository uses **Contura Architecture Framework (CAF)** with a **router-only command surface**.
Copilot should treat this file as the primary workflow entry.

## First, load the repo constraints

Read (in this order):

1. `.github/copilot-instructions.md` (Copilot-facing rules + pointers)
2. `skills/caf/SKILL.md` (default router skill; if `tools/caf-state/active_skillpack.json` has `"active_pack": "portable"`, use `skills_portable/caf/SKILL.md`)
3. `skills/caf-meta/SKILL.md` (audit/diagnostics helper)
4. `architecture_library/phase_8/**` (Phase 8 standards, schemas, templates)

## Command surface (router-only)

Use only these commands (do not invent new ones):

- `caf help`
- `caf saas <name>`
- `caf arch <name>`
- `caf next <name> [apply=true]`
- `caf build <name>`

Tooling note:

- Codex uses `$caf ...`
- Antigravity uses `/caf ...`

## Operating rules (must follow)

- **Producer-side only**: never manually edit shipped instance outputs under:
  - `reference_architectures/**`
  - `companion_repositories/**`
  Fix skills/templates/validators/library declarations instead.
- **Fail-closed**: missing/ambiguous inputs or violated constraints → stop and write a **feedback packet**.
- **No bespoke procedural tech-stack recipes** inside skills: skills compile declarations into artifacts + diagnostics.

## Typical flow (marketing demo)

2. If a feedback packet is emitted:
   - Open `reference_architectures/<name>/feedback_packets/*.md`
   - Fix the root cause in producers (skills/templates/library declarations)
   - Re-run the demo
