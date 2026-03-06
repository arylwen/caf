---
name: caf-add-approved-technology-well-known
description: >
  Propose (and optionally materialize) CAF changes to add a well-known technology to the approved technology atoms,
  Fail-closed: if sources are insufficient or ambiguous, emit a feedback packet and do not guess.
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.


# caf-add-approved-technology-well-known

## Purpose
Accelerate adding a **publicly documented** (“well-known”) technology to CAF while maintaining:
- **catalog integrity** (platform pins must use only approved atoms)
- **schema alignment**
- **scaffolding consistency**

This is an instruction-only skill (no scripts). It may propose diffs and/or write patches if explicitly allowed by the runtime.

## Inputs
Required:
- `technology_name`: e.g., "Podman Compose", "Flyway", "Redis"
- `scope`: one of: `platform_pins` | `approved_atom` | `both`
- `target_profile_intent`: a short sentence describing the desired new approved profile (if applicable)

Optional (strongly recommended):
- `closest_existing_profile_id`: a catalog entry to copy and modify
- `constraints`: version, OS constraints, licensing considerations, etc.
- `preferred_sources`: a list of authoritative domains (e.g., vendor docs)

## Source of truth (local files)

NOTE: CAF no longer uses a technology-profile catalog for technology selection.
Pinning happens via **platform pins (technology atoms)** + TBPs.

- `architecture_library/phase_8/86_phase_8_approved_technology_atoms_schema_v1.yaml`
- `architecture_library/phase_8/84_phase_8_profile_parameters_schema_v1.yaml` (platform pin enums)
- `architecture_library/phase_8/99_phase_8_technology_atom_capabilities_v1.yaml` (atom → capability mapping)
- TBP catalog/manifests under `architecture_library/phase_8/tbp/` (when adding stack bindings)
- `architecture_library/phase_8/88_phase_8_add_approved_technology_atom_v1.md`

## Procedure

### Step 0 — Establish baseline and closest match
1. Locate the closest existing platform pin enum/template match (if scope includes platform pins).
2. Identify whether the technology maps to:
   - a new **atom value** (enum addition), and/or
   - a new **platform pin enum value** (schema/template addition), and/or

### Step 1 — Web research (official docs preferred)
Perform web searches to collect **authoritative** facts:
- canonical product name
- the concept it corresponds to in CAF (provider/runtime/deployment/iac/etc.)
- supported commands / configuration formats (only if needed for runbook/scaffolding)
- any constraints that must be represented (OS, version minimums, etc.)

Rules:
- Prefer official docs and primary sources over blogs.
- Capture citations for each non-trivial factual claim.
- If sources conflict, treat the tech as ambiguous and fail-closed.

### Step 2 — Produce a grounded “change proposal”
Produce a short change proposal containing:
1. **Atoms update** (if needed)
   - exact enum(s) to extend
   - exact new values (snake_case)
2. **Platform pin schema update** (if needed)
   - exact enum(s) to extend
3. **Catalog entry**
   - full new catalog entry (copy-and-modify style)
5. **Scaffolding/runbook impacts**
   - which files would be generated/touched
   - a single canonical “How to run” command set (only if needed)

### Step 3 — Fail-closed checks
Before proposing patches, verify:
- every new profile field is representable in the atoms schema
- the profile schema accepts the values
- the changes do not introduce free-form fields without schema/validator updates

If any check fails:
- DO NOT PATCH
- write a feedback packet with the missing/ambiguous inputs and the exact file(s) that must be updated.

## Feedback packet (always)

Write a feedback packet to:
- `reference_architectures/<name>/feedback_packets/BP-YYYYMMDD-add-approved-tech-<slug>.md`

Minimum fields:
- Decision (`PROPOSE_PATCH` | `FAIL_CLOSED`)
- Stuck At
- Required Capability
- Observed Constraint
- Gap Type (Missing input | Spec inconsistency | Conflicting sources)
- Minimal Fix Proposal
- Evidence (include citations for external sources)

Do not print the feedback packet contents in chat.

If the decision is `PROPOSE_PATCH`, include suggested diffs (unified diff preferred) for the exact files to edit.
