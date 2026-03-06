# Phase 8 — PRD Source Contract (v1)

## Purpose

Define the **canonical PRD location** and the **minimum required structure** for a PRD used by Phase 8 inference.

This contract is **normative** for Phase 8:

- If the PRD violates this contract, CAF must **fail-closed**.
- CAF must not guess missing structure.

---

## Canonical PRD locations (two-input mode)

For a reference architecture instance, Phase 8 uses **two PRD-like inputs**:

### Product PRD (PM-owned)

- `reference_architectures/<instance_name>/product/PRD.md`

This document describes **product / application** capabilities and domain entities.

### Platform posture brief (architect-owned; file name is stable)

- `reference_architectures/<instance_name>/product/PLATFORM_PRD.md`

This document is a **Platform Posture / Architecture Brief**. It describes system/platform constraints
that drive architecture shape inference.

If a tool supports an override path, it must still be a Markdown document that satisfies this contract.

## Canonical resolved PRDs (semantic step output)

Phase 8 may also produce resolved forms (semantic normalization + clarification):

- `reference_architectures/<instance_name>/product/PRD.resolved.md`
- `reference_architectures/<instance_name>/product/PLATFORM_PRD.resolved.md`

Resolved documents MUST also satisfy this contract.

---

## Required PRD sections (top-level)

The document must include the following headings (case-insensitive match is allowed):

1) Framing (either):
   - `## Product Framing`  **or**
   - `## Platform Framing`
2) `## Scope`
3) `## Capabilities`
4) `## Quality Attributes`
5) `## Constraints`
6) Posture (either):
   - `## Product Posture`  **or**
   - `## Platform Posture`

Notes:

- Additional sections are allowed.
- Required sections must not be empty.

---

## Capabilities requirements

### Capabilities index table

Within `## Capabilities`, the PRD must include an index table listing all capability IDs.

Minimum required columns:

- `Capability ID`
- `Name`

Recommended columns (optional but encouraged):

- `Primary Actor`
- `Trigger (short)`
- `Notes`

Capability IDs must follow:

- `CAP-XXX` where `XXX` is a 3-digit number (e.g., `CAP-001`).

### Capability blocks

For every capability ID listed in the index, the PRD must contain one capability block with heading:

- `### CAP-XXX — <Capability name>`

Each capability block must contain all required fields.

#### Minimum capability block requirements (hard)

Each capability block must include these field headings:

- `#### Actor`
- `#### Trigger`
- `#### Main Flow`
- `#### Postconditions`
- `#### Domain Entities`

Constraints:

- Each required field must have non-empty content.
- Placeholders are forbidden in required fields:
  - `<...>`
  - `TBD`, `TODO`, `UNKNOWN` (case-insensitive)

---

## Posture requirements

The document must include a Posture section (`## Product Posture` or `## Platform Posture`) with explicit answers.

Recommended format:

- a Markdown table with columns: `Question ID | Question | Answer`

Rules:

- Each posture question included must have a non-empty `Answer`.
- Ambiguous placeholders are forbidden in posture answers:
  - `TBD`, `TODO`, `UNKNOWN`, `depends`, `<...>` (case-insensitive)
- If none of the provided options fit, the answer must be explicit:
  - `Other: <free text>`

---

## Evidence pointer format

Phase 8 inference and validation use evidence pointers to prove groundedness.

### Canonical pointer forms

- Section evidence:
  - `PRD:SEC:<section_id>`

- Capability field evidence:
  - `PRD:CAP:<capability_id>:<field>`

Where:

- `<section_id>` is a stable, short identifier owned by CAF tools.
- `<capability_id>` is `CAP-XXX`.
- `<field>` is one of:
  - `actor`
  - `trigger`
  - `main_flow`
  - `postconditions`
  - `domain_entities`

---

## Fail-closed rules

CAF must fail-closed and write an actionable feedback packet if any are true:

1) **Missing required inputs** (two-input mode):
   - missing `product/PRD.md` when no override is explicitly provided
   - missing `product/PLATFORM_PRD.md` when no override is explicitly provided
2) **Missing required sections**.
3) **Missing capability structure**:
   - no capabilities index table
   - capability IDs malformed
   - a capability listed in the index has no capability block
4) **Missing required capability fields** (Actor/Trigger/Main Flow/Postconditions).
5) **Ambiguous posture**:
   - posture answers missing
   - posture answers contain placeholders or ambiguous tokens

CAF must not “repair” the PRD structure automatically.
