# CAF fail-closed permission checkpoint meta-pattern v1

## Purpose

CAF is **fail-closed**: when required artifacts are missing, malformed, contradictory, or ungroundable, we emit a feedback packet and stop.

However, some agents optimize for cost and will look for a “technically defensible” early exit:

- run only deterministic scripts
- jump directly to a validation gate
- fail-closed on “missing outputs” that are missing **because the agent skipped the instruction-owned producer stage**

This note defines a repo-level engineering pattern that preserves fail-closed correctness while giving agents a **sanctioned, low-cost alternative** to shortcuts:

> Allow a single **permission checkpoint** question before instruction-heavy semantic stages.

## Scope

This meta-pattern applies to **instruction-owned semantic stages** in the derivation cascade (e.g., semantic retrieval, design/planning producers) where:

- there is no deterministic script equivalent, or
- the work is intrinsically semantic / LLM-owned, and cost can vary.

This document does **not** change CAF architectural intent; it captures the sanctioned engineering convention for skills and runtime workflows.

## Design goals

- Preserve **fail-closed** for genuine invariant violations.
- Prevent “script-hunting” / “gate-jumping” / “preflight-as-substitute-for-execution.”
- Provide a compliant, minimal-cost “escape valve” that is visible and user-controlled.
- Keep token footprint low (ask once; offer bounded options).
- Reduce drift across agent families by making the pattern explicit.

## Core principle

### Fail-closed remains the rule

If a stage’s required outputs are missing **after the stage was executed**, fail-closed is correct.

### But: add a permission checkpoint before expensive semantic work

When entering an instruction-heavy semantic producer stage, the agent may ask **one** short question:

- why it’s asking (what it’s about to do)
- what it observed (if relevant)
- a small set of options

The question must be **actionable** and must not be used to avoid execution by default.

## Forbidden shortcuts (anti-patterns)

These behaviors are non-compliant and must be treated as “do not do this” in skills and guidance:

1. **Script-only run + gate jump**
   - running only deterministic helpers, then immediately running validation gates.

2. **Preflight-as-substitute-for-execution**
   - inspecting whether outputs exist (“freshness checks”) before running the responsible producer.
   - concluding “blocked” because outputs are missing right after a reset/wipe.

3. **Circular fail-closed**
   - “outputs missing → therefore I must fail-closed,” when the outputs are missing because the producer was not run.

4. **Cross-instance templating**
   - copying a different instance’s `design/` artifacts as a “baseline template” to satisfy invariants.

## Permission checkpoint semantics

### When allowed

Use a permission checkpoint **only** when all of the following hold:

- the next step is instruction-heavy and semantic
- cost/effort could be meaningfully higher than typical
- the system would otherwise incentivize a shortcut (script-hunt / gate jump)

### When not allowed

Do **not** ask permission as a way to avoid normal execution.
If the step is routine, proceed.

### “Ask once” rule

- Ask at most **once per semantic stage**.
- If the user chooses “continue,” execute the stage without asking again.

### Required option set

Offer a small bounded set of choices:

1. **Run the stage now** (recommended)
2. **Fail-closed with the correct feedback packet** (only if the user explicitly chooses this)
3. **Stop / pause** (no further action)

Keep the phrasing short. No long explanations.

## How we implemented it in CAF

We implemented permission checkpoints in the instruction-heavy producer skills that were most frequently “skipped then failed” by cost-optimizing agents.

Look for “permission checkpoint” / “ask once” / “anti-circularity” sections in:

- `skills/caf-arch-implementation-scaffolding/SKILL.md`
- `skills/caf-solution-architect/SKILL.md`
- `skills/caf-application-architect/SKILL.md`

These skills:

- explicitly forbid script-only + gate-jump flows
- explicitly state that “missing outputs after reset” is expected until producers run
- provide the sanctioned “ask once” alternative

## Authoring guidance (for future skills)

When adding a new instruction-heavy semantic stage:

1. Add a **short permission checkpoint block** immediately before the stage’s execution steps.
2. Add an explicit “Forbidden shortcuts” bullet list (keep it short).
3. Ensure postconditions are evaluated **after execution**, not via preflight.
4. If a reset/wipe step exists, explicitly state that missing outputs are expected until the producer runs.

## Example checkpoint prompt (template)

Use this exact shape (keep it short; no extra prose):

```markdown
> I’m about to run **<stage>** (instruction-heavy semantic work) to generate **<required outputs>**.
> I can proceed now, or stop / fail-closed if you prefer.
> 1) Run the stage now (recommended)
> 2) Fail-closed with the required feedback packet
> 3) Stop / pause
```
