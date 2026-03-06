> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.

---
name: caf-prd-resolve
description: >
  Resolve (normalize + clarify) the Product PRD and Platform posture brief into placeholder-free,
  machine-extractable resolved PRDs. Semantic step with strict invariants.
---

# caf-prd-resolve

## Purpose

Produce two resolved documents used by `/caf prd`:

- `reference_architectures/<instance>/product/PRD.resolved.md`
- `reference_architectures/<instance>/product/PLATFORM_PRD.resolved.md`

The resolved docs MUST satisfy the Phase 8 PRD Source Contract and MUST be safe inputs for deterministic extraction.

## Inputs (must exist)

- `reference_architectures/<instance>/product/PRD.md`
- `reference_architectures/<instance>/product/PLATFORM_PRD.md`

Optional token-savers (if present):

- `reference_architectures/<instance>/spec/playbook/prd_extract_v1.json`
- `reference_architectures/<instance>/spec/playbook/platform_prd_extract_v1.json`

## Normative sources

- `architecture_library/phase_8/78_phase_8_prd_source_contract_v1.md`

## Resolver invariants (MUST)

Treat this step like a constrained compiler.

1) **No scope invention**
   - Do NOT add new features, capabilities, actors, external systems, or workflows.
   - You may only clarify wording and make implicit structure explicit.

2) **Capability ID stability**
   - Preserve every `CAP-XXX` ID and capability name from the source index.
   - Do NOT renumber, delete, or merge capabilities.
   - Do NOT add new `CAP-XXX` blocks. If something is missing, add it to *Open questions* in the same document.

3) **Domain entity boundedness**
   - The `#### Domain Entities` list for each capability MUST be bullets.
   - Every entity MUST be grounded in the source text.
   - The only allowed implicit entities are: Tenant, Organization, User, Role (and only if multi-tenancy or identity is explicitly stated).

4) **Format preservation + extractability**
   - Keep required top-level headings and capability block headings per the PRD Source Contract.
   - Keep the capabilities index table present and consistent with capability blocks.
   - No placeholders anywhere in the resolved docs: no TBD, TODO, UNKNOWN, and no angle bracket tokens.

5) **No CAF internal leakage**
   - Do NOT mention pins, template IDs, parameter IDs, evidence pointer IDs, file paths, or CAF internal contracts.

## Procedure

For each input document (PRD.md and PLATFORM_PRD.md):

- Normalize headings and field labels to match the PRD contract.
- Rewrite only for clarity and structural correctness.
- Ensure every required field is non-empty.
- Ensure every capability has a bullet Domain Entities list.

Write the resolved outputs. Do not modify the source inputs.

## Failure mode

If you cannot satisfy the invariants without inventing scope, STOP and write a feedback packet describing the minimal edits needed in the source PRDs.
