# Skills, runners, and the `/caf` command surface

## Skills

Skills are the reusable workflow units executed by your runner.

- `skills/` uses Node helper scripts to reduce token cost and enforce determinism.
- `skills_portable/` is instruction-only (no script calls).

If you are publishing CAF, keep `skills_portable/` instruction-only.

## Runners

This repo includes runner shims:

- `.claude/` (Claude)
- `.codex/` (Codex)
- `.copilot/` (Copilot)
- `.agent/` (Antigravity / generic)

These folders contain routing metadata so a runner can discover `/caf`.

## Command surface

Use `/caf help` to discover commands.

CAF intentionally exposes a small set of subcommands:

- `/caf saas <instance>`
- `/caf prd <instance>`
- `/caf arch <instance>`
- `/caf next <instance> apply`
- `/caf plan <instance>`
- `/caf build <instance>`

CAF is designed so missing/ambiguous inputs fail closed (via feedback packets) rather than inventing a path forward.

`/caf prd` is part of the default lifecycle, not a side workflow: `/caf saas` seeds PRD source docs and a bootstrap shape, `/caf prd` promotes a lifecycle-ready shape, and the first `/caf arch` warns if you are still on the bootstrap default.
