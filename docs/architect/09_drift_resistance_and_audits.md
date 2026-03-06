# Drift resistance and audits

CAF’s core design premise: **semantic steps drift; deterministic gates must not.**

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
- `technical_notes/TN-011_caf_build_meta_rules_v1.md`
