# Drift resistance and audits

CAF’s core design premise: **semantic steps drift; deterministic gates must not.**

![CAF gates and fail-closed enforcement](../images/caf_gates_and_fail_closed.svg)

*CAF prevents architectural drift by evaluating proposed changes against architecture obligations and blocking non-compliant changes until they are corrected or the architecture is explicitly updated.*

## Drift resistance mechanisms

- Split: semantic ranking vs deterministic validation
- Bounded “context packs” (`/caf ask`) to reduce token sprawl
- Mechanical index generation (TSV views) to make analysis stable
- Library audits to keep pattern surfaces consistent

## Where audits live

- `tools/caf-meta/` is the maintainer audit surface.

Representative audits:

- `tools/caf-meta/audit_architecture_library_v1.mjs`
- `tools/caf-meta/audit_no_tbp_leakage_in_worker_skills_v1.mjs`
- `tools/caf-meta/audit_patch_notes_required_v1.mjs`

## Release posture

For public release bundles, keep:

- normative library + docs
- instruction-only skillpacks (`skills_portable/`)

And prefer to exclude:

- `out/` directories
- local settings or machine-specific artifacts

See also:

- `tools/caf-meta/prepare_public_launch_v1.mjs`
- `docs/maintainer/02_canonical_sources_and_boundaries.md`

## Find out more

[Architecture invariants and catalog](13_architecture_invariants_and_catalog.md) — Review the human-readable catalog of what CAF is trying to keep true and how those invariants are defined, enforced, checked, and evidenced.

## You might also be interested in

- [Gates and fail-closed](08_gates_and_fail_closed.md) — See the blocker posture that checks many of these invariants.
- [Patterns → obligations → tasks](07_patterns_to_obligations_to_tasks.md) — Understand how accepted choices become downstream work.
- [Profile parameters configuration](../user/13_profile_parameters_configuration.md) — See one of the canonical machine-consumed sources behind activated invariants.
