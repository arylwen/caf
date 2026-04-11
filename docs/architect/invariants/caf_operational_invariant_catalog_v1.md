# CAF operational invariant catalog v1

CAF is the architecture control layer for AI-assisted software delivery.

This catalog focuses on CAF operational invariants: the framework-side truths CAF relies on while it carries architecture through derivation, planning, gates, and build. It explains where those invariants are defined, how they are enforced or checked, and which evidence surfaces are expected to prove them.

The canonical machine-readable sources are now:

- [`../../../architecture_library/17_contura_caf_operational_invariant_catalog_v1.yaml`](../../../architecture_library/17_contura_caf_operational_invariant_catalog_v1.yaml)
- [`../../../architecture_library/18_contura_invariant_taxonomy_v1.yaml`](../../../architecture_library/18_contura_invariant_taxonomy_v1.yaml)

This page is a reader-friendly derivative. It helps architects and maintainers understand the invariant surface without replacing the YAML as canon.

## Why this page matters

Architects rarely manage only components and diagrams. They also manage invariants: properties that must remain true if architecture is still being carried forward honestly. In CAF, those invariants span product and architecture decisions, planning payloads, resolved guardrails, worker contracts, and fail-closed gates.

## How to read a catalog row

- **Defined in** — where the invariant is stated normatively
- **Enforced by** — where CAF tries to make it true
- **Checked by** — where CAF verifies it
- **Evidence surfaces** — where proof is expected to live
- **Activation** — whether the invariant is always on or only becomes active when a pin, option, capability, artifact, or stage is present
- **Derivation lineage** — where the invariant originates in the cascade and what upstream invariant it refines or realizes

## At a glance

- **Catalog rows:** 22
- **Top statuses:**
- **enforced** — 10
- **partially_enforced** — 9
- **declared** — 3
- **Top source classes:**
- **gate** — 13
- **meta_pattern** — 11
- **contract** — 10
- **playbook_block** — 9
- **docs** — 8
- **worker_contract** — 6
- **Top families:**
- **design_to_plan_handoff_boundary** — 4
- **gate_truthfulness_and_fail_closed** — 3
- **planning_payload_integrity** — 2
- **decision_option_integrity** — 1
- **block_ownership_and_authority** — 1
- **shared_parsing_and_normalization** — 1
- **Activation kinds:**
- **always_on** — 8
- **when_artifact_present** — 6
- **when_stage_active** — 4
- **when_capability_present** — 2
- **when_pin_equals** — 1
- **when_manifest_present** — 1

## High-value examples from the current catalog

- **Each adopted decision question must have exactly one adopted option** (`INV-DECISION-EXACTLY-ONE-ADOPTED-OPTION`) — For CAF decision patterns, every adopted question must resolve to exactly one adopted option; zero or multiple adopted options violates the canonical decision integrity contract.
- **Resolved guardrails view is authoritative for rails and branching behavior** (`INV-LAYER8-RESOLVED-VIEW-AUTHORITATIVE`) — When branching behavior depends on pinned values and derived rails, CAF must treat profile_parameters_resolved.yaml as the single source of truth instead of recomputing or reinterpreting the same semantics ad hoc.
- **Architecture style must resolve through ABP/PBP artifacts instead of being reinterpreted from prose** (`INV-ABP-PBP-RESOLUTION-CANONICAL-STYLE-TO-PLANE`) — CAF resolves architecture.architecture_style into selected ABP and derived ABP/PBP projections, and planning should consume abp_pbp_resolution_v1.yaml rather than reinterpreting architecture style from prose or local heuristics.
- **Worker skills must not hardcode TBP IDs** (`INV-WORKERS-NO-TBP-ID-LEAKAGE`) — Workers must bind to TBP consequences via capabilities and role_binding_key rather than hardcoding TBP IDs, so adding or changing TBPs does not require worker rewrites.
- **Extension packs must remain non-authoritative and declare upstream dependencies** (`INV-EXT-NON-AUTHORITATIVE-UPSTREAM-DECLARATION`) — Extension packs and modernization playbooks may package cross-cutting guidance, but they must remain non-authoritative, stay downstream of CAF governance, and explicitly declare their upstream dependencies.

## Why the derivation-cascade view matters

CAF invariants do not all live at the same layer. Some begin as framework intent. Some become active when a pin is chosen. Some are realized in resolved views such as the guardrails-resolved posture or ABP/PBP projection. Others appear only when planning payloads, tasks, workers, or runtime evidence surfaces are present.

That is why the catalog now tracks both semantic family and derivation lineage.

## Binding Authority Split

This family currently contains 1 catalog row.

### INV-PROFILE-BINDINGS-RATIONALE-SPLIT — Machine-consumed bindings and architectural rationale must remain split

profile_parameters.yaml owns machine-consumed technical bindings, while specs, designs, and decision surfaces own rationale; CAF should not bury architectural reasoning inside pins or silently move machine bindings into prose.

- **Status:** declared
- **Severity / enforcement:** blocker / declared_only
- **Activation:** always_on — Applies whenever an instance uses profile_parameters.yaml and architecture rationale surfaces together.
- **Subject area:** binding_and_rationale_split
- **Scope:** lifecycle=cross_phase; plane=framework; artifact=spec/guardrails/profile_parameters.yaml plus spec/design rationale surfaces
- **Source classes:** profile_parameters, docs, playbook_block
- **Canonical owner:** docs_contract — `docs/user/13_profile_parameters_configuration.md`
**Defined in:**
- `docs/user/13_profile_parameters_configuration.md` — anchor: Architecture / rationale split — role: primary
- `docs/user/15_prd_first_lifecycle.md` — anchor: rationale vs binding — role: secondary

**Enforced by:**

- `reference_architectures/<instance>/spec/guardrails/profile_parameters.yaml` — machine bindings live in profile parameters
- `reference_architectures/<instance>/spec/playbook/*.md` — rationale and architectural reasoning live in specs and decisions

**Checked by:**

- `docs/user/13_profile_parameters_configuration.md` — current enforcement is documented and culturally reinforced rather than centrally linted

**Evidence surfaces:**

- `reference_architectures/<instance>/spec/guardrails/profile_parameters.yaml` — anchor: platform.* and ui.* pins
- `reference_architectures/<instance>/spec/playbook/system_spec_v1.md` — anchor: architect rationale surfaces

**Derivation lineage:**

- origin stage: pin
- no explicit upstream relation recorded

**Failure mode:** technology bindings drift into prose or rationale gets buried inside machine pins  
**Typical blocker or packet surface:** traceability and retrieval degrade; human rationale becomes harder to recover or enforce

## Block Ownership And Authority

This family currently contains 1 catalog row.

### INV-PLAYBOOK-BLOCK-SINGLE-OWNER — Each managed playbook block must have a single canonical owner

CAF-managed playbook blocks must have an explicit owner surface (script, skill, or architect), and validators/gates should treat the ownership registry as the single source of truth.

- **Status:** partially_enforced
- **Severity / enforcement:** blocker / deterministic_helper
- **Activation:** always_on — Applies to every CAF-managed playbook block.
- **Subject area:** ownership_and_authority
- **Scope:** lifecycle=cross_phase; plane=framework; artifact=reference_architectures/{instance}/spec/playbook/*.md managed blocks
- **Source classes:** contract, playbook_block, docs
- **Canonical owner:** contract — `tools/caf/contracts/playbook_blocks_ownership_and_invariants_v1.md`
**Defined in:**
- `tools/caf/contracts/playbook_blocks_ownership_and_invariants_v1.md` — anchor: This document is the single source of truth — role: primary

**Enforced by:**

- `tools/caf/contracts/playbook_blocks_ownership_and_invariants_v1.md` — names owner per managed block

**Checked by:**

- `tools/caf/contracts/playbook_blocks_ownership_and_invariants_v1.md` — current repo-wide enforcement appears contract-driven rather than centrally gated

**Evidence surfaces:**

- `reference_architectures/<instance>/spec/playbook/system_spec_v1.md` — anchor: CAF_MANAGED_BLOCK markers
- `reference_architectures/<instance>/spec/playbook/application_spec_v1.md` — anchor: CAF_MANAGED_BLOCK markers

**Derivation lineage:**

- origin stage: execution
- no explicit upstream relation recorded

**Failure mode:** ambiguous producer ownership or competing producer lore for the same block  
**Typical blocker or packet surface:** ownership drift; validator/gate behavior may diverge by surface

## Decision Option Integrity

This family currently contains 1 catalog row.

### INV-DECISION-EXACTLY-ONE-ADOPTED-OPTION — Each adopted decision question must have exactly one adopted option
For CAF decision patterns, every adopted question must resolve to exactly one adopted option; zero or multiple adopted options violates the canonical decision integrity contract.
- **Status:** enforced
- **Severity / enforcement:** blocker / fail_closed
- **Activation:** always_on — Applies whenever decision_resolutions_v1 contains adopted decision questions.
- **Subject area:** decision_integrity
- **Scope:** lifecycle=spec; plane=framework; artifact=ARCHITECT_EDIT_BLOCK: decision_resolutions_v1
- **Source classes:** playbook_block, meta_pattern, contract, validator, docs
- **Canonical owner:** architect_edit_block_plus_deterministic_validator — `tools/caf/analyze_decisions_v1.mjs`
**Defined in:**
- `docs/architect/05_traceability_chain_and_data_model.md` — anchor: Decision patterns -> exactly 1 adopted option — role: primary
- `tools/caf/contracts/playbook_blocks_ownership_and_invariants_v1.md` — anchor: ARCHITECT_EDIT_BLOCK: decision_resolutions_v1 — role: secondary

**Enforced by:**
- `reference_architectures/<instance>/spec/playbook/system_spec_v1.md` — architect must make adopt/defer/reject explicit in the canonical block
- `tools/caf/analyze_decisions_v1.mjs` — diagnoses adopted-option invariant violations

**Checked by:**
- `tools/caf/analyze_decisions_v1.mjs` — emits adopted option invariant errors for zero or multi-adopt selections

**Evidence surfaces:**
- `reference_architectures/<instance>/spec/playbook/system_spec_v1.md` — anchor: ARCHITECT_EDIT_BLOCK: decision_resolutions_v1

**Downstream consumers:**
- `tools/caf/materialize_planning_pattern_payload_v1.mjs` — adopted options feed planning payload materialization

**Derivation lineage:**
- origin stage: pattern
- no explicit upstream relation recorded

**Failure mode:** adopted decision question has zero or more than one adopted option  
**Typical blocker or packet surface:** analyze_decisions_v1 diagnostics; downstream planning surfaces become invalid
## Derivation Cascade Resolution

This family currently contains 1 catalog row.

### INV-ABP-PBP-RESOLUTION-CANONICAL-STYLE-TO-PLANE — Architecture style must resolve through ABP/PBP artifacts instead of being reinterpreted from prose
CAF resolves architecture.architecture_style into selected ABP and derived ABP/PBP projections, and planning should consume abp_pbp_resolution_v1.yaml rather than reinterpreting architecture style from prose or local heuristics.
- **Status:** partially_enforced
- **Severity / enforcement:** blocker / deterministic_helper
- **Activation:** when_pin_equals — Applies whenever architecture.architecture_style is pinned and ABP/PBP projection is derived.
- **Subject area:** style_to_plane_resolution
- **Scope:** lifecycle=design_to_plan; plane=cross_plane; artifact=spec/guardrails/abp_pbp_resolution_v1.yaml
- **Source classes:** profile_parameters, resolved_guardrails, abp, pbp, docs
- **Canonical owner:** guardrails_deriver — `tools/caf/guardrails_v1.mjs`
**Defined in:**
- `docs/user/13_profile_parameters_configuration.md` — anchor: Architecture style resolution — role: primary
- `architecture_library/00_contura_architecture_library_taxonomy_v1.md` — anchor: ABP / PBP / TBP definitions — role: secondary

**Enforced by:**
- `tools/caf/guardrails_v1.mjs` — derives ABP/PBP resolution from style pin and profile parameters

**Checked by:**
- `tools/caf/planning_invariant_gate_v1.mjs` — planning fails closed if required resolved inputs are missing
- `docs/user/13_profile_parameters_configuration.md` — /caf plan should use ABP/PBP projection for style-to-plane role mapping

**Evidence surfaces:**
- `reference_architectures/<instance>/spec/guardrails/abp_pbp_resolution_v1.yaml` — anchor: selected ABP and derived PBP/plane view
- `reference_architectures/<instance>/spec/guardrails/profile_parameters_resolved.yaml` — anchor: resolved architecture style and rails

**Downstream consumers:**
- `tools/caf/compile_pattern_obligations_v1.mjs` — pattern obligations should remain aligned to resolved style/plane mapping
- `skills/caf-application-architect/SKILL.md` — planning consumes resolved architecture posture rather than free-form prose reinterpretation

**Derivation lineage:**
- origin stage: resolution
- invariant: `INV-LAYER8-RESOLVED-VIEW-AUTHORITATIVE` — relation: refines

**Failure mode:** planners or workers infer plane roles from prose and diverge from resolved architecture style  
**Typical blocker or packet surface:** style-to-plane drift across planning and build artifacts
## Design To Plan Handoff Boundary

This family currently contains 4 catalog rows.

### INV-DESIGN-TO-PLAN-PLANNING-BRIDGE-FAIL-CLOSED — The planning payload bridge is a fail-closed design-to-plan handoff surface
Once later design derivation emits the planning payload bridge, /caf plan must consume that framework-owned bridge rather than infer or recreate it, and progression should fail closed when the bridge is missing or malformed.
- **Status:** enforced
- **Severity / enforcement:** blocker / fail_closed
- **Activation:** when_stage_active — Applies when later design surfaces are in scope for planning.
- **Subject area:** handoff_boundary
- **Scope:** lifecycle=design_to_plan; plane=cross_plane; artifact=CAF_MANAGED_BLOCK: planning_pattern_payload_v1
- **Source classes:** contract, gate, playbook_block
- **Canonical owner:** contract — `tools/caf/contracts/design_handoff_preflight_boundary_v1.md`
**Defined in:**
- `tools/caf/contracts/design_handoff_preflight_boundary_v1.md` — anchor: 1) Planning payload bridge blocks — role: primary

**Enforced by:**
- `tools/caf/materialize_planning_pattern_payload_v1.mjs` — produces the bridge blocks in both design docs

**Checked by:**
- `tools/caf/design_postgate_planning_coherence_v1.mjs` — coherence validator for the bridge
- `tools/caf/planning_invariant_gate_v1.mjs` — refuses planning progression when canonical planning outputs are absent or malformed

**Evidence surfaces:**
- `reference_architectures/<instance>/design/playbook/application_design_v1.md` — anchor: CAF_MANAGED_BLOCK: planning_pattern_payload_v1
- `reference_architectures/<instance>/design/playbook/control_plane_design_v1.md` — anchor: CAF_MANAGED_BLOCK: planning_pattern_payload_v1

**Derivation lineage:**
- origin stage: verification
- no explicit upstream relation recorded

**Failure mode:** planning bridge missing, empty, or malformed after later design derivation  
**Typical blocker or packet surface:** design_postgate_planning_coherence_v1.mjs / planning_invariant_gate_v1.mjs

### INV-CONTRACT-DECLARATIONS-MATERIALITY-BOUNDARY — Contract declarations become fail-closed only when the design materially declares CP↔AP contracts
The contract_declarations_v1 registry is materially required only when the control-plane design contains a material CP↔AP contract section/choices block; in that condition missing or placeholder-like output should fail closed, but CAF must not invent registry obligations when the design handoff did not declare them.
- **Status:** enforced
- **Severity / enforcement:** blocker / fail_closed
- **Activation:** when_artifact_present — Applies when the design materially declares CP↔AP contracts.
- **Subject area:** handoff_boundary
- **Scope:** lifecycle=design_to_plan; plane=cross_plane; artifact=design/playbook/contract_declarations_v1.yaml
- **Source classes:** contract, gate, playbook_block
- **Canonical owner:** contract — `tools/caf/contracts/design_handoff_preflight_boundary_v1.md`
**Defined in:**
- `tools/caf/contracts/design_handoff_preflight_boundary_v1.md` — anchor: 2) Conditional contract declarations registry — role: primary

**Enforced by:**
- `tools/caf/scaffold_contract_declarations_v1.mjs` — scaffold and normalization path for the registry

**Checked by:**
- `tools/caf/design_postgate_contract_declarations_coherence_v1.mjs` — coherence validator for the registry
- `tools/caf/validate_instance_v1.mjs` — downstream schema/invariant validation

**Evidence surfaces:**
- `reference_architectures/<instance>/design/playbook/contract_declarations_v1.yaml` — anchor: root document
- `reference_architectures/<instance>/design/playbook/control_plane_design_v1.md` — anchor: material CP↔AP contract section / choices block

**Derivation lineage:**
- origin stage: planning
- no explicit upstream relation recorded

**Failure mode:** missing, placeholder-like, or incoherent registry when material contract declarations exist  
**Typical blocker or packet surface:** design_postgate_contract_declarations_coherence_v1.mjs / validate_instance_v1.mjs

### INV-PLANE-INTEGRATION-CONTRACT-CHOICES-CANONICAL-BLOCK — Plane integration contract choices must exist as a canonical architect-edit block when later design is in scope
The plane_integration_contract_choices_v1 block in control_plane_design_v1.md is the canonical planning/build-facing handoff for CP runtime shape, AP runtime shape, and primary CP↔AP contract adoption, and should fail closed when missing, unparsable, or non-canonical once later design derivation is in scope.
- **Status:** enforced
- **Severity / enforcement:** blocker / fail_closed
- **Activation:** when_artifact_present — Applies when later design-to-plan contract choices are in scope.
- **Subject area:** handoff_boundary
- **Scope:** lifecycle=design_to_plan; plane=cross_plane; artifact=ARCHITECT_EDIT_BLOCK: plane_integration_contract_choices_v1
- **Source classes:** contract, playbook_block, gate
- **Canonical owner:** contract — `tools/caf/contracts/design_handoff_preflight_boundary_v1.md`
**Defined in:**
- `tools/caf/contracts/design_handoff_preflight_boundary_v1.md` — anchor: 3) Narrow plane integration contract choices block — role: primary

**Enforced by:**
- `skills/caf-solution-architect/SKILL.md` — produces the architect-edit block from the library-owned schema/template seam
- `architecture_library/phase_8/86_phase_8_plane_integration_contract_choices_schema_v1.yaml` — canonical block shape

**Checked by:**
- `tools/caf/design_postgate_plane_integration_contract_choices_coherence_v1.mjs` — deterministic postgate validator
- `tools/caf/validate_instance_v1.mjs` — downstream validation

**Evidence surfaces:**
- `reference_architectures/<instance>/design/playbook/control_plane_design_v1.md` — anchor: ARCHITECT_EDIT_BLOCK: plane_integration_contract_choices_v1

**Downstream consumers:**
- `tools/caf/task_graph_contract_anchor_postprocess_v1.mjs` — planning/build contract anchor consumer

**Derivation lineage:**
- origin stage: planning
- no explicit upstream relation recorded

**Failure mode:** missing, non-canonical, or unparsable plane integration contract choices block  
**Typical blocker or packet surface:** design_postgate_plane_integration_contract_choices_coherence_v1.mjs / validate_instance_v1.mjs
### INV-PLANE-DOMAIN-MODEL-VIEWS-CANONICAL-YAML — Normalized plane domain-model YAML views are canonical planning-facing handoff surfaces
Once later design derivation emits normalized application/system plane domain-model YAML views, they are no longer advisory and planning/build may fail closed when either view is missing, unparsable, or violates the canonical planning-facing contract.
- **Status:** enforced
- **Severity / enforcement:** blocker / fail_closed
- **Activation:** when_artifact_present — Applies when normalized plane domain-model YAML views are emitted.
- **Subject area:** handoff_boundary
- **Scope:** lifecycle=design_to_plan; plane=cross_plane; artifact=design/playbook/{application_domain_model_v1.yaml,system_domain_model_v1.yaml}
- **Source classes:** contract, playbook_block, gate
- **Canonical owner:** contract — `tools/caf/contracts/design_handoff_preflight_boundary_v1.md`
**Defined in:**
- `tools/caf/contracts/design_handoff_preflight_boundary_v1.md` — anchor: 4) Normalized plane domain-model YAML views — role: primary

**Enforced by:**
- `skills/worker-domain-modeler/SKILL.md` — emits normalized application/system plane views
- `architecture_library/phase_8/87b_phase_8_plane_domain_model_schema_v1.yaml` — canonical YAML shape

**Checked by:**
- `tools/caf/design_postgate_plane_domain_model_views_coherence_v1.mjs` — deterministic postgate validator
- `tools/caf/validate_instance_v1.mjs` — planning/build validation of the canonical views

**Evidence surfaces:**
- `reference_architectures/<instance>/design/playbook/application_domain_model_v1.yaml` — anchor: root document
- `reference_architectures/<instance>/design/playbook/system_domain_model_v1.yaml` — anchor: root document

**Derivation lineage:**
- origin stage: planning
- no explicit upstream relation recorded

**Failure mode:** normalized plane views absent, unparsable, or contract-incoherent  
**Typical blocker or packet surface:** design_postgate_plane_domain_model_views_coherence_v1.mjs / validate_instance_v1.mjs
## Deterministic Enrichment Ownership

This family currently contains 1 catalog row.

### INV-ENRICHMENT-OWNERSHIP-SPLIT — CAF must keep semantic production, deterministic enrichment, gates, and repair tools in distinct ownership lanes
CAF flows must distinguish semantic producer / planner-owned structure, framework-owned deterministic enrichment, invariant gates, and maintenance-only repair tools; deterministic helpers must not synthesize missing semantic outputs after the fact.
- **Status:** partially_enforced
- **Severity / enforcement:** blocker / declared_only
- **Activation:** always_on — Applies to CAF-owned semantic producers, deterministic enrichers, gates, and repair tools.
- **Subject area:** deterministic_enrichment
- **Scope:** lifecycle=cross_phase; plane=framework; artifact=ownership split across planner, enrichers, gates, and repair tools
- **Source classes:** meta_pattern, contract, worker_contract, gate
- **Canonical owner:** meta_pattern — `architecture_library/patterns/caf_meta_v1/caf_deterministic_enrichment_ownership_meta_pattern_v1.md`
**Defined in:**
- `architecture_library/patterns/caf_meta_v1/caf_deterministic_enrichment_ownership_meta_pattern_v1.md` — anchor: Core rule / Enricher posture — role: primary
- `tools/caf/contracts/enrichment_ownership_map_v1.md` — anchor: Ownership rule — role: secondary

**Enforced by:**
- `tools/caf/contracts/enrichment_ownership_map_v1.md` — documents covered surfaces and their deterministic enricher/gate pairings

**Checked by:**
- `tools/caf/contracts/enrichment_ownership_map_v1.md` — current enforcement is largely by documented ownership map plus specific gates for covered families

**Evidence surfaces:**
- `tools/caf/contracts/enrichment_ownership_map_v1.md` — anchor: covered surfaces / known gaps
- `tools/caf/*.mjs` — anchor: enrichers, compilers, gates

**Derivation lineage:**
- origin stage: execution
- no explicit upstream relation recorded

**Failure mode:** semantic work is recreated by helpers, or library-owned structural pressure is left implicit  
**Typical blocker or packet surface:** drift across planner prompts, enrichers, and gates
## Extension Pack Boundary

This family currently contains 1 catalog row.

### INV-EXT-NON-AUTHORITATIVE-UPSTREAM-DECLARATION — Extension packs must remain non-authoritative and declare upstream dependencies
Extension packs and modernization playbooks may package cross-cutting guidance, but they must remain non-authoritative, stay downstream of CAF governance, and explicitly declare their upstream dependencies.
- **Status:** declared
- **Severity / enforcement:** blocker / declared_only
- **Activation:** when_manifest_present — Applies whenever a new extension pack or modernization playbook is added.
- **Subject area:** extension_pack_governance
- **Scope:** lifecycle=framework_wide; plane=framework; artifact=extension packs and modernization playbooks
- **Source classes:** ext_pattern, docs, meta_pattern
- **Canonical owner:** framework_taxonomy_doc — `architecture_library/03_contura_architecture_framework_v1.md`
**Defined in:**
- `architecture_library/03_contura_architecture_framework_v1.md` — anchor: Extension packs and modernization playbooks package non-authoritative guidance — role: primary
- `architecture_library/06_contura_architecture_library_roadmap_v1.md` — anchor: New extension packs and modernization playbooks must declare that they are non-authoritative and list their upstream dependencies — role: secondary

**Enforced by:**
- `architecture_library/03_contura_architecture_framework_v1.md` — defines extension packs as downstream, non-authoritative surfaces

**Checked by:**
- `architecture_library/06_contura_architecture_library_roadmap_v1.md` — roadmap currently states the rule but repo-wide automatic enforcement is not yet obvious

**Evidence surfaces:**
- `architecture_library/06_contura_architecture_library_roadmap_v1.md` — anchor: extensibility rules / dependency relationships
- `architecture_library/03_contura_architecture_framework_v1.md` — anchor: extension packs & modernization playbooks

**Derivation lineage:**
- origin stage: intent
- no explicit upstream relation recorded

**Failure mode:** extension packs begin acting like authority-bearing frameworks or omit upstream dependencies  
**Typical blocker or packet surface:** framework governance drifts and package boundaries become ambiguous
## Gate Truthfulness And Fail Closed

This family currently contains 3 catalog rows.

### INV-GATES-VERIFY-NOT-INVENT-MEANING — Gates should verify compiled or enriched results rather than invent missing semantic meaning
CAF gates should verify invariants on the compiled or enriched result and should not compensate for missing semantic work by inventing new meaning or stack-specific lore in top-level gate branches.
- **Status:** partially_enforced
- **Severity / enforcement:** blocker / declared_only
- **Activation:** always_on — Applies to gates, validators, and postgates that evaluate semantic outputs.
- **Subject area:** gate_posture
- **Scope:** lifecycle=cross_phase; plane=framework; artifact=gates / validators / postgates under tools/caf
- **Source classes:** meta_pattern, gate, worker_contract
- **Canonical owner:** meta_pattern — `architecture_library/patterns/caf_meta_v1/caf_contract_execution_and_validator_ownership_meta_pattern_v1.md`
**Defined in:**
- `architecture_library/patterns/caf_meta_v1/caf_contract_execution_and_validator_ownership_meta_pattern_v1.md` — anchor: Intent / Anti-patterns — role: primary
- `architecture_library/patterns/caf_meta_v1/caf_deterministic_enrichment_ownership_meta_pattern_v1.md` — anchor: Where to place logic — role: secondary

**Enforced by:**
- `tools/caf/*.mjs` — generic gates are intended to execute declared contracts and validator kinds

**Checked by:**
- `architecture_library/patterns/caf_meta_v1/caf_contract_execution_and_validator_ownership_meta_pattern_v1.md` — rule is explicit, but the current catalog does not claim a global automated lint for every gate

**Evidence surfaces:**
- `tools/caf/*.mjs` — anchor: generic gates and validators
- `TBP manifests / role binding declarations` — anchor: validator_kind and owner delegation semantics

**Derivation lineage:**
- origin stage: verification
- invariant: `INV-ENRICHMENT-OWNERSHIP-SPLIT` — relation: refines

**Failure mode:** bespoke top-level gate branches recreate semantics or stack lore that belongs in contracts/TBPs/validators  
**Typical blocker or packet surface:** drift, overfitting, and dishonest fail-closed claims
### INV-FAIL-CLOSED-WITH-FEEDBACK-PACKET — Missing, malformed, contradictory, or ungroundable required outputs should fail closed with a feedback packet
CAF is fail closed: when required artifacts are missing, malformed, contradictory, or ungroundable, the framework should emit a feedback packet and stop rather than continue by guessing.
- **Status:** partially_enforced
- **Severity / enforcement:** release_critical / fail_closed
- **Activation:** always_on — Applies whenever a required CAF output is missing, malformed, contradictory, or ungroundable.
- **Subject area:** fail_closed_behavior
- **Scope:** lifecycle=cross_phase; plane=framework; artifact=gates, preflights, postgates, feedback packet surfaces
- **Source classes:** meta_pattern, gate, docs
- **Canonical owner:** meta_pattern — `architecture_library/patterns/caf_meta_v1/caf_fail_closed_permission_checkpoint_meta_pattern_v1.md`
**Defined in:**
- `architecture_library/patterns/caf_meta_v1/caf_fail_closed_permission_checkpoint_meta_pattern_v1.md` — anchor: Purpose / Core principle — role: primary
- `docs/architect/01_mental_model.md` — anchor: CAF is a fail-closed derivation system — role: secondary
- `docs/architect/08_gates_and_fail_closed.md` — anchor: Gates and fail-closed behavior — role: secondary

**Enforced by:**
- `tools/caf/planning_invariant_gate_v1.mjs` — thin orchestrator that writes a feedback packet on failure
- `tools/caf/lib_feedback_packets_v1.mjs` — shared packet header/lifecycle helpers

**Checked by:**
- `tools/caf/*gate*.mjs` — fail-closed gates/postgates are the primary checking posture

**Evidence surfaces:**
- `reference_architectures/<instance>/feedback_packets/*.md` — anchor: generated feedback packets
- `required canonical artifacts for the active lifecycle stage` — anchor: stage-specific evidence surfaces

**Derivation lineage:**
- origin stage: verification
- no explicit upstream relation recorded

**Failure mode:** required structure absent or incoherent, but workflow continues by inference or silence  
**Typical blocker or packet surface:** stage-specific feedback packet plus stop condition
### INV-PERMISSION-CHECKPOINT-ASK-ONCE-NO-GATE-JUMP — Permission checkpoints may ask once before expensive semantic stages but may not be used to skip producer execution
Instruction-heavy semantic stages may use a single permission checkpoint before execution, but agents must not use script-only runs, preflight-as-substitute-for-execution, or circular fail-closed logic to avoid the responsible producer stage.
- **Status:** declared
- **Severity / enforcement:** blocker / declared_only
- **Activation:** when_stage_active — Applies when a stage introduces an ask-once permission checkpoint before expensive semantic work.
- **Subject area:** fail_closed_behavior
- **Scope:** lifecycle=cross_phase; plane=framework; artifact=instruction-heavy semantic skills
- **Source classes:** meta_pattern, worker_contract, gate
- **Canonical owner:** meta_pattern — `architecture_library/patterns/caf_meta_v1/caf_fail_closed_permission_checkpoint_meta_pattern_v1.md`
**Defined in:**
- `architecture_library/patterns/caf_meta_v1/caf_fail_closed_permission_checkpoint_meta_pattern_v1.md` — anchor: Permission checkpoint semantics / Forbidden shortcuts — role: primary

**Enforced by:**
- `skills/caf-arch-implementation-scaffolding/SKILL.md` — intended sanctioned checkpoint surface
- `skills/caf-solution-architect/SKILL.md` — intended sanctioned checkpoint surface
- `skills/caf-application-architect/SKILL.md` — intended sanctioned checkpoint surface

**Checked by:**
- `skill execution guidance` — the current catalog does not identify a repo-wide automated validator for checkpoint misuse

**Evidence surfaces:**
- `skills/caf-arch-implementation-scaffolding/SKILL.md` — anchor: permission checkpoint / anti-circularity sections
- `skills/caf-solution-architect/SKILL.md` — anchor: permission checkpoint / anti-circularity sections
- `skills/caf-application-architect/SKILL.md` — anchor: permission checkpoint / anti-circularity sections

**Derivation lineage:**
- origin stage: verification
- invariant: `INV-FAIL-CLOSED-WITH-FEEDBACK-PACKET` — relation: refines

**Failure mode:** agent skips the producer stage, runs helpers/gates only, and calls the resulting missing outputs a legitimate fail-closed block  
**Typical blocker or packet surface:** semantic-stage drift; dishonest fail-closed behavior
## Pin Closure And Allowed Values

This family currently contains 1 catalog row.

### INV-SHAPE-PINS-CLOSED-AND-ALLOWED — Architecture shape pins must be complete and within the authoritative allowed-value catalog
Template instances and their pins must be fully declared, use allowed values, and avoid placeholders so downstream derivation never invents missing architecture choices.
- **Status:** partially_enforced
- **Severity / enforcement:** blocker / gate_checked
- **Activation:** always_on — Applies whenever authoritative architecture shape parameters are proposed or promoted.
- **Subject area:** pin_closure
- **Scope:** lifecycle=spec; plane=framework; artifact=spec/playbook/architecture_shape_parameters.yaml
- **Source classes:** pins, schema, docs, validator
- **Canonical owner:** architect_shape_surface_plus_validator — `tools/caf/prd_shape_validate_and_promote_v1.mjs`
**Defined in:**
- `architecture_library/09_contura_instance_derivation_process_6_to_8_v1b2.md` — anchor: Validation Gate V1 — Pin Closure (fail-closed) — role: primary
- `architecture_library/06_contura_architecture_shape_parameters_schema_v1.yaml` — anchor: template_instances / pins — role: secondary
- `architecture_library/07_contura_parameterized_architecture_templates_v1.md` — anchor: architect must treat template parameters as authoritative architectural input — role: secondary

**Enforced by:**
- `reference_architectures/<instance>/spec/playbook/architecture_shape_parameters.yaml` — architect declares template instances and pin values
- `tools/caf/prd_shape_validate_and_promote_v1.mjs` — validates proposed shape parameters before promotion

**Checked by:**
- `tools/caf/prd_shape_validate_and_promote_v1.mjs` — checks schema_version, pin completeness, and allowed values before authoritative promotion
- `tools/caf/arch_gate_v1.mjs` — requires authoritative shape file before architecture scaffolding can proceed

**Evidence surfaces:**
- `reference_architectures/<instance>/spec/playbook/architecture_shape_parameters.yaml` — anchor: template_instances
- `reference_architectures/<instance>/spec/playbook/architecture_shape_parameters.proposed.yaml` — anchor: proposed shape parameters before promotion

**Downstream consumers:**
- `tools/caf/build_retrieval_context_blob_v1.mjs` — retrieval context includes authoritative shape parameters
- `tools/caf/guardrails_v1.mjs` — guardrails derivation uses authoritative shape parameters as a pinned input

**Derivation lineage:**
- origin stage: pin
- no explicit upstream relation recorded

**Failure mode:** missing pins, placeholder values, or out-of-catalog values  
**Typical blocker or packet surface:** pin closure fail / shape promotion blocked before architecture scaffolding
## Planning Payload Integrity

This family currently contains 2 catalog rows.

### INV-PLANNING-PAYLOAD-ADOPTED-OPTIONS-PRESERVED — Planning payload adopted option tuples must preserve decision resolutions without reinterpretation
The emitted planning_pattern_payload_v1.adopted_option_choices block must preserve adopted option tuples from decision_resolutions_v1 without semantic reinterpretation.
- **Status:** enforced
- **Severity / enforcement:** blocker / fail_closed
- **Activation:** when_artifact_present — Applies when planning_pattern_payload_v1 is materialized for a design-to-plan handoff.
- **Subject area:** planning_payload_integrity
- **Scope:** lifecycle=design_to_plan; plane=cross_plane; artifact=CAF_MANAGED_BLOCK: planning_pattern_payload_v1
- **Source classes:** meta_pattern, playbook_block, gate
- **Canonical owner:** materializer — `tools/caf/materialize_planning_pattern_payload_v1.mjs`
**Defined in:**
- `architecture_library/patterns/caf_meta_v1/caf_promotions_and_obligations_meta_patterns_v1.md` — anchor: Critical invariants — role: primary

**Enforced by:**
- `tools/caf/materialize_planning_pattern_payload_v1.mjs` — copies adopted option tuples into planning payload blocks

**Checked by:**
- `tools/caf/design_postgate_planning_coherence_v1.mjs` — validates planning bridge coherence before planning
- `tools/caf/planning_invariant_gate_v1.mjs` — expects planning payload presence and coherence

**Evidence surfaces:**
- `reference_architectures/<instance>/spec/playbook/system_spec_v1.md` — anchor: ARCHITECT_EDIT_BLOCK: decision_resolutions_v1
- `reference_architectures/<instance>/design/playbook/control_plane_design_v1.md` — anchor: CAF_MANAGED_BLOCK: planning_pattern_payload_v1
- `reference_architectures/<instance>/design/playbook/application_design_v1.md` — anchor: CAF_MANAGED_BLOCK: planning_pattern_payload_v1

**Downstream consumers:**
- `tools/caf/compile_pattern_obligations_v1.mjs` — obligation compilation depends on preserved adopted option choices
- `skills/caf-application-architect/SKILL.md` — planner consumes adopted options in a distinct ownership lane

**Derivation lineage:**
- origin stage: planning
- invariant: `INV-DECISION-EXACTLY-ONE-ADOPTED-OPTION` — relation: realizes

**Failure mode:** adopted option tuples missing, altered, or semantically reinterpreted in the planning payload  
**Typical blocker or packet surface:** design_postgate_planning_coherence_v1.mjs / planning_invariant_gate_v1.mjs
### INV-PLANNING-PAYLOAD-PROMOTIONS-SHAPE — Planning payload promotions must preserve expected shape and avoid placeholder empty-object drift
The emitted planning_pattern_payload_v1.promotions block must preserve the expected canonical shape; it must not collapse to a placeholder empty object and should emit explicit list keys even when empty.
- **Status:** enforced
- **Severity / enforcement:** blocker / fail_closed
- **Activation:** when_artifact_present — Applies when planning_pattern_payload_v1 promotions are emitted.
- **Subject area:** planning_payload_integrity
- **Scope:** lifecycle=design_to_plan; plane=cross_plane; artifact=CAF_MANAGED_BLOCK: planning_pattern_payload_v1.promotions
- **Source classes:** meta_pattern, playbook_block, gate
- **Canonical owner:** materializer — `tools/caf/materialize_planning_pattern_payload_v1.mjs`
**Defined in:**
- `architecture_library/patterns/caf_meta_v1/caf_promotions_and_obligations_meta_patterns_v1.md` — anchor: Critical invariants — role: primary

**Enforced by:**
- `tools/caf/materialize_planning_pattern_payload_v1.mjs` — unions promotions from adopted patterns into canonical planning payload shape

**Checked by:**
- `tools/caf/design_postgate_planning_coherence_v1.mjs` — validates planning payload shape before plan
- `tools/caf/planning_invariant_gate_v1.mjs` — requires coherent planning artifacts before progression

**Evidence surfaces:**
- `reference_architectures/<instance>/design/playbook/control_plane_design_v1.md` — anchor: CAF_MANAGED_BLOCK: planning_pattern_payload_v1
- `reference_architectures/<instance>/design/playbook/application_design_v1.md` — anchor: CAF_MANAGED_BLOCK: planning_pattern_payload_v1

**Derivation lineage:**
- origin stage: planning
- no explicit upstream relation recorded

**Failure mode:** promotions rendered as {} or missing expected list keys / canonical shape  
**Typical blocker or packet surface:** design_postgate_planning_coherence_v1.mjs / planning_invariant_gate_v1.mjs
## Resolved View Authority

This family currently contains 1 catalog row.

### INV-LAYER8-RESOLVED-VIEW-AUTHORITATIVE — Resolved guardrails view is authoritative for rails and branching behavior
When branching behavior depends on pinned values and derived rails, CAF must treat profile_parameters_resolved.yaml as the single source of truth instead of recomputing or reinterpreting the same semantics ad hoc.
- **Status:** enforced
- **Severity / enforcement:** blocker / gate_checked
- **Activation:** when_artifact_present — Applies once resolved guardrails have been derived for an instance.
- **Subject area:** resolved_view_authority
- **Scope:** lifecycle=cross_phase; plane=framework; artifact=spec/guardrails/profile_parameters_resolved.yaml
- **Source classes:** profile_parameters, resolved_guardrails, meta_pattern, gate, docs
- **Canonical owner:** guardrails_deriver — `tools/caf/guardrails_v1.mjs`
**Defined in:**
- `architecture_library/patterns/caf_meta_v1/caf_meta_patterns_playbook_v1.md` — anchor: MP-13: resolved guardrails view is authoritative — role: primary
- `docs/user/13_profile_parameters_configuration.md` — anchor: The resolved files are the ones deterministic consumers should treat as authoritative — role: secondary

**Enforced by:**
- `tools/caf/guardrails_v1.mjs` — derives profile_parameters_resolved.yaml from pinned inputs
- `tools/caf/companion_init_v1.mjs` — copies resolved guardrails into the companion repo as canonical CAF input

**Checked by:**
- `tools/caf/planning_invariant_gate_v1.mjs` — fails closed if profile_parameters_resolved.yaml is missing or unreadable
- `tools/caf/build_technology_choice_realization_gate_v1.mjs` — checks runtime realization against canonical resolved rails
- `tools/caf/playbook_gate_v1.mjs` — reads resolved guardrails as the enforcement bar source

**Evidence surfaces:**
- `reference_architectures/<instance>/spec/guardrails/profile_parameters_resolved.yaml` — anchor: resolved rails and effective bindings
- `companion_repositories/<instance>/profile_v1/caf/profile_parameters_resolved.yaml` — anchor: companion copy of canonical resolved rails

**Downstream consumers:**
- `tools/caf/compile_pattern_obligations_v1.mjs` — reads resolved rails to compile obligations and gates
- `tools/caf/build_ux_retrieval_context_blob_v1.mjs` — embeds resolved UI/runtime posture in UX retrieval context

**Derivation lineage:**
- origin stage: resolution
- invariant: `INV-SHAPE-PINS-CLOSED-AND-ALLOWED` — relation: realizes

**Failure mode:** consumers recompute rails ad hoc or branch from stale pin interpretations  
**Typical blocker or packet surface:** planning/build/playbook gates fail or generated behavior drifts across surfaces
## Runtime Contract Owner Parity

This family currently contains 1 catalog row.

### INV-CP-RUNTIME-REPOSITORY-HEALTH-OWNER-PARITY — Runtime repository-health owner seams and concrete repositories must stay aligned
When the resolved CP runtime repository-health owner surface uses repository.health() as a readiness probe through the active persistence assembly surface, every concrete repository returned by that active assembly surface must implement a compatible health() method.
- **Status:** enforced
- **Severity / enforcement:** blocker / fail_closed
- **Activation:** when_capability_present — Applies when CP runtime repository health capability surfaces are present.
- **Subject area:** runtime_contracts
- **Scope:** lifecycle=build; plane=control_plane; artifact=cp runtime repository-health owner seam plus active persistence assembly surface
- **Source classes:** contract, runtime_evidence, gate
- **Canonical owner:** contract — `tools/caf/contracts/cp_runtime_repository_health_contract_v1.md`
**Defined in:**
- `tools/caf/contracts/cp_runtime_repository_health_contract_v1.md` — anchor: Contract / Postgate expectation — role: primary
- `architecture_library/patterns/caf_meta_v1/caf_contract_execution_and_validator_ownership_meta_pattern_v1.md` — anchor: Proxy/owner delegated proof — role: secondary

**Enforced by:**
- `adopted runtime TBP role bindings` — binds cp_runtime_repository_health_owner to the concrete owner seam
- `TG-00-CP-runtime-scaffold / TG-90-runtime-wiring producer seams` — concrete runtime files must realize health parity

**Checked by:**
- `tools/caf/build_technology_choice_realization_gate_v1.mjs` — validator-driven build verification for technology-choice realization

**Evidence surfaces:**
- `resolved owner seam file from cp_runtime_repository_health_owner binding` — anchor: repository.health() call site
- `active CP persistence assembly surface / concrete repositories` — anchor: concrete repository implementations

**Derivation lineage:**
- origin stage: runtime_evidence
- no explicit upstream relation recorded

**Failure mode:** owner seam calls repository.health() but concrete repositories do not implement a compatible method  
**Typical blocker or packet surface:** build_technology_choice_realization_gate_v1.mjs and related review surfaces
## Shared Parsing And Normalization

This family currently contains 1 catalog row.

### INV-CANDIDATE-PARSING-SHARED-HELPER-REUSE — Candidate-block parsing must reuse the shared parser to avoid drift
Any deterministic helper that parses decision-pattern candidates must reuse the shared candidate parsing helper rather than introducing a new local regex or divergent normalization path.
- **Status:** partially_enforced
- **Severity / enforcement:** blocker / deterministic_helper
- **Activation:** always_on — Applies whenever deterministic helpers parse caf_decision_pattern_candidates_v1.
- **Subject area:** parsing_and_normalization
- **Scope:** lifecycle=retrieval; plane=framework; artifact=caf_decision_pattern_candidates_v1 parsing
- **Source classes:** contract, validator
- **Canonical owner:** shared_library — `tools/caf/lib_caf_decision_candidates_v1.mjs`
**Defined in:**
- `tools/caf/contracts/playbook_blocks_ownership_and_invariants_v1.md` — anchor: Shared parsing and normalization (no drift) — role: primary
- `tools/caf/contracts/decision_candidates_block_parsing_contract_v1.md` — anchor: contract — role: secondary

**Enforced by:**
- `tools/caf/lib_caf_decision_candidates_v1.mjs` — canonical parser and normalization path

**Checked by:**
- `tools/caf/contracts/playbook_blocks_ownership_and_invariants_v1.md` — rule is explicit, but repo-wide automatic misuse detection is not obvious from the current catalog

**Evidence surfaces:**
- `tools/caf/lib_caf_decision_candidates_v1.mjs` — anchor: exported parser functions
- `tools/caf/*` — anchor: parser imports/usages

**Derivation lineage:**
- origin stage: verification
- no explicit upstream relation recorded

**Failure mode:** helper-specific regex drift or inconsistent candidate normalization across tools  
**Typical blocker or packet surface:** inconsistent candidate interpretation across gate, mindmap, or reports
## Task Parameterization

This family currently contains 1 catalog row.

### INV-TASKS-CONSUME-RESOLVED-RAILS-AND-TBPS — Architectural tasks must consume resolved rails and TBP resolution instead of hardcoded technology branches
Architectural tasks should realize different stacks by consuming profile_parameters_resolved.yaml and, when relevant, tbp_resolution_v1.yaml, rather than embedding ad hoc if-postgres or if-docker logic.
- **Status:** partially_enforced
- **Severity / enforcement:** blocker / declared_only
- **Activation:** when_stage_active — Applies when planning and task emission depend on technology rails or TBP consequences.
- **Subject area:** task_parameterization
- **Scope:** lifecycle=planning; plane=cross_plane; artifact=task_graph_v1.yaml plus worker/task input contracts
- **Source classes:** resolved_guardrails, tbp, meta_pattern, worker_contract
- **Canonical owner:** meta_pattern — `architecture_library/patterns/caf_meta_v1/caf_meta_patterns_playbook_v1.md`
**Defined in:**
- `architecture_library/patterns/caf_meta_v1/caf_meta_patterns_playbook_v1.md` — anchor: MP-18: Architectural tasks are parameterized by rails and TBPs, not hardcoded to technologies — role: primary
- `docs/user/13_profile_parameters_configuration.md` — anchor: That split gives TBP resolution, planning, retrieval, and UI workers one place to read UI technology/runtime choices — role: secondary

**Enforced by:**
- `tools/caf/planning_technology_choice_realization_gate_v1.mjs` — expects tasks to include resolved rails input where required

**Checked by:**
- `tools/caf/planning_technology_choice_realization_gate_v1.mjs` — checks that technology-sensitive tasks declare profile_parameters_resolved.yaml as input

**Evidence surfaces:**
- `reference_architectures/<instance>/plan/task_graph_v1.yaml` — anchor: task inputs include profile_parameters_resolved.yaml and TBP-derived surfaces when required
- `reference_architectures/<instance>/spec/guardrails/profile_parameters_resolved.yaml` — anchor: resolved rails consumed by planning tasks

**Derivation lineage:**
- origin stage: planning
- invariant: `INV-LAYER8-RESOLVED-VIEW-AUTHORITATIVE` — relation: realizes
- invariant: `INV-ABP-PBP-RESOLUTION-CANONICAL-STYLE-TO-PLANE` — relation: realizes

**Failure mode:** task logic hardcodes technologies instead of following resolved rails/TBP inputs  
**Typical blocker or packet surface:** planning tasks become brittle and drift when stacks change
## Tbp Indirection And Portability

This family currently contains 1 catalog row.

### INV-WORKERS-NO-TBP-ID-LEAKAGE — Worker skills must not hardcode TBP IDs
Workers must bind to TBP consequences via capabilities and role_binding_key rather than hardcoding TBP IDs, so adding or changing TBPs does not require worker rewrites.
- **Status:** enforced
- **Severity / enforcement:** blocker / gate_checked
- **Activation:** when_capability_present — Applies whenever workers consume TBP-driven placement or layout expectations.
- **Subject area:** worker_portability
- **Scope:** lifecycle=build; plane=framework; artifact=skills/worker-*/SKILL.md and TBP role-binding resolution
- **Source classes:** tbp, meta_pattern, worker_contract, validator
- **Canonical owner:** meta_pattern — `architecture_library/patterns/caf_meta_v1/caf_no_tbp_id_leakage_in_worker_skills_meta_pattern_v1.md`
**Defined in:**
- `architecture_library/patterns/caf_meta_v1/caf_no_tbp_id_leakage_in_worker_skills_meta_pattern_v1.md` — anchor: R1. Workers MUST NOT hardcode TBP IDs — role: primary
- `architecture_library/patterns/caf_meta_v1/caf_prevent_combinatorial_sprawl_meta_patterns_v1.md` — anchor: Technology-specific details MUST be carried by TBPs — role: secondary

**Enforced by:**
- `tools/caf/resolve_tbp_role_bindings_v1.mjs` — workers should resolve placement via capability and role_binding_key
- `skills/worker-*/SKILL.md` — workers consume resolved role-binding expectations rather than TBP IDs

**Checked by:**
- `tools/caf-meta/audit_no_tbp_leakage_in_worker_skills_v1.mjs` — audits worker skills for TBP ID leakage

**Evidence surfaces:**
- `skills/worker-*/SKILL.md` — anchor: worker instructions avoid TBP-* identifiers
- `reference_architectures/<instance>/caf/tbp_resolution_v1.yaml` — anchor: resolved role-binding expectations

**Derivation lineage:**
- origin stage: execution
- invariant: `INV-TASKS-CONSUME-RESOLVED-RAILS-AND-TBPS` — relation: refines

**Failure mode:** workers become stale or technology-hardcoded when TBP providers change  
**Typical blocker or packet surface:** TBP leakage audit fails or workers drift across provider changes
## Ux Lane Orchestration

This family currently contains 1 catalog row.

### INV-UX-LANE-PRE-STAGE-SPLIT — UX lane preflight and retrieval-preflight must remain split at the declared deterministic boundary
The UX lane must keep ux_preflight_v1 and ux_retrieval_preflight_v1 as distinct deterministic stages: the first owns canonical UX artifact creation and deterministic seed refresh, while the second owns packet application, architect-block hydration, retrieval-blob assembly, and shortlist preparation.
- **Status:** partially_enforced
- **Severity / enforcement:** blocker / gate_checked
- **Activation:** when_stage_active — Applies when /caf ux runs its declared deterministic pre-stage boundary.
- **Subject area:** ux_lane_governance
- **Scope:** lifecycle=design; plane=ux_lane; artifact=ux_preflight_v1.mjs / ux_retrieval_preflight_v1.mjs boundary
- **Source classes:** contract, gate, worker_contract
- **Canonical owner:** contract — `tools/caf/contracts/ux_lane_gate_posture_v1.md`
**Defined in:**
- `tools/caf/contracts/ux_lane_gate_posture_v1.md` — anchor: Pre-stage split — role: primary

**Enforced by:**
- `tools/caf/contracts/ux_lane_gate_posture_v1.md` — defines exact helper ownership per stage

**Checked by:**
- `tools/caf/contracts/ux_lane_gate_posture_v1.md` — explicit deterministic posture, though the current catalog does not claim a dedicated central invariant gate for stage mixing

**Evidence surfaces:**
- `tools/caf/ux_preflight_v1.mjs` — anchor: deterministic helper chain
- `tools/caf/ux_retrieval_preflight_v1.mjs` — anchor: deterministic retrieval-prep chain

**Derivation lineage:**
- origin stage: execution
- no explicit upstream relation recorded

**Failure mode:** stage responsibilities blur and packet application/retrieval prep are mixed into the wrong preflight stage  
**Typical blocker or packet surface:** UX lane orchestration drift

## Find out more

[Drift resistance and audits](../09_drift_resistance_and_audits.md) — See how CAF uses audits, gates, and release-facing proof boundaries to resist architectural drift.

## You might also be interested in

- [Patterns → obligations → tasks](../07_patterns_to_obligations_to_tasks.md) — See how accepted architecture choices become downstream work.
- [Gates and fail-closed](../08_gates_and_fail_closed.md) — Understand the blocker posture that checks many of these invariants.
- [Profile parameters configuration](../../user/13_profile_parameters_configuration.md) — See the machine-consumed binding surface behind many activated invariants.
- [Reference map](../12_reference_map.md) — Jump into the broader architect documentation set.
