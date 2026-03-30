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

### Lifecycle artifact flow

Use [CAF lifecycle artifact handoff](diagrams/caf_lifecycle_artifact_handoff_v1.md) when the question is not just "which state comes next?" but also "which artifact bundle is being handed to the next command?" Pair it with [Lifecycle artifact reference](11_lifecycle_artifact_reference.md) when you need the document-by-document explanation behind that diagram.

Use it for:

- explaining the difference between the two `/caf arch` passes
- showing what `/caf next <instance> apply` actually checkpoints
- showing which bundle `/caf plan` and `/caf build` consume
- discussing 0.4.0 command-shape or UX-lane planning without inventing a parallel lifecycle
- explaining where the now-real `/caf ux`, `/caf ux plan`, and `/caf ux build` lane fits

In 0.4.0 planning terms, the second `/caf arch` → `/caf plan` seam is the key tightening point: planning should consume the later design handoff as an explicit surface, not as a vague pile of later-phase docs.

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

## Planning handoff view

When you are analyzing the second `/caf arch` -> `/caf plan` seam, separate the core planning inputs from the supporting explanation/debug surfaces rather than treating the later design handoff as one opaque blob.

### Core planning inputs

These are the current surfaces `/caf plan` should treat as the main semantic inputs:

- `design/playbook/control_plane_design_v1.md`
- `design/playbook/application_design_v1.md`
- `design/playbook/contract_declarations_v1.yaml`
- `design/playbook/application_domain_model_v1.yaml`
- `design/playbook/system_domain_model_v1.yaml`
- CAF-managed planning payload blocks when the later architecture step emitted them

### Supporting explanation/debug surfaces

These are useful, but they should not silently become the sole semantic handoff:

- `design/playbook/design_summary_v1.md`
- design retrieval/debug artifacts
- other explanatory sidecars that help humans audit the handoff

### Gate posture

- Missing core planning inputs should be the future fail-closed preflight target once the second `/caf arch` producer has run.
- Missing supporting explanation/debug surfaces should remain advisory unless a separate contract explicitly promotes them.
- The goal is not to create new sources of truth; it is to make the existing handoff legible enough that gates can check it without compensating for missing semantic work.

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

## You might also be interested in

- [Maintainer workflow diagrams](diagrams/README.md)
- [Lifecycle artifact reference](11_lifecycle_artifact_reference.md)
- [Taxonomies and ID namespaces](10_taxonomies_and_id_namespaces.md)
- [Feedback packets and fail-closed](07_feedback_packets_and_fail_closed.md)
- [`caf_deterministic_enrichment_ownership_meta_pattern_v1.md`](../../architecture_library/patterns/caf_meta_v1/caf_deterministic_enrichment_ownership_meta_pattern_v1.md)
- [`caf_promotions_and_obligations_meta_patterns_v1.md`](../../architecture_library/patterns/caf_meta_v1/caf_promotions_and_obligations_meta_patterns_v1.md)


## 0.4.0 seam reminder

When you are evaluating release-track work around the second `/caf arch` → `/caf plan` seam, use this posture:

- tighten what planning explicitly consumes from the later design handoff before proposing new command growth;
- make the core-vs-supporting split explicit enough that future preflight and post-plan gates can fail closed on the former without inventing new semantic sources;
- keep BFF and related system/interface shaping in the second `/caf arch`;
- treat the current `/caf ux` lane as a bounded downstream consumer of the later design handoff rather than a replacement for that design pass;
- apply the same ownership split inside `/caf ux plan`: semantic task shaping first, deterministic projection and gates after.
