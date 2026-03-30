# Phase 8 Human Signal Blocks Contract (v2)

## Purpose



> Reference: CAF meta-patterns playbook and checklist live in `architecture_library/patterns/caf_meta_v1/`.

Standardize how CAF captures **human signals** (approvals, resolutions, answered open questions, waivers) with **minimal friction** and **maximum traceability**, without requiring separate “approval files”.

This contract defines:
- what a “human signal” is,
- where it must live (`ARCHITECT_EDIT_BLOCK`),
- how CAF may prepopulate it (without overwriting human edits),
- how downstream steps MUST consume it (spec → design → plan → build).

This document is **normative** for Phase 8.

---

## Definitions

### CAF-managed block

A section delimited by:

- `<!-- CAF_MANAGED_BLOCK: <id> START -->` … `END`

CAF may rewrite these blocks on reruns. Humans MUST NOT rely on manual edits inside them.

### Designer-managed block

A section delimited by:

- `<!-- DESIGNER_MANAGED_BLOCK: <id> START -->` … `END`

The producing designer (agent/skill) owns these blocks and may regenerate them deterministically.  
Humans SHOULD NOT rely on manual edits inside them unless a workflow explicitly requests it.

### Architect-edit block (Human Signal block)

A section delimited by:

- `<!-- ARCHITECT_EDIT_BLOCK: <id> START -->` … `END`

This is the only approved location for **human-authored** and **human-approved** information that must carry across reruns.

CAF MUST preserve the contents of these blocks exactly, subject to the merge rules below.

### Human signal

Any explicit human decision that changes downstream derivations, including:
- approval/adoption/rejection of CAF-proposed decision candidates
- resolving open questions (by adopting an option, or deferring with explicit “not applicable”)
- governance/risk posture acceptances
- waivers/exceptions to otherwise-default invariants

If a downstream step needs a human decision, it MUST be represented as a Human Signal inside an `ARCHITECT_EDIT_BLOCK`.

---

## Invariants (HS)

### HS-01 — Human signals MUST live in ARCHITECT_EDIT_BLOCKs

Any artifact that requires human input MUST provide an `ARCHITECT_EDIT_BLOCK` to carry that signal.

CAF MUST NOT require a separate YAML file solely for human approvals/resolutions.

### HS-02 — CAF may prepopulate, but MUST NOT overwrite human edits

CAF MAY prepopulate Human Signal blocks to reduce friction, but it MUST follow these merge rules:

- CAF MAY insert a default scaffold when the block is empty.
- CAF MAY append new items that are clearly marked as “unresolved/default.”
- CAF MAY upgrade a previously generated default scaffold to a newer low-friction scaffold **only if** the block is still identical to the prior default scaffold and contains no human edits (e.g., all statuses unresolved and all payloads empty).
- CAF MUST NOT delete, reorder, or rewrite human-provided values once the human has edited them.
- CAF MUST NOT “clean up” or normalize human text beyond whitespace trimming at the edges.

### HS-03 — Candidate proposals and human resolutions MUST be linked by stable IDs

When CAF proposes a decision candidate in a CAF-managed candidate list (e.g. `caf_decision_pattern_candidates_v1`), it MUST assign a stable **evidence hook id** (`H-...`).

Human resolutions MUST reference those hook IDs, so downstream artifacts can trace:
candidate → resolution → design implication.

### HS-04 — Downstream derivations MUST consume only human-resolved “adopt” items

For any hop that requires binding choices (e.g., specs → design), the producer MUST:

- treat `adopt` as binding input
- treat `defer` as an open question carried forward
- treat `reject` as non-driving (recordable in trace, but must not drive design)

If a gated hop requires human signals that are missing, the producer MUST fail-closed with a feedback packet.

---

### HS-05 — Human-facing docs MUST present questions (with embedded options), not standalone option-set inventories

In human-facing artifacts (spec/design/contract docs), CAF MUST emit **questions** as the unit of interaction.  
Each question MAY embed an option list, but that list MUST be **hydrated from a library-owned `caf.option_sets` entry** referenced by the question template.

Normative constraints:
- Human-facing docs MUST NOT include a standalone `option_sets:` inventory section.
- Skills/templates MUST NOT hardcode option lists or question inventories.
- If a warranted question cannot be hydrated because the referenced option set or question template is missing, the producer MUST fail-closed with a feedback packet describing the missing library surface.

---

## Canonical human-signal block: decision approvals/resolutions

### Canonical location (Phase 8)

System spec is canonical for cross-system and cross-plane approvals:

- `reference_architectures/<name>/spec/playbook/system_spec_v1.md`

It MUST contain:

- `<!-- ARCHITECT_EDIT_BLOCK: decision_resolutions_v1 START -->` … `END`

Application spec MAY optionally include local approvals, but MUST NOT conflict with system spec (system spec wins).

### Block schema (v1)

`decision_resolutions_v1` captures approvals/rejections of CAF-proposed candidates (pattern-level).

```yaml
schema_version: decision_resolutions_v1
decisions:
  - evidence_hook_id: H-<...>
    pattern_id: CAF-<...>
    status: adopt | defer | reject

    # Legitimacy anchors (required; min 1). CAF may prepopulate from the originating candidate evidence;
    # the architect may edit/replace them.
    anchors:
      - anchor_type: caf_pattern_requirement
        anchor_id: CAF-<...>
        anchor_path: architecture_library/patterns/caf_v1/definitions_v1/CAF-<...>.yaml
      - anchor_type: guardrail_ref
        anchor_id: <optional rail id>
        anchor_path: reference_architectures/<name>/spec/guardrails/profile_parameters_resolved.yaml

    rationale: "<short grounded justification (may cite candidate evidence)>"
    resolved_values: {}
```

### Invariants (DR)

- **DR-01:** `evidence_hook_id` MUST be unique within the block.
- **DR-02:** `pattern_id` MUST match the candidate referenced by `evidence_hook_id`.
- **DR-03:** Producers MUST treat only `status: adopt` as driving input for downstream derivation.
- **DR-04:** Producers MUST preserve human edits; they MAY only append new unseen candidates.

### Invariants (OQ)

- **OQ-01:** For each `question_id`, there MUST be **exactly one** option with `status: adopt` once the question is considered “resolved” for a gated hop.
- **OQ-02:** The adopted option MUST be “complete enough” for the hop:
  - required payload fields MUST be present and non-empty (where required)
  - if a required field is unknown, the architect MUST keep the option as `defer` (do not guess)
- **OQ-03:** Downstream consumption:
  - treat the adopted option’s payload as the resolved answer
  - ignore `defer`/`reject` options for derivation (but keep them for traceability)

### Fail-closed rule

If a downstream hop requires a resolved open question and:
- 0 options are `adopt`, or
- more than 1 option is `adopt`, or
- the adopted option is missing required payload fields,

then the producer MUST fail-closed and write a feedback packet pointing to:
- file path
- block id
- `question_id`
- the required missing fields (by name)

---

## Canonical human-signal block: application-design carried-forward open questions

Canonical location:

- `reference_architectures/<name>/design/playbook/application_design_v1.md`
- `<!-- ARCHITECT_EDIT_BLOCK: open_questions_v1 START -->` … `END`

Purpose:

- carry forward unresolved **application-plane design questions** in a compact, planning-visible form;
- keep those questions in a library-owned human-signal shape instead of leaving the structure to skill-local convention;
- avoid forcing `/caf plan` or downstream workers to rediscover unresolved design semantics from surrounding prose.

Canonical block shape (new output):

```yaml
schema_version: open_questions_v1
questions: {}
```

Where `questions` is a **topic-keyed mapping**. Each topic entry SHOULD use this shape:

```yaml
<topic_key>:
  question_id: "<stable question id>"
  question: "<human-readable question>"
  options:
    - option_id: <stable option id>
      status: adopt | defer | reject
      summary: "<optional concise summary>"
      payload: {}
  anchors: []
```

Normative constraints:

- New CAF output for this block MUST use `schema_version: open_questions_v1`; older `version: 1` scaffolds are compatibility-only and MUST NOT be treated as the new canonical output shape.
- New CAF output for this block MUST use a **mapping** under `questions`, not a top-level list.
- Topic keys are a merge/locality aid; downstream logic MUST key on `question_id`, not on map order.

Pattern-backed advisory interpretation (non-blocking):

- When a carried-forward question is anchored to a library-owned pattern (for example via `caf_pattern`), advisory/reporting tooling SHOULD read the referenced pattern definition directly for:
  - `summary` / `intent` (what capability is being postponed),
  - `problem` / `consequences` / `forces_tradeoffs` (what risk/trade-off remains visible while deferred), and
  - `human_questions` / `option_sets` (the library-owned follow-on option inventory if the pattern is later adopted).
- Do **not** add a seam-local YAML mapping file just to restate deferred-pattern warnings or allowed follow-on options when the pattern definition already owns that information.
- Options use the same human-signal semantics as other choice/open-question blocks: exactly one `status: adopt` only when the question is resolved for a gated hop; otherwise leave all options unresolved/deferred.

Current promotion posture:

- This block is **not yet** promoted to a dedicated fail-closed later-design handoff boundary.
- First establish a bounded downstream consumer and a deterministic validator path. Until then, treat the block as a library-owned design-handoff surface whose shape must stay stable, but whose absence/resolution state is not yet a standalone `/caf plan` preflight rule.
- CAF MAY surface a non-empty block through an **advisory-only** checker so planning/build operators can see which `question_id` values remain carried forward, but advisory visibility does not change blocker posture.

---

## Library-owned inventories for decisions and open questions

To avoid “solving the architecture in the skill,” **skills MUST NOT predeclare canonical decision inventories** (decision IDs/topics/questions) purely because a template exists.

Instead:

- **Patterns own option sets** (and, when needed, question/decision templates) in:
  - `architecture_library/patterns/caf_v1/definitions_v1/*.yaml`
- Producers **derive what to ask** from **grounded applicability**:
  1) Adopted patterns (from `system_spec_v1.md` / `application_spec_v1.md` decision resolutions)
  2) Instance scope evidence (e.g., resources actually present in the spec)
  3) Dedicated contract sections already present in the document (avoid duplication)

### Normative rule

- A producer MAY emit a decision/question block **only when warranted**, and MUST anchor it to:
  - `caf_pattern: <PATTERN_ID>`
  - the originating `option_set_id` (library-owned)

### Fallback

If no grounded question template exists but a human signal is required to proceed, emit a **single question** with a single `custom` option (empty payload) and fail-closed downstream until the library is extended or the architect provides a complete custom answer.


## Canonical human-signal block: choice sets (same friction-minimizing pattern)

Some domains prefer “choices” blocks (e.g., plane integration contracts). These are the same mechanic as open questions:
- a small set of options
- architect flips `status: adopt`
- adopted option payload becomes binding input



**Library-owned option sets (normative):**
- Canonical option lists MUST be **sourced from the CAF library**, not hardcoded in skills.
- Preferred source: `architecture_library/patterns/caf_v1/definitions_v1/<PATTERN>.yaml` under `caf.option_sets`.
- Option `summary` text MUST be **neutral** (no “recommended”) unless the recommendation is backed by explicit, cited evidence in the same artifact.

CAF MAY represent them as a dedicated block id (e.g., `plane_integration_contract_choices_v1`) for readability,
but the consumption and fail-closed invariants MUST match OQ-01..OQ-03.

---

## Validation and fail-closed behavior

### During architecture_scaffolding

- Candidate proposals may exist with all resolutions set to `defer` (allowed).
- Open questions may exist unresolved (expected).

### During implementation_scaffolding (specs → design)

- If required human signals for the hop are missing (e.g., required `ARCHITECT_EDIT_BLOCK`s missing or invalid YAML),
  the system MUST fail-closed and write a feedback packet.

### During pre_production / production_hardening

- Additional required signals MAY be introduced by enforcement bar / rails / TBPs.
- If required signals are missing, fail-closed with a feedback packet.
