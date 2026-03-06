# Phase 8 Contract-First Framework (v1)

## Purpose

Provide Phase 8 **framework-level truths** so the crew can make guided decisions without CAF hardcoding architecture.
This document is **normative** for Phase 8.

Phase 8 is **contract-first**: boundary interactions must be explicit, verifiable, and justified.
CAF does not mandate a specific architecture, but it mandates that the architecture be expressed as contracts.

## Definitions

### Contract (CAF definition)

A **contract** is a boundary specification that is sufficient for downstream planning and implementation to proceed
without inventing semantics.

A contract MUST include:
- **Interface surface**: what crosses the boundary (events/commands/APIs/messages)
- **Required context** (where applicable): tenant context, correlation, auth context
- **Invariants**: assumptions and rules that must hold (ordering, delivery semantics, idempotency/replay expectations)
- **Acceptance checks**: verifiable conditions that can be tested or validated
- **Open questions**: any missing semantics must be recorded as questions, not invented

### Boundary (CAF definition)

A **boundary** is any interaction surface where independent responsibilities meet. Common boundaries include:
- control-plane ↔ application-plane (cross-plane boundary)
- async messaging boundary (publisher/subscriber, queue/bus)
- external integration boundary (third-party systems)
- storage boundary (persistence interface)

## Contract-first invariants (normative)

### CF-01 — Contracts are required for material boundaries

If a boundary is **material** to correctness, safety, governance, or lifecycle, the system design MUST define a contract for it.

Materiality indicators (non-exhaustive):
- multi-tenancy, tenant lifecycle management, policy enforcement, governance/audit posture
- async workflows, event-driven integration, background processing
- cross-service communication across deployment/runtime boundaries
- external integrations with reliability/security concerns

### CF-02 — Contracts must be expressed in allowed forms and declared

Contracts MUST be:
- expressed using one of the **Allowed Contract Forms** below, and
- declared via the **Contract Declarations Registry** (canonical YAML) with anchors and justification.

CAF does not mandate a single contract artifact file per boundary; instead it mandates that the chosen contract form be explicit and justified.

### CF-03 — Justification is required

For every declared contract, the design MUST include a short justification:
- why this contract form is appropriate, and
- why alternative forms are not chosen (briefly)

Justifications MUST be anchored to at least one of:
- a design decision checklist item
- a CAF/core/external pattern requirement
- a TBP requirement/binding (role-level, not vendor selection)
- a Layer 8 rail

### CF-04 — No invention to fill missing semantics

If semantics are missing, the responsible skill MUST record open questions and fail-closed.
The contract is the preferred place to record those questions because it is the interface between the crew and the human architect.

## Allowed Contract Forms (normative)

A contract MAY be expressed in one of these forms:

- **FORM_A_STANDALONE_DOC**: A dedicated contract document at a canonical path in Layer 6.
- **FORM_B_EMBEDDED_SECTION**: A dedicated, canonical section inside an existing design document, marked with CAF-managed blocks.
- **FORM_C_REGISTRY_REFERENCED**: A registry entry references a contract that lives elsewhere (doc + section), used when contracts are numerous.

All forms MUST provide the required contract elements defined above.

## Contract Declarations Registry (canonical)

The authoritative registry is:

- `reference_architectures/<name>/design/playbook/contract_declarations_v1.yaml`

This registry:

- enumerates material boundaries that have contracts
- identifies the chosen contract form and where to find it
- records anchors and justification so downstream planning can proceed deterministically

## Implications for planning and QA (normative)

- The Application Architect MUST attach anchors and acceptance checks to tasks.
- Plan QA MUST fail-closed if:
  - a material boundary exists without a contract declaration, or
  - a contract declaration exists but does not resolve to a valid contract in an allowed form, or
  - justification/anchors are missing.
