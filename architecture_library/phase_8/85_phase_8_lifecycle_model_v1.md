# Phase 8 Lifecycle Model — evolution_stage + generation_phase (v1)

## Purpose

Define the **minimal, unambiguous lifecycle vocabulary** used by Phase 8 generation, so:

- architects can choose values quickly,
- skills can enforce boundaries deterministically,
- validators can detect drift (fail-closed) without inventing new rules.

This document is **normative** for Phase 8.

---

## Two axes, two jobs

Phase 8 uses **two lifecycle axes**:

### 1. evolution_stage (system maturity)

**What it answers:** *“How mature is this system, and what level of risk is acceptable?”*

- Owned by: the **architect**
- Stability: changes **slowly**
- Primary use: sets the **safety/maturity posture** for what is allowed to be produced.

**Current enum:**

- stage_0_local_prototype
- stage_1_free_tier
- stage_2_early_adopters
- stage_3_growth
- stage_4_scale_up
- stage_5_enterprise

**Rule of thumb:**

- As evolution_stage increases, the system may allow more “real” artifacts, but only when explicitly approved.

### 2. generation_phase (build / generation focus)

**What it answers:** *“Which kind of work are we doing in this run?”*

- Owned by: the **architect**
- Stability: can change **run to run**
- Primary use: selects the **construction focus** (architecture scaffolding vs implementation scaffolding vs hardening).

**Current enum:**

- architecture_scaffolding  
  Produce structure + architecture-facing docs/stubs. No runnable production code.
- implementation_scaffolding  
  Produce implementation-oriented scaffolding, still bounded and non-runnable by default.
- pre_production  
  Prepare for test environments and integration, still gated by approvals.
- production_hardening  
  Hardening steps, still gated and strictly bounded.

---

## Related Phase 8 pins: platform spine (execution context)

Phase 8 requires an explicit **platform spine** in the instance `profile_parameters.yaml`.

These are **individual technology pins ("technology atoms")**, not a bundled “technology profile”:

- `platform.infra_target`
- `platform.packaging`
- `platform.runtime_language`
- `platform.database_engine`

**Why this matters:** CAF previously experimented with **technology profiles** (a bundle of atoms under a single `approved_profile_id`). That approach drifted quickly and created a combinatorial catalog problem. Phase 8 now pins **atoms directly** in `profile_parameters.yaml` so the generator can stay deterministic without forcing a one-size-fits-all bundle.

**Authoritative enum source:** the allowed values for these pins live in the Phase 8 Profile Parameters schema:

- `architecture_library/phase_8/84_phase_8_profile_parameters_schema_v1.yaml`

If additional technology pins are introduced in the future, they must be added to the schema (and any validators) explicitly. No inference.

---

## Why both lifecycle axes are needed

Without **evolution_stage**, a generator can’t tell whether “real code” is acceptable.

Without **generation_phase**, a generator can’t tell whether the user wants architecture scaffolding vs implementation scaffolding vs hardening.

They are intentionally **orthogonal**:

- evolution_stage = maturity / risk posture
- generation_phase = work focus for the current run

---

## Where these values live (authoritative)

For each reference architecture instance, the architect pins inputs in:

Pinned UX inputs (architect-authored):

- `reference_architectures/<name>/spec/guardrails/profile_parameters.yaml`
  - `lifecycle.evolution_stage`
  - `lifecycle.generation_phase`
  - `platform pins (infra_target/packaging/runtime_language/database_engine)` 

Authoritative architect-authored fields:

- `lifecycle.evolution_stage`
- `lifecycle.generation_phase`
- `platform pins (infra_target/packaging/runtime_language/database_engine)`

All other enforcement inputs (skill selection, write boundaries, artifact classes, forbidden actions, approval gates) are **derived** into assistant-authored views (read-only) such as:

- `reference_architectures/<name>/spec/guardrails/profile_parameters_resolved.yaml`

---

## Safety invariants (must hold)

These invariants are enforced by skills and validators:

1) **Fail-closed**: missing/ambiguous inputs → refuse and emit a feedback packet.
2) **Write boundedness**: no writes outside the authoritative `allowed_write_paths`.
3) **Artifact boundedness**: only produce artifacts within the authoritative `allowed_artifact_classes`.
4) **Forbidden means forbidden**: never perform any action listed in the authoritative `forbidden_actions`.
5) **No hidden inputs**: skills may only read the declared inputs.

Authority rule:

- If a derived view exists, it is authoritative for enforcement rails; otherwise enforcement must fail closed (do not infer).

---

## Instance evolution policy (normative)

Lifecycle values are used in two operational contexts:

1) **CAF-managed sandbox instances** (inside the CAF workspace)

- Instances under `reference_architectures/<name>/...`.
- Intended to be created and evolved by CAF workflows.

1) **Standalone instance repositories**

- Repos where architecture and code evolve outside the CAF workspace (typically companion repositories).

CAF applies different refusal behavior based on context and detected drift.
See: `architecture_library/phase_8/89_phase_8_instance_evolution_policy_v1.md`.

Key intent:

- CAF-managed instances must remain **deterministic**; if drift is detected, CAF must refuse.
- Standalone repos may drift; CAF may proceed only when sufficiently aligned, otherwise it must require an explicit architect choice.
