# CAF Pattern Definitions v1

## Purpose

This folder contains **CAF pattern definitions** extracted from Contura Phase 2 pattern guides (the 20_/21_/22_ series) and formatted in the same shape as core and external patterns.

CAF patterns are **house architectural constraints** used to:

- provide stable, referenceable anchors in design decision checklists
- enable deterministic planning and Plan QA validation
- avoid requiring agents to parse long narrative guides to apply rules

## Authoritative sources

CAF pattern definitions are derived from these documents:

- `architecture_library/20_contura_control_application_data_plane_pattern_guide_v1.md`
- `architecture_library/21_contura_channel_resilient_delivery_pattern_guide_v1.md`
- `architecture_library/21_contura_multi_tenancy_patterns_v1.md`
- `architecture_library/22_contura_identity_access_pattern_guide_v1.md`
- `architecture_library/22_contura_policy_engine_architecture_guide_v1.md`

Each definition includes `source_documents` pointers.

## Status

- Triggering is **semantic and evidence-grounded** (ranking over the CAF pattern index + pattern definitions), not deterministic cue tables.
- Minimum evidence, decision prompts, and acceptance checks are conservative v0 scaffolds and must be refined via explicit catalog edits.


## Retrieval surface

CAF pattern selection uses the **canonical retrieval surface**:

- `architecture_library/patterns/retrieval_surface_v1/pattern_retrieval_surface_v1.jsonl`
- view profiles: `architecture_library/patterns/retrieval_surface_v1/retrieval_view_profiles_v1.yaml`
- owner: `skills/worker-pattern-retriever/SKILL.md`

No legacy indices or trigger playbooks are used for retrieval.

## Pattern kind

CAF pattern definitions include `caf.kind` to distinguish:
- `decision_pattern` (cue-triggered)
- `standard` (always-on)
- `process_contract` (derivation/orchestration contract)
- `checklist` (evaluation/completeness checklist)
