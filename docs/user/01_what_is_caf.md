# What is CAF?

CAF (Contura Architecture Framework) is the fail-closed architecture control layer for AI-assisted software delivery.

CAF helps teams use coding agents without letting architecture turn into an afterthought.

It turns PRDs and architecture decisions into explicit checkpoints, evidence, plans, candidate code, and an optional richer UX lane.

![CAF end-to-end pipeline](../images/caf_end_to_end_pipeline.svg)

*CAF is a staged delivery system, not a one-shot generator. Each stage answers one question and hands a durable artifact to the next stage.*

## What that means

CAF is designed for teams that want to move faster with coding agents while still keeping human architectural control.

The basic idea is:

1. start from product intent and constraints
2. derive architecture before implementation work
3. turn adopted architecture into planned work
4. generate candidate code from that planned work
5. optionally derive a richer UX lane after the second architecture pass and main build lane
6. keep the resulting state queryable instead of burying it in chat history

## Why CAF exists

Many AI coding flows jump from prompt to code.

CAF takes a different path. It keeps architecture active during delivery, so the team can still ask:

- what decisions did we make, and why?
- how much work does this imply?
- what is likely affected if something changes?

## What fail-closed means

Fail-closed means CAF does not quietly improvise when required inputs are missing, contradictory, or ambiguous.

Instead, CAF blocks progression and emits a feedback packet telling you what needs to be fixed next.

That matters because it keeps convenience from quietly turning into hidden policy.

## What CAF produces

CAF is designed to produce durable delivery artifacts, including:

- lifecycle-ready product intent
- architecture scaffolding and adopted decisions
- planning bundles and task graphs
- candidate code
- optional richer UX artifacts, UX plans, and UX build outputs
- ask/query context built from those artifacts

## What CAF is not

- Not a prompt-to-code shortcut.
- Not a replacement for architectural review.
- Not a ship-to-production generator.

## Find out more

[Quickstart](03_quickstart.md) — Create a first CAF instance and follow the default PRD-first command flow.

## You might also be interested in

- [Core concepts](04_core_concepts.md) — Learn the meaning of pins, patterns, obligations, capabilities, gates, feedback packets, and the optional richer UX lane.
- [PRD-first lifecycle](15_prd_first_lifecycle.md) — See the default flow end to end.
- [Answering questions with CAF](14_answering_questions_with_caf.md) — Use `/caf ask` to inspect architecture and work without guessing.
