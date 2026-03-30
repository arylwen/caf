# Lifecycle artifact reference

This page explains the main documents and artifacts shown in [CAF lifecycle artifact handoff](diagrams/caf_lifecycle_artifact_handoff_v1.md).

Use it when you need to answer questions like:

- What does each lifecycle document actually do?
- Which files are source surfaces versus derived handoff artifacts?
- Which command produces a document, and which later command consumes it?

## Bootstrap and PRD-promotion surfaces

### `product/PRD.md`

- Human-owned product intent source document.
- Seeded by `/caf saas`, refined by PMs/architects, consumed by `/caf prd`.
- Main place where product wording should influence downstream derivation.

### `product/PLATFORM_PRD.md`

- Human-owned platform and operational intent source document.
- Seeded by `/caf saas`, consumed by `/caf prd` alongside `PRD.md`.
- Helps `/caf prd` infer architecture shape and platform posture.

### `spec/playbook/architecture_shape_parameters.yaml`

- Authoritative architecture-shape binding surface.
- Seeded as bootstrap by `/caf saas`; normally promoted by `/caf prd`; may be curated directly in advanced architect flows.
- Consumed by the first `/caf arch`.

## First `/caf arch` outputs: spec bundle

### `spec/playbook/system_spec_v1.md`

- System-level architecture specification produced by the first `/caf arch`.
- Holds cross-cutting system structure, decision candidates, and architect adoption content.
- Consumed by `/caf next apply`, the second `/caf arch`, and later architectural review.

### `spec/playbook/application_spec_v1.md`

- Application-plane architecture specification produced by the first `/caf arch`.
- Captures application-side structure, workflows, and decision content.
- Consumed by `/caf next apply` and the second `/caf arch`.

### `spec/playbook/application_product_surface_v1.md`

- Externalized product-surface source document seeded by `/caf saas` and automatically projected under `/caf arch` when still default.
- Human-readable product-facing source for UI/UX wording, surface expectations, and later UX derivation.
- Consumed by the second `/caf arch`, `/caf plan` as narrative grounding, `/caf ux`, and UI-facing workers.

### `spec/playbook/application_domain_model_v1.md`

- Application-plane domain-model source document from the spec phase.
- Human-readable domain source for later design normalization.
- Consumed by the second `/caf arch`.

### `spec/playbook/system_domain_model_v1.md`

- System/control-plane domain-model source document from the spec phase.
- Captures system-side entities, boundaries, and relationships in source form.
- Consumed by the second `/caf arch`.

### Spec retrieval/debug artifacts

- CAF-managed sidecars that show how the first architecture pass retrieved or justified patterns and decisions.
- Mostly explanatory/debug surfaces rather than direct planning inputs.
- Useful when auditing why a spec bundle looks the way it does.

## Checkpoint seam

### `spec/guardrails/derivation_cascade_contract_v1.md`

- Checkpoint contract written around `/caf next <instance> apply`.
- Makes the adopted architecture state explicit for downstream phases.
- Consumed as guardrail context by later derivation and planning steps.

### `.caf-state/checkpoints/architecture_scaffolding_*`

- Mechanical lifecycle receipts showing what was applied and when.
- Provide auditable state, not new semantic authority.
- Useful for debugging lifecycle progression.

## Second `/caf arch` outputs: design bundle

### `design/playbook/control_plane_design_v1.md`

- Control-plane/system-side design document emitted by the second `/caf arch`.
- Holds control-plane posture, CP↔AP interaction shaping, auth/session implications, integration/resilience decisions, and other system-design judgments.
- Consumed by `/caf plan` and by workers that need control-plane grounding.

### `design/playbook/application_design_v1.md`

- Application-side design document emitted by the second `/caf arch`.
- Holds application workflows, interaction structure, route/page-level behavioral implications, and other solution-architecture details close to delivery.
- Consumed by `/caf plan` and application-facing workers.

### `design/playbook/contract_declarations_v1.yaml`

- Mechanical declaration surface for contracts/interfaces identified during the second `/caf arch`.
- Bridges architectural design into planning and worker execution.
- Consumed by `/caf plan` and contract-aware workers.

### `design/playbook/application_domain_model_v1.yaml`

- Normalized YAML view of the application domain model.
- Derived from spec/design inputs so planning and workers can consume a machine-friendly domain representation.
- Consumed by `/caf plan` and downstream delivery steps.

### `design/playbook/system_domain_model_v1.yaml`

- Normalized YAML view of the system/control-plane domain model.
- Serves the same role as the application YAML view for system-side planning and delivery.
- Consumed by `/caf plan` and downstream delivery steps.

### `design/playbook/design_summary_v1.md`

- Narrative summary of the design bundle.
- Helps maintainers and architects understand the resulting design posture without re-reading every design file.
- Also acts as an explanatory bridge into planning.

### CAF-managed planning payload blocks

- Structured sections embedded or emitted to make the design bundle easier for `/caf plan` to consume.
- Framework-owned bridge surfaces, not new human-authored semantic sources.
- Consumed by planning helpers, enrichers, or gates as appropriate.

### Design retrieval/debug artifacts

- CAF-managed sidecars explaining second-pass pattern retrieval and derivation.
- Primarily for auditability and debugging.
- Helpful when the design bundle needs review or correction.

## What `/caf plan` should explicitly consume from the later architecture-step handoff

The second `/caf arch` → `/caf plan` seam should be understood as an explicit design-to-planning handoff, not as a generic “later docs exist” condition.

### Current planning handoff view

| Surface | Planning role | Why | Future gate posture |
| --- | --- | --- | --- |
| `control_plane_design_v1.md` | Core for planning | Carries control-plane/system-design judgments that affect obligations, boundaries, auth/session posture, and CP↔AP shaping. | Missing after second `/caf arch` should fail closed. |
| `application_design_v1.md` | Core for planning | Carries application workflow, route/page-level interaction posture, and delivery-relevant solution-architecture judgments. | Missing after second `/caf arch` should fail closed. |
| `contract_declarations_v1.yaml` | Core for planning | Gives planning the mechanical contract/interface declaration surface it can propagate into obligations, task structure, and later binding views. | Missing after second `/caf arch` should fail closed. |
| `application_domain_model_v1.yaml` | Core for planning | Gives planning a normalized application-side domain representation. | Missing after second `/caf arch` should fail closed. |
| `system_domain_model_v1.yaml` | Core for planning | Gives planning a normalized system/control-plane domain representation. | Missing after second `/caf arch` should fail closed. |
| CAF-managed planning payload blocks | Core when emitted / expected by the design handoff | Framework-owned bridge surfaces that expose planning-relevant semantics without inventing a second human-authored source. | If the design handoff indicates these should exist, absence should fail closed. |
| `design_summary_v1.md` | Supporting | Helpful narrative bridge for maintainers and architects, but not the primary semantic source for planning. | Missing should be advisory unless a future contract promotes it. |
| design retrieval/debug artifacts | Supporting | Useful for auditability and debugging, not the primary semantic handoff. | Missing should be advisory. |

### Planning-consumed design judgments

- `control_plane_design_v1.md`
  - supplies control-plane posture, CP↔AP interaction shaping, auth/session implications, boundary decisions, and other system-design signals that affect obligations or task structure.
- `application_design_v1.md`
  - supplies application workflow shape, route/page-level behavioral implications, interaction posture, and delivery-relevant solution-architecture judgments.

### Planning-consumed machine-friendly design surfaces

- `contract_declarations_v1.yaml`
  - gives planning a mechanical contract/interface declaration surface to carry forward into obligations, task structure, and later binding views.
- `application_domain_model_v1.yaml`
  - gives planning a normalized application-side domain representation.
- `system_domain_model_v1.yaml`
  - gives planning a normalized system/control-plane domain representation.

### Planning bridge surfaces

- CAF-managed planning payload blocks
  - are framework-owned bridge surfaces that make specific design semantics easier for `/caf plan` to consume without inventing a second human-authored semantic source.
- `design_summary_v1.md`
  - acts as a narrative bridge when planning or maintainers need a concise explanation of the resulting design posture, but it should not become the only semantic handoff.

### Not primary planning inputs

- design retrieval/debug artifacts remain useful for auditability and debugging, but they are not the primary semantic handoff that `/caf plan` should depend on.

### Where the current `/caf ux` lane fits

CAF now has a bounded `/caf ux` lane that sits here as a downstream consumer of the later design handoff.

That means:

- it does not replace the second `/caf arch` design pass;
- it does not become an alternate source of truth for system/interface decisions already owned by the later design handoff;
- it consumes the same design handoff and emits an additional bounded UX artifact bundle for planning/build to consume explicitly.

### UX lane artifacts

#### `product/UX_VISION.md`

- Human-owned design-brief source seeded by `/caf saas`.
- May capture brand/logo/color/default visual cues and other design-brief inputs.
- `/caf prd` may consume only the architecture-shape-relevant subset of this source.

#### `design/playbook/ux_design_v1.md`

- Canonical bounded UX semantic artifact produced by `/caf ux`.
- Carries UX meaning (journeys, surfaces, trust/clarity posture, interface pressures) for later UX planning/build.

#### `design/playbook/ux_visual_system_v1.md`

- Derived visual-system/design-system plan produced downstream of `ux_design_v1.md`.
- Keeps semantic visual-system roles above the current React/Vite realization.
- Consumed by `/caf ux plan` and `/caf ux build`.

#### `design/playbook/retrieval_context_blob_ux_design_v1.md`

- Bounded UX retrieval framing surface for pattern selection and later UX planning context.
- Produced by `/caf ux` and consumed by `/caf ux plan`.

#### `design/playbook/ux_task_graph_v1.yaml`

- Planner-owned semantic task graph produced by `/caf ux plan`.
- Consumed by deterministic UX-plan projections and later `/caf ux build` dispatch.

## Planning outputs

### `design/playbook/pattern_obligations_v1.yaml`

- Compiler-owned obligation expansion from adopted patterns and design inputs.
- Produced during `/caf plan`.
- Consumed by enrichers, gates, and later planning views.

### `design/playbook/task_graph_v1.yaml`

- Planner-owned task structure produced by `/caf plan`.
- Captures semantic task decomposition, dependencies, and capabilities.
- Consumed by `/caf build`.

### `design/playbook/interface_binding_contracts_v1.yaml`

- Derived interface-binding view used to connect plan outputs to concrete implementation expectations.
- Produced after planning from framework-owned rules.
- Consumed by build and review surfaces.

### `design/playbook/task_plan_v1.md`

- Human-readable planning view derived from planning outputs.
- Explains the plan in narrative form.
- Useful for review and debugging.

### `design/playbook/task_backlog_v1.md`

- Derived backlog view over the planned task structure.
- Useful for execution review and release-readiness tracking.
- Consumed mainly by humans rather than as the primary machine-readable plan surface.

## Build outputs

### Companion repo candidate artifacts

- Candidate implementation outputs written under `companion_repositories/<instance>/`.
- Produced by `/caf build` from the planned task graph and supporting inputs.
- Require human review; they are not the same thing as source-of-truth architecture artifacts.

### Task reports, reviews, wave state, runnable-candidate proofs

- Execution-time evidence showing what build attempted, what reviews said, how waves advanced, and whether the candidate is runnable.
- Produced during `/caf build` and post-build verification.
- Useful for debugging and release readiness.

## After the first build: continuous re-derivation operating loop

Once CAF has produced a companion repo candidate, the lifecycle does not collapse into "the codebase is now the only truth."

The durable source/authority order remains:

- product intent sources;
- promoted or curated architecture-shape inputs;
- adopted spec/design playbooks and checkpointed lifecycle state;
- planning and build outputs as downstream evidence and candidates.

For lifecycle evolution, the maintainer-facing rule is:

**re-derive always; rebuild selectively.**

That yields three practical post-build modes:

- **regeneration** when a fresh bounded derivative is the right answer;
- **non-destructive evolution** when the existing repo remains aligned enough that the structure contract should be preserved;
- **modernization / rebase** when the running product matters but routine generation is no longer a safe fit.

Current command-shape implication:

- do not invent the next architecture state from code alone;
- rerun from the highest affected semantic stage (`/caf prd`, first `/caf arch`, `/caf next apply`, second `/caf arch`, `/caf plan`, `/caf build`);
- keep standalone-repo evolution non-destructive by default unless an explicit architect decision escalates the work into regeneration or modernization posture.

For the fuller lifecycle note and terminology framing, see:

- `docs/dev/roadmaps/architecture_note_0_4_0_continuous_re_derivation_and_instance_evolution_v1.md`
- `docs/dev/roadmaps/terminology_note_continuous_re_derivation_v1.md`

## You might also be interested in

- [CAF lifecycle artifact handoff](diagrams/caf_lifecycle_artifact_handoff_v1.md)
- [CAF lifecycle state machine](diagrams/caf_lifecycle_state_machine_v1.md)
- [Planning workflows and post-chain](09_planning_workflows_and_post_chain.md)
