# Phase 8 Agent Crew Model (v1)

Normative note (v1): Phase 8 is a deterministic, fail-closed build loop. Constraints come from **Task Graph + Layer 8 rails + resolved ABP/PBP style bindings + platform pins (technology atoms) + TBPs**. Agents MUST NOT invent requirements, tasks, technologies, or architecture outside those constraints.

## Purpose

Define the minimal Phase 8 “crew” model: who does what, what each role is allowed to decide, and how the end-to-end loop stays deterministic and fail-closed.

This model is intended to:
- preserve architect authority (pins + explicit decisions in Layer 6 + derived rails in Layer 8)
- separate **system design** (solution architecture) from **plan compilation** (task graph) and **implementation** (workers/TBPs)
- reduce hidden decisions by requiring explicit anchors for requirements
- fail closed on missing capabilities, missing evidence, or ambiguous inputs

### Terminology note (TBPs)

**TBPs (Technology Binding Patterns)** are implementation-facing patterns tied to the pinned platform pins (technology atoms).
They may be **vendor/product specific** (e.g., AWS-managed services) because `platform pins (infra_target/packaging/runtime_language/database_engine)` is an explicit architect pin.

Rules:
- **Core/external patterns MUST NOT imply vendor selection.**
- Planning MAY require **TBP roles** (capability-shaped requirements). The pinned platform pins deterministically select eligible TBPs for those roles.
- Worker skills implement using the selected TBPs or fail-closed with a feedback packet.

## Roles (human + agent)

### Human: Systems Architect (authoritative owner)

The Systems Architect owns:
- architecture intent (what the system is and must do)
- pinned lifecycle knobs:
  - `lifecycle.evolution_stage`
  - `lifecycle.generation_phase`
- approved platform pin selection (technology atoms):
  - `platform pins (infra_target/packaging/runtime_language/database_engine)`
- acceptance of feedback packets and approval of catalog/profile changes

The Systems Architect MUST:
- provide or approve any new requirements/constraints (no “implicit” requirements)
- resolve feedback packets by either changing the pins/inputs or approving new catalog/profile entries

### Agent: System Architect (pins → specifications)

`caf-system-architect` is the pins → specs bridge during `architecture_scaffolding`.

Responsibilities:
- create/update `reference_architectures/<name>/spec/playbook/system_spec_v1.md` (merge-safe)
- create/update `reference_architectures/<name>/spec/playbook/application_spec_v1.md` (merge-safe)
- write CAF-managed blocks that capture pinned inputs + pin-derived constraints
- propose CAF decision patterns as **advisory candidates**, with traceable links to the supporting sources
- maintain architect-edit blocks for:
  - system-level requirements and open questions in `system_spec_v1.md`
  - application-plane functional requirements and open questions in `application_spec_v1.md`

Hard limits:
- MUST NOT select vendors/products
- MUST NOT invent domain requirements or business semantics
- MUST seed only the removable sample domain (Widget) on first creation; all real domain content is authored by the human Systems Architect
- MUST record missing semantics as open questions (do not guess)

### Agent: Solution Architect (specification → system design)

In widely used industry terms, “solution architecture” corresponds to **system design**: major components, planes/boundaries, and cross-cutting concerns.

**CAF v1 uses a single-brain skill** to avoid split-brain between control-plane and application-plane design:

- `caf-solution-architect` → writes/updates:
  - `design/playbook/contract_declarations_v1.yaml`
  - `design/playbook/control_plane_design_v1.md`
  - `design/playbook/application_design_v1.md`

This skill MAY delegate drafting to helper skills (e.g., platform/app designers), but it remains the single authority that:
- defines the integration contract first
- resolves contradictions
- finalizes coherent designs

Hard limits:
- MUST NOT introduce technology selection beyond the pinned platform pins (technology atoms)
- MUST NOT invent requirements without anchors (decision checklist / core pattern / TBP requirement / rail)

### Agent: Application Architect (system design → plan)

`caf-application-architect` compiles the design into an executable plan:

- `reference_architectures/<name>/design/playbook/task_graph_v1.yaml` (canonical path; no version suffix)

Responsibilities:
- compile tasks from the **task archetype catalog** + resolved ABP/PBP style bindings + TBP role bindings + explicit decision anchors
- attach anchors and acceptance checks to each task
- fail closed if:
  - no archetype fits (emit a Make Tasks Request feedback packet)
  - required anchors are missing (requirement legitimacy guardrail)
  - required TBP role bindings/capabilities are missing

Hard limits:
- MUST NOT invent tasks “because it seems useful” (no anchor → not allowed)
- MUST NOT choose vendor technologies; it may only require TBP roles, not specific products

### Agent: Plan QA (task graph gate)

`caf-plan-qa` is a separate skill with no UX shim.

Responsibilities:
- validate `task_graph_v1.yaml` for:
  - schema correctness
  - anchor legitimacy (no unanchored requirements)
  - Layer 8 rails compliance (write paths, artifact classes, forbidden actions)
  - no technology invention outside the pinned profile
- emit a feedback packet only on failure

### Agent: Manager (task dispatcher + rails enforcement)

`caf-build-candidate` dispatches tasks to workers via capability mapping.

Responsibilities:
- verify required plan artifacts exist and pass Plan QA
- resolve each task’s required capabilities to worker skills
- enforce Layer 8 rails:
  - write boundaries (allowed paths)
  - allowed artifact classes
  - forbidden actions
- aggregate results and emit feedback packets on any failure

Fail-closed requirement:
- if capability coverage is incomplete, emit a **Make Skill Request** feedback packet

Hard limits:
- MUST NOT invent architecture
- MUST NOT invent tasks
- MUST NOT select vendors/providers
- MUST NOT bypass refusal conditions

### Agents: Workers (task executors)

Workers:
- implement tasks exactly as declared by the Task Graph
- must not invent architecture or add new scope
- must output only what the Task Graph declares (paths + artifact classes)
- must include evidence hooks and satisfy acceptance checks

Workers are capability-based: each worker advertises one or more capabilities and only accepts tasks requiring those capabilities.

### Agent: Code QA (optional, embedded)

Code QA is permitted as:
- checks embedded in producing workflows, and/or
- a scoring/evaluation worker that returns violations

If present, Code QA MUST be fail-closed and must not auto-fix by inventing requirements.


## Invariants (normative)

**Invariant: Contract-first.** Phase 8 operates contract-first: boundary interactions must be explicit, verifiable, and justified. Material boundaries MUST have contracts expressed in an allowed form and declared in `contract_declarations_v1.yaml`. Missing semantics MUST be recorded as open questions and treated as fail-closed.

## Canonical contract artifacts

The following artifacts define the v1 loop contracts:

### Pinned inputs and derived rails
- `reference_architectures/<name>/spec/playbook/architecture_shape_parameters.yaml`
- `reference_architectures/<name>/spec/guardrails/profile_parameters.yaml`
- `reference_architectures/<name>/spec/guardrails/profile_parameters_resolved.yaml` (Layer 8 derived rails; generated)
- `reference_architectures/<name>/spec/guardrails/abp_pbp_resolution_v1.yaml` (style→plane binding projection; generated)

### Specifications
- `reference_architectures/<name>/spec/playbook/system_spec_v1.md` (pins → system constraints; merge-safe)
- `reference_architectures/<name>/spec/playbook/application_spec_v1.md` (application-plane functional spec; merge-safe)
- `reference_architectures/<name>/spec/playbook/application_domain_model_v1.md` (application-plane detailed domain source; architect-edit)
- `reference_architectures/<name>/spec/playbook/system_domain_model_v1.md` (system/control-plane detailed domain source; architect-edit)

### Designs
- `reference_architectures/<name>/design/playbook/control_plane_design_v1.md`
- `reference_architectures/<name>/design/playbook/application_design_v1.md`
- `reference_architectures/<name>/design/playbook/application_domain_model_v1.yaml` (derived)
- `reference_architectures/<name>/design/playbook/system_domain_model_v1.yaml` (derived)

### Plan
- `reference_architectures/<name>/design/playbook/task_graph_v1.yaml`

### Feedback packets (fail-closed only)
- `reference_architectures/<name>/feedback_packets/` (or companion repo feedback packet location, if applicable)

## End-to-end run sequence (fail-closed)

### A) architecture_scaffolding (pins → specs)

1) Systems Architect pins:
   - `lifecycle.evolution_stage`
   - `lifecycle.generation_phase = architecture_scaffolding`
   - `platform pins (infra_target/packaging/runtime_language/database_engine)`

2) `caf-arch` derives the Layer 8 resolved view (rails), projects the selected ABP across the PBP catalog, and validates pins (fail-closed).
   Detailed plane domain models are not yet authoritative at this stage; `application_spec_v1.md` and `system_spec_v1.md` remain intentionally lean.

3) `caf-system-architect` creates/updates (merge-safe):
   - `playbook/system_spec_v1.md`
   - `playbook/application_spec_v1.md`
   (CAF-managed blocks are rerun-safe; architect-edit blocks preserve human content.)

4) Human Systems Architect edits/accepts:
   - system requirements and open questions in `system_spec_v1.md`
   - application functional requirements and open questions in `application_spec_v1.md`

### B) implementation_scaffolding (specs → design → plan)

5) Systems Architect sets:
   - `lifecycle.generation_phase = implementation_scaffolding`

6) `caf-solution-architect` (Solution Architect role):
   - writes/updates `contract_declarations_v1.yaml` (declares any material boundary contracts; form + justification)
   - writes/updates `control_plane_design_v1.md`
   - writes/updates `application_design_v1.md`
   - scaffolds/updates `application_domain_model_v1.md` and `system_domain_model_v1.md` when detailed domain modeling is needed for planning
   - derives `application_domain_model_v1.yaml` and `system_domain_model_v1.yaml` for planner consumption
   (including Decision Checklist blocks in both design docs)
   (CAF-managed blocks are rerun-safe; required ARCHITECT_EDIT_BLOCK sections preserve human accept/reject and open question answers.)

7) Human Systems Architect resolves (edit in-place):
   - `control_plane_design_v1.md` ARCHITECT_EDIT_BLOCK(s) (decisions + open questions + plane integration contract choices)
   - `application_design_v1.md` ARCHITECT_EDIT_BLOCK(s) (decisions + open questions)
   (Flip `status: adopt` in each option set; preserve everything else.)

8) `caf-application-architect` compiles using the resolved ABP/PBP style bindings, explicit plane/runtime/contract selections, derived active-plane evidence, plane-separated domain model views, and TBP role bindings:
   - `task_graph_v1.yaml`
   If compilation is impossible, emit a feedback packet (Make Tasks Request).

9) `caf-plan-qa` gates the Task Graph (feedback packet on failure only).

### C) candidate build loop (plan → candidate outputs)

10) `caf-build-candidate` (Manager):
    - enforces rails
    - resolves capabilities to workers
    - dispatches tasks or fail-closed with Make Skill Request feedback packet

11) Workers implement tasks using eligible TBPs for the pinned platform pins (technology atoms):
    - write only declared outputs
    - include evidence hooks where required
    - satisfy acceptance checks

12) Manager aggregates results and emits feedback packets on any failure.

## Version notes

v1 — Adds explicit System Architect vs Solution Architect vs Application Architect responsibilities, introduces `system_spec_v1.md` and `caf-system-architect` for pins→spec, and clarifies TBPs as vendor/product specific under the pinned platform pins (technology atoms).
