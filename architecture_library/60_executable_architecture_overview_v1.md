# Contura Executable Architecture Overview v1

Version: v1  
Status: Draft  
Last Updated: 2025-12-15

## Purpose

This document defines how Contura architecture documents become enforceable, machine-consumable constraints.

It explains how:

- Normative documents (frameworks, governance, pattern guides) produce enforceable requirements
- ADRs capture decisions plus required evidence
- Validation schemas, check catalogs, and policy rules enable CI gates and agent automation
- Safety Gates and evaluation loops connect runtime behavior back to architecture constraints

This document is the top-level bridge between “written architecture” and “enforced architecture”.

## Upstream Documents

This document is governed by, and must remain aligned with:

- 02_contura_document_output_standards_v2.md
- 03_contura_architecture_framework_v1.md
- 06_contura_architecture_library_roadmap_v1.md
- 10_contura_ai_safety_gate_specification.md
- 11_contura_ai_observability_and_evaluation_specification_v1.md
- 12_contura_cost_governance_finops_v1.md
- 13_contura_compliance_automation_framework_v1.md
- 20_contura_control_application_data_plane_pattern_guide_v1.md
- 21_contura_multi_tenancy_patterns_v1.md
- 22_contura_policy_engine_architecture_guide_v1.md
- 23_contura_data_governance_and_data_quality_standards_v1.md
- 30_contura_multi_tenancy_validation_guide_v1.md
- 40_contura_adr_standard_v1.md
- 42_adr_tenancy_readiness_template_v1.md
- 61_contura_multi_tenancy_validation_schema_v1.yaml
- 62_contura_multi_tenancy_validation_checks_v1.json
- 63_contura_multi_tenancy_policy_rules_v1.yaml

Where this document is ambiguous, upstream documents prevail.

## Scope

In scope:

- The “document to enforcement” chain: requirements → checks → gates → evidence
- How agents and CI use executable artifacts
- Where enforcement occurs across control/application/data planes
- Minimum conventions for mapping normative requirements to check IDs

Out of scope:

- Vendor-specific CI implementation details
- Source-code-level reference implementations for every language
- Full domain architecture frameworks (Phase 3)

## Key Definitions

Executable Architecture

A set of artifacts that allow architectural requirements to be evaluated automatically, repeatedly, and consistently.

Evidence

A verifiable proof artifact demonstrating a requirement is satisfied. Examples include tests, static analysis outputs, configuration snapshots, dashboards, or incident playbook links.

Gate

A decision point that blocks or allows a change or execution based on evaluation outcomes (CI gates, runtime Safety Gates, compliance gates).

## Why Executable Architecture Exists

Written architecture alone is insufficient for:

- Multi-tenancy safety (cross-tenant incidents are often caused by small implementation slips)
- AI safety (agents can create new action paths and blast radius behaviors)
- Cost governance (spend grows invisibly without enforcement)
- Compliance (manual controls do not scale)

Contura requires architecture that can be checked.

## The Contura Enforcement Chain

Plain-text flow:

Normative requirements (CAF, governance, patterns)
→ ADR decision(s) and scope declaration
→ Canonical checklist IDs
→ Executable artifacts (schema, checks catalog, policy rules)
→ CI evaluation (pre-merge, pre-deploy)
→ Runtime gates (Safety Gates, policy enforcement, quota enforcement)
→ Telemetry and audits (observability spec)
→ Incidents mapped back to checklist IDs (incident classification)
→ Updates to docs, checks, policies, and ADRs

## Artifact Types and Roles

## Normative Documents

Normative documents define mandatory requirements:

- Frameworks and governance specs define evaluation rules and constitutional constraints
- Pattern guides define reusable architectures and forbidden anti-patterns
- Validation guides define checklists and IDs that requirements map onto

Normative documents must use stable terminology and must be traceable to enforcement via IDs.

## ADRs

ADRs are the canonical vehicle for decisions plus evidence.

Every ADR affecting tenancy, identity, AI behavior, cost, compliance, or cross-plane boundaries must include:

- Explicit scope (system/service/component)
- Affected plane(s) (control/application/data)
- Referenced checklists and policy rules
- Evidence links sufficient for reviewers and CI to validate claims

Tenancy readiness ADRs embed checklist evidence tables.

## Executable (Meta) Artifacts

The executable layer converts requirements into machine-readable structures:

- Validation Schema (defines allowed structure and IDs)
- Validation Checks Catalog (concrete checks, severities, enforceability stage)
- Policy Rules (runtime-enforceable rules derived from patterns and checks)

These artifacts are consumed by CI, evaluation agents, and enforcement systems.

## Internal Artifacts

Internal artifacts (rubrics, completeness checklists) improve authoring quality but must not be relied on by enforcement tooling unless explicitly promoted to Executable (Meta).

## Enforcement Locations Across Planes

The same requirement often needs multiple enforcement points.

## Control Plane

Typical enforcement responsibilities:

- Define policies, entitlements, and configurations
- Version and distribute policy rules
- Define Safety Gate configurations and risk class mappings
- Own tenancy lifecycle state and identity issuance rules

Control plane enforcement is primarily declarative and evaluative.

## Application Plane

Typical enforcement responsibilities:

- Bind and propagate Tenant Context at runtime
- Enforce authorization and policy decisions in workflows and tool invocation
- Ensure agent execution obeys autonomy bounds, recursion limits, and approval policies
- Emit required telemetry and trace linkages

Application plane is where “behavior happens”, so it is a primary enforcement surface.

## Data Plane

Typical enforcement responsibilities:

- Enforce tenant isolation in storage and retrieval
- Enforce governance constraints (retention, lineage, access)
- Support tenancy-aware observability storage and querying
- Provide safe inference, retrieval filtering, and auditable access controls

Data plane must fail closed on tenancy scope violations.

## Mapping Requirements to Checks

To be executable, normative requirements must be mapped to stable check IDs.

Rules:

1. Every checklist item must have a stable ID.
2. Checks must declare enforceability stage(s):
   - Authoring-time (documentation completeness)
   - Build-time (static analysis, unit tests)
   - Deploy-time (config validation)
   - Runtime (policy enforcement, Safety Gates)
   - Post-execution (evaluation jobs, audits)
3. “Not applicable” requires explicit justification and expiry if it is a waiver.
4. Violations must map to operational severity for incident response.

## CI and Agent Workflows

## CI Gate Types

Minimum CI gates implied by the library:

- Document conformance gate (formatting, naming, structure)
- Tenancy readiness gate (checklist coverage + evidence presence)
- Policy rule validation gate (schema validity, rule compilation)
- Safety gate configuration validation (risk taxonomy completeness)
- Observability readiness gate (required telemetry fields and traces declared)
- Cost governance gate (quota/metering wiring present for relevant components)

## Agent Responsibilities

Agents used for code generation or review must:

- Treat the taxonomy as the canonical doc index
- Use executable artifacts as source of truth for checks and required evidence
- Refuse to “invent” requirements, IDs, policies, or components not grounded in the library
- Produce evidence artifacts alongside code changes when required by checks

## Minimum Evidence Bundle

For a component to be considered “tenancy-safe” and “agent-ready”, the minimum evidence bundle includes:

- A scoped ADR or ADR section referencing the relevant checklist IDs
- Automated tests or static checks demonstrating tenant context binding and propagation
- Proof of tenant-scoped authorization and data access enforcement
- Proof of tenant-scoped telemetry fields and correlation IDs
- Proof of metering attribution where relevant
- Links to dashboards or query recipes for audit and incident triage

## Operational Feedback Loop

Architecture enforcement must improve over time.

When a failure occurs:

- Classify it against checklist IDs
- Identify which enforcement stage failed to catch it
- Add or strengthen checks, policy rules, and evidence requirements
- Update relevant normative docs if ambiguity allowed the failure

## Non-Goals and Anti-Patterns

The executable layer must not become:

- A second architecture framework that contradicts CAF
- A vendor-specific cookbook embedded into core documents
- A loose “best practices” list without stable IDs and enforceability definitions

Anti-patterns:

- Requirements without IDs
- IDs without enforceable checks
- Checks that cannot produce or reference evidence
- Runtime gates without telemetry and audit outputs
- ADRs that claim compliance without evidence links

## Next Documents Enabled by This Overview

This document unblocks Phase 3 domain frameworks by defining how they must be enforceable.

Per the roadmap, the next domain framework should be:

- CSCP-AF — Contura SaaS Control Plane Architecture Framework
- CSAP-AF — Contura SaaS Application Plane Architecture Framework

## Version History

v1 — Initial draft defining the Contura executable architecture chain, artifact roles, enforcement locations across planes, mapping rules from requirements to checks, CI and agent responsibilities, and the operational feedback loop.
