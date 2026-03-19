<h1 align="left">
  <img src="docs/images/contura-logo-150_v1.png" alt="CAF logo" width="48" style="vertical-align: middle; margin-right: 12px;" />
  Contura Architecture Framework (CAF)
</h1>

<p align="center">
  <strong>Follow CAF on:</strong>
  <a href="https://medium.com/contura-architecture-framework/most-ai-coding-flows-jump-from-prompt-to-code-caf-keeps-architecture-in-the-loop-8af17300501a">Medium</a> ·
  <a href="https://x.com/conturacaf">X</a>
</p>

Most AI coding flows jump from prompt to code. CAF keeps architecture in the loop.

CAF turns PRDs into architecture, project plans, and candidate code through orchestrated, governed AI generation.

CAF keeps product intent, architecture decisions, implementation architecture decisions, planning, and candidate code connected through human decision gates.

<p align="center">
  <img src="docs/images/caf_prd_first_journey.svg" alt="CAF PRD-first journey from seeded instance through PRDs, architecture, planning, and candidate code." width="100%" />
</p>

CAF gives teams three durable answers:

1) **Why does this decision exist?**
2) **How much work does it imply?**
3) **What breaks if it changes?**

CAF supports Claude Code, Codex, and Antigravity coding agents and provides a single command surface (`/caf ...`).

## Quick start (ask-first)

```bash
git clone https://github.com/arylwen/caf.git
cd caf
/caf ask For codex-saas, what architecture decisions did we make, and why?
```

Use the canonical `codex-saas` sample to understand CAF before generating anything new.

Questions you can ask right away:

- `/caf ask Summarize the main features of the codex-saas reference architecture.`
- `/caf ask Which patterns were selected for codex-saas, and which pins drove them?`
- `/caf ask Given pin CP-4, what work is implied?`
- `/caf ask If we change code/ap/widgets/service.py, what intent/work is most likely impacted?`

## Quick start (create your own instance)

Replace `<instance>` with your own name.

```text
/caf saas <instance>
/caf prd <instance>           # default next step: resolve PRD and promote a lifecycle-ready shape
/caf arch <instance>
/caf next <instance> apply
/caf arch <instance>
/caf plan <instance>
/caf build <instance>
```

## What you get (and what you don’t)

- CAF produces **architecture, project plans, and candidate code**.
- CAF is **not** a “ship-to-prod” generator: outputs are **candidate-only** and require human review.
- CAF is **fail-closed**: if inputs are missing or ambiguous, it emits a feedback packet instead of guessing.

## Next best link

[What is CAF?](docs/user/01_what_is_caf.md) — Get the shortest public explanation of what CAF does and why it exists.

## Top 3 related links

- [PRD-first lifecycle](docs/user/15_prd_first_lifecycle.md) — Follow the default product-intent to architecture to plan to build path.
- [Answering questions with CAF](docs/user/14_answering_questions_with_caf.md) — See how `/caf ask` turns CAF into a queryable delivery surface.
- [Architect docs](docs/architect/README.md) — Go deeper on decisions, sizing, impact, and architect-operated workflows.

## More docs

- User docs: [`docs/user/README.md`](docs/user/README.md)
- Maintainer docs: [`docs/maintainer/README.md`](docs/maintainer/README.md)
- Pattern browsing: [`docs/patterns/README.md`](docs/patterns/README.md)

## Repo landmarks

- `architecture_library/` — normative CAF intent: catalogs (patterns, TBPs, PBPs, policy matrices)
- `skills/` — canonical skill implementations; uses nodejs scripts to optimize token usage
- `skills_portable/` — instruction-only skill set (portable baseline)
- `.agent/` — router shim discovered by runners that use `/caf` under Antigravity
- `.claude/` — router shim discovered by runners that use `/caf` under Claude
- `.codex/` — router shim discovered by runners that use `/caf` under Codex
- `.copilot/` — router shim discovered by runners that use `/caf` under Copilot

Generated at runtime (typically **gitignored**; may not exist until you run CAF):

- `reference_architectures/<instance>/` — generated architecture artifacts (do not hand-edit outside `ARCHITECT_EDIT_BLOCK`)
- `companion_repositories/<instance>/` — generated candidate code workspace

## Notes

- **Review the agent permissions in `.vscode/settings.json` and `.claude/settings.local.json` and make sure they meet your security requirements before running the agent.**
- **Safety rule (agents):** CAF workflows should **not** run any `git` commands (read or write). Treat the working tree as the source of truth.

## Find CAF on

- Medium: [Architecture Still Matters in the Age of Vibe Coding](https://medium.com/contura-architecture-framework/most-ai-coding-flows-jump-from-prompt-to-code-caf-keeps-architecture-in-the-loop-8af17300501a)
- X: [CAF on X](https://x.com/conturacaf)