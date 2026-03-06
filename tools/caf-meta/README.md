# CAF meta helpers (library maintenance)

These scripts are **maintainer-only**. They operate on the CAF **library** and repo hygiene
(audits, sweeps, deterministic index/graph generation).

- Runtime/instance generation helpers remain under `tools/caf/`.
- All scripts here must be **deterministic, mechanical transformations only**.

## Outputs

Two output roots exist by design:

1) **Ephemeral local outputs (gitignored)**
- `tools/caf-meta/out/` (scratch space, manifests, local diffs)

2) **Library-owned eval artifacts (tracked, stable)**
- `architecture_library/__meta/caf_library__evals/**` (audit reports, scores)

## Scripts (current)

- `caf_meta_audit_v1.mjs` — Wrapper that runs one or more audits intentionally.
- `audit_architecture_library_v1.mjs` — Scan `architecture_library/**` for drift markers; optional index cross-check.
- `audit_decision_option_hydration_v1.mjs` — Check decision option hydration against pattern `caf.option_sets`.
- `audit_no_tbp_leakage_in_worker_skills_v1.mjs` — Enforce: worker skills must not hardcode TBP IDs; bind via capability + role_binding_key.
- `audit_patch_notes_required_v1.mjs` — Enforce: each patch commit adds a `docs/dev/patch_notes/patch_*.md` file.
- `new_patch_note_v1.mjs` — Create a new patch note stub for the next commit.
- `pattern_relations_sweep_v1.mjs` — Normalize/validate typed relations; emits patch-style suggestions.
- `pattern_relations_reclassify_v1.mjs` — Reclassify legacy relations into typed edges; emits canonicalized relations.
- `score_playbook_v1.mjs` — Deterministically score a playbook instance (writes under `architecture_library/__meta/...`).
- `build_release_inventory_v1.mjs` — Deterministically inventory tracked vs excluded files for publishing.
- `build_release_bundle_v1.mjs` — Build a deterministic release zip (`caf-dev` → `caf`).
- `build_publish_sweep_manifest_v1.mjs` — Emit a file-by-file publish readiness checklist.
- `diff_retrieval_blobs_v1.mjs` — Generate + diff retrieval context blobs for an instance (section-level).
- `build_pattern_docs_v1.mjs` — Build GitHub-friendly pattern taxonomy docs + graphs + `docs/pattern_index_v1.json` + an offline HTML pattern browser.
- `build_split_retrieval_surfaces_v1.mjs` — Rebuild token-minimized retrieval surfaces derived from the canonical JSONL surface.
- `prepare_public_launch_v1.mjs` — Maintainer wrapper: rebuild derived surfaces + run audits + (optionally) build a release bundle.

## Quick usage

- `node tools/caf-meta/caf_meta_audit_v1.mjs help`
- `node tools/caf-meta/caf_meta_audit_v1.mjs audit all`
- `node tools/caf-meta/build_pattern_docs_v1.mjs`
- `node tools/caf-meta/build_split_retrieval_surfaces_v1.mjs`
- `node tools/caf-meta/prepare_public_launch_v1.mjs --bundle=true`
