# TN-005 — Phase 8 Derivation State Machine (Working, Descriptive) v1

Status: Working Draft (Descriptive, Non-normative)
Audience: CAF operators (you + me), maintainers, and anyone debugging “where are we in the loop?”
Non-normative: This note is not enforced by validators. It does not introduce new requirements.
Intent: Provide a shared, evolving mental model of CAF’s derivation lifecycle so we can locate the current state, understand what transitions are legal, and identify gaps between docs and implementation.

---

## 1. Purpose

This technical note describes the Phase 8 “derivation loop” as a state machine.

It exists to answer, deterministically and quickly:

* What state is an instance in right now?
* What command or human edit is the correct next transition?
* What artifacts should exist in each state?
* Where did the run fail (fail-closed latch), and what needs to change to proceed?

This note is intentionally descriptive. It must not become an “auto-architecture engine” or prescribe design decisions.

---

## 2. Scope

In scope:

* Phase 8 instance lifecycle as observed through artifacts under:

  * Note: Layer 7 is produced in the documentation/audit loop (e.g., `caf-arch-doc` / `caf-layer7`), not as a prerequisite for the core build loop.

  * `reference_architectures/<name>/layer_6/`
  * `reference_architectures/<name>/layer_7/` (documentation/audit loop; not produced by `/caf-arch`)
  * `reference_architectures/<name>/layer_8/`
  * `reference_architectures/<name>/feedback_packets/`
  * `companion_repositories/<target>/`
* The command loop:

  * `/caf-saas` (includes init)
  * `/caf-arch`
  * `/caf-next` (advisory/apply phase advance; user-initiated)
  * `/caf-build-candidate`
  * `/caf-arch-doc` (documentation loop; may call `caf-layer7`)
  * `/caf-layer7` (Layer 7 derived bundle; doc/audit)
* Human edits that unblock progress (pins/specs/designs/plans).

Out of scope:

* “What the architecture should be”
* Technology selection beyond pinned `platform pins (infra_target/packaging/runtime_language/database_engine)`
* Any prescriptive contract filenames or form choices (contract-first is validated by completeness/anchors, not by naming).

---

## 3. Vocabulary and conventions

### 3.1 “State” definition

A state is a tuple of observable facts:

* Pins exist and are syntactically valid
* Derived views (Layer 8 resolved) exist and are current enough
* Required artifacts for a phase exist (specs/designs/task graph)
* A fail-closed latch is absent (or present)

This note uses artifact existence + minimum structural properties (“predicates”) to define states.

### 3.2 “Transition” definition

A transition is one of:

* A command invocation (e.g., `/caf-arch`)
* A human edit of a pinned input or authored spec/design section
* A maintainer edit of CAF library/skills to fix drift (not editing generated outputs)

Transitions have:

* Preconditions
* Artifacts created/updated
* Fail-closed outcomes (feedback packet emitted)

### 3.3 Paths and placeholders

* `<name>` = instance name under `reference_architectures/`
* `<target>` = companion repo target under `companion_repositories/`

---

## 4. Primary state variables

These are the “core dials” and derived facts that determine the state.

### 4.1 Pins (owned by human architect)

* `reference_architectures/<name>/layer_8/profile_parameters.yaml`

  * Contains the only 3 pinned knobs:

    * `lifecycle.evolution_stage`
    * `lifecycle.generation_phase`
    * `platform pins (infra_target/packaging/runtime_language/database_engine)`

* `reference_architectures/<name>/layer_6/architecture_shape_parameters.yaml`

  * Instance identity/shape inputs (as currently defined by init)

### 4.2 Derived resolved view (owned by CAF)

* `reference_architectures/<name>/layer_8/profile_parameters_resolved.yaml`

  * Derived rails/views (allowed paths, forbidden actions, runnable_code_approved, enforcement bar selection)
  * Must be regenerated (overwritten) after any pin change
  * Staleness must be detectable: the resolved view should include `meta.derived_at` (updated on every run) and a copy of the three pins under `meta.derived_from_pins`

* `reference_architectures/<name>/guardrails/syntactic_checks.md` (optional)

  * Human-readable readiness summary (advisory)

### 4.3 Specs / designs / plan

* `reference_architectures/<name>/layer_6/system_spec_v1.md`
* `reference_architectures/<name>/layer_6/application_spec_v1.md`
* `reference_architectures/<name>/layer_6/application_design_v1.md` (current implementation path)
* `reference_architectures/<name>/layer_6/control_plane_design_v1.md` (current implementation path)
* `reference_architectures/<name>/layer_6/task_graph_v1.yaml`

Optional / evolving (may exist depending on branch/version):

* `reference_architectures/<name>/layer_6/contract_declarations_v1.yaml`

  * If the contract-first registry framework is wired into the loop, this becomes a key state variable.

### 4.4 Fail-closed latch

* Any feedback packet under:

  * `reference_architectures/<name>/feedback_packets/`

Interpretation:

* Presence of a feedback packet means: the last attempted transition failed-closed and human/maintainer action is required before rerun.

---

## 5. State machine (working)

This is the working set of states for the v1 derivation loop. States are defined by predicates over artifacts.

### S0 — No instance

Predicates:

* `reference_architectures/<name>/` does not exist

Legal next transitions:

* T0: `/caf-saas <name> ...` → S1

---

### S1 — Instance initialized (pins exist)

Predicates:

* `layer_6/architecture_shape_parameters.yaml` exists
* `layer_8/profile_parameters.yaml` exists

Notes:

* At this state, derived views may be absent/stale until `/caf-arch` runs.

Legal next transitions:

* T1: Human edits `profile_parameters.yaml` (pins) → stays S1 (pins changed)
* T2: `/caf-arch <name>` → S2 or S4 (depending on `lifecycle.generation_phase`), or SF (fail-closed)

---

### S2 — Architecture scaffolding derived (spec foundation + resolved rails + companion skeleton)

Predicates:

* S1 predicates hold
* `layer_8/profile_parameters_resolved.yaml` exists
* `layer_6/system_spec_v1.md` exists
* `layer_6/application_spec_v1.md` exists
* `layer_6/system_spec_v1.md` contains the CAF-managed block `caf_decision_pattern_candidates_v1` (standard candidate record format)
* `layer_6/application_spec_v1.md` contains the CAF-managed block `caf_decision_pattern_candidates_v1` (standard candidate record format)
* Companion skeleton initialized under `companion_repositories/<target>/` (as produced by the current orchestration)

Legal next transitions:

* T3: Human edits `system_spec_v1.md` (architect-edit sections) → stays S2
* T4: Human edits `application_spec_v1.md` to complete functional requirements/resources → S3
* T5: Human changes `generation_phase` to `implementation_scaffolding` → back to S1 (pins changed; rerun required)
* T2: `/caf-arch <name>` (rerun) → refreshes S2 (or fail-closed)

---

### S3 — Specs “ready enough” for design/planning

Predicates:

* S2 predicates hold
* `application_spec_v1.md` meets minimal planning readiness (working rule-of-thumb):

  * Has `## Resources`
  * At least one resource entry with operations sufficient to plan CRUD+list/get/etc (as per CAF convention for your current templates)

Legal next transitions:

* T5: Human sets `generation_phase=implementation_scaffolding` → back to S1
* T2: `/caf-arch <name>` with phase now implementation_scaffolding → S4 or SF
* T5R: Human creates/edits `layer_6/system_spec_v1.md (ARCHITECT_EDIT_BLOCK: decision_resolutions_v1)` to resolve candidates → S3R

---


### S3R — Decisions resolved “enough” for design (resolution registry present)

Predicates:

* S3 predicates hold
* `layer_6/system_spec_v1.md (ARCHITECT_EDIT_BLOCK: decision_resolutions_v1)` exists
* `layer_6/system_spec_v1.md (ARCHITECT_EDIT_BLOCK: decision_resolutions_v1)` exists and contains valid YAML (may be all `defer` during early runs):
  * `decisions` contains at least 1 entry
  * each entry has `evidence_hook_id`, `pattern_id`, `status`, `anchors`, `rationale`

Legal next transitions:

* T5R: Human resolves candidates by editing `layer_6/system_spec_v1.md (ARCHITECT_EDIT_BLOCK: decision_resolutions_v1)` → stays S3R (then rerun `/caf-arch` for design)
* T2: `/caf-arch <name>` with phase `implementation_scaffolding` and S3R satisfied → S4 or SF

---

### S4 — Implementation scaffolding derived (designs + task graph)

Predicates:

* S3R predicates hold (or at minimum S3 + decision_resolutions + whatever the current skills require)
* `layer_6/application_design_v1.md` exists (or the current design artifact)
* `layer_6/control_plane_design_v1.md` exists (or the current design artifact)
* `layer_6/task_graph_v1.yaml` exists
* `layer_8/profile_parameters_resolved.yaml` exists

Optional strengthening (future / desired):

* `layer_6/contract_declarations_v1.yaml` exists and is consistent with contract-first schema

Legal next transitions:

* T6: `/caf-build-candidate <name>` → S5 or SF
* T7: Human edits specs/designs to resolve inconsistencies → stays S4 (then rerun `/caf-arch`)

---

### S5 — Candidate build executed (tasks dispatched into companion repo)

Predicates:

* S4 predicates hold
* `/caf-build-candidate` has run successfully under Layer 8 rails
* Companion repo contains generated/updated candidate outputs under allowed paths
* Any copied “CAF inputs” folder in the companion repo exists (as per current build procedure)

Legal next transitions:

* T8: Rerun `/caf-build-candidate` after plan changes → stays S5 (new candidate)
* T9: Human/maintainer updates Task Graph / skills / capability mapping → go back to S4 then build again

---

### SF — Fail-closed latch (feedback packet emitted)

Predicates:

* A feedback packet exists under `reference_architectures/<name>/feedback_packets/`
* The last attempted transition did not complete

Legal next transitions:

* TF1: Human resolves feedback packet by editing pinned inputs/specs/designs/task graph (as instructed) → return to the last stable state and rerun the failed command
* TF2: Maintainer resolves drift by updating CAF library/skills/validators (not editing generated instance outputs) → rerun failed command

---

## 6. Transition table (working)

### T0 — Initialize instance

Trigger:

* `/caf-saas <name> ...` (includes init)

Preconditions:

* S0

Artifacts created:

* `reference_architectures/<name>/layer_6/architecture_shape_parameters.yaml`
* `reference_architectures/<name>/layer_8/profile_parameters.yaml`
* Additional instance scaffolding as per current init

Failure modes:

* SF with feedback packet if required init inputs are missing/invalid

---

### T2 — Derive architecture (orchestrator)

Trigger:

* `/caf-arch <name>`

Preconditions:

* S1
* Pins are valid

Artifacts updated/created (minimum):

* Layer 7 bundle
* Layer 8 resolved view + readiness
* Companion skeleton init/update

Phase-specific:

* If `generation_phase=architecture_scaffolding`:

  * Creates/updates: `system_spec_v1.md`, `application_spec_v1.md`
* Else:

  * Creates/updates: designs + `task_graph_v1.yaml`

Failure modes:

* SF with feedback packet if:

  * pins invalid
  * required prerequisite artifacts are missing for the selected phase
  * rails cannot be derived
  * downstream skills fail-closed

---

### T5 — Human changes pins

Trigger:

* Human edits `layer_8/profile_parameters.yaml`

Effect:

* Invalidates the resolved view until `/caf-arch` reruns
* Operationally: returns to S1 (pins changed)

---

### T6 — Build candidate

Trigger:

* `/caf-build-candidate <name>`

Preconditions:

* S4 (Task Graph exists)
* Layer 8 resolved view exists and allows writing to companion repo paths
* Capability coverage is complete (or fail-closed)

Artifacts created/updated:

* Candidate code / docs / outputs in `companion_repositories/<target>/...` within allowed paths
* Build bookkeeping as per current build process

Failure modes:

* SF with feedback packet if:

  * missing capability mapping / missing worker skill
  * task violates rails
  * required inputs missing
  * enforcement bar checks fail

---

## 7. “Where we are” checklist (operator quick scan)

For an instance `<name>`, check in order:

1. Pins exist?

   * `layer_8/profile_parameters.yaml`
   * `layer_6/architecture_shape_parameters.yaml`

2. Resolved view current?

   * `layer_8/profile_parameters_resolved.yaml` exists
   * If pins changed since last run, treat resolved view as stale until `/caf-arch` rerun

3. Phase-specific artifacts exist?

   * If `architecture_scaffolding`:

     * `system_spec_v1.md`, `application_spec_v1.md`
   * If `implementation_scaffolding`:

     * designs + `task_graph_v1.yaml`

4. Fail latch present?

   * Any `feedback_packets/*` → you are in SF until resolved

5. Ready to build?

   * `task_graph_v1.yaml` present + resolved rails allow companion writes → `/caf-build-candidate`

---

## 8. Known gaps (working observations)

This section records discrepancies we observe while evolving the process. It is not a requirements list.

* If the crew model claims a step exists (e.g., Plan QA) but no corresponding skill exists, the state machine should reflect “current implementation” and separately track the “desired future transitions.”
* Contract-first registry:

  * If the framework exists but is not yet enforced/wired into `/caf-arch` and Plan QA, then `contract_declarations_v1.yaml` should be treated as “optional / future strengthening” rather than a state predicate (until implemented).
* Terminology drift:

  * If legacy docs mention deprecated concepts (e.g., prompt packs), this note should not rely on them; it should describe the current runnable loop and mark legacy terms as non-authoritative.

---

## 9. How we will evolve this note

Update rules (to keep this useful and low-drama):

* Every time we discover a mismatch between:

  * what the orchestrator actually does,
  * what the crew model claims,
  * and what validators enforce,
    we update the “Known gaps” section and adjust state predicates accordingly.
* Promote to a Phase 8 library doc only after:

  * states + transitions stabilize across at least one end-to-end run,
  * and we decide which invariants should become enforceable.

---

## 10. Change log (working)

* v1: Initial working draft to describe Phase 8 derivation as a state machine with artifact-based predicates and command transitions.
