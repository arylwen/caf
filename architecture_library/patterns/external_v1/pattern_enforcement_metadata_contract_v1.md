# Pattern Enforcement Metadata Contract (v1)

## Purpose

Define how CAF derives and freezes a small enforcement surface from rich pattern definitions.

The enforcement surface is used by deterministic planning and Plan QA. The rich pattern text remains the human reference.

## Why this exists

Pattern-native definitions (intent, context, solution, consequences) are valuable but are not directly enforceable. CAF needs a small number of machine-readable items that can be validated fail-closed without interpretation drift.

## Terms

- pattern-native fields
  - The descriptive pattern content used by humans.
- enforcement metadata
  - A small set of fields that planning and QA are allowed to treat as normative once frozen.

## Enforcement metadata fields

The following fields appear under caf: in each external pattern definition:

- minimum_evidence
  - The smallest explicit signals required before a designer may propose or adopt the pattern.
  - Signals must be observable in the spec or design docs.
- definition_of_done
  - Architecture invariants that should be demonstrable when the pattern is adopted.
  - Checks must be testable as docs-level assertions or code-level validations.
- capabilities_needed
  - Coarse capability requirements used for task dispatch coverage and gap detection.
- forbidden_assumptions
  - Explicitly forbidden inferences (for example, vendor selection).

## Derivation workflow

1) Enrich pattern-native definition

- Populate intent, context, problem, trade-offs, solution, consequences, and implementation notes.
- This can be done in Excel, markdown, or any other convenient format.

2) Propose enforcement metadata

- Populate minimum_evidence and definition_of_done conservatively.
- Do not translate the entire pattern into checks. Choose the smallest stable set.

3) Freeze

Freeze rule (v0): The derived enforcement fields in external pattern definitions are canonical; automated re-derivation is forbidden. Updates occur only via explicit, reviewable catalog edits.

- Once a pattern is treated as planning-relevant, minimum_evidence and definition_of_done must be explicitly reviewed and treated as normative until versioned.
- After freeze, edits that change meaning require a new version.

## How minimum_evidence is written

- Must be unambiguous and externally observable.
- Must be phrased as explicit cues or commitments, not as inferred intent.

Good examples:

- The spec explicitly requires central API policy enforcement for auth, quotas, and versioning.
- The design explicitly commits to event-driven communication between services.
- The design explicitly states that retries may occur and duplicate side effects must be prevented.

Bad examples:

- The system might need a gateway.
- This seems like microservices.
- Teams usually do this.

## How definition_of_done is written

- Must be verifiable by docs-level checks or code-level checks.
- Must not depend on a specific cloud vendor or product.
- Must be phrased as invariants.

Good examples:

- All inbound requests establish and propagate a correlation_id.
- All asynchronous consumers are idempotent and document their deduplication strategy.
- Message handling defines retry policy and a DLQ policy.

Bad examples:

- Use VendorX gateway.
- Use Kubernetes.
- Ensure the system is scalable.

## Default anchor policy for external patterns

External patterns do not automatically become anchors.

- default_anchor_policy: requires_explicit_design_decision
  - Designers may propose the pattern based on trigger cues.
  - Planning may only treat the pattern as a requirement if a design decision checklist item explicitly adopts it, or if it is promoted into a normative CAF core pattern or a TBP requirement.

## Version history

- v1: Initial contract for deriving and freezing minimum_evidence and definition_of_done from enriched pattern definitions.
