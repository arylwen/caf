# Implementation Profile Template (v1)

## Status

Draft — Structure only.  
No implementation profiles may be generated from this template
until it is accepted and versioned.

## Purpose

This document defines the **canonical structure** for
**Phase 8 Implementation Profiles**.

An Implementation Profile captures a **bounded realization path**
for a **single Phase 6 template instantiation**, without introducing
architectural authority.

Implementation Profiles are:

- downstream of Phase 6 Parameterized Architecture Templates
- downstream of Phase 7 reference implementations
- upstream of tooling, generators, and delivery systems

They are **non-normative** and **replaceable**.

---

## Applicability

This template applies to:

- Phase 8 work only
- Exactly one bound Phase 7 reference implementation
- Exactly one pinned Phase 6 template instantiation (or a declared set)

Profiles that are not explicitly bound are invalid.

---

## 1. Profile Identity

Each Implementation Profile MUST declare:

- **Profile Name**
- **Profile Version**
- **Status:** Draft | Active | Deprecated
- **Owning Reference Implementation**
- **Date Created**
- **Last Updated**

No implicit versioning is permitted.

---

## 2. Binding Context (Hard Gate)

Each profile MUST explicitly bind to:

- Phase 6 Parameterized Architecture Template(s)
  - template name(s)
  - template version(s)
- Phase 7 reference implementation identifier
- Phase 7 Exit Declaration
- Phase 8 Lifecycle Declaration

If any binding input is missing or ambiguous,
profile instantiation MUST fail.

---

## 3. Authority Boundary Statement (Mandatory)

Each profile MUST include the following statement verbatim
(or a stricter equivalent):

> This Implementation Profile does not define, modify, or reinterpret
> architectural truth.
>
> All architectural authority remains upstream in:
>
> - the Contura Architecture Framework (CAF)
> - Phase 6 Parameterized Architecture Templates
> - associated governance and validation documents
>
> This profile is illustrative, non-authoritative, and replaceable.

Profiles lacking an explicit authority boundary are invalid.

---

## 4. Declared Parameter Surface (Structure Only)

This section defines **what may vary at implementation time**.

### Rules

- Parameters MUST be:
  - explicit
  - finite
  - value-required (no defaults)
- Parameters MUST NOT:
  - introduce architectural behavior
  - select vendors or technologies
  - weaken governance constraints

### Required Parameter Categories

Each profile MUST declare values for the following categories
(or explicitly mark them as **Not Applicable**, with justification):

- **Deployment Substrate Class**
- **Execution Environment Model**
- **Packaging and Release Model**
- **Configuration and Secret Injection Model**
- **Observability Wiring Pattern**
- **CI / Delivery Integration Shape**
- **Operational Responsibility Model**

Only categories are declared here.
Allowed values are defined in profile instantiations, not in this template.

---

## 5. Inherited Invariants (Non-Negotiable)

Each profile MUST explicitly reaffirm inheritance of all upstream invariants,
including (but not limited to):

- CAF principles and pillars
- Control / Application / Data Plane separation
- Multi-tenancy invariants and validation rules
- Explicit tenant context binding and propagation
- Agent identity and delegation rules
- AI Safety Gate enforcement
- Cost governance and runtime enforcement
- Compliance automation and evidence requirements
- Observability and evaluation obligations

Profiles MUST NOT restate or reinterpret these invariants.
They are referenced, not redefined.

---

## 6. Required Evidence Artifacts

Each profile MUST declare what evidence is expected when it is instantiated.

At minimum, this includes:

- Required ADRs (e.g. tenancy readiness, agent identity applicability)
- Required validation mappings
- Expected runtime evidence classes:
  - logs
  - traces
  - metrics
  - cost signals
  - audit events

Evidence expectations MUST be declarative and verifiable.

---

## 7. Refusal Conditions (Fail-Closed)

Each profile MUST define explicit refusal conditions, including:

- missing parameter values
- conflicting parameter selections
- attempts to infer defaults
- attempts to introduce architectural structure
- attempts to bypass governance, safety, tenancy, or cost enforcement

When refusal occurs:

- tooling MUST stop
- agents MUST refuse
- a structured refusal reason MUST be emitted

Silent fallback behavior is forbidden.

---

## 8. Profile Instantiation Rules

An Implementation Profile MAY be instantiated only if:

- Phase 8 lifecycle has been declared
- All bindings are explicit and valid
- All required parameters are supplied
- All refusal conditions are satisfied
- Required evidence artifacts are declared

Instantiation without these conditions is invalid.

---

## 9. Versioning and Deprecation

- Any structural change to this template requires a new version
- Existing profiles MUST reference the exact template version used
- Deprecated profiles remain readable but MUST NOT be extended

Silent mutation is forbidden.

---

## 10. Non-Goals (Explicit)

This template does NOT:

- recommend technologies or vendors
- define stacks or reference architectures
- authorize code generation
- replace ADRs
- relax architectural or governance constraints

Any attempt to use this template for those purposes is invalid.

---
