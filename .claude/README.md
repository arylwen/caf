# Claude Code shim

This folder is a thin shim for **Claude Code / terminal-style agents**.

It mirrors the intent of `.codex/` without duplicating CAF's canonical skill implementations.

## Canonical (authoritative) skills

- Router skill: `skills/caf/SKILL.md` (default; `skills_portable/caf/SKILL.md` when `tools/caf-state/active_skillpack.json` sets `active_pack` to `portable`)
- Meta router: `skills/caf-meta/SKILL.md`

The shim skills under `.claude/skills/**` delegate to the canonical skills.

## Command invocation

- Terminal agents (Claude Code): use `/caf ...`
- Common public surface: `/caf ask`, `/caf saas`, `/caf prd`, `/caf arch`, `/caf next <instance_name> apply`, `/caf plan`, `/caf backlog`, `/caf build`, `/caf ux`, `/caf ux plan`, `/caf ux build`.

## Local scripts

- Use `.claude/scripts/` for Claude-local helper scripts.
- Keep temporary helpers out of `tools/caf/` unless they are being promoted into a maintainer-vetted canonical framework helper.

## Runtime notes

See `.claude/runtime/` for the assumed runtime environment vocabulary.
