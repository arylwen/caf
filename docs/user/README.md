# CAF user documentation

CAF is the fail-closed architecture control layer for AI-assisted software delivery.

CAF helps teams use coding agents without letting architecture turn into an afterthought.

It turns PRDs and architecture decisions into explicit checkpoints, evidence, plans, and candidate code.

![CAF end-to-end pipeline](../images/caf_end_to_end_pipeline.svg)

*Read this diagram top to bottom: product intent becomes architecture, architecture becomes planned work, and planned work becomes candidate code. Each stage leaves behind an artifact CAF can inspect later.*

## Start here

- [Invariants](../architect/invariants/README.md) — start with the architectural truths CAF is built to preserve.
- [What is CAF?](01_what_is_caf.md) — Short explanation of what CAF is, what it produces, and what fail-closed means.
- [Quickstart](03_quickstart.md) — Seed an instance and follow the default PRD-first path.
- [PRD-first lifecycle](15_prd_first_lifecycle.md) — See the default flow from seeded source docs into architecture, planning, and build.
- [Answering questions with CAF](14_answering_questions_with_caf.md) — Use `/caf ask` to inspect decisions, work, and likely impact before generating more artifacts.

## Read by goal

- **I want the shortest explanation first** — Start with [What is CAF?](01_what_is_caf.md), then read [Core concepts](04_core_concepts.md).
- **I want to create an instance and run CAF** — Read [Installation](02_installation.md), then [Quickstart](03_quickstart.md).
- **I want to understand the default lifecycle** — Read [PRD workflow](12_prd_workflow.md) and [PRD-first lifecycle](15_prd_first_lifecycle.md).
- **I want to understand why CAF blocks instead of guessing** — Read [Feedback packets and debugging](08_feedback_packets_and_debugging.md).
- **I want to ask architecture questions instead of rerunning everything** — Read [Answering questions with CAF](14_answering_questions_with_caf.md).

## What CAF does

1. Starts from product intent rather than a one-off build prompt.
2. Derives and checkpoints architecture before planning and build.
3. Compiles obligations into planned work.
4. Produces candidate code that remains tied to the earlier artifacts.

## What CAF is not

- Not an autopilot to production.
- Not a replacement for architectural review.
- Not a system that guesses silently when important inputs are missing.

## Core design properties

- **Fail-closed:** when inputs are missing or ambiguous, CAF emits a feedback packet instead of guessing.
- **Deterministic gates:** mechanical checks enforce contracts and stop drift.
- **Traceability:** outputs are intended to answer why a decision exists, how much work it implies, and what changes are likely affected.

## Find out more

[Quickstart](03_quickstart.md) — Create a first CAF instance and follow the default PRD-first command flow.

## You might also be interested in

- [PRD-first lifecycle](15_prd_first_lifecycle.md) — See how product intent becomes architecture, planning, and candidate code.
- [Product manager view](11_product_manager_view.md) — Read the requirements-side framing.
- [Architect docs](../architect/README.md) — Go deeper on decisions, sizing, impact, and architect-operated workflows.
