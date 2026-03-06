# Pattern Library Workflow (TN-008)

## Purpose

Define how CAF stores patterns and how patterns influence design and planning without introducing non-determinism.

## Pattern layers

CAF recognizes four pattern layers:

- CAF patterns
  - Contura-owned plane separation, tenancy, identity/access, and policy boundary guidance.
- Core patterns (CAF Layer 1)
  - Stack-independent patterns under architecture_library/patterns/core_v1/.
- TBPs
  - Technology binding patterns under architecture_library/phase_8/tbp/.
- External patterns
  - A longlist under architecture_library/patterns/external_v1/.

## Storage model

- Core patterns are stored as markdown with deterministic fields and evidence hooks.
- External patterns are stored as one YAML file per pattern, with a small CAF metadata block.
- Trigger cues are stored separately from pattern definitions.

## How patterns influence the v1 loop

Design time (spec to design):

- Designers may consult any layer.
- Designers must record explicit design decisions in the Design Decision Checklist.
- External patterns do not automatically become requirements.

Planning time (design to task graph):

- Planning may only require tasks and acceptance checks when anchored to:

  - an explicit Design Decision Checklist item
  - a normative core pattern requirement
  - a TBP requirement or binding
  - a Layer 8 rail

- External patterns may contribute to planning only through explicit design decisions.

## Derive and freeze enforcement metadata

External patterns contain rich descriptive fields, but planning and QA must use only a small frozen enforcement surface:

- minimum_evidence
- definition_of_done
- capabilities_needed
- forbidden_assumptions

See architecture_library/patterns/external_v1/pattern_enforcement_metadata_contract_v1.md.

## Version history

- v1: Initial workflow note.
