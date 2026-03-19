# CAF Meta-Patterns Checklist (v1)

Use this checklist when changing skills, templates, validators, or adding pattern option sets.

## A. Human friction

- [ ] Architect action is primarily: flip `status` (`adopt|reject|defer` / `open|answered`).
- [ ] No copy/paste required to “answer” a question.
- [ ] Every choice set includes a `custom` option.
- [ ] Option summaries are neutral (no “recommended”).

## B. Groundedness

- [ ] Canonical options live in the library (pattern definitions), not in skills.
- [ ] Skills do not embed canonical inventories of decisions/questions.
- [ ] Decisions/questions are emitted only when warranted (adopted pattern and/or explicit instance evidence).
- [ ] Each emitted choice/question includes anchors to patterns/checklists/spec sections.
- [ ] **Decision patterns are fully optionized:** every `caf.kind: decision_pattern` has:
  - `caf.option_sets[]` (non-empty),
  - `caf.human_questions[]` (non-empty; each references an `option_set_id`),
  - and each option set declares `default_option_id` so safe auto-adopt can preselect exactly one option.

## C. Rerun safety

- [ ] `ARCHITECT_EDIT_BLOCK`s are preserved verbatim.
- [ ] Regenerable content is confined to CAF/DESIGNER managed blocks.
- [ ] Scaffold upgrades only occur when untouched; otherwise preserve and advise.

## D. Fail-closed gating

- [ ] Required choice sets enforce exactly-one-adopt.
- [ ] Planning fails closed before build when required human signals are missing.
- [ ] Feedback packets specify the exact block and minimal required edit.
- [ ] New enforcement rules land in DoD + review rubrics first (avoid ad-hoc scripted validators).
- [ ] If a deterministic tripwire is needed, prefer a generic lint that compiles from rubric/contract assertions (not a one-off script).
- [ ] Producer fixes are preferred over patching instance outputs; reviewer catches regressions.
- [ ] Architectural tasks consume rails/TBP inputs and avoid technology-hardcoded branching (technology specifics belong in TBP tasks + manifests).
- [ ] Avoid combinatorial sprawl: workers/gates express invariants, not per-technology syntactic checks (technology specifics belong behind TBP-provided seams).
- [ ] Worker skills do not hardcode TBP IDs; they bind via capability + `role_binding_key` using `resolve_tbp_role_bindings_v1` (see `caf_no_tbp_id_leakage_in_worker_skills_meta_pattern_v1.md`).
- [ ] When a rule is library-authored and repetitive, decide whether it belongs in the planner output or in a deterministic enricher; do not leave the ownership implicit.
- [ ] Every new library terminal or realization option maps to an existing enricher/gate, or introduces a new framework-owned one before becoming a default.
- [ ] Generic gates prefer declared matcher kinds / artifact classes over hardcoded TBP- or technology-specific checks.

## E. Avoid duplication

- [ ] Each decision has one “home” (e.g., contract choices in contract section).
- [ ] No parallel inventories that duplicate the same choice in multiple places.

## F. Composable deterministic scripts

- [ ] Deterministic scripts (gates/merges/indexers/evals) are **composable**:
  - export `internal_main(argv, deps?)` (importable),
  - preserve CLI behavior via an entrypoint guard,
  - and perform **no execution on import** (no top-level `await main()`, no top-level filesystem writes).
- [ ] When adjacent deterministic stages have no semantic step between them, provide a `*_postprocess_v1.mjs` wrapper that imports and calls the stage `internal_main` functions in order (avoid agent ordering foot-guns and Node process fan-out).

## G. Semantic barrier sandwich (pre-gate + semantic + post-gate)

- [ ] When a semantic step depends on deterministic prerequisites, provide a deterministic **pre-gate** (preflight) and make it the default invocation path.
- [ ] Deterministic builders/gates that depend on semantic outputs fail closed when required summary/decision blocks are missing or placeholder-like.
- [ ] Post-gate default posture is **invariant checking**, not auto-fixing.
  - If a deterministic repair exists, it is an explicit reset/repair command (human-invoked), not a hidden postprocess that encourages agents to skip work.
- [ ] Prefer explicit command splits (e.g. `/caf arch` vs `/caf plan`) when it prevents agents from skipping planning due to context compaction.
- [ ] Anti-repair-script posture is followed and documented (see `caf_anti_repair_scripts_meta_patterns_v1.md`).

## H. Feedback packets: human + autonomous agent remediation

- [ ] Feedback packets include both:
  - a human operator remediation path (commands and/or manual file delete list), and
  - an autonomous agent remediation path (concrete edits + which command to rerun).
- [ ] Packets reference the correct command for the phase (`/caf arch` vs `/caf plan` vs `/caf build`).
- [ ] Packets conform to the canonical feedback packet protocol (required header order, status lifecycle, required sections):
  - `architecture_library/patterns/caf_meta_v1/caf_feedback_packet_protocol_meta_pattern_v1.md`

## I. Incremental semantic work for constrained models

- [ ] When a semantic step touches many patterns/candidates, the skill encourages incremental updates (one pattern / small batch at a time) to prevent timeouts and thrash.
