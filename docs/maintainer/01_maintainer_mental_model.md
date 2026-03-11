# Maintainer mental model

CAF has three distinct maintainer-facing surfaces:

1. **Canon** — binding framework rules and invariants.
2. **Public maintainer guidance** — curated explanations for people evolving CAF.
3. **Private maintainer notes** — working drafts, roadmap notes, experiments, and postmortems.

## Canon lives here

- `architecture_library/patterns/caf_meta_v1/`
- `architecture_library/__meta/caf_operating_contract_v1.md`
- `tools/caf/contracts/**`

When you are deciding what CAF *must* do, start there.

## Public maintainer guidance lives here

- `docs/maintainer/**`

Use this folder to explain the system, orient new maintainers, and point them at the canonical rules.
It should not become a duplicate second canon.

## Private maintainer notes live here

- `docs/dev/maintainer/**`

Use this folder for working drafts, live audits, roadmap notes, runner-local advice, experiments, and incident writeups that are useful to maintainers but are not stable public guidance.

## History lives here

- `docs/dev/history/**`

Archive retired or superseded documents here when they still have historical value.

## Practical classification rule

- If it explains **how CAF itself operates** and must stay binding, move it to `caf_meta_v1` or another canonical contract surface.
- If it helps maintainers navigate or apply the canon publicly, put it in `docs/maintainer/`.
- If it is a working note, private operational note, roadmap, experiment, or postmortem, put it in `docs/dev/maintainer/`.
- If it is retired but worth preserving, archive it under `docs/dev/history/`.

## Next

[Canonical sources and boundaries](02_canonical_sources_and_boundaries.md) — Learn where framework rules live so you can change CAF without creating duplicate doctrine.

## Related

- [Skill authoring](03_skill_authoring.md) — Add or adjust a skill while preserving CAF ownership boundaries.
- [Command surfaces and routing](05_command_surfaces_and_routing.md) — Understand where maintainer-facing commands are allowed to operate.
- [Release and public bundle hygiene](08_release_and_public_bundle_hygiene.md) — Use the current public maintainer release checklist and bundle rules as a fast navigation index.

