---
name: worker-domain-modeler
description: >
  Derive a structured, DDD-oriented domain model from product-level specification text.
  Instruction-only: no scripts. Fail-closed on ambiguity or missing required inputs.
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.


# worker-domain-modeler

## Purpose

Produce `playbook/domain_model_v1.yaml` as a **semantic intermediate** used by Playbook planning.
This step makes planning less bespoke by avoiding direct "CRUD resources" hardcoding in the planner.

This worker does **not** select technologies or frameworks.

## Inputs (read-only)

Required:
- `reference_architectures/<name>/spec/playbook/application_spec_v1.md`

Optional (if present, use as constraints/anchors):
- `reference_architectures/<name>/spec/playbook/system_spec_v1.md`
- `reference_architectures/<name>/design/playbook/application_design_v1.md`
- `reference_architectures/<name>/design/playbook/control_plane_design_v1.md`

## Output

- `reference_architectures/<name>/spec/playbook/domain_model_v1.yaml`

Must validate against:
- `architecture_library/phase_8/87_phase_8_domain_model_schema_v1.yaml`

## Hard rules (fail-closed)

1) Grounded only: do not invent product features not supported by the spec.
2) Deterministic: given the same spec text, produce stable ids (`context_id`, `use_case_id`).
3) Minimum viable structure:
   - At least 1 bounded context
   - At least 1 use case
4) If the spec is too underspecified to confidently name a domain summary + at least one use case, refuse and write a feedback packet.

## Procedure

1) Read `application_spec_v1.md`.

2) Extract product-level intent:

   - `domain.summary`: 1–3 sentences describing what the product manages/does.
   - Identify user-facing behaviors as candidate **use cases**.

   Preferred sources (use the first that exists):
   - If spec has a `## Use cases` / `## User stories` / `## Functional requirements` section, use it.
   - Else, use the spec's `Domain` and `Resources` descriptions.

3) Derive bounded contexts (DDD-oriented, but minimal):

   - If the spec only describes a single cohesive product area, produce a single context:
     - `context_id: CORE`
     - `name: Core`
   - If the spec clearly describes distinct subdomains (e.g., billing, identity, content), split into 2–4 contexts.

   Deterministic `context_id` rule:
   - Uppercase snake case of the context name, with non-alphanumerics removed.
   - Example: "User Identity" -> `USER_IDENTITY`

4) Derive entities (tactical DDD-lite, non-bespoke):

   - Prefer using explicit `Resources` listed in the spec as entity candidates.
   - If no resources are explicitly listed, derive 1–3 entity candidates only when the spec names a noun that is clearly the primary managed record (e.g., "widget").
   - Fields:
     - Use only fields explicitly present in the spec.
     - If a field type is not explicit, use a conservative placeholder type like `text` (this is a domain type label, not a programming type).

5) Derive use cases:

   - Minimum: produce `UC-01` representing the primary interaction (e.g., "Manage Widgets").
   - If resources exist, include standard use cases corresponding to operations only if the spec implies they exist.

   Deterministic `use_case_id` rule:
   - `UC-` + two-digit index in order of appearance in the spec.
   - Example: `UC-01`, `UC-02`, ...

6) Derive API candidates (optional, planning hint only):

   - If the spec includes a `## Resources` section listing resource names and operations, mirror it under:
     - `api_candidates.resources[]`
   - If resources are not explicitly listed, but entities were derived in step 4, you MAY list them as `api_candidates.resources` with no operations (or with inferred operations only if the spec strongly implies CRUD).

   Note: `api_candidates` does not decide REST vs GraphQL. It is only a list of potential externally-exposed interaction surfaces.

7) Write `playbook/domain_model_v1.yaml`.

   Required content:
   - `schema_version: domain_model_v1`
   - `generated_from.inputs`: include the exact input file paths used.
   - `domain.summary`
   - `domain.bounded_contexts[]` (≥1)
   - `domain.use_cases[]` (≥1)

8) If refusal is required:

   - Write a feedback packet under:
     - `reference_architectures/<name>/feedback_packets/BP-YYYYMMDD-domain-model-incomplete.md`
   - Include:
     - Stuck At: domain model derivation
     - Missing/ambiguous source sections in `application_spec_v1.md`
     - Minimal fix proposal: which headings/content to add (e.g., add `## Use cases` with 1–3 bullets)
