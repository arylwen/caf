# CAF Meta-Patterns (v1)

This folder captures **CAF's meta-patterns**: cross-cutting, framework-level invariants and guidance that shape how CAF generates artifacts, proposes candidates, captures human signals, and fails closed.

These are **not** domain architecture patterns (those live under `architecture_library/patterns/caf_v1/`).

## What lives here

- **Playbook:** the detailed rationale, principles, invariants, and examples CAF uses to minimize human architect friction while staying grounded and deterministic.
- **Checklist:** a short, operational checklist used when adding/adjusting patterns, skills, templates, validators.
- **Meta-pattern highlight:** prefer DoD + code review rubrics over bespoke scripted validators (see MP-17).
- **Meta-pattern highlight:** architectural tasks are parameterized by rails/TBPs (avoid “if postgres then …” branching; see MP-18).
- **Anti-pattern highlight:** combinatorial sprawl (technology/language special-casing across workers/gates) is prohibited; see the new meta-pattern docs.
- **Meta-pattern highlight:** deterministic scripts are composable (CLI + importable `internal_main` with no execution on import; bundle adjacent deterministic stages into a single postprocess tool; see MP-19).
- **Roadmap:** a staggered plan to extend library-owned option sets across CAF domain patterns.
- **Meta-pattern highlight:** worker skills must not hardcode TBP IDs; bind via capability + role bindings (see `caf_no_tbp_id_leakage_in_worker_skills_meta_pattern_v1.md`).

## Canonical Phase 8 contracts referenced

- Human signal blocks: `architecture_library/phase_8/82_phase_8_human_signal_blocks_contract_v2.md`
- Document output standards: `architecture_library/02_contura_document_output_standards_v2.md`
- Crew model: `architecture_library/phase_8/80_phase_8_agent_crew_model_v1.md`

## Naming convention

Files here are intentionally verbose and narrative. They are written to be reusable for:

- CAF documentation
- internal reasoning capture

## Audience

This folder is primarily **maintainer-facing**. If you are using CAF to generate specs/designs and are not modifying the library, you can safely ignore `caf_meta_v1`.

## Key docs

- `caf_meta_patterns_playbook_v1.md`
- `caf_meta_patterns_checklist_v1.md`
- `meta_vs_domain_classification_rule_v1.md`
- `caf_feedback_packet_protocol_meta_pattern_v1.md`
- `caf_command_surface_meta_patterns_v1.md`
- `caf_skill_portability_and_adapter_shim_meta_patterns_v1.md`
- `caf_library_assets_and_candidate_outputs_meta_patterns_v1.md`
- `caf_promotions_and_obligations_meta_patterns_v1.md`
- `caf_fail_closed_permission_checkpoint_meta_pattern_v1.md`
- `caf_crew_model_meta_patterns_v1.md`
- `caf_lifecycle_axes_meta_patterns_v1.md`
- `caf_derivation_cascade_meta_patterns_v1.md`
- `caf_directory_and_enforcement_meta_patterns_v1.md`
- `caf_adr_governance_meta_patterns_v1.md`
- `caf_anti_repair_scripts_meta_patterns_v1.md`
- `caf_no_tbp_id_leakage_in_worker_skills_meta_pattern_v1.md`


## User-facing pattern browsing

For GitHub-friendly browsing of patterns by family (and a machine-friendly index for assistants), see:

- `docs/patterns/pattern_taxonomy_v1.md`
- `docs/pattern_index_v1.json`

## Public maintainer entry point

For a curated public maintainer-facing navigation surface, start in `docs/maintainer/README.md`.
