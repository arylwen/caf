# Phase 8 Plane Integration Contract Guidance (v1)

## Purpose

Guidance for expressing **control-plane ↔ application-plane** integration as an explicit contract,
without hardcoding a single mandatory artifact. The chosen contract form MUST be declared in the
Contract Declarations Registry.

This guidance focuses on:

- events/commands exchanged between planes (semantic contract, not vendor tech)
- required context propagation (tenant context, correlation, auth context)
- invariants and acceptance checks (idempotency expectations, replay safety, failure semantics)
- how to record open questions (fail-closed)

## Contract-first requirement (normative)

If the control-plane ↔ application-plane boundary is **material** (correctness, safety, governance, lifecycle),
then a plane integration contract MUST exist in an **allowed contract form** and MUST be declared in:

- `reference_architectures/<name>/design/playbook/contract_declarations_v1.yaml`

CAF does not mandate where the contract lives, only that it is explicit, verifiable, and justified.

## Allowed forms (summary)

- Standalone contract doc in Layer 6 (FORM_A_STANDALONE_DOC)
- Dedicated embedded section in a design doc (FORM_B_EMBEDDED_SECTION)
- Registry entry referencing a contract elsewhere (FORM_C_REGISTRY_REFERENCED)

## Minimum contract contents (normative)

A plane integration contract MUST include:

- Interface surface (events/commands/APIs/messages)
- Required context: tenant context, correlation, auth context (where applicable)
- Invariants: delivery/ordering/idempotency/replay expectations
- Acceptance checks: verifiable conditions
- Open questions: record missing semantics instead of inventing

## Plan QA expectations (normative)

Plan QA MUST fail-closed if:

- the boundary is material but there is no contract declaration, or
- the declaration does not resolve to a valid contract in an allowed form, or
- anchors/justification are missing.

## Architect in-place approvals for embedded plane integration contracts

**Library-owned option sets (normative):**

- Where the embedded contract includes `options`, those options MUST be sourced from CAF library patterns (`caf.option_sets`) when available.
- Avoid hardcoding canonical option lists in skills or per-reference-architecture files; treat patterns as the single source of truth.

When expressing a CP↔AP plane integration contract as an embedded section (FORM_B) inside a design document,
include architect-editable blocks to capture required human signals in-place:

- `ARCHITECT_EDIT_BLOCK: plane_integration_contract_choices_v1` (YAML options with `status: adopt|reject|defer`; adopted option payload is the binding answer)
- `ARCHITECT_EDIT_BLOCK: plane_integration_contract_open_questions_v1` (YAML questions expressed as option sets; same `status` mechanic; no copy/paste)

The designer may provide a proposed baseline in a `DESIGNER_MANAGED_BLOCK: plane_integration_contract_v1`, but must not overwrite architect edits.

## Runtime shapes (planning precondition; normative)

Planning requires CP/AP runtime shape selections to be explicit and machine-readable.
When the CP↔AP boundary is material (or when `/caf plan` is expected to run), the embedded
choices block MUST include:

- `choices.cp_runtime_shape` (exactly one `status: adopt`)
- `choices.ap_runtime_shape` (exactly one `status: adopt`)

CAF treats these as planning inputs that gate runtime scaffold task materialization.

Canonical schema reference:

- `architecture_library/phase_8/86_phase_8_plane_integration_contract_choices_schema_v1.yaml`
