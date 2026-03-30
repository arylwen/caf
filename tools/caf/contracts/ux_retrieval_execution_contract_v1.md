# UX retrieval execution contract v1

**Owner:** `/caf ux` retrieval producer / worker chain  
**Status:** maintainer-facing 0.4.0 contract

## Purpose

Define the routed retrieval execution shape for the UX lane while keeping semantic derivation and semantic retrieval separate.

## Canonical execution order

### 1. Deterministic pre-stage

Run:
- `node tools/caf/ux_retrieval_preflight_v1.mjs <instance_name>`

This wrapper performs:
1. deterministic UX materialization + seed refresh
2. semantic packet application into managed blocks
3. architect pointer hydration
4. retrieval blob build
5. shortlist prefilter for `profile=ux_design`

### 2. Semantic retrieval stage

The retrieval worker should read:
- `design/playbook/retrieval_context_blob_ux_design_v1.md`
- `design/playbook/semantic_candidate_subset_ux_design_v1.jsonl`

Then choose HIGH/MED seeds semantically, invoke graph expansion, and write grounded candidate records.

### 3. Deterministic post-stage

Run:
- `node tools/caf/ux_retrieval_postprocess_v1.mjs <instance_name>`

## Hard rules

- profile: `ux_design`
- shortlist cap: `30`
- graph expansion before cap inflation
- no UX-only hidden retrieval shortcut
- no script-authored semantic inference in the pre-stage
