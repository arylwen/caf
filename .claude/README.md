# Claude Code shim

This folder is a thin shim for **Claude Code / terminal-style agents**.

It mirrors the intent of `.codex/` without duplicating CAF's canonical skill implementations.

## Canonical (authoritative) skills

- Router skill: `skills/caf/SKILL.md` (default; `skills_portable/caf/SKILL.md` when `tools/caf-state/active_skillpack.json` sets `active_pack` to `portable`)
- Meta router: `skills/caf-meta/SKILL.md`

The shim skills under `.claude/skills/**` delegate to the canonical skills.

## Command invocation

- Terminal agents (Claude Code): use `/caf ...`

## Runtime notes

See `.claude/runtime/` for the assumed runtime environment vocabulary.
