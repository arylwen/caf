# CAF decision candidate block parsing contract (v1)

This document defines the **deterministic parsing contract** for the CAF-managed blocks:

- `<!-- CAF_MANAGED_BLOCK: caf_decision_pattern_candidates_v1 START -->`
- `<!-- CAF_MANAGED_BLOCK: caf_decision_pattern_candidates_v1 END -->`

## Why this contract exists

Candidate blocks are emitted by LLM workers. Even when content is correct, minor **formatting drift** is common
(nested bullets, indentation, list-wrapped headers). We do **not** want to spend tokens asking workers to
reformat candidates.

Instead:

- Parsers MUST be resilient.
- Parsers MUST remain mechanical and **non-inferential**.

## Required shared implementation

All scripts that parse candidate blocks SHOULD reuse:

- `tools/caf/lib_caf_decision_candidates_v1.mjs`

Do not re-implement ad-hoc regex parsing in each script.

## Resilience rules

Parsers MUST accept:

1) Candidate headings:

- `### <HOOK>: <PATTERN_ID> ...`
- HOOK prefixes may be `H|HIGH`, `M|MEDIUM`, `L|LOW`.

2) Evidence section headers:

- `**Evidence:**`
- `- **Evidence:**` (list-wrapped)

3) Evidence bullets:

- `- E1 [pinned_input] ...`
- Nested list variants such as `- - E1 ...` and indented forms.

Parsers SHOULD normalize evidence bullets to the canonical form:

- `- E<n> [type] ...`

## Non-goals

- No semantic inference.
- No guessing missing values.
- No cross-file heuristics.
