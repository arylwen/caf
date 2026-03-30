# Canonical sources and boundaries

CAF stays coherent by keeping a small number of binding sources and resisting duplicate doctrine.

## Binding framework doctrine

These are the sources that define framework rules and invariants:

- `architecture_library/patterns/caf_meta_v1/`
- `architecture_library/__meta/caf_operating_contract_v1.md`
- `tools/caf/contracts/**`
- explicit schemas and catalogs under `architecture_library/**`

## Public explanation surfaces

These folders are public documentation and should explain, not redefine, the canon:

- `docs/user/`
- `docs/architect/`
- `docs/maintainer/`

## Private maintainer surfaces

These are useful to maintainers but are not part of the public repo story:

- `docs/dev/maintainer/`
- `docs/dev/patch_notes/`
- `docs/dev/history/`
- `docs/dev/launch/`

## Generated and operational artifacts

These are not documentation and should not be treated as library canon:

- `reference_architectures/**`
- `companion_repositories/**`
- `feedback_packets/caf/`
- `tools/caf/out/**`

## Boundary rules

- Do not move canonical CAF meta-pattern content out of `architecture_library/patterns/caf_meta_v1/`.
- Do not put generated operational artifacts under `docs/`.
- Do not duplicate normative guidance across maintainer docs, skills, and playbooks when a canonical contract already exists.
- Prefer links and concise summaries over copy-pasted doctrine.

## Find out more

[Skill authoring](03_skill_authoring.md) — Apply the boundary rules on this page to an actual maintainer workflow.

## You might also be interested in

- [Pattern library workflow](04_pattern_library_workflow.md) — See how canonical ownership affects pattern-library edits and reviews.
- [Feedback packets and fail-closed](07_feedback_packets_and_fail_closed.md) — Understand how boundary violations and missing evidence surface operationally.
- [Release and public bundle hygiene](08_release_and_public_bundle_hygiene.md) — Jump to the current public maintainer release rules from one place.

