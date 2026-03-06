---
name: caf-make-skill
description: >
  Scaffolds one or more new worker skills (agents) from a structured Phase 8 Make Skill Request payload.
  Designed to consume the "Proposed Make Skill Request" block inside a feedback packet. Fail-closed on any ambiguity.
status: active

---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.


# CAF Make Skill Skill

## Goal

Create or update worker skills under `skills/<worker_id>/SKILL.md` based only on the structured request payload,
and register their capabilities in the Phase 8 worker capability catalog.

This command is a factory operation. It must not introduce architecture decisions or generate application code.

It MAY scaffold worker skills that are capable of generating the required artifacts declared in the request's
`task_signatures[]` (bounded by constraints).

## Inputs

One of:

- A path to a feedback packet file containing a "Proposed Make Skill Request" block.
- A raw YAML payload that validates against `architecture_library/phase_8/80_phase_8_make_skill_request_schema_v1.yaml`.

## Source of truth (local files)

- `architecture_library/phase_8/80_phase_8_make_skill_request_schema_v1.yaml`
- `architecture_library/phase_8/80_phase_8_make_skill_feedback_packet_block_v1.md`
- `architecture_library/phase_8/80_phase_8_caf_make_skill_spec_v1.md`

## Outputs

For each requested worker:

- `skills/<proposed_worker_id>/SKILL.md`

Catalog update (if needed):

- `architecture_library/phase_8/80_phase_8_worker_capability_catalog_v1.yaml`

Each generated `SKILL.md` must include these sections:

- `## Capabilities`
- `## Inputs`
- `## Outputs`
- `## Acceptance Checks`
- `## Fail-closed conditions`

## Procedure

1) Locate and extract the request payload.
2) Validate the payload structurally against the schema.
3) Validate that requested task signatures are within `constraints.allowed_write_paths` and use only `constraints.allowed_artifact_classes`.
4) For each `requested_workers[]` entry:
   - Create `skills/<proposed_worker_id>/` if missing.
   - Write `SKILL.md` that:
     - declares the exact `capabilities[]` from the request
     - copies only the referenced `task_signatures[]` relevant to those capabilities
     - lists required evidence responsibilities implied by `definition_of_done` and `semantic_review` (when present)
5) Register capability coverage (deterministic):
   - Open: `architecture_library/phase_8/80_phase_8_worker_capability_catalog_v1.yaml`
   - For each `requested_workers[]` entry and each of its `capabilities[]`:
     - If an entry exists for `capability_id`:
       - require its `worker_id` matches the requested `proposed_worker_id` (fail-closed on conflicts)
       - set `status: active` (do not change `role_kind`)
     - If no entry exists for `capability_id`:
       - append a new entry with:
         - `capability_id: <capability>`
         - `worker_id: <proposed_worker_id>`
         - `role_kind: <requested role_kind>`
         - `status: active`
6) Do not create runner shims by default.

7) User-facing completion reminder (normative):

   After successfully scaffolding skills and updating the capability catalog, remind the architect to re-run:

   - `/caf-arch <instance_name>`

   If the architect needs to change pins (stage/phase/approved profile), they must update the instance pins and
   regenerate the derived view before re-running `/caf-arch`.

   If the architect is proceeding directly to implementation, they may then re-run:

   - `/caf-build-candidate <instance_name>`

## Fail-closed rules

- If the payload is missing or schema-invalid, stop and write a feedback packet.
- If any requested output path falls outside allowed write paths, stop and write a feedback packet.
- If any requested artifact class is not allowed, stop and write a feedback packet.
- If any requested capability conflicts with an existing catalog mapping (different `worker_id`), stop and write a feedback packet.
- Never invent tasks, outputs, validations, or architecture choices.
