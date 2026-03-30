# CAF Pattern Retrieval Surface v1

This directory introduces a **single canonical retrieval substrate** for pattern selection across CAF.

## What changed

Historically, pattern retrieval was split across multiple indices and playbooks (CAF/core/external). This
created split-brain risk (different retrieval logic per step) and made it hard to converge retrieval behavior.

CAF defines **one** canonical retrieval surface (`pattern_retrieval_surface_v1.jsonl`) and then defines
**views** (profiles) over that surface for different phases.

To reduce token footprint, CAF also maintains **derived split surfaces**:

- `pattern_semantic_surface_v1.jsonl` (cue-only; semantic scoring)
- `pattern_graph_surface_v1.jsonl` (relations-only; deterministic graph expansion)

## Canonical surface

**File:** `architecture_library/patterns/retrieval_surface_v1/pattern_retrieval_surface_v1.jsonl`

Each line is a JSON object with fields:

- `key` (string; globally unique)
- `namespace` (string; one of `caf_v1 | core_v1 | external_v1 | ux_v1`)
- `id` (string; pattern_id)
- `name` (string)
- `summary` (string)
- `plane` (string; `control | application | both`)
- `family` (string; stable grouping key used for diversity constraints)
- `definition_path` (string; repo-relative path to the authoritative pattern definition YAML)
- `terms` (array of `{value, kind}`) used to improve recall

Optional (v1.3+; relationship-aware traversal):

- `relations` (array of `{kind, id}`) used for **typed** graph expansion
  - `kind` one of: `depends_on | complements | refines | alternative_to`
  - `id` MUST be a valid pattern ID present in the same JSONL
  - Source of truth is the pattern YAML `related_patterns` field; `relations[]` is a derived adjacency view.

**Canonical rule (v1.4):**

- `pattern_retrieval_surface_v1.jsonl` is the **only** authoritative substrate.
- Workers MAY use derived split surfaces to minimize tokens.
- Legacy pattern indices and trigger playbooks are **not** inputs to retrieval and are not considered authoritative.
- Pattern definition YAML files remain authoritative for rich semantics; the JSONL references them via `definition_path`.

**Terms policy (v1.2):**

- `terms[]` is maintained directly in the JSONL as the canonical recall substrate.
- Terms may be derived from pattern definition narrative fields (intent/context/problem/solution/tradeoffs/DoD/minimum_evidence/etc.),
  but there is no upstream “builder” contract that requires separate index/playbook files.
- If terms are missing or weak for a pattern family, improve them in the JSONL (do not introduce new index files).


Hygiene + normalization:

- Lint contract: `architecture_library/patterns/retrieval_surface_v1/retrieval_surface_lint_contract_v1.md`
  - banned tokens
  - max term lengths (embedding-friendly)
  - minimum trigger cue coverage
- Bridge lexicon (for cue sweeps): `architecture_library/patterns/retrieval_surface_v1/bridge_lexicon_v1.yaml`

**Minimum recall coverage (v1.3):**

- Every pattern record MUST include at least one `terms[]` entry with `kind: trigger_cue`.
- Prefer having 8–18 `trigger_cue` terms per pattern.
- When a pattern lacks explicit trigger cues, derive them ONLY from grounded text already present in the record (e.g., `name`, `summary`, `intent`, `context`).
  - Include name tokens (lowercased) and adjacent name bigrams (simple n-grams) as `trigger_cue` terms.
  - Do not invent synonyms or add vendor/product names unless present in the pattern text or pinned by profile.


**Legacy migration note (v1.2):**

- Historical trigger playbooks (core/external) contained additional `decision_prompts`, `minimum_evidence`, and `notes` text.
- Those files have been retired; their content has been migrated into `terms[]` in the canonical JSONL (kinds: `decision_prompt`, `minimum_evidence`, `notes`).
- To improve recall or guidance, edit the JSONL terms directly (do not reintroduce index/playbook files).


## View profiles

**File:** `architecture_library/patterns/retrieval_surface_v1/retrieval_view_profiles_v1.yaml`

A *view* is a filter + ranking policy over the same JSONL surface.

Two profiles are defined:

- `arch_scaffolding`: pins→spec scaffolding. Narrow scope (`caf_v1 + core_v1`).
- `solution_architecture`: spec→design work. Wider scope (`caf_v1 + core_v1 + external_v1`).
- `ux_design`: `/caf ux` work. Uses the same canonical substrate, but normally consumes the curated `static_semantic_subset_ux_design_v1.jsonl` shortlist plus typed graph expansion rather than the full surface.

The retrieval owner worker always loads the same JSONL and then applies the chosen view.

## Derived split surfaces

**Builder (deterministic; caf-meta maintenance):** `tools/caf-meta/build_split_retrieval_surfaces_v1.mjs`

- Semantic surface is a cue-only projection of canonical fields + a filtered `terms[]` allowlist.
- Graph surface contains only `{namespace,id,relations[]}` for typed traversal.

## Retrieval owner worker

**Skill:** `skills/worker-pattern-retriever/SKILL.md`

This worker is the **single owner** of candidate selection for the block:

- `<!-- CAF_MANAGED_BLOCK: caf_decision_pattern_candidates_v1 START --> ... END -->`

Key properties:

- Ranks over the canonical JSONL surface.
- Opens pattern definitions for the top candidates.
- Emits candidates **only when grounded** (must cite both pinned inputs and pattern definition).
- If it cannot ground any candidates, it fails closed and writes a retrieval diagnostics feedback packet.

---

Legacy indices/playbooks have been retired. If you observe retrieval regressions:

- improve `terms[]` in `pattern_retrieval_surface_v1.jsonl` for the affected pattern families, and
- 




## UX retrieval scaling posture

Package 7 adds `ux_v1` to the canonical substrate but does **not** change the token-discipline rule. The UX lane should normally load `static_semantic_subset_ux_design_v1.jsonl` (30 records) and then widen via graph expansion. This is the same anti-context-exhaustion pattern already used elsewhere in CAF: curated shortlist first, full graph only for deterministic widening.
