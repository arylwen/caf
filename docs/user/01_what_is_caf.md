# What is CAF?

CAF (Contura Architecture Framework) turns PRDs into architecture, project plans, and candidate code through orchestrated, governed AI generation.

CAF is a **fail-closed**, state-machine-driven framework for turning architectural intent into **execution**:

- **Architecture decisions** (explicitly adopted, deferred, and rejected patterns)
- **Required deliverables** (design obligations) and the **work needed** to satisfy them (capabilities)
- **A task graph and backlog** that engineers can execute
- **Candidate code** in a companion repository

CAF is designed for **guardrailed autonomy**: the model can propose and generate, but CAF validates outputs deterministically and stops on ambiguity.

## Why CAF?

CAF makes architecture work visible and reviewable. Instead of “we’ll figure it out as we go,” you get:

- a concrete set of decisions the team is making
- a backlog that is **derived** from those decisions
- an audit trail for why work exists (intent → decision → work item)
- early surfacing of missing inputs (fail-closed feedback packets)

CAF turns architectural intent into **explicit decisions and an executable backlog** with a traceable “why.”

## What CAF is for

CAF helps you go from “here’s what we want to build” to a **traceable** solution plan:

1. You pin a small set of explicit inputs (pins). The pins express architectural intent.
2. CAF retrieves candidate patterns supporting the architectural intent and asks you to adopt, defer, or reject.
3. Adopted patterns emit obligations (required deliverables).
4. Obligations compile into a task graph and backlog.
5. The build step generates **candidate** code aligned to the backlog.

## What CAF is not

- Not an autopilot to production.
- Not a replacement for architectural review.
- Not a “best practice generator” that guesses when inputs are missing.

## Core design properties

- **Fail-closed:** when inputs are missing or ambiguous, CAF emits a feedback packet instead of guessing.
- **Deterministic gates:** mechanical checks enforce contracts and stop drift.
- **Traceability:** outputs are intended to answer “why is this here?” (architectural intent (pins) → patterns → obligations → tasks → code).

## Next

[Quickstart](03_quickstart.md) — Create a first CAF instance and see the core command flow end to end.

## Related

- [Core concepts](04_core_concepts.md) — Learn the core vocabulary that CAF uses to turn intent into work.
- [Product manager view](11_product_manager_view.md) — See CAF from the perspective of someone shaping requirements and priorities.
- [Answering questions with CAF](14_answering_questions_with_caf.md) — Use `/caf ask` to inspect an instance before generating more artifacts.

