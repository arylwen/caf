# Phase 8 — Compiler diagnostics (v1)

## Purpose

CAF is a compiler-like architect support tool. Alongside primary outputs (specs, designs, task graphs, candidate code), CAF MUST emit **diagnostic artifacts** that make its decisions auditable and its failures actionable.

This contract defines three **strict Markdown** diagnostics written under:

- `reference_architectures/<instance>/spec/guardrails/`

Diagnostics are required for:

- Grounding (evidence traceability)
- Relevance (selection support + omissions)
- Completeness (gates + obligations)

These diagnostics are intentionally **not schemas**. They are strict Markdown with required headings and minimal content rules.

## Diagnostics artifacts (required)

CAF MUST create/update these files:

- `reference_architectures/<instance>/spec/guardrails/grounding_ledger_v1.md`
- `reference_architectures/<instance>/spec/guardrails/relevance_report_v1.md`
- `reference_architectures/<instance>/spec/guardrails/completeness_report_v1.md`

### Producers

- `/caf arch` MUST (re)generate all three diagnostics.
- `/caf build` MUST update at least the completeness and relevance reports to reflect build outcomes (tasks executed, acceptance checks observed).

## Hard rules

Additional rule (derivation cascade contract):

- When `reference_architectures/<instance>/spec/guardrails/derivation_cascade_contract_v1.md` exists, diagnostics MUST treat it as the **single authoritative “what state am I in?”** source.
- Diagnostics MUST:
  - cite the contract for the pinned inputs (stage/phase/profile)
  - cite the contract for any “resolved view stale” determination (if reported)
  - prefer citing the contract over directly citing pins/resolved for state, unless the contract is missing or contradicted


Additional rule (pattern obligations → task coverage):

When `reference_architectures/<instance>/design/playbook/pattern_obligations_v1.yaml` exists, diagnostics MUST:

- list every obligation entry (obligation_id, obligation_kind, plane_scope, capability_id)
- link each obligation to the Task Graph task(s) that implement it by scanning `tasks[].trace_anchors[].pattern_id` for the exact token:
  - `pattern_obligation_id:<obligation_id>`
- treat any obligation as **missing** if no implementing task is found (fail-closed)

This coverage rule is semantic and replaces any “minimum task count” heuristics.

Additional rule (cross-plane contract materialization):

- When `reference_architectures/<instance>/design/playbook/contract_declarations_v1.yaml` exists, diagnostics MUST:
  - list each `contracts[]` entry with:
    - `boundary_id`
    - `materiality.is_material`
    - `contract_form`
    - `contract_ref.path` and `contract_ref.section_heading`
  - for each **material** cross-plane contract, link it to the Task Graph tasks:
    - `TG-00-CONTRACT-<BOUNDARY_ID>-<PLANE_ID>` (one per plane)
  - cite the contract source via `contract_ref` and include any extracted selections (e.g., `contract_surface`, tenant carrier) as evidence items.
  - treat a missing contract task for a material contract as a **completeness failure**.




1) **Fail-closed**
- If CAF cannot produce the diagnostics from authoritative artifacts, it MUST write a feedback packet and stop.
- CAF MUST NOT fabricate evidence, anchors, tasks, patterns, gates, or file existence.

2) **No placeholders**
- Diagnostics MUST NOT contain placeholder tokens such as `TBD`, `TODO`, `REPLACE_ME`, `FIXME`, `???`, `<...>`, `{{...}}`.
- If a section has no content, write a single bullet: `- (none)`.

3) **Trace anchors are required**
- Every grounded claim MUST reference at least one **evidence item** by ID.
- Every evidence item MUST cite a source path and a stable anchor (section heading, YAML key path, or a short quoted snippet).

4) **Strict headings**
- Each diagnostic must contain the required headings exactly as defined by its template.
- Do not add or rename top-level headings.


Additional rule (task completion evidence):

- For any task that materializes candidate code (including contract scaffolding and boundary scaffolding), CAF MUST require **Task completion evidence** in the generated artifact README(s).
- A “task completion evidence” section is present when the artifact contains the exact heading:
  - `## Task completion evidence`
- Under that heading, the artifact MUST include:
  - `### Claims` (1–5 bullets describing what was implemented)
  - `### Evidence anchors` (1+ bullets, each in the form `path:Lx-Ly` pointing to the code that supports a claim)
- Diagnostics MUST include a section that reports evidence coverage:
  - number of required artifacts checked
  - list of artifacts missing the evidence section (fail-closed)
- Until environment execution is supported, diagnostics MUST NOT attempt to execute code; evidence anchors are treated as semantic grounding cues.

## Evidence item format (shared)

Evidence items are referenced by ID:

- Evidence ID format: `E-<NNN>` where `<NNN>` is a zero-padded integer starting at `001`.

Each evidence item MUST include:

- `evidence_id`: `E-001`
- `type`: one of `pinned_input | derived_view | spec_text | design_text | task_graph | tbp | pbp | enforcement_bar | filesystem_check`
- `claim`: short paraphrase of what the evidence supports
- `cite`: `path#anchor` (preferred) OR `path:<section heading>`
- `excerpt`: a short excerpt (≤ 25 words) OR a concise YAML key path (e.g., `lifecycle.generation_phase`)

## Minimal source set (by phase)

Diagnostics must be grounded in what exists. Minimum sources by generation phase:

- `architecture_scaffolding`:
  - `guardrails/derivation_cascade_contract_v1.md` (authoritative state report; **materialized by caf-arch/caf-next**)
  - `playbook/architecture_shape_parameters.yaml`
  - `guardrails/profile_parameters.yaml`
  - `guardrails/profile_parameters_resolved.yaml`
  - Any generated specs if present

Note: Diagnostics generation MUST NOT fail solely because `guardrails/derivation_cascade_contract_v1.md` is initially missing. `caf arch` is responsible for materializing it in-run (see `skills/caf-arch/SKILL.md`).

- `implementation_scaffolding` and later:
  - All of the above, plus:
  - `spec/playbook/system_spec_v1.md` (if present)
  - `spec/playbook/application_spec_v1.md` (if present)
  - `design/playbook/application_design_v1.md` and `playbook/control_plane_design_v1.md` (if present)
  - `playbook/task_graph_v1.yaml` (required for build phases)
  - Referenced TBP/PBP manifests (as indicated by guardrails resolved view)
  - Candidate enforcement bar (library)

If a source is required for the current phase but missing, CAF MUST fail-closed.

## Templates

Producers MUST follow these templates:

- `architecture_library/phase_8/templates/diagnostics/grounding_ledger_v1.template.md`
- `architecture_library/phase_8/templates/diagnostics/relevance_report_v1.template.md`
- `architecture_library/phase_8/templates/diagnostics/completeness_report_v1.template.md`
