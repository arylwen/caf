# CAF maintainer docs

If you are extending, debugging, or packaging CAF itself, start here.

Use this surface when you need to answer questions like:

1. Where does CAF canon live?
2. Which documents are normative versus explanatory?
3. How do I add or adjust skills, patterns, audits, or command surfaces without creating drift?
4. How do I keep the release-facing docs and assets clean and ready?

## Read by goal

- **Orient new readers first** — Point them to [Invariants](../architect/invariants/README.md) and [User docs](../user/README.md) before deeper maintainer or architect surfaces when the audience is new to CAF.
- **Understand canon versus explanation** — Start with [Maintainer mental model](01_maintainer_mental_model.md), then read [Canonical sources and boundaries](02_canonical_sources_and_boundaries.md) to learn where CAF rules actually live.
- **Add or adjust a skill safely** — Follow [Skill authoring](03_skill_authoring.md), [Command surfaces and routing](05_command_surfaces_and_routing.md), and [Feedback packets and fail-closed](07_feedback_packets_and_fail_closed.md) to extend CAF without creating drift.
- **Debug generated outputs and packets** — Start with [Debugging generated outputs](06_debugging_generated_outputs.md), then use [Feedback packets and fail-closed](07_feedback_packets_and_fail_closed.md) and [Architect gates + fail-closed behavior](../architect/08_gates_and_fail_closed.md) when a framework seam needs investigation.
- **Prepare a release bundle** — Use [Canonical sources and boundaries](02_canonical_sources_and_boundaries.md), [Release and public bundle hygiene](08_release_and_public_bundle_hygiene.md), and [`tools/caf-meta/README.md`](../../tools/caf-meta/README.md) when you need the maintainer view of release-oriented repo hygiene.
- **Understand lifecycle handoffs and planning ownership** — Read [Planning workflows and post-chain](09_planning_workflows_and_post_chain.md), [Lifecycle artifact reference](11_lifecycle_artifact_reference.md), and [Taxonomies and ID namespaces](10_taxonomies_and_id_namespaces.md) when you need the maintainer view of how `/caf arch`, `/caf plan`, and `/caf build` hand artifacts to one another.
- **Review workflow diagrams directly** — Use [Maintainer workflow diagrams](diagrams/README.md) when you want the canonical Mermaid-backed lifecycle and post-chain views without narrative duplication.

## Reading order

1. [Maintainer mental model](01_maintainer_mental_model.md)
2. [Canonical sources and boundaries](02_canonical_sources_and_boundaries.md)
3. [Skill authoring](03_skill_authoring.md)
4. [Pattern library workflow](04_pattern_library_workflow.md)
5. [Command surfaces and routing](05_command_surfaces_and_routing.md)
6. [Debugging generated outputs](06_debugging_generated_outputs.md)
7. [Feedback packets and fail-closed](07_feedback_packets_and_fail_closed.md)
8. [Release and public bundle hygiene](08_release_and_public_bundle_hygiene.md)
9. [Planning workflows and post-chain](09_planning_workflows_and_post_chain.md)
10. [Taxonomies and ID namespaces](10_taxonomies_and_id_namespaces.md)
11. [Lifecycle artifact reference](11_lifecycle_artifact_reference.md)

## Canonical rule

This folder is a curated navigation surface. It explains and links to the canonical sources, but it does not replace them.

Normative CAF framework doctrine remains in:

- `architecture_library/patterns/caf_meta_v1/`
- `architecture_library/__meta/caf_operating_contract_v1.md`
- `tools/caf/contracts/**`
