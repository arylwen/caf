# External Pattern Library (v1)

Status: FROZEN (v0) — caf.minimum_evidence, caf.definition_of_done, caf.forbidden_assumptions, caf.capabilities_needed, caf.plane, and caf.verifiability are canonical and must not be re-derived automatically; changes require an explicit catalog update.

## Purpose

Provide a structured longlist of commonly used architecture, delivery, and reliability patterns.

This library is designed to keep pattern-native knowledge (intent, context, trade-offs, solution) separate from CAF planning enforcement, while still enabling deterministic, fail-closed planning workflows.

## Scope

- Patterns in this library are not CAF Layer 1 core patterns.
- Patterns in this library do not automatically become planning anchors.
- A pattern from this library may influence planning only when it is explicitly adopted as a design decision and allowed by CAF rules.

## Files

- definitions_v1/
  - One YAML file per pattern containing pattern-native fields plus a minimal CAF metadata block.
- Retrieval index (canonical, shared across namespaces):
  - `architecture_library/patterns/retrieval_surface_v1/pattern_retrieval_surface_v1.jsonl`

## Determinism and fail-closed behavior

- Pattern-native fields may be rich and descriptive.
- CAF planning must rely on explicit, machine-readable commitments:

  - explicit design decision checklist items
  - normative CAF Layer 1 patterns
  - TBP requirements and bindings
  - Layer 8 rails

- The CAF metadata fields in these pattern definitions start as conservative placeholders.
- Do not treat placeholder definition_of_done or minimum_evidence as enforceable.

### Seed / TBD markers (public-facing)

Many entries in `definitions_v1/` are intentionally **seed-grade**:

- `notes: "Seed entry..."`
- `minimum_evidence: "TBD: ..."`
- `anchor_id: TBD_DESIGN_DECISION_ID`

These markers mean:

- The pattern is available for **retrieval** and discussion.
- The pattern should **not** be auto-adopted or treated as an enforceable obligation without explicit spec/design cues and a resolved decision record.
- Maintainers may promote individual patterns by replacing TBD placeholders with conservative, reviewable commitments.

## Promotion model

Patterns in this library can be promoted over time by freezing:

- minimum_evidence (the smallest explicit signals required before proposing or adopting the pattern)
- definition_of_done (architecture invariants that should be demonstrable when the pattern is adopted)
- capabilities_needed (coarse capability needs used by manager dispatch and coverage checks)

Promotion should be intentional and reviewed, because it changes what the system can require and validate.

## Version history

- v1: Initial longlist imported as structured YAML definitions.
