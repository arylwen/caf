# CAF architect docs (advanced)

CAF is the fail-closed architecture control layer for AI-assisted software delivery.

CAF helps teams use coding agents without letting architecture turn into an afterthought.

This folder is for **software architects, solution architects, and platform engineers**.

These pages focus on how CAF keeps architecture active across planning, build, and later change.

![CAF operating loop](../images/caf_operating_loop.svg)

*Read this diagram as an operating model, not a one-time pipeline: humans steer intent, CAF structures architecture and delivery work, gates enforce consistency, and the resulting state stays queryable over time.*

## The architect view

CAF is built to help architects keep answering three durable questions without treating architecture as a one-time kickoff artifact:

1. **What decisions did we make, and why?**
2. **How much work does this imply?**
3. **If we change X, what is likely affected?**

## Quick entry points

- Invariants and catalogs: [`invariants/README.md`](invariants/README.md)
- Invariant taxonomy: [`invariants/invariant_taxonomy_v1.md`](invariants/invariant_taxonomy_v1.md)
- Mental model + traceability chain: [`01_mental_model.md`](01_mental_model.md)
- Decisions (what + why): [`02_decision_visibility.md`](02_decision_visibility.md)
- Sizing (how big is the work): [`03_work_visibility_sizing.md`](03_work_visibility_sizing.md)
- Change impact: [`04_impact_assessment.md`](04_impact_assessment.md)

## Ask-first workflow (architect-friendly)

CAF is designed so you can answer the three questions above via a single UX surface:

- `/caf ask <question...>`

Mechanically, `/caf ask` classifies an intent and materializes a compact **ask context pack** at:

- `reference_architectures/<instance>/{spec|design}/caf_meta/ask_context_v1.md`

See: [`06_caf_ask_internals.md`](06_caf_ask_internals.md)

## Read by goal

- **Understand traceability and ask surfaces** — Start with [Mental model](01_mental_model.md), then read [Traceability data model](05_traceability_chain_and_data_model.md) and [CAF ask internals](06_caf_ask_internals.md) to see how architect questions map to durable state.
- **Understand decisions, sizing, and impact** — Read [Decision visibility](02_decision_visibility.md), [Work visibility sizing](03_work_visibility_sizing.md), and [Impact assessment](04_impact_assessment.md) for the three core architect questions CAF is designed to answer.
- **Understand patterns, obligations, and fail-closed behavior** — Follow [Patterns → obligations → tasks](07_patterns_to_obligations_to_tasks.md), [Gates + fail-closed behavior](08_gates_and_fail_closed.md), [Drift resistance + audits](09_drift_resistance_and_audits.md), and [Architecture invariants and catalog](13_architecture_invariants_and_catalog.md) to see how architecture intent becomes governed downstream work.
- **Review the PRD-first architect flow in context** — Pair [Architect workflows](10_architect_workflows.md) with [PRD → Architecture Shape](../user/12_prd_workflow.md) and [PRD-first lifecycle](../user/15_prd_first_lifecycle.md) to see how architect-facing work fits into the default lifecycle.

## Recommended reading order

1. [Mental model](01_mental_model.md)
2. [Traceability data model](05_traceability_chain_and_data_model.md)
3. [How CAF answers “decisions + why”](02_decision_visibility.md)
4. [How CAF answers “how big is the work”](03_work_visibility_sizing.md)
5. [How CAF answers “if we change X, what breaks”](04_impact_assessment.md)
6. [CAF ask internals](06_caf_ask_internals.md)
7. [Patterns → obligations → tasks](07_patterns_to_obligations_to_tasks.md)
8. [Gates + fail-closed behavior](08_gates_and_fail_closed.md)
9. [Drift resistance + audits](09_drift_resistance_and_audits.md)
10. [Architect workflows](10_architect_workflows.md)
11. [Customization surfaces](11_customization_surfaces.md)
12. [Reference map](12_reference_map.md)
13. [Architecture invariants and catalog](13_architecture_invariants_and_catalog.md)
14. [Invariant taxonomy](invariants/invariant_taxonomy_v1.md)

For the end-to-end default sequence from seeded PRD to build, see also: [`../user/15_prd_first_lifecycle.md`](../user/15_prd_first_lifecycle.md)

## Related deep notes

For deeper mechanics, start with:

- `architecture_library/patterns/caf_meta_v1/caf_derivation_cascade_meta_patterns_v1.md`
- `architecture_library/patterns/caf_meta_v1/caf_promotions_and_obligations_meta_patterns_v1.md`
- `architecture_library/patterns/caf_meta_v1/caf_directory_and_enforcement_meta_patterns_v1.md`
- [Maintainer guide](../maintainer/README.md)

## Find out more

[Mental model](01_mental_model.md) — Start with the traceability model behind the three architect questions CAF is designed to answer.

## You might also be interested in

- [Architect workflows](10_architect_workflows.md) — See how the PRD-first launch path fits into day-to-day architect use.
- [CAF ask internals](06_caf_ask_internals.md) — Understand how architect questions map to durable ask context packs.
- [Architecture invariants and catalog](13_architecture_invariants_and_catalog.md) — Review the human-readable catalog of what CAF is trying to keep true and how it proves it.
- [PRD-first lifecycle](../user/15_prd_first_lifecycle.md) — Cross-check the lifecycle framing against the architect view.
