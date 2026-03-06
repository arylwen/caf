# TN-010 — CAF advancement roadmap (v1)

This note is the single reference for near-term CAF work to move from
“deterministic scaffolding” toward “model-made decisions inside guardrails”,
without destabilizing the Phase 8 state machine.

## North star

CAF is an **architect support tool**. The primary quality criteria are:

1) **Grounding** — outputs cite and use only on-disk authoritative sources.
2) **Relevance** — outputs target the current stage/phase and adopted patterns.
3) **Completeness** — produce all confidently-grounded required artifacts, and fail-closed otherwise.

Determinism is valuable only where it protects grounding and state evolution. We do **not** require
reproducibility across runs; an architect may re-run commands to explore alternatives.

## Non-negotiables (laws)

- **Fail-closed** is non-negotiable.
- **Skills stay generic**: they implement the derivation cascade; they do not embed architecture decisions.
- **Decisions live in the library** (patterns, TBPs, PBPs) via *declarations*, not bespoke skill logic.
- **No destructive git actions** in any runner shim or producer skill.
- **Adapters are shims only** (front matter allowed for discovery): see `TN-003`.

## Where decisions should live (target distribution)

### 1) Patterns (semantic intent)

Patterns own:

- trigger cues (what text signals the pattern might apply)
- promotions (what semantic inputs/anchors/bindings/placements the pattern contributes)

Patterns must not mandate filenames or paths.

### 2) TBPs (technology binding)

TBPs own:

- role bindings (role → path_template + artifact_class)
- enforcement hooks (acceptance checks; evidence hooks)
- any tech-specific constraints and required outputs

### 3) PBPs (plane binding / layout)

PBPs own:

- plane ids (e.g., CP/AP)
- required plane directories and shared layout rules

### 4) Skills (generic compiler / orchestrator)

Skills own:

- reading authoritative inputs (pins/spec/design/policy matrix)
- validating integrity + hygiene
- compiling declared semantics (pattern payload → task graph)
- dispatching worker tasks under rails and enforcement bars

## Roadmap checklist

### A) Retire prompt-pack assumptions (DONE in this archive)

Goal: remove dead concepts that confuse the loop.

- [x] Rewrite `TN-004` to remove prompt packs and clarify “library assets vs candidate outputs”.
- [x] Update backlog items that referenced packs/seed assets to current terms.
- [x] Update `drift-eval-caf` checks so they do not require a pack inventory.

Acceptance:

- No repo docs claim candidate code is emitted from “prompt packs”.
- `drift-eval-caf` shim rules match the repo’s actual adapter surface.

### B) Add strict debugging artifacts (spec first; implement next)

Goal: make grounding/relevance/completeness debuggable *without* reading long transcripts.

**Contract:** every producer run writes a small set of deterministic, machine-readable markdown reports
to the companion repo, under a single location.

Proposed location (derived from the policy matrix’s `companion_repo_target_template`):

- `<companion_repo_target>/caf/debug/`

Required reports (strict markdown; no placeholders; stable headings):

1) `grounding_report_v1.md`
   - inputs opened (paths)
   - key claims (with citations to paths/line ranges)
   - grounding failures (what could not be grounded)

2) `pattern_selection_report_v1.md`
   - cue matches (which cues matched which text snippets)
   - selected patterns (+source_path)
   - rejected candidates + why

3) `planning_payload_report_v1.md`
   - payloads read (both design docs)
   - merged result (deterministic merge rule)
   - any dropped fields (and why)

4) `task_graph_compile_report_v1.md`
   - task graph inputs added by promotions
   - trace anchors added
   - TBP evidence hooks compiled into acceptance checks

5) `build_execution_report_v1.md`
   - tasks executed (ids)
   - files written (paths)
   - enforcement bar checks run + pass/fail

**Important:** reports are additive observability; they must not change the state machine or derived rails.

Implementation notes:

- Reports are written by producer skills (`caf-arch`, `caf-next`, `caf-build`) and must obey allowed write paths.
- If a report cannot be written (path not allowed), fail-closed with a feedback packet.

### C) Move “decisions” into TBP/PBP declarations via `extensions.*` (no new schemas yet)

Goal: make the library the single place where decision points and gates are declared.

Approach:

- Do not introduce a new top-level schema yet.
- Add **optional** `extensions.*` sections to existing TBP/PBP manifests, with conservative semantics.

Allowed patterns (examples):

- `extensions.required_outputs` (list of required output globs/paths by role)
- `extensions.definition_of_done` (simple `file_contains` / `file_not_contains` style checks)
- `extensions.decisions` (declarations of “if you bind X, you must also declare Y”)

Producer skill behavior:

- If `extensions.*` exists, treat it as input to compilation.
- If it is missing, do nothing (backwards-safe).
- Skills must never invent `extensions.*` content.

### D) Start `caf-meta` as audit-only, then bounded backfills

Goal: use strong models at the **meta level** to reduce manual library maintenance, without letting
models rewrite CAF semantics or create uncontrolled schema sprawl.

#### D1) caf-meta (audit-only)

`caf-meta audit` produces reports only (no writes outside a scratch folder):

- inventory of schemas (YAML/MD contracts) and who uses them
- dead references (obsolete notes, unused schemas)
- pattern coverage gaps (trigger cues missing, promotions missing, TBP hooks missing)

Allowed write path:

- `technical_notes/caf_meta_reports/` (new folder)

Must run (and fail-closed if any fail):

- `drift-eval-caf`
- placeholder scan rules
- schema validations that already exist (where applicable)

#### D2) caf-meta (bounded backfills)

After audit-only stabilizes, allow caf-meta to propose **patch plans** (not direct edits) for:

- missing trigger cue table rows
- missing L0 promotions stubs
- missing `extensions.definition_of_done` stubs derived from TBP evidence hooks

Rules:

- Proposals must be emitted as copy/pasteable patches (one file per patch).
- Proposals must cite exact source paths used to justify each change.
- No new schema versions without an explicit human decision.

### E) Sweep `skills_portable/` for instruction-only compliance (planned)

Goal: keep the portable skillpack strictly **instruction-only**, while ensuring it stays aligned with the canonical `skills/` implementations.

Scope:

- Inventory portable skills and flag any drift: missing steps, stale commands, or references to repo-internal scripts/paths that portable users won’t have.
- Enforce a simple rule: portable docs may describe the `/caf` command surface, but must not depend on running repo-local scripts (e.g., `node tools/...`) or require non-portable files.
- Produce a deterministic sweep report (no edits):
  - `technical_notes/caf_meta_reports/skills_portable_sweep_v1.md`

Acceptance:

- Every `skills_portable/**` item is runnable as instructions without requiring any repo-local script execution.
- Any gaps vs `skills/` are listed as concrete, bounded follow-up tasks (file + section + proposed minimal text change).

## Obsolete content cleanup policy

When a technical note or library doc is obsolete:

- Prefer rewriting in place (stable file ids), adding an explicit “previous behavior (deprecated)” section.
- If retiring entirely, leave a short stub that points to the new authoritative doc.

## Context window strategy (pattern selection at scale)

As the pattern library grows, we cannot open full definitions for every pattern.

Selection strategy:

1) Use **cue tables** to shortlist pattern IDs (small, cheap context).
2) Open only the top-K selected definitions to attempt grounding (K bounded; e.g., 25–40).
3) If grounding fails, widen K deterministically, but preserve diversity (caf/core/external).

This keeps the “semantic match surface” small while still allowing strong models to reason
deeply on the selected definitions.

## What “good” looks like (near-term)

Within the guardrails, we should be able to:

- run `/caf saas hello-saas` → `/caf arch hello-saas` → `/caf next hello-saas apply=true` → `/caf build hello-saas`
- get non-empty AP and CP outputs *when CP is declared present by PBP/placements*
- debug any failure by reading only the `caf/debug/*.md` reports

---

References:

- `TN-003_runner_adapters_shims_only_v1.md`
- `TN-004_seed_assets_vs_candidate_generation.md`
- `TN-009_generic_derivation_cascade_v1.md`

## Deferred: format inventory audit (YAML/JSON/TSV)

As CAF iterates, periodically audit all on-disk structured formats (YAML/JSON/TSV) for redundancy and necessity.

Rules:
- Do not introduce a new format solely for convenience.
- Prefer consolidating or deleting derived views once a stable authoritative source exists.
- Perform this audit via `caf-meta` (library-only) and record findings as Markdown reports.
