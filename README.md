<h1 align="left">
  <img src="docs/images/contura-logo-150_v1.png" alt="CAF logo" width="48" style="vertical-align: middle; margin-right: 12px;" />
  Contura Architecture Framework (CAF)
</h1>

CAF (Contura Architecture Framework) turns vibe coding into **intentional architecture**.

CAF is built for teams who want to answer stakeholder questions like:

1) **“What architecture decisions did we make, and why?”**
2) **“For this product/architecture intent, how big is the work?”**
3) **“If we change X, what features/architectural intent does it impact?”**

---

## Quick start (ask-first)

```text
git clone github.com/arylwen/caf
/caf ask For codex-saas, what architecture decisions did we make, and why?
```

(For the full workflow to create new instances, see **Quickstart (generate an instance)** below.)

---

## Questions you can ask (with example prompts)

CAF is designed so your assistant can answer questions **without guessing**:

- use `/caf ask <question...>`
- mention the instance name in the question (or omit it to use the default sample instance)

### 1. Architectural decision process (visibility)

Ask your assistant:

- `/caf ask Summarize the main features of the codex-saas reference architecture.`
- `/caf ask Summarize the patterns selected for codex-saas and the architectural intent (pins) that drove them.`

### 2. Work visibility (cost / size of change)

Ask your assistant:

- `/caf ask Given pin CP-4, what obligations and tasks are implied?`
- `/caf ask For intent tenant_context_propagation, what work is implied (tasks, dependencies, inputs)?`

### 3. Risk / impact assessment

Ask your assistant:

- `/caf ask If we change code/ap/widgets/service.py, what intent/work is most likely impacted?`

Note: CAF is strongest at **intent → work** impact (pins → patterns → obligations → tasks). File-level impact becomes much stronger after `/caf build`, when you can inspect the generated companion workspace.

---

## Quickstart (generate an instance)

These commands create a fresh SaaS instance, derive architecture + planning artifacts, advance phases, and generate **candidate** code.

CAF supports Claude Code, Codex, and Antigravity coding agents and provides a single command surface (`/caf ...`).

```text
/caf saas hello-saas
/caf arch hello-saas
/caf next hello-saas apply=true
/caf arch hello-saas
/caf plan hello-saas
/caf build hello-saas
```

---

## Docs

- User docs (public): [`docs/user/README.md`](docs/user/README.md)
- Pattern browsing: [`docs/patterns/README.md`](docs/patterns/README.md)

---

## What you get (and what you don’t)

- CAF produces **architecture and design specification, backlog and project plan, and candidate code**.
- CAF is **not** a “ship-to-prod” generator: outputs are **candidate-only** and require human review.

Notes:

- CAF is **fail-closed**: if inputs are missing/ambiguous, it emits a feedback packet instead of guessing.
- Output is **candidate-only** (not production-ready).
- **Review the agent permissions in .vscode/settings.json and .claude/settings.local.json and make sure they meet your security requirements before running the agent.**
- **Safety rule (agents):** CAF workflows should **not** run any `git` commands (read or write). Treat the working tree as the source of truth.

---

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
