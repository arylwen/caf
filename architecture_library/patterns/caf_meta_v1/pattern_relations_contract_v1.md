# Pattern Relations Contract v1

Audit Date: 2026-02-19

This contract defines what it means for patterns to be “related” in CAF, and how those relations must be represented
so they are **usable by both humans and retrieval workers**.

## Why this exists

CAF pattern libraries evolved with mixed “related patterns” conventions (IDs, free-text names, placeholders).
This makes it impossible to:

- validate relationship hygiene deterministically,
- expand candidate sets safely, or
- reason about symmetry (“A references B but B does not reference A”).

This contract establishes **typed relation semantics** and a **machine-followable encoding rule**.

## Relation types (minimum set)

### 1) `depends_on` (directed)

Meaning: adopting pattern **A** requires pattern **B** to be present (or explicitly rejected with rationale).

- Direction: `A depends_on B`
- Reciprocity: not required (B does not need to list all dependents)

### 2) `complements` (pairing)

Meaning: patterns are commonly adopted together to close a completeness gap.

- Direction: symmetric intent (treat as a pair)
- Reciprocity: required (if A complements B, B should also complement A)

### 3) `refines` (directed)

Meaning: pattern **B** is a more specific or specialized form under pattern **A**.

- Direction: `B refines A`
- Reciprocity: optional (`A refined_by B` is allowed but not required)

### 4) `alternative_to` (exclusive-ish)

Meaning: patterns are alternatives; select one, or follow an explicit composition rule.

- Direction: symmetric
- Reciprocity: required

## Encoding rules (v1)

CAF currently stores `related_patterns` inside pattern definition YAML as a narrative field.
Until a schema bump introduces a structured representation, use **one of**:

### A) ID-only comma list (legacy; allowed)

Example:

```yaml
related_patterns: OBS-01, CTX-01, EXT-API_GATEWAY
```

Rules:
- IDs only (no prose)
- comma-separated
- no bullet prefixes

### B) Typed, line-oriented encoding (preferred in v1)

Example:

```yaml
related_patterns: |
  depends_on: CTX-01
  complements: OBS-01
  alternative_to: EXT-API_GATEWAY
```

Rules:
- one relation per line
- `RELATION: PATTERN_ID`
- IDs must exist in the pattern library inventory

## Retrieval surface rule (hard requirement)

In the canonical retrieval surface (`pattern_retrieval_surface_v1.jsonl`):

- `terms.kind=related_pattern` MUST contain **only valid pattern IDs** that exist as `id` values in the same JSONL.

Any non-ID related hints MUST be encoded as:
- `trigger_cue` (preferred), or
- `notes`

Optional typed adjacency (recommended):

- `relations[]` MAY be present as a derived, typed adjacency view:
  - `relations: [{"kind":"depends_on","id":"CTX-01"}, ...]`
  - MUST be derived from the pattern definition YAML `related_patterns` field (single-source-of-truth).
  - `relations[*].id` MUST be a valid pattern ID present in the same JSONL.

## Library hygiene expectations

- If a relation type requires reciprocity (`complements`, `alternative_to`), producer-side tooling SHOULD ensure
  reverse edges exist (or emit a feedback packet/audit finding).
- Relations SHOULD be kept small and meaningful (prefer ≤ 6 related edges per pattern unless the family requires more).

## Worker behavior (future-facing)

Workers may use relations to propose bounded candidate expansion, but only with grounding:

- relations are a *candidate suggestion mechanism*,
- grounding determines inclusion,
- ungrounded related patterns must not be emitted.

(Implementation lives outside this contract.)
