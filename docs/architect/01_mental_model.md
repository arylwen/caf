# Mental model: what CAF is doing

CAF is a **fail-closed derivation system**: it only advances when required inputs exist and contracts are satisfied.

## The three architect questions (what CAF is optimized to answer)

1) **What architecture decisions did we make, and why?**
- CAF answer surface: decision visibility (`/caf ask ...` → intent: `decision_visibility`)

2) **For this product / architecture intent, how big is the work?**
- CAF answer surface: work visibility (`/caf ask ...` → intent: `work_visibility`)

3) **If we change X, what features / architectural intent does it impact?**
- CAF answer surface: impact assessment (`/caf ask ...` → intent: `impact_assessment`)

These map to a deterministic “ask context pack” that includes the smallest set of artifacts needed to answer the question.

## Core traceability chain

1. **Pins** (explicit intent)
2. **Patterns** (candidate decisions; adopted/deferred/rejected)
3. **Obligations** (required deliverables implied by adopted patterns)
4. **Capabilities** (types of work that must occur to satisfy obligations)
5. **Tasks** (ordered execution units; mechanically validated)
6. **Artifacts** (spec/design/playbook/diagnostics/candidate code)

## Fail-closed behavior

CAF does not “fill gaps” silently. When a required input is missing or ambiguous, it emits a **feedback packet** describing the next fix needed to continue.

## Deterministic vs semantic steps

- **Semantic** steps are allowed to interpret text (e.g., pattern retrieval/ranking).
- **Deterministic** steps validate contracts, enforce invariants, and gate progression.

This split is the main drift-resistance mechanism.

## Where the key evidence lives (instance layout)

Canonical instance layout:

- `reference_architectures/<instance>/spec/`
  - `playbook/` — specs, pins, retrieval context blobs
  - `guardrails/` — resolved profile parameters (optional)
  - `caf_meta/` — CAF-generated diagnostic artifacts (including `ask_context_v1.md`)
- `reference_architectures/<instance>/design/`
  - `playbook/` — task graph + obligations + backlog
  - `caf_meta/` — CAF-generated diagnostic artifacts (including `ask_context_v1.md`)
- `reference_architectures/<instance>/feedback_packets/`

See: [`05_traceability_chain_and_data_model.md`](05_traceability_chain_and_data_model.md)
