# Phase 7 — Reference Implementation Structure & Derivation Contract

## Purpose

This document defines the **structure, constraints, and derivation contract** for all Phase 7 reference implementations in the Contura Architecture Library.

Phase 7 exists to provide **illustrative, non-normative examples** of how to derive from **Parameterized Architecture Templates (Phase 6)** without inventing architecture, weakening constraints, or selecting implementation technologies.

This document establishes the **only allowed shape** of Phase 7 artifacts.

---

## Position in the Architecture Library

Phase 7 is:

- Downstream of:
  - CAF
  - Phase 1 governance specifications
  - Phase 2 pattern libraries
  - Phase 3 validation guides
  - Phase 4 ADR standards
  - Phase 6 parameterized architecture templates

- Upstream of:
  - Phase 8 implementation profiles
  - Companion repositories
  - Code, IaC, CI/CD, prompts, or runtime artifacts

Phase 7 **does not introduce new architectural truth**.
It demonstrates correct derivation from existing truth.

---

## What Phase 7 Is

Phase 7 produces **reference implementations** that are:

- Non-normative
- Illustrative only
- Replaceable
- Fully derived from Phase 6 templates

Reference implementations exist to answer:

> “What does a *fully pinned*, *template-compliant* architecture look like before implementation begins?”

---

## What Phase 7 Is Not

Phase 7 does **not**:

- Choose cloud providers
- Select programming languages
- Define infrastructure
- Provide code or IaC
- Optimize performance or cost
- Contain prompts or agent instructions
- Introduce new patterns or invariants

Any such content belongs to **Phase 8 or later**.

---

## Derivation Contract (Normative for Phase 7)

All Phase 7 reference implementations MUST satisfy the following rules.

### 1. Template Declaration Requirement

Each reference implementation MUST explicitly declare:

- The Phase 6 template(s) it instantiates
- The exact version of each template

No implicit or assumed template usage is allowed.

---

### 2. Explicit Parameter Pinning

All parameters exposed by each instantiated template MUST be:

- Explicitly listed
- Explicitly pinned to an allowed value

Defaults, inference, or omission are forbidden.

If a required architectural choice cannot be expressed as a template parameter, the reference implementation MUST stop and surface the gap.

---

### 3. No Architectural Invention

Reference implementations:

- MAY select among exposed parameters
- MUST NOT introduce new architectural structures
- MUST NOT redefine boundaries, responsibilities, or invariants

Anything not representable via Phase 6 templates is out of scope.

---

### 4. ADR Production Constraint

Only ADRs **required by template instantiation** may be produced.

ADR content MUST:

- Capture pinned parameter decisions
- Reference applicable governance documents
- Reference applicable validation checklist IDs

No exploratory, speculative, or forward-looking ADRs are permitted.

---

### 5. Validation Mapping Requirement

Each reference implementation MUST include an explicit mapping from:

- Architecture shape parameters
  → Pattern guides
  → Validation checklist IDs

Validation mapping is **conceptual only** and does not include evidence or runtime proof.

---

## Canonical Phase 7 Directory Structure

Each reference implementation MUST conform to the following directory structure.

```ascii

reference_implementations/
  
  <reference_name>/
  
    README.md
  
    pinned_templates/
      architecture_shape_parameters.yaml
  
    adrs/
      adr_index.md
      adr_*.md
  
    validation_mapping/
      validation_mapping.md

No additional directories are allowed at Phase 7.

```

---

## Artifact Descriptions

### README.md

Explains:

- What this reference implementation illustrates
- Which templates are instantiated
- Why this example was chosen (intentionally boring, low variance)
- Explicit non-goals

---

### architecture_shape_parameters.yaml

Contains:

- Template identifiers and versions
- Exhaustive parameter list
- Explicit pinned values

This file is declarative and non-executable.

---

### adrs/

Contains only ADRs required by template rules, including (where applicable):

- Tenancy Readiness ADR
- Agent Identity ADR instantiation
- Any other template-mandated ADRs

---

### validation_mapping.md

Provides a table mapping:

- Architecture shape parameters
- Relevant pattern sections
- Validation checklist IDs
- Expected evidence type (conceptual only)

No implementation proof is included.

---

## Reference Implementation Boundary

Reference implementations:

- Are illustrative, not authoritative
- May become outdated
- May be replaced without architectural impact
- Do not define best practices

Architectural truth remains exclusively upstream.

---

## Phase 7 Completion Criteria

Phase 7 is considered complete when:

- At least one reference implementation exists
- All parameters are fully pinned
- Required ADRs are produced
- Validation mappings are explicit
- No implementation detail has leaked in

Only then may Phase 8 begin.

---

## Summary

Phase 7 provides **proof of disciplined derivation**, not construction guidance.

It exists to demonstrate that:

- Phase 6 templates are sufficient
- Architectural choices can be fully pinned
- ADRs and validation emerge mechanically
- No invention is required to move forward safely

This contract is the foundation upon which all Phase 7 artifacts depend.
