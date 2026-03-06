# CAF Retrieval + Ranking Plan (Token-Minimal)

This document proposes retrieval/ranking strategies to reduce prompt token footprint while improving determinism and pattern quality.

## Goals

- Reduce weekly token burn from loading the full retrieval surface.
- Keep retrieval deterministic where possible (Node scripts), reserving LLM usage for semantic matching only.
- Avoid overkill patterns when simpler ancestors satisfy the same pins.
- Make graph expansion reliable regardless of model quirks.
- No backwards compatibility constraints.

## Core idea

Keep one authoritative surface, but derive two token-minimized artifacts:

1. **Semantic surface** (small): only cue fields used for matching.
2. **Graph surface** (tiny): only pattern ids and typed relations for deterministic expansion.

### Why it helps

- The LLM only sees semantic cues for a *small* shortlist, not the entire pattern corpus.
- Graph expansion is deterministic, cheap, and does not require loading large text blobs.

## Recommended strategy

### Option A — Split surfaces + deterministic prefilter (recommended)

1) Build split surfaces from the canonical JSONL:

- `node tools/caf-meta/build_split_retrieval_surfaces_v1.mjs`

Outputs:
- `architecture_library/patterns/retrieval_surface_v1/pattern_semantic_surface_v1.jsonl`
- `architecture_library/patterns/retrieval_surface_v1/pattern_graph_surface_v1.jsonl`

2) **Deterministic prefilter** (Node, no LLM):

- Use pin keys + simple keyword overlap against semantic cues to select N candidates (e.g., 80–200).
- Always keep the prefilter stable and explainable (score + hits).

Tool:
- `node tools/caf/prefilter_semantic_candidates_v1.mjs <instance> --profile=<...> --limit=180`

3) **LLM semantic scoring** only on the resulting subset JSONL.

4) **Graph expansion** (deterministic) from the LLM-selected seeds using the graph surface:

- `node tools/caf/graph_expand_candidates_v1.mjs <instance> --profile=<...> --seeds=<id1,id2,...>`

Outcome: small prompt, stable recall, deterministic expansion.

## Overkill rejection

Problem: Pattern 1 and Pattern 2 both satisfy pin X, but Pattern 2 refines/extends Pattern 1 and is more complicated.

### Proposed rule: ancestor dominance

If pattern **B** is reachable from **A** via `refines` (or another "adds complexity" relation):

- Prefer **A** when **A** satisfies all required pins.
- Prefer **B** only when **B** adds a required capability (covers a pin A does not) OR when pins/rails indicate "enterprise" intent.

In the worker prompt:

- If you keep both, the more complex one must state what incremental capability it adds and why it is required.

## Mermaid diagram as derived artifact

Yes—generate a Mermaid graph for:

- debugging relationship integrity
- quickly spotting isolated patterns
- human review during regressions

Keep it **derived** and **not** injected into prompts.

Tool:
- `node tools/caf-meta/generate_pattern_graph_mermaid_v1.mjs`

## Pin value explanation verification

Token-saving rule:

- No fallbacks.
- If `pin_value_explanations_v1` validation fails, write a feedback packet and stop.
