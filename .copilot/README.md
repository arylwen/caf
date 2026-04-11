# Copilot shims (CAF)

These are thin, low-maintenance shims for GitHub Copilot.

## How Copilot consumes instructions

Copilot reads repository instructions from:
- `.github/copilot-instructions.md`
- `.github/AGENT_INSTRUCTIONS.md` (canonical)

This `.copilot/` folder exists for symmetry with `.codex/` and `.claude/`, and for quick human navigation.

## Canonical skill procedures

The authoritative router skill procedures live at:
- `skills/caf/SKILL.md` (default; `skills_portable/caf/SKILL.md` when `tools/caf-state/active_skillpack.json` sets `active_pack` to `portable`)
- `skills/caf-meta/SKILL.md`

The shim skills under `.copilot/skills/*` simply point to those canonical paths.

## Local scripts

- Use `.copilot/scripts/` for Copilot-local helper scripts.
- Keep temporary helpers out of `tools/caf/` unless they are being promoted into a maintainer-vetted canonical framework helper.
