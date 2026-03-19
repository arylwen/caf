# Maintainer workflow diagrams

This folder holds the canonical Mermaid-backed workflow diagrams for CAF maintainer docs.

Why they live here:

- workflow diagrams need to be edited independently from narrative pages
- multiple maintainer pages may want to link to the same workflow view
- GitHub renders Mermaid in Markdown pages, so standalone diagram pages are the most reusable source form without introducing a docs build step

## Diagrams

- [CAF lifecycle state machine](caf_lifecycle_state_machine_v1.md)
- [CAF plan post-chain](caf_plan_post_chain_v1.md)
- [CAF planning ownership split](caf_planning_ownership_split_v1.md)

## Editing posture

- Treat these pages as the canonical workflow-diagram sources.
- Narrative maintainer pages should link here rather than re-owning the diagram body.
- If a workflow changes, update the diagram page first, then adjust any narrative pages that explain it.
