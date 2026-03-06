---
name: worker-pattern-retriever
description: >
  Canonical pattern retrieval owner for CAF. Performs token-minimized semantic ranking over a
  split semantic surface, then uses a deterministic graph surface for expansion.
  Emits grounded pattern candidates into caf_decision_pattern_candidates_v1 blocks.
  Instruction-only for semantic retrieval/ranking and pattern candidate grounding.
  Deterministic retrieval postprocess (union refresh + scaffold merge + retrieval gate) MUST be delegated to the scripted helper when available:
  - `node tools/caf/retrieval_postprocess_v1.mjs <instance_name> --profile=<profile>`
  If the helper cannot be invoked in your environment, fail-closed with a feedback packet.
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.


# worker-pattern-retriever

## Purpose

This worker is the **single owner** of pattern retrieval across CAF phases.

**Execution routing (ship rule):** Prefer the phase-specialized skills:
- `skills_portable/worker-pattern-retriever-arch-scaffolding/SKILL.md`
- `skills_portable/worker-pattern-retriever-solution-architecture/SKILL.md`

This SKILL remains the canonical reference for shared constraints and format rules.


It:

- uses split retrieval surfaces (token-minimized):
  - semantic cues: `architecture_library/patterns/retrieval_surface_v1/pattern_semantic_surface_v1.jsonl`
  - graph relations: `architecture_library/patterns/retrieval_surface_v1/pattern_graph_surface_v1.jsonl`
- applies a retrieval **view profile**:
  - `architecture_library/patterns/retrieval_surface_v1/retrieval_view_profiles_v1.yaml`
- produces **grounded** candidates in:
  - `reference_architectures/<name>/spec/playbook/system_spec_v1.md` → `CAF_MANAGED_BLOCK: caf_decision_pattern_candidates_v1`
  - `reference_architectures/<name>/spec/playbook/application_spec_v1.md` → `CAF_MANAGED_BLOCK: caf_decision_pattern_candidates_v1` (subset where plane ∈ {application,both})

This worker must also merge-safely refresh the spec `decision_resolutions_v1` scaffold so the architect can adopt/reject/defer candidates.

This worker is complex and contains semantic steps. Semantic steps are mandatory. Make a careful plan before you execute. Follow the instructions and ship blockers exactly. Do not skip steps. Do not take shortcuts. Do not run the retrieval gate before the spec is updated with candidates.

## Invocation inputs

- `instance_name` (required)
- `profile` (required): `arch_scaffolding | solution_architecture`

## Required inputs (fail-closed)

### Authoritative instance surfaces (ship rule)

Only treat these paths as authoritative inputs/outputs for the active instance run:

- `reference_architectures/<name>/spec/playbook/**`
- `reference_architectures/<name>/spec/guardrails/**`
- `reference_architectures/<name>/design/playbook/**`
- `reference_architectures/<name>/feedback_packets/**`

Ignore any sibling folders such as `playbook-1`, `playbook-2`, `playbook_old`, `tmp`, etc.
They are user-created and MUST NOT be searched or read (even “as structural reference”).

Do not delete user-generated content. If sibling folders exist, ignore them.

Pinned / derived sources (ground truth):
- `reference_architectures/<name>/spec/playbook/architecture_shape_parameters.yaml`
- `reference_architectures/<name>/spec/guardrails/profile_parameters_resolved.yaml`

Spec files (targets; must exist or be created by caller):
- `reference_architectures/<name>/spec/playbook/system_spec_v1.md`
- `reference_architectures/<name>/spec/playbook/application_spec_v1.md`

Library sources:
- `architecture_library/patterns/retrieval_surface_v1/pattern_semantic_surface_v1.jsonl`
- `architecture_library/patterns/retrieval_surface_v1/pattern_graph_surface_v1.jsonl`
- `architecture_library/patterns/retrieval_surface_v1/retrieval_view_profiles_v1.yaml`
- `architecture_library/patterns/retrieval_surface_v1/retrieval_surface_lint_contract_v1.md`
- `architecture_library/patterns/retrieval_surface_v1/bridge_lexicon_v1.yaml`

NOTE: This worker does **not** re-extract per-pin definitions from the templates catalog.
Pin value definitions must already be present (grounded) in `system_spec_v1.md` via
`CAF_MANAGED_BLOCK: pin_value_explanations_v1` produced by the upstream pins→spec step.

## Execution order (ship blocker)

Non-skippable checklist (the common regression):

- Execute all semantic steps. Do NOT jump from “retrieval blob exists” directly to `retrieval_gate_v1`.
- Do NOT reuse existing `graph_expansion_*` artifacts. If graph expansion is enabled for the profile, you must execute the deterministic expander for this run.
- Do NOT leave candidate blocks unchanged. Candidates MUST be written back into `system_spec_v1.md` and `application_spec_v1.md` before any gate runs.

Minimum required artifact set for a successful run (all under `<playbookDir>/` for the active instance):
Playbook directory by profile (deterministic):
- arch_scaffolding => <playbookDir>=spec/playbook
- solution_architecture => <playbookDir>=design/playbook


- `semantic_candidate_subset_<profile>_v1.jsonl`
- `semantic_prefilter_debug_<profile>_v1.md`
- `retrieval_context_blob_<profile>_v1.md`
- `graph_expansion_open_list_<profile>_v1.yaml`
- `graph_expansion_trace_<profile>_v1.md`
- Updated candidate blocks in both spec files

If any of the above is missing for this run, stop and fail-closed rather than proceeding.

You MUST follow this order for each run:

1. Build/refresh the retrieval context blob (script-owned).
2. Perform semantic retrieval/ranking. This is a semantic judgment that must be performed by the LLM. Do not search for a scripted shortcut. 
   - Input: `reference_architectures/<instance_name>/<playbookDir>/retrieval_context_blob_<profile>_v1.md`
   - Output (working set): a ranked list of `pattern_id` candidates with an initial grounding tier.
   - **Do not arbitrarily truncate** (e.g., “first 30”).
     - If `reference_architectures/<instance_name>/<playbookDir>/semantic_candidate_subset_<profile>_v1.jsonl` exists for this run, treat it as the
       authoritative, deterministic semantic slice and consider **all records eligible for scoring** in that file (not automatically usable). You MUST still rank and assign confidence; mark LOW when unsupported by blob+definition evidence.
     - If you must cap, cap at `max_candidates` from the profile run config (never an ad-hoc constant).
   - Drop all LOW confidence candidates from the working set before graph expansion. 
3. Invoke graph expansion using HIGH+MEDIUM seed ids.
   - Seed ids = **all** `pattern_id` values currently marked HIGH or MEDIUM in the working set.
   - Seed id format (exact): **pattern id only**, no quotes, no prefixes, no file refs.
     - Example: `CAF-POL-01`
   - Graph expansion output is advisory (open list). It is NOT the final candidate set.
4. Integrate all graph open-list candidates into the working set (grounding required). 
This is a semantic judgment step that must be performed by the LLM. Do not search for a scripted shortcut.
   - Load (exact path):
     - `reference_architectures/<instance_name>/<playbookDir>/graph_expansion_open_list_<profile>_v1.yaml`
   - Open-list ids are (exact): ordered `candidates[*].id`.
   - Let `graph_only` be the ordered by rank, descending from HIGH to LOW `candidates[*].id` list **excluding** any ids already selected as semantic seeds. 
   - Add all and up to `reserve_slots` ids from `graph_only` into the candidate set.
   - Ground these added candidates the same way as semantic candidates:
     - open the definition file
     - include ≥1 `pinned_input` evidence bullet (cite pins from architecture_shape_parameters)
     - include an additional evidence bullet (prefer `derived_rails_or_posture` when applicable; otherwise add a second `pinned_input` bullet)
     - `pattern_definition` evidence is OPTIONAL (omit to save tokens unless a reviewer explicitly requests it)
   - Ship blocker: do not stop after “1 graph pattern”; keep going until you have added `reserve_slots` graph-only ids or you exhaust `graph_only`.
5. **Write the combined, grounded candidate records to the grounded-candidate dump** (do not edit large spec docs in-band).

   - Write ONLY canonical candidate records into:
     - arch_scaffolding => `spec/playbook/grounded_candidate_records_arch_scaffolding_v1.md`
     - solution_architecture => `design/playbook/grounded_candidate_records_solution_architecture_v1.md`
   - The dump MUST contain one or more candidate records in the canonical heading form (e.g., `### HIGH-1: ...` / `### H-1: ...`), and the record body MUST follow the `Candidate record format (v1)` from the spec templates.

6. Run the deterministic retrieval postprocess chain (mandatory):

   - `node tools/caf/retrieval_postprocess_v1.mjs <instance_name> --profile=<profile>`

This helper runs, in order:

- `apply_grounded_candidates_v1` (union refresh into CAF-managed spec candidate blocks)
- `pattern_retrieval_scaffold_merge_v1` (merge-safe decision scaffold refresh + option hydration)
- `retrieval_gate_v1` (postcondition enforcement)

Rules:

- Do NOT run the three helpers individually (avoid ordering quirks).
- If the helper cannot be invoked, FAIL-CLOSED with a feedback packet and STOP.


### Retrieval debug format (script-owned; ship blocker)


**Hard rule:** Generate the debug view **only after** the spec candidate blocks have been updated (in full-pack mode this occurs via `retrieval_postprocess_v1`).
- `spec/playbook/system_spec_v1.md` → `CAF_MANAGED_BLOCK: caf_decision_pattern_candidates_v1`
- `spec/playbook/application_spec_v1.md` → `CAF_MANAGED_BLOCK: caf_decision_pattern_candidates_v1`

If either spec file has **zero** candidates after your update attempt:
- Do not attempt to generate debug.
- Fail-closed with a feedback packet explaining which block is missing/empty and why.

No retrieval debug report is required (LLM-authored or otherwise).
- Keep tables compact. If you truncate, keep counts correct and state the truncation.
- The Final Candidate Set table MUST match the candidates emitted into `caf_decision_pattern_candidates_v1` blocks.
- LLM-authored debug MUST NOT include any semantic coverage appendix. Semantic coverage is **script-owned** only.



## Token discipline (ship blocker; single flow)

- Do not load the full semantic surface into the model context.
  - Only load: `semantic_candidate_subset_<profile>_v1.jsonl`.
- Deterministic prefilter is mandatory (script-owned):
  - `node tools/caf/prefilter_semantic_candidates_v1.mjs <instance_name> --profile=<profile> --limit=180`
  - If it cannot be invoked, FAIL-CLOSED with a feedback packet and STOP.
- Graph expansion is deterministic and must be executed for the run when enabled.
  - Do not reuse `graph_expansion_*` artifacts across runs.


NOTE (ship blocker): the retrieval context blob is **script-owned**.
- Always invoke:
  - `node tools/caf/build_retrieval_context_blob_v1.mjs <instance_name> --profile=<profile>`
- Never hand-assemble the blob in-band.
- If the helper cannot be invoked, FAIL-CLOSED with a feedback packet and STOP.

## Fail-closed rules

0) Feedback packet naming (ship blocker):
   - All retrieval worker feedback packets MUST use slug prefix `pattern-retrieval-`:
     - `reference_architectures/<name>/feedback_packets/BP-YYYYMMDD-pattern-retrieval-<reason>.md`
   - `<reason>` MUST be one of: `lint`, `blob_cap`, `coverage_floor`, `grounding`, `yaml_parse`, `scaffold_merge`.

1) Grounded only:
   - Every emitted candidate MUST include:
     - ≥2 evidence bullets total
     - ≥1 evidence bullet of type `pinned_input` or `derived_rails_or_posture`
   - `pattern_definition` evidence is OPTIONAL (omit to save tokens unless explicitly requested).

2) No invention:
   - Do not introduce vendor/product selections.
   - Do not invent requirements; if underspecified, emit **open questions**.

3) Zero candidates is not allowed:
   - If no candidates can be grounded, write a retrieval diagnostics feedback packet and refuse.

3a) Namespace coverage floor (solution_architecture; ship blocker):
   - If `profile=solution_architecture`, the emitted candidate set MUST include:
     - ≥ **5** `EXT-...` patterns (external_v1),
     - ≥ **2** core patterns (core_v1), and
     - ≥ **3** CAF patterns (caf_v1).
   - Rationale: avoid starving CAF obligations/contracts while still ensuring external foundation patterns are present.
   - If you cannot ground this coverage, FAIL-CLOSED with a feedback packet:
     - explain which coverage floor failed (external/core/caf)
     - remediation:
       - for external/core: patch cue sweeps + bridge phrases via `bridge_lexicon_v1.yaml`
       - for caf: improve CAF recall by adding `decision_prompt` + relevant bridge cues to caf_v1 records in `pattern_retrieval_surface_v1.jsonl`
         (do not promote externals to core; keep recall grounded).

4) Respect view:
   - Only consider records whose `namespace` is included in the selected view profile.

5) Enrichment must be present (architecture scaffolding):
   - If `system_spec_v1.md` contains either CAF-managed enrichment block below, and the block is empty
     OR contains placeholder text (e.g., `CAF will populate`, `TBD`, `TODO`), FAIL-CLOSED:
       - `CAF_MANAGED_BLOCK: pin_value_explanations_v1`
       - `CAF_MANAGED_BLOCK: tech_profile_explanations_v1`

   - Rationale: placeholder/noise in these blocks leaks directly into the retrieval context blob and degrades recall/stability.

   - **Template discipline (ship blocker):** upstream spec scaffolds must copy templates verbatim.
   - If missing/placeholder: write a feedback packet and STOP.

   - **Non-optional SPEC signals (ship blocker):** the retrieval context blob MUST include:
     - `## Pin-derived system constraints (CAF-managed)`
     This section is CAF-managed and must be hydrated by scripts prior to blob build.
     If missing/placeholder: write a feedback packet and STOP.

6) Retrieval surface lint (bounded; worker-safe):

- Full-surface lint across the entire JSONL is a **library hygiene** responsibility (CI/audit), not a per-run ship blocker here.
- This worker MUST still be strict where it matters:
  - Parse the JSONL line-by-line; FAIL-CLOSED if any line is not valid JSON or is missing any required top-level keys: `key`, `namespace`, `id`, `plane`, `family`, `definition_path`, `terms`.
  - For any record you **OPEN** or **EMIT**, enforce the lint contract **strictly** (fail-closed on violation):
    - forbidden tokens
    - allowed `terms[*].kind`
    - single-line `terms[*].value`
    - length caps for capped kinds
    - ≥1 `trigger_cue`
    - for `core_v1` and `external_v1`: ≥2 `trigger_cue` entries that are **exact** phrases from `bridge_lexicon_v1.yaml`

- If any strict check fails for an opened/emitted record:
  - write a feedback packet `BP-YYYYMMDD-pattern-retrieval-lint.md` naming the offending record `key` + `definition_path` + violated rule(s)
  - stop (do not score, do not emit).

7) Semantic ranking is **LLM judgment** (anti-thrash):

- Do NOT write ad-hoc scripts to "score" or "rank" patterns (lexical keyword counters, pin-only scoring, etc.).
- The only allowed scripting here is deterministic **mechanical** work (JSONL parsing, view filtering, scaffold merge/hydration via the provided helper).
- Candidate ranking MUST be your semantic judgment against the **retrieval context blob**, not just pins.

## Retrieval context blob (grounded; normalized; v2)

Build a **single, compact, stable** context blob from authoritative instance docs only (no guessing, no external knowledge).

Why: dumping long prose/YAML makes the blob exceed model limits, causing truncation and unstable retrieval.
This worker MUST keep the blob embedding-friendly and compact.

NOTE (pins are the exception): The **architecture shape pins** are the highest-signal retrieval input.
Do not over-compress pins into 1–3 summary bullets. Instead, include the **full selected pins list**
(CP/AP/DP/AI/ST) in a stable, canonical format (see `## PINS_SUMMARY` rules below).

### Blob size targets

These are **targets**, not exact-count requirements:

- `arch_scaffolding`: target ≤ **60,000 chars** and ≤ **400 bullets**
- `solution_architecture`: target ≤ **80,000 chars** and ≤ **520 bullets**

Hard rule (ship blocker):
- Do NOT paste raw YAML/file dumps into the blob (except tiny enum lists).
- If you cannot keep within the bullet limits without losing required signal, FAIL-CLOSED with a feedback packet describing which upstream section must be trimmed/normalized.

### Mandatory sections (fixed order)

Write the blob in this exact order (Markdown headings exactly as shown):

1) `# Retrieval context blob (profile=<...>)`
2) `## INSTANCE_SUMMARY`
3) `## PIN_VALUE_EXPLANATIONS` (copy **selected pin value** bullets from `system_spec_v1.md` → `CAF_MANAGED_BLOCK: pin_value_explanations_v1`)
4) `## PINS_SUMMARY` (from `architecture_shape_parameters.yaml`; **full pins list**)
5) `## GUARDRAILS_SUMMARY` (from `profile_parameters_resolved.yaml`)
6) `## ARCHITECT_DECISIONS` (from `system_spec_v1.md` → `decision_resolutions_v1`)
7) `## SPEC_SIGNAL` (from CAF-managed spec blocks + architect-edit requirement blocks)
8) `## DOMAIN_RESOURCES` (only for `solution_architecture`; from `application_spec_v1.md`)
9) `## UI_SIGNAL` (if `application_spec_v1.md` contains `ARCHITECT_EDIT_BLOCK: ui_requirements_v1`; include even when defaults)
10) `### BRIDGE_ECHO (canonical phrases)`

### Content rules (stable; concise)

- Do NOT paste full YAML or full blocks verbatim.
- Extract only the **highest-signal fields** as short bullets.
- Each bullet should be a single sentence or key/value pair.
- Prefer **identifiers + enums** over prose (e.g., `runtime_language: python`, `database_engine: postgres`, `plane.runtime_shape: api_service_http`).
- For long text (requirements/notes), include at most **5 bullets** and cap each bullet at **160 chars**.
- Always include resource names + operation names (no descriptions) in `DOMAIN_RESOURCES`.

#### `## SPEC_SIGNAL` (required; pins-first; avoid tech-choice drift)

Populate `## SPEC_SIGNAL` using only **high-signal** spec sections that are stable at this phase:

- From `system_spec_v1.md` (CAF-managed):
  - summarize `pin_derived_system_constraints_v1` into **3–7 bullets** (short, imperative)
- From `application_spec_v1.md` (CAF-managed):
  - summarize `intent_derived_app_plane_constraints_v1` into **2–5 bullets**
- From architect-edit requirement blocks (if non-empty / non-placeholder):
  - `system_requirements_v1` (≤5 bullets)
  - `open_questions_v1` (≤5 bullets)

Do **NOT** treat `technology_choice_points_v1` as authoritative retrieval signal at this phase.
Instead, emit at most a single note:

- `technology_choice_points: present (ignored for retrieval unless explicitly resolved in decision_resolutions)`

#### `## PINS_SUMMARY` (required; do not over-compress)

Pins MUST be emitted as a complete list, grouped by template, using the canonical format:

- `TEMPLATE_ID (template_version=<...>)`
  - `<PIN_ID>=<PIN_VALUE>`
  - ...

Rules:
- Include **all** templates present under `template_instances[]` in `architecture_shape_parameters.yaml`.
- Include **all** pins under each template's `pins:` mapping.
- Preserve the exact pin IDs and values from the YAML (no paraphrase).
- Do not collapse into prose summaries like "CP: ...".
- If a pin value is long, keep it as-is; pins are allowed to dominate blob length.

#### `## PIN_VALUE_EXPLANATIONS` (required; spec-sourced; grounded)

Goal: give the semantic retriever grounded, high-signal **selected value definitions** for the pins
without re-parsing the template catalog inside this worker.

Source of truth (authoritative for this worker):
- `reference_architectures/<name>/spec/playbook/system_spec_v1.md` → `CAF_MANAGED_BLOCK: pin_value_explanations_v1`

Construction rules (mechanical copy; no invention):
- Copy the bullets from `pin_value_explanations_v1` **verbatim** into this blob section.
- Preserve exact pin IDs and the exact selected value labels.
- Do **not** add extra “Intent”/“Constraints” paragraphs here; keep the blob compact.
- Prefer **1 bullet per pin** (the selected value definition). If the spec block contains an additional
  constraint bullet for a pin, include it too.

Grounding expectations:
- The upstream pins→spec step MUST ground these bullets to the templates catalog (typically via
  cite markers pointing at `architecture_library/07_contura_parameterized_architecture_templates_v1.md:<PIN_ID>`).
- This worker MUST NOT introduce new wording beyond copying those grounded bullets.

### Required source coverage

Use these sources to populate the sections:

- `reference_architectures/<name>/spec/playbook/architecture_shape_parameters.yaml`
  - include template_ids and pin selections (CP/AP/DP/AI/ST)
- `reference_architectures/<name>/spec/guardrails/profile_parameters_resolved.yaml`
  - lifecycle + platform posture + `plane.runtime_shape` + cross-plane posture rails
- `reference_architectures/<name>/spec/playbook/system_spec_v1.md`
  - `ARCHITECT_EDIT_BLOCK: decision_resolutions_v1` (adopt/reject/defer summaries)
  - CAF-managed constraints blocks (derived constraints + posture rails) as summarized bullets
- `reference_architectures/<name>/spec/playbook/system_spec_v1.md`
  - `CAF_MANAGED_BLOCK: pin_value_explanations_v1` (used to build `## PIN_VALUE_EXPLANATIONS`)
- `reference_architectures/<name>/spec/playbook/application_spec_v1.md`
  - resources + operations (solution_architecture profile)
  - UI requirements (if present)

### Bridge echo footer (mandatory)

Append a small, stable footer:

- `### BRIDGE_ECHO (canonical phrases)`
  - Copy **exactly 11** phrases verbatim from `bridge_lexicon_v1.yaml` (one per line).
  - The first **6** phrases MUST be exactly (in this order):
    - `control plane`
    - `application plane`
    - `data plane`
    - `cross-plane`
    - `plane boundary`
    - `integration contract`
  - The remaining **4** phrases MUST be additional exact phrases from the lexicon (mix categories).
  - Purpose: keep shared plane/contract/boundary vocabulary present for cross-namespace alignment.

## Retrieval debug view (CAF-managed)

### Stub-first debug output (mandatory)

This worker MUST write the retrieval context blob stub **immediately after determining its path**, before any scoring/grounding.

- Write a minimal blob stub (with required headings).

No LLM-authored retrieval debug report is required.

If desired, a script-owned computed debug can be produced via:

### Debug contents (best-effort; non-blocking)

The debug file is for humans. It MUST NOT introduce new architecture choices.

Minimum required contents:

- Retrieval run header: instance + profile + mode (`baseline`)
- Link to the scoring blob file path
- Short blob health summary:
  - total bullets (approx) and whether any raw YAML dumps were avoided
- Candidate ranking summary (no numeric scores required):
  - Top 10 per-namespace (or fewer if the namespace is small): `pattern_id`, `plane`, `confidence (HIGH/MED/LOW)`, and a 1-line reason grounded in blob evidence
  - Merged ranked shortlist (top 30): `pattern_id`, `namespace`, `plane`, `confidence`, 1-line reason
- Grounding attempts:
  - list of definitions opened (top K), and whether each grounded successfully
- Graph expansion (always include this section, even if disabled or skipped):
  - config summary: `enabled`, `reserve_slots`, `max_hops`, `relation_kinds`
  - seeds used (pattern_ids)
  - edges traversed (count) and nodes discovered/opened/grounded/emitted (counts)
  - graph-derived candidates added: `pattern_id`, `relation_kind`, `from_seed`, 1-line grounded reason
  - skipped neighbors (top 20): `pattern_id`, skip reason (`ungrounded` | `namespace_excluded` | `budget_cap` | `diversity_cap` | `already_present`)
- Emission summary:
  - number of candidates emitted into each spec
  - list of any new `decision_resolutions` entries appended
- Any refusal diagnostics (if failed closed), with a link to the feedback packet path

## Ranking procedure (semantic; ranked by relevance)

This worker performs **semantic** ranking (LLM judgment) over the canonical retrieval surface.
Numeric scores are **optional**; the output must still be a stable ordered shortlist with grounded reasons.

Profile-controlled behavior (read from `retrieval_view_profiles_v1.yaml`):

- Do not restate or re-implement the selection algorithm in this skill.
- Follow the active profile in `architecture_library/patterns/retrieval_surface_v1/retrieval_view_profiles_v1.yaml` for: `max_candidates`, `open_definitions_top_k`, `diversity_constraints`, namespace coverage, and graph expansion limits.
- If graph expansion is enabled, it MUST run; if it cannot run (e.g., no eligible HIGH/MED grounded seeds), FAIL-CLOSED.

## Grounding procedure (HS-0)

For each candidate you want to emit:

- Cite pinned input evidence:
  - `architecture_shape_parameters.yaml` and/or `profile_parameters_resolved.yaml`
- Cite pattern definition evidence:
  - the candidate's `definition_path` (from the surface)

Citations format MUST match the spec templates:
- `(cite: <path>:<section or line range>)`

Reject the candidate if you cannot provide both pinned/derived evidence and pattern-definition evidence.

## Candidate emission contract

Emit candidates using the **Candidate record format (v1)** in the spec templates.

No ellipsis placeholders (ship rule):
- You MUST NOT emit placeholders like `...`, `[… 33 more ...]`, or similar truncation markers inside candidate blocks.

Bound the candidate set (token discipline; v1):
- Hard cap: emit **≤ 40** candidates total (system_spec_v1.md).
- Prefer fewer: target 18–28 seeds + graph expansion reserve slots, not a dump.
  - what you kept,
  - what you dropped,
  - and why.

Machine-readable evidence refs (ship rule):
- For every Evidence bullet where evidence_type==pinned_input, you MUST include: `pin_ref: <PIN_ID>=<PIN_VALUE>`
  - Source: `reference_architectures/<name>/spec/playbook/architecture_shape_parameters.yaml`
- For every Evidence bullet where evidence_type==derived_rails_or_posture, you MUST include: `rail_ref: <RAIL_KEY>=<RAIL_VALUE>`
  - Source: `reference_architectures/<name>/spec/guardrails/profile_parameters_resolved.yaml`
- For all other evidence types, include: `ref: none`

Format reminder (matches spec templates):
- `- <E#> [<evidence_type>] <short quote or paraphrase> (<machine_ref>; cite: <path>:<section or line range>)`

- In `system_spec_v1.md`, emit the master list.
- In `application_spec_v1.md`, emit only candidates where `plane ∈ {application, both}`.

## Retrieval diagnostics feedback packet (required on refusal)

If zero grounded candidates survive:

- Write: `reference_architectures/<name>/feedback_packets/BP-YYYYMMDD-pattern-retrieval-diagnostics.md`
- Include:
  - the retrieval context blob excerpt (what was used)
  - the top 15 ranked records considered
  - for the top 10 opened definitions, why grounding failed
  - recommended minimal clarifications to the pinned inputs (what to add/change)

Then replace both candidate blocks with:
- `- Refused: zero grounded candidates; see feedback packet BP-...`

## Merge-safe decision_resolutions scaffold refresh

Preferred path (token-saver; deterministic):

- If you used the grounded-candidate dump + apply helper, prefer running the retrieval postprocess chain (apply + scaffold hydration + gate):
  - `node tools/caf/retrieval_postprocess_v1.mjs <instance_name> --profile=<arch_scaffolding|solution_architecture>`

- Otherwise (merge/hydration only), run the scaffold merge helper and let it perform the merge + option hydration:
  - `node tools/caf/pattern_retrieval_scaffold_merge_v1.mjs <instance_name>`

If the helper cannot be invoked, FAIL-CLOSED with a feedback packet; do not attempt any in-band merge/hydration in-band.

After writing candidates:

- This skillpack requires the helper to perform merge-safe scaffold refresh + option hydration.
- If the helper cannot be invoked, FAIL-CLOSED with a feedback packet requesting the instruction-only skillpack (or restore the helper).
