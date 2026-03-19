# Enrichment ownership map v1

This document is the maintainer-facing registry for CAF deterministic enrichment coverage.

Use it when:

- adding a new library terminal or task-seed family
- deciding whether a rule belongs in the planner, an enricher, a gate, or a worker
- deciding whether a realization option is mature enough to become a default template posture
- deciding whether repeated library prose should stay in prompts or move into deterministic enrichment because of weak-model fidelity and token-cost pressure

The companion meta-pattern is:

- `architecture_library/patterns/caf_meta_v1/caf_deterministic_enrichment_ownership_meta_pattern_v1.md`

## Ownership rule

For each terminal or library-authored pressure surface, record:

1. source surface
2. planner-owned carrier
3. deterministic enricher/deriver
4. verifying gate
5. current coverage status

If a new surface does not fit an existing enricher, maintainers must either:

- add a new deterministic enricher/validator path, or
- keep the feature non-default until first-class ownership exists

## Current covered surfaces

### 1. Library semantic acceptance attachments

- **Source surfaces**
  - CAF/external pattern definition semantic acceptance attachments
  - adopted human-question and option attachments
  - TBP manifest `extensions.gates[]`
  - ABP/PBP shared attachment surfaces when present
- **Planner-owned carrier**
  - task ids
  - semantic anchors
  - adopted-decision anchors
  - baseline DoD / review skeleton in `task_graph_v1.yaml`
- **Deterministic enricher**
  - `tools/caf/task_graph_semantic_acceptance_enrichment_v1.mjs`
- **Verifying gate(s)**
  - `tools/caf/planning_invariant_gate_v1.mjs`
  - downstream task-graph consumers that require the attached lines
- **Coverage status**
  - covered

### 2. Framework-managed required inputs implied by resolved rails

- **Source surfaces**
  - `reference_architectures/<instance>/spec/guardrails/profile_parameters_resolved.yaml`
  - resolved runtime/auth/persistence selections
- **Planner-owned carrier**
  - task ids
  - capability ids
  - final `task_graph_v1.yaml`
- **Deterministic enricher**
  - `tools/caf/task_graph_required_input_enrichment_v1.mjs`
- **Verifying gate(s)**
  - `tools/caf/planning_technology_choice_realization_gate_v1.mjs`
- **Coverage status**
  - covered

### 3. Interface-binding contract derivation and task attachment sequencing

- **Source surfaces**
  - planner-emitted `interface_binding_hints[]` in `task_graph_v1.yaml`
  - `abp_pbp_resolution_v1.yaml`
- **Planner-owned carrier**
  - task ids
  - `interface_binding_hints[]`
- **Deterministic derivation / sequencing**
  - `tools/caf/gen_interface_binding_contracts_v1.mjs`
  - `tools/caf/interface_binding_contract_gate_v1.mjs`
- **Verifying gate(s)**
  - `tools/caf/interface_binding_contract_gate_v1.mjs`
  - build/runtime binding evidence consumers
- **Coverage status**
  - covered

### 4. UI task-seed semantic pressure preservation

- **Source surfaces**
  - `architecture_library/phase_8/80_phase_8_ui_task_seeds_v1.yaml`
  - planner-emitted matching UI task ids in `task_graph_v1.yaml`
- **Planner-owned carrier**
  - UI task ids
  - task dependencies / steps / structural routing
  - baseline task contract
- **Deterministic enricher**
  - `tools/caf/task_graph_ui_seed_semantic_enrichment_v1.mjs`
- **Verifying gate(s)**
  - `tools/caf/post_plan_gate_v1.mjs` (chain ownership)
  - `tools/caf/task_graph_shape_gate_v1.mjs` (presence of expected UI task ids)
  - `tools/caf/planning_invariant_gate_v1.mjs` (post-plan preservation of seed-authored inputs and semantic pressure)
- **Coverage status**
  - covered

## Known gaps / partial coverage

### A. Canonical dependency baseline research and upgrade policy

- **Source surfaces**
  - runtime dependency manifests
  - version pins inside library-owned templates / TBPs / starter baselines
  - driver/runtime compatibility expectations that may drift with time
- **Observed gap**
  - CAF can now verify selected manifest semantics deterministically, but it does not yet maintain an intentional research-backed policy for when to refresh package baselines, which versions are blessed, and how upgrades are staged
- **Needed ownership path**
  - a roadmap-owned research + curation loop that produces blessed baseline updates, compatibility notes, and explicit rollout decisions rather than ad hoc version drift
- **Coverage status**
  - roadmap_only

### B. Canonical dependency-manifest realization verification

- **Source surfaces**
  - TBP/role-binding/runtime realization expectations for Python dependency manifests
- **Planner-owned carrier**
  - resolved TBP obligations and role binding expectations attached to observability/runtime tasks
- **Deterministic validator path**
  - `tools/caf/lib_role_binding_validators_v1.mjs`
  - `tools/caf/lib_python_dependency_manifest_v1.mjs`
  - consumed by `tools/caf/build_technology_choice_realization_gate_v1.mjs`
- **Verifying gate(s)**
  - `tools/caf/build_technology_choice_realization_gate_v1.mjs`
  - review surfaces such as `RR-PY-DEPENDENCY-MANIFEST-01`
- **Coverage status**
  - covered

### C. `raw_sql` first-class terminal support

- **Source surfaces**
  - approved technology atoms / technology-choice rules permit `raw_sql`
- **Observed gap**
  - worker awareness exists, but there is no first-class library-owned terminal with realization semantics comparable to current SQLAlchemy-oriented paths
- **Needed ownership path**
  - declarative terminal contract + realization expectations + gates/enrichment where needed before making `raw_sql` a default starter posture
- **Coverage status**
  - missing

## Maintainer procedure for new terminals

Before adopting a new terminal or changing a template default:

1. Record the terminal here.
2. Identify the planner-owned carrier.
3. Reuse an existing enricher if it already fits.
4. If not, add a new deterministic enricher/validator path under `tools/caf/`.
5. Add or update the verifying gate.
6. Update the relevant meta-pattern/checklist docs.
7. Only then consider switching template defaults.

### 5. Compiler-owned pattern obligations

- **Source surfaces**
  - `planning_pattern_payload_v1` (selected patterns + adopted option choices)
  - resolved rails / enforcement bar
  - contract declarations
  - structured domain models
  - resolved TBP manifests
- **Planner-owned carrier**
  - none for the obligation artifact itself; the planner consumes the compiled registry and owns task structure
- **Deterministic compiler**
  - `tools/caf/compile_pattern_obligations_v1.mjs`
- **Verifying gate(s)**
  - `tools/caf/pattern_obligation_gate_v1.mjs`
  - `tools/caf/tbp_obligation_gate_v1.mjs`
  - `tools/caf/planning_invariant_gate_v1.mjs`
- **Coverage status**
  - covered

### 6. Compiler-owned obligation trace attachment

- **Source surfaces**
  - compiled `pattern_obligations_v1.yaml`
  - planner-emitted canonical task ids / option anchors / tbp anchors in `task_graph_v1.yaml`
- **Planner-owned carrier**
  - task ids
  - task structure
  - canonical option tasks and TBP task scaffolds
- **Deterministic enricher**
  - `tools/caf/task_graph_obligation_trace_enrichment_v1.mjs`
- **Verifying gate(s)**
  - `tools/caf/pattern_obligation_gate_v1.mjs`
  - `tools/caf/planning_invariant_gate_v1.mjs`
- **Coverage status**
  - covered
