# Core concepts

![CAF operating loop](../images/caf_operating_loop.svg)

*CAF is an operating loop: intent becomes decisions, decisions become work, work becomes candidate outputs, and the resulting state stays queryable.*

## Pins

Pins are human-declared architectural intent (constraints and priorities).

Pins are kept small and explicit so CAF can validate them deterministically (enums, schemas, allowed values).

## Patterns

Patterns are reusable architecture decisions. CAF retrieves candidates, then you adopt/defer/reject.

Patterns are organized into **families** (e.g., IAM, POL, MTEN). For browsing:

- Taxonomy + graphs: [`docs/patterns/pattern_taxonomy_v1.md`](../patterns/pattern_taxonomy_v1.md)
- Offline browser: [`docs/patterns/pattern_browser_v1.html`](../patterns/pattern_browser_v1.html)

## Obligations

Adopted patterns imply **non-optional deliverables**. CAF calls these deliverables **obligations**.

Think of an obligation as:

- a design-level “must ship” item (e.g., *idempotency strategy documented*, *auth boundary defined*)
- written so it can be planned and validated (not a vague principle)

Obligations are how CAF turns a decision into concrete work.

## Capabilities

Capabilities are the **types of work** CAF knows how to plan and validate across projects.

Think of a capability as:

- a stable “work verb” (e.g., *define auth model*, *emit policy hooks*, *add observability surface*)
- used to ensure the task graph has coverage for every obligation

In practice:

- **Patterns** define *what must be true* (obligations).
- **Capabilities** help CAF organize *how the work happens* (task graph coverage).

## Task graph + backlog

CAF decomposes obligations and capabilities into a task graph and backlog entries.

The backlog is the bridge between architecture/design and candidate code generation.

## Feedback packets

CAF emits structured feedback packets when it cannot proceed deterministically.

The goal is to make “what to fix next” explicit and auditable.

## Glossary (CAF-specific terms)

- **Pin** — An explicit, human-declared input (constraint or priority).
- **Pattern** — A reusable decision you can adopt/defer/reject.
- **Obligation** — A required deliverable implied by adopted patterns.
- **Capability** — A reusable type of work that helps ensure obligations are planned and satisfied.
- **Gate** — A deterministic contract check that blocks progress on mismatch.
- **Feedback packet** — A structured failure report telling you what to fix next.

## Find out more

[Instances, phases, and state](05_instances_phases_and_state.md) — See where the concepts on this page show up in a real CAF instance.

## You might also be interested in

- [PRD workflow](12_prd_workflow.md) — Follow how requirement text becomes pins, decisions, and later obligations.
- [Architecture library](06_architecture_library.md) — Browse the reusable patterns and rules that CAF retrieves and applies.
- [Skills, runners, and command surface](07_skills_runners_and_command_surface.md) — Understand how CAF routes work across command and execution surfaces.

