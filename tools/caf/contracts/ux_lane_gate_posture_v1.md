# UX lane gate posture v1

Status: maintainer-facing 0.4.0 contract

## Purpose

Define the deterministic helper/gate posture for the `/caf ux` lane.

## Pre-stage split

### `ux_preflight_v1.mjs`

Owns only:
1. `materialize_ux_design_v1.mjs`
2. `derive_ux_seed_content_v1.mjs`

Meaning:
- ensure the canonical UX artifact exists;
- refresh deterministic seed blocks;
- stop before packet application or retrieval prep.

### `ux_retrieval_preflight_v1.mjs`

Owns the deterministic retrieval-prep chain:
1. `ux_preflight_v1.mjs`
2. `derive_ux_semantic_projection_v1.mjs`
3. `hydrate_ux_architect_blocks_v1.mjs`
4. `build_ux_retrieval_context_blob_v1.mjs`
5. `prefilter_semantic_candidates_v1.mjs --profile=ux_design`

Meaning:
- apply the instruction-owned semantic packet into the canonical UX artifact;
- hydrate compact architect pointers;
- build the UX retrieval blob and shortlist before semantic retrieval.
