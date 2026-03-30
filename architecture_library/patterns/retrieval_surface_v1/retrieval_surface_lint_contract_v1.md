# Retrieval Surface Lint Contract v1

Audit Date: 2026-02-19

This file defines **fail-closed** hygiene and normalization rules for the canonical pattern retrieval surface:

- `architecture_library/patterns/retrieval_surface_v1/pattern_retrieval_surface_v1.jsonl`

The intent is to keep the retrieval surface stable, inspectable, and embedding-friendly.

## Scope

These rules apply to **all** records in the canonical JSONL surface.

Enforcement is split:

- **Library hygiene (CI/audit; full-surface):** a deterministic linter/validator (outside the instruction-only workers) SHOULD validate the entire file and fail the build if any rule is violated.
- **Instruction-only workers (bounded; ship-safe):** workers like `skills/worker-pattern-retriever` MUST enforce these rules **strictly** for any record they **open** or **emit**, and MUST fail-closed if an opened/emitted record violates any ship-blocker rule below.

Rationale: instruction-only workers cannot reliably perform full-file deterministic linting without tooling, but we still require strict correctness for anything that influences emitted candidates.

## Forbidden tokens (ship blockers) (ship blockers)

No `terms[*].value` may contain any of the following substrings (case-sensitive):

- `NOT_DERIVABLE`
- `DERIVABLE_FROM_ATTACHED_PDF`
- `WORD_PLACEHOLDER_`
- `FIXED_PLACEHOLDER_STRING_`
- `ANGLE_BRACKET_ELLIPSIS`
- `CAF will populate`

Rationale: these leak placeholder noise into embeddings and destroy recall.

## Term length caps (ship blockers)

## Term value formatting (ship blockers)

- All `terms[*].value` MUST be **single-line text** (no `\n` or `\r`).
- Collapse any internal whitespace runs to a single space.

## Allowed term kinds (ship blockers)

Only the following `terms[*].kind` values are allowed. Adding a new kind requires updating this contract.

- `pattern_id`, `name`, `summary`, `intent`, `context`, `problem`, `solution`, `forces`, `consequences`,
  `applies_when`, `minimum_evidence`, `dod`, `examples`, `implementation_notes`, `notes`,
  `trigger_cue`, `decision_prompt`, `option`, `option_set_id`, `capability`, `related_pattern`,
  `promotion_source`, `promotion_scope`, `required_trace_anchor_kind`, `required_trace_anchor_scope`,
  `forbidden_assumption`


All `terms[*].value` strings MUST be within the maximum length for their `kind`.
If a term exceeds the cap, it must be truncated (or removed) **in the JSONL**.

| kind | max chars |
| --- | ---: |
| `trigger_cue` | 80 |
| `decision_prompt` | 260 |
| `notes` | 260 |
| `option` | 260 |
| `summary` | 300 |
| `intent` | 300 |
| `applies_when` | 300 |
| `context` | 300 |
| `problem` | 300 |
| `solution` | 300 |
| `forces` | 300 |
| `consequences` | 300 |
| `implementation_notes` | 300 |
| `examples` | 300 |
| `minimum_evidence` | 300 |
| `dod` | 300 |

Other kinds (ids, file paths, scope markers) should remain short by construction.

## Related pattern term constraints (ship blockers)

For any `terms[]` entry where `kind: related_pattern`:

- `value` MUST be **exactly** a valid pattern ID that exists as an `id` in `pattern_retrieval_surface_v1.jsonl`.
  - No aliases, no free-text names, no “see also” prose.
- `value` MUST NOT contain leading bullet markers (e.g., `- `, `* `, `• `) or any trailing description.
- Placeholder sentences are forbidden as `related_pattern` values (e.g., “See source guide for related patterns.”).

If you want to preserve a non-ID “related” hint (e.g., a concept name, a rough label, or a not-yet-modeled pattern),
encode it as:

- `kind: trigger_cue` (preferred for short phrases ≤ 80 chars), or
- `kind: notes` (for longer text)

Rationale: `related_pattern` is reserved for **machine-followable** links only.

## Forbidden term kinds (ship blockers)

- `extended_definition` terms are **forbidden** in the canonical surface.
  - Rationale: long, paragraph-like definitions dilute embeddings and reduce retrieval stability.
  - Use `summary`, `intent`, `applies_when`, `trigger_cue`, and `decision_prompt` instead.

## Minimum trigger cue coverage (ship blockers)

Every pattern record MUST include:

- at least **1** term where `kind: trigger_cue`
- recommended: **8–18** trigger cues per pattern

If a pattern lacks explicit trigger cues, derive them only from grounded text already present in the record (e.g., `name`, `summary`, `intent`, `context`).

## Bridge cue coverage (ship blockers)

To keep retrieval aligned across namespaces, every `core_v1`, `external_v1`, and `ux_v1` pattern record MUST include:

- at least **2** `terms[]` entries where:
  - `kind: trigger_cue`, and
  - `value` is **exactly** one of the canonical phrases in `bridge_lexicon_v1.yaml` (any category).

Rationale: the CAF "plane dialect" (CP/AP/contract/boundary vocabulary) must be present in non-CAF namespaces so cross-namespace retrieval is not starved.

## Bridge lexicon (recommended)

To reduce namespace dialect drift (CAF/core/external), maintain a canonical bridge vocabulary in:

- `architecture_library/patterns/retrieval_surface_v1/bridge_lexicon_v1.yaml`

When doing cue sweeps, prefer adding 2–5 bridge phrases (where relevant) to the pattern’s `trigger_cue` set.

## Expected failure mode

On any violation, workers MUST fail-closed with a feedback packet explaining:

- which rule failed
- the offending `key` + `kind`
- the offending term value (excerpt)
- the producer-side file(s) to patch (typically the JSONL surface)
