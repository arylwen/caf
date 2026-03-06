# CAF ADR Governance Meta-Patterns (v1)

This document consolidates and replaces the former `CAF-ADRSTD-*` pattern definitions that previously lived under `architecture_library/patterns/caf_v1/definitions_v1/`.

ADR governance is a **CAF meta-pattern**: it constrains how CAF records architectural decisions and traceability, rather than describing target-system architecture.

## Sources to reconcile (flag discrepancies first)

Do **not** assume any one source is authoritative while CAF is iterating. Flag discrepancies first.

Sources to reconcile:

- ADR standard:
  - `architecture_library/40_contura_adr_standard_v1.md`
- Any ADR templates used by skills (if present under `skills/**/templates/` or similar)
- Phase 8 docs that define human-signal blocks and preservation rules:
  - `architecture_library/phase_8/82_phase_8_human_signal_blocks_contract_v2.md`

## Core meta-pattern: ADRs are the durable log of adopted human decisions

- ADRs should capture **adopted** choices (not raw candidates).
- ADRs should link back to:
  - the originating spec/design section
  - the pattern/checklist anchors that motivated the decision
  - any validation/evidence hooks that enforce it
- ADRs should remain stable across reruns; CAF can append new ADRs or update CAF-managed sections, but must preserve human edits.

## Lifecycle guidance (high-level)

- Early stages: fewer ADRs; focus on high-impact boundaries and contracts.
- Later stages: ADRs become richer, with stronger traceability and validation links.

## Drift policy

If ADR practices in skills/templates diverge from `40_contura_adr_standard_v1.md`, flag the mismatch and reconcile intentionally (update standard, template, or producer).

## ADR integration across planes (formerly CAF-ADR-01)

This guidance was previously captured as `CAF-ADR-01` under `caf_v1`. It is a **CAF meta-pattern** because it governs how CAF records and reconciles decisions that affect cross-plane contracts.

Norms:

- Any ADR that changes **cross-plane interactions** (e.g., CP↔AP contract, tenant boundary rules, policy responsibility splits) should:
  - explicitly reference the relevant **pattern guide** and/or contract section it impacts
  - include anchors back to the spec/design section and evidence hooks
- If an ADR conflicts with the current CAF guidance, **do not allow silent drift**:
  - reconcile intentionally by updating the ADR, updating the guidance docs, or both
  - record the reconciliation (why the “source of truth” changed)

Where to reconcile (discrepancy-first):

- Pattern guides and Phase 8 governance docs:
  - `architecture_library/20_contura_control_application_data_plane_pattern_guide_v1.md`
  - `architecture_library/phase_8/82_phase_8_human_signal_blocks_contract_v2.md`
- Any contract declarations and plane integration contract sections produced in reference architectures.
