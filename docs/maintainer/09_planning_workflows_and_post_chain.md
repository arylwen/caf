# Planning workflows and post-chain

This page is the maintainer-facing guide to the current CAF workflow views.

Use it when you need to answer questions like:

- What are the main lifecycle states and transition commands?
- What happens inside `/caf plan` after design outputs exist?
- Where do planner-owned, compiler-owned, enrichment-owned, and gate-owned responsibilities split?

## Diagram posture

CAF now keeps workflow diagrams as standalone Mermaid-backed maintainer pages under [`docs/maintainer/diagrams/`](diagrams/README.md).

Why:

- lifecycle/state views and internal activity views have different jobs
- the diagrams should be editable independently from this narrative page
- other maintainer pages can reuse the same workflow sources without re-owning the diagram body

## Which diagram to use

### Lifecycle and transitions

Start with [CAF lifecycle state machine](diagrams/caf_lifecycle_state_machine_v1.md).

Use it for:

- `/caf saas` seeding
- `/caf prd` promotion
- the first and second `/caf arch` transitions
- `/caf next <instance> apply` as a checkpoint transition
- the later `/caf plan` and `/caf build` transitions

### Internal `/caf plan` mechanics

Use [CAF plan post-chain](diagrams/caf_plan_post_chain_v1.md).

Use it for:

- compiler-owned obligations
- planner-owned task graph output
- deterministic post-plan enrichers
- fail-closed planning gates before build

### Ownership explanation inside planning

Use [CAF planning ownership split](diagrams/caf_planning_ownership_split_v1.md).

Use it for:

- explaining why obligations are compiler-owned
- showing what stays planner-owned
- showing how deterministic enrichers attach additional structure before gates

## Terms used on this page

- **CAF planning command** — the full `/caf plan <instance>` pipeline.
- **Planner-owned semantic step** — the application-architect reasoning step that emits task structure.
- **Compiler-owned artifact** — a deterministic framework artifact produced from structured inputs.
- **Deterministic enrichment** — framework-owned attachment or derivation after the planner-owned step.
- **Gate** — fail-closed verification that required compiled or enriched outputs exist and are coherent.

## Ownership summary

### What is planner-owned

- task existence
- task ids
- dependencies and wave shape
- required capabilities
- semantic anchors and task-local rationale
- genuinely interpretive grouping or sequencing decisions

### What is compiler-owned

- `pattern_obligations_v1.yaml`
- adopted-option obligation expansion
- TBP or PBP obligation expansion that can be derived mechanically
- optional derived debug or search projections such as TSV or JSONL mirrors

### What is deterministic-enrichment-owned

- semantic acceptance attachment expansion
- required-input attachment
- UI seed semantic pressure
- obligation trace attachment when the target is mechanical

### What gates own

- verifying that planner-owned structure exists
- verifying that compiler-owned and enrichment-owned outputs were produced
- failing closed instead of silently compensating for missing semantic work

## Related

- [Maintainer workflow diagrams](diagrams/README.md)
- [Taxonomies and ID namespaces](10_taxonomies_and_id_namespaces.md)
- [Feedback packets and fail-closed](07_feedback_packets_and_fail_closed.md)
- [`caf_deterministic_enrichment_ownership_meta_pattern_v1.md`](../../architecture_library/patterns/caf_meta_v1/caf_deterministic_enrichment_ownership_meta_pattern_v1.md)
- [`caf_promotions_and_obligations_meta_patterns_v1.md`](../../architecture_library/patterns/caf_meta_v1/caf_promotions_and_obligations_meta_patterns_v1.md)
