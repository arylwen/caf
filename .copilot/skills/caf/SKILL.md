---
name: caf
description: >
  Use caf help for next steps.
status: active
---

# CAF

This is a thin Copilot shim.

Canonical router skill (authoritative; resolved at runtime):

- Default: `skills/caf/SKILL.md`
- If `tools/caf-state/active_skillpack.json` contains `"active_pack": "portable"`: `skills_portable/caf/SKILL.md`

If you are an agent, follow `.github/AGENT_INSTRUCTIONS.md` first, then execute the canonical skill.

(For a full shim with command hygiene, see `.codex/skills/caf/SKILL.md`.)
