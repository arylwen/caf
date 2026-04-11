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
- `.kiro/` (Kiro IDE workspace skills)
- `.agent/` (Antigravity / generic)

These folders contain routing metadata so a runner can discover `/caf`.

For Kiro IDE specifically, `.kiro/skills/` is the project-local workspace skill surface that exposes CAF through the IDE slash-command picker while still delegating to the canonical `skills/` implementation.

For the packaged terminal helpers, prefer the direct Node entrypoints from the repo root:

```powershell
node .\tools\caf\cli\codex\run_caf_flow_v1.mjs codex-saas
node .\tools\caf\cli\claude\run_caf_flow_v1.mjs codex-saas
node .\tools\caf\cli\claude-local\run_caf_flow_v1.mjs codex-saas
```

The `.cmd`, `.sh`, and `.ps1` wrappers remain supported as alternates. `claude-local` is the local-endpoint counterpart to the Claude helper and keeps the same CAF lifecycle semantics while injecting local runner and LM Studio recovery settings.

## Command surface

Use `/caf help` to discover commands.

CAF intentionally exposes a small set of subcommands:

- `/caf ask <question...>`
- `/caf saas <instance>`
- `/caf prd <instance>`
- `/caf arch <instance>`
- `/caf next <instance> apply`
- `/caf plan <instance>`
- `/caf backlog <instance>`
- `/caf build <instance>`
- `/caf ux <instance>`
- `/caf ux plan <instance>`
- `/caf ux build <instance>`

CAF is designed so missing/ambiguous inputs fail closed (via feedback packets) rather than inventing a path forward.

`/caf prd` is part of the default lifecycle, not a side workflow: `/caf saas` seeds PRD source docs and a bootstrap shape, `/caf prd` promotes a lifecycle-ready shape, and the first `/caf arch` warns if you are still on the bootstrap default.


The UX commands are part of the main `/caf` quick-start surface.

Run them in this order:

- `/caf ux <instance>` after the second `/caf arch <instance>` to derive `ux_design_v1.md` and `ux_visual_system_v1.md`
- `/caf ux plan <instance>` after `/caf ux <instance>` to produce `ux_task_graph_v1.yaml`, `ux_task_plan_v1.md`, and `ux_task_backlog_v1.md`
- `/caf ux build <instance>` after the main `/caf build <instance>` completes to realize the richer UX lane against the already-built backend/runtime truth

These commands extend CAF's richer UX lane. They do not replace the smoke-test UI path, and they stay on top of the current REST/OpenAPI backend rather than inventing a separate backend contract.

## Backlog projection

- `/caf plan <instance>` owns the semantic planning bundle.
- `/caf backlog <instance>` projects `task_backlog_v1.md` on demand from the existing `task_graph_v1.yaml`.
- This split keeps large planning runs from inventing ad-hoc projector scripts under `tools/caf/`.
