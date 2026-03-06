# CAF Layer 1 Pattern Catalog

## Purpose

Provide the index of CAF Layer 1, stack-independent architecture patterns.

Layer 1 patterns define module roles, dependency rules, assembly contracts, evidence hooks, and structural validations. They are intended to be instantiated by the Application Architect and converted into PLAN.md step blocks.

## Scope

This catalog contains only stack-independent patterns. Stack-dependent bindings are handled as Layer 2 overlays and are out of scope for this catalog.

## Core set v1

The following patterns are the initial core set. Each entry links conceptually to a pattern file under architecture_library/patterns/core_v1/patterns/.

- CMP-01: Composition Root and Layered Boundaries
- CTX-01: Request Context and Propagation
- SVC-01: Application Service Facade Boundary
- POL-01: Policy Enforcement Boundary
- CFG-01: Configuration Boundary
- PST-01: Persistence Boundary via Repositories
- INT-01: External Integration Adapter Boundary
- VAL-01: Validation and Error Handling Boundary
- OBS-01: Observability Boundary

## Pattern selection principles

- Select the minimum set of patterns required to express explicit commitments in the spec and design documents.
- Prefer patterns that are structurally verifiable.
- If a required commitment cannot be expressed using available patterns, fail-closed and emit a feedback packet requesting a new pattern or a Layer 2 overlay binding.

For the deterministic selection workflow (coverage mapping, precedence, and when to add Layer 2 overlays), see [pattern_selection_guidance_v1.md](pattern_selection_guidance_v1.md).

## Version History

- v1: Initial catalog (core set v1).
