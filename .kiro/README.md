# Kiro IDE shim

This folder is a thin shim for **Kiro IDE workspace skills**.

It mirrors the intent of `.claude/`, `.codex/`, and `.copilot/` without duplicating CAF's canonical skill implementations.

## Canonical (authoritative) skills

- Router skill: `skills/caf/SKILL.md` (default; `skills_portable/caf/SKILL.md` when `tools/caf-state/active_skillpack.json` sets `active_pack` to `portable`)
- Meta router: `skills/caf-meta/SKILL.md`

The shim skills under `.kiro/skills/**` delegate to the canonical skills.

## Command invocation

- Kiro IDE workspace skills: use `/caf ...` from the chat slash-command surface when the workspace skill is discovered.
- Common public surface: `/caf ask`, `/caf saas`, `/caf prd`, `/caf arch`, `/caf next <instance_name> apply`, `/caf plan`, `/caf backlog`, `/caf build`, `/caf ux`, `/caf ux plan`, `/caf ux build`.

## Local scripts

- Use `.kiro/scripts/` for Kiro-local helper scripts.
- Keep temporary helpers out of `tools/caf/` unless they are being promoted into a maintainer-vetted canonical framework helper.

## Runtime notes

See `.kiro/runtime/` for the assumed runtime environment vocabulary.
