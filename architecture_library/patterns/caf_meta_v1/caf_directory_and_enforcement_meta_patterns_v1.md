# CAF Directory and Enforcement Meta-Patterns (v1)

This document consolidates and replaces the former `CAF-DIR-*` and `CAF-ENF-*` pattern definitions that previously lived under `architecture_library/patterns/caf_v1/definitions_v1/`.

These are **CAF meta-patterns** (framework output placement + rails/enforcement posture), not target-system architecture patterns.

## Sources to reconcile (flag discrepancies first)

Do **not** treat any single source as authoritative during iteration. Flag mismatches first, then reconcile.

Sources to reconcile:

- `skills/` and `.codex/` shims (actual behavior)
- `.agent/workflows/` (operational runbooks)
- Phase 8 framework docs (intent):
  - `architecture_library/phase_8/80_phase_8_agent_crew_model_v1.md`
  - `architecture_library/phase_8/82_phase_8_human_signal_blocks_contract_v2.md`
- Layer 8 resolved rails (where defined/derived):
  - allowed_write_paths / allowed_artifact_classes / forbidden_actions
  - runnable_code_approved
  - enforcement bar selection

## Core meta-pattern: Output is constrained by rails, not by ad-hoc skill choices

CAF outputs must be gated by **derived rails** (Layer 8 resolved view), not by “whatever the skill decided.”

### Rails (authoritative at runtime)

- **allowed_write_paths**: where the agent may write
- **allowed_artifact_classes**: which kinds of outputs are permitted
- **forbidden_actions**: explicit bans (e.g., do not modify reference archives directly)
- **runnable_code_approved**: whether runnable code is permitted
- **enforcement bar selection**: candidate vs contract scaffolding vs other bars

### Placement invariants

- CAF should not “spray files” across the repo. Every output class has a sanctioned directory.
- Reference archives under `reference_architectures/` and generated instances under `companion_repositories/` are producer outputs; fix producers, not outputs (unless iteration policy explicitly allows regeneration).

## Enforcement bars (candidate vs contract scaffolding)

CAF should make it obvious which posture applies:

- **Candidate**: runnable artifacts are treated as non-production and gated; evidence/validation hooks exist.
- **Contract scaffolding**: architecture/contract artifacts dominate; implementation is minimal or absent.

Enforcement bars should be selected from resolved rails/pins and applied consistently across the crew.

## Drift prevention (framework-level)

- Evaluators (e.g., drift checks) should block:
  - skill-owned inventories of decisions/options
  - writes outside allowed paths
  - missing required scaffolds when a pack/agent is enabled
  - inconsistencies between inventories and actual shims/workflows

This doc is the conceptual home for the old `CAF-ENF-*` patterns, but framed as framework invariants instead of domain patterns.
