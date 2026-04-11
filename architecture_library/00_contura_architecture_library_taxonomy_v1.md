# Contura Architecture Library — Taxonomy (v1)

See also: `architecture_library/patterns/caf_meta_v1/` for CAF framework meta-patterns (not target-system domain patterns).

This document defines the **canonical structure, authority boundaries, and reading order** of the Contura Architecture Library.

---

## Why This Library Exists

The Contura Architecture Library exists to support **intentional system design** in environments where automation, scale, and safety matter.

The Contura Architecture Framework (CAF) defines architectural intent.
Validation is the mechanism that enforces that intent and enables safe automation.

This library:

- Defines architectural intent, boundaries, and invariants
- Makes assumptions and trade-offs explicit
- Prevents accidental or opportunistic architectural drift
- Enables automation without permitting invention

This is **not** a step-by-step construction guide.
It is a structured architectural record that downstream systems, tools, and teams can rely on safely.

---

## Type Legend

- **Normative** — Defines mandatory architectural requirements  
- **Informative** — Provides explanation or examples only  
- **Executable (Meta)** — Machine-consumed, enforceable artifacts  
- **Internal** — Authoring, review, or quality-control aids only  

Document type indicates authority:  
**Normative defines truth; Informative explains; Executable enforces; Internal governs authoring.**

---

## Conceptual Layers

The Contura Architecture Library is organized into **six conceptual layers**.
Each layer answers exactly one question and defines a clear **authority boundary**.

This section summarizes the library by intent and responsibility.
For canonical numbering, precedence, and enforcement semantics, see the **Artifact Index** below.

---

### 1. Orientation & Reading Aids  

**Question:** What is this library, and how do I read it?  
**Authority:** Explanatory only. No architectural intent.

- `00_contura_architecture_library_taxonomy_v1.md`
- `01_contura_architecture_how_to_read_this_library_v1.md`
- `02_contura_document_output_standards_v2.md`
- `04_contura_architecture_glossary_v1.md`
- `06_contura_architecture_library_roadmap_v1.md`

---

### 2. Foundational Architectural Intent  

**Question:** What kind of system is this, and what must always be true?  
**Authority:** Defines architectural identity and invariants.

- `03_contura_architecture_framework_v1.md`
- `05_contura_saas_architecture_commitment_v1.md`

---

### 3. Governance & Evaluators — Normative Constraints  

**Question:** What rules govern safety, cost, compliance, and behavior?  
**Authority:** Mandatory constraints. No guidance.

- `10_contura_ai_safety_gate_specification_v1.md`
- `11_contura_ai_observability_and_evaluation_specification_v1.md`
- `12_contura_cost_governance_finops_v1.md`
- `13_contura_compliance_automation_framework_v1.md`

---

### 4. Structural Shape Space  

**Question:** What architectural shapes are allowed or forbidden?  
**Authority:** Permitted and forbidden structural forms.

- `20_contura_control_application_data_plane_pattern_guide_v1.md`
- `21_contura_multi_tenancy_patterns_v1.md`
- `22_contura_policy_engine_architecture_guide_v1.md`
- `23_contura_data_governance_and_data_quality_standards_v1.md`
- `24_contura_control_plane_domain_constraints_v1.md`

---

### 5. Validation & Enforcement  

**Question:** How is architectural intent checked and enforced?  
**Authority:** Evaluates conformance. Does not define intent.

- `30_contura_multi_tenancy_validation_guide_v1.md`
- `31_contura_multi_tenancy_validation_user_guide_v1.md`
- `32_contura_multi_tenancy_incident_classification_v1.md`
- `60_executable_architecture_overview_v1.md`
- `61–63` executable validation artifacts

---

### 6. Construction (Constrained)  

**Question:** How do systems get built without redefining architectural truth?  
**Authority:** Downstream realization only.

- `70_contura_reference_implementation_structure_and_derivation_contract_v1.md`
- `phase_8/*` implementation profiles and companion artifacts

---

## Artifact Index (Canonical)

Lower-numbered documents take precedence unless explicitly stated otherwise.

---

## Foundations (00–09) — Orientation & Foundational Architectural Intent

| File Name | Title | Type | Description |
| --------- | ------ | ---- | ----------- |
| `00_contura_architecture_library_taxonomy_v1.md` | Architecture Library Taxonomy | Normative | Canonical structure, scope, and precedence rules. |
| `01_contura_architecture_how_to_read_this_library_v1.md` | How to Read This Architecture Library | Informative | Conceptual mental model and reading guidance. |
| `02_contura_document_output_standards_v2.md` | Document Output Standards | Normative | Formatting, structure, versioning, publication rules. |
| `03_contura_architecture_framework_v1.md` | Contura Architecture Framework (CAF) | Normative | Core principles, views, and lifecycle stages. |
| `04_contura_architecture_glossary_v1.md` | Architecture Glossary | Normative | Authoritative terminology and disallowed meanings. |
| `05_contura_saas_architecture_commitment_v1.md` | SaaS Architecture Commitment | Normative | Architectural identity and invariants. |
| `06_contura_architecture_library_roadmap_v1.md` | Architecture Library Roadmap | Normative | Dependency order and phased evolution. |

---

## Governance & Evaluators (10–19) — Normative Constraints

| File Name | Title | Type | Description |
| --------- | ------ | ---- | ----------- |
| `10_contura_ai_safety_gate_specification.md` | AI Safety Gate Specification | Normative | Risk classes and lifecycle enforcement. |
| `11_contura_ai_observability_and_evaluation_specification_v1.md` | AI Observability & Evaluation | Normative | Telemetry, scoring, drift detection. |
| `12_contura_cost_governance_finops_v1.md` | Cost Governance / FinOps | Normative | Budgets and cost enforcement. |
| `13_contura_compliance_automation_framework_v1.md` | Compliance Automation Framework | Normative | Compliance as enforceable controls. |
| `16_contura_target_system_invariant_catalog_v1.yaml` | Target-System Invariant Catalog | Executable | Machine-readable catalog of architect-facing target-system invariants. |
| `17_contura_caf_operational_invariant_catalog_v1.yaml` | CAF Operational Invariant Catalog | Executable | Machine-readable catalog of carry-through and enforcement invariants. |
| `18_contura_invariant_taxonomy_v1.yaml` | Invariant Taxonomy | Executable | Machine-readable row model and audit taxonomy for invariant catalogs. |

---

## Core Pattern Guides (20–29) — Structural Shape Space

| File Name | Title | Type | Description |
| --------- | ------ | ---- | ----------- |
| `20_contura_control_application_data_plane_pattern_guide_v1.md` | Control/Application/Data Plane | Normative | Tri-plane responsibilities. |
| `21_contura_multi_tenancy_patterns_v1.md` | Multi-Tenancy Patterns | Normative | Tenant invariants and isolation. |
| `22_contura_policy_engine_architecture_guide_v1.md` | Policy Engine Architecture | Normative | Policy modeling and enforcement. |
| `23_contura_data_governance_and_data_quality_standards_v1.md` | Data Governance & Quality | Normative | Data quality and retention. |
| `24_contura_control_plane_domain_constraints_v1.md` | Control Plane Domain Constraints | Normative | Domain-scoped constraints for Control Plane authority and responsibility boundaries. |

---

## Validation & Operations (30–39) — Validation & Enforcement

| File Name | Title | Type | Description |
| --------- | ------ | ---- | ----------- |
| `30_contura_multi_tenancy_validation_guide_v1.md` | Multi-Tenancy Validation Guide | Normative | Checklist validation rules. |
| `31_contura_multi_tenancy_validation_user_guide_v1.md` | Validation User Guide | Informative | Application examples. |
| `32_contura_multi_tenancy_incident_classification_v1.md` | Incident Classification | Normative | Failure classes and severity. |

---

## Architectural Decision Records (40–59) — Evidence & Decisions

| File Name | Title | Type | Description |
| --------- | ------ | ---- | ----------- |
| `40_contura_adr_standard_v1.md` | ADR Standard | Normative | ADR structure and lifecycle. |
| `41_agent_identity_pattern_adr.md` | ADR: Agent Identity Pattern | Normative | Agent identity enforcement. |
| `42_adr_tenancy_readiness_template_v1.md` | ADR: Tenancy Readiness Template | Normative | Validation-backed ADRs. |
| `43_adr_terminology_conformance_checklist_v1.md` | ADR Terminology Checklist | Internal | Terminology alignment. |
| `44_adr_terminology_linter_rules_v1.md` | ADR Terminology Linter | Internal | Automated checks. |
| `45_contura_library_coherence_audit_checklist_v1.md` | Library Coherence Audit | Internal | Cross-document consistency. |

---

## Meta — Executable Architecture Layer (60–79) — Validation Automation

| File Name | Title | Type | Description |
| --------- | ------ | ---- | ----------- |
| `60_executable_architecture_overview_v1.md` | Executable Architecture Overview | Executable | CI and enforcement integration. |
| `61_contura_multi_tenancy_validation_schema_v1.yaml` | Validation Schema | Executable | Checklist schema. |
| `62_contura_multi_tenancy_validation_checks_v1.json` | Validation Checks | Executable | Concrete checks. |
| `63_contura_multi_tenancy_policy_rules_v1.yaml` | Policy Rules | Executable | Enforceable rules. |
| `70_contura_reference_implementation_structure_and_derivation_contract_v1.md` | Reference Implementation Contract | Normative | Derivation rules. |

---

## Phase 8 — Implementation Profiles & Companion Artifacts — Construction (Constrained)

Within Phase 8, `profile_parameters.yaml` is the **single canonical architect-authored instance input**.
All other Phase 8 instance inputs are either assistant-derived views or deprecated older formats.

Phase 8 binding families are cleanly separated:

- **ABP** — architecture style / implementation shape (plane-neutral)
- **PBP** — plane mapping of ABP roles
- **TBP** — technology realization of already-resolved style + plane choices


| File Name | Title | Type | Description |
| --------- | ------ | ---- | ----------- |
| `phase_8/82_phase_8_directory_and_naming_conventions_v1.md` | Implementation Profiles Overview | Informative | Phase scope. |
| `phase_8/81_phase_8_implementation_profile_template_v1.md` | Implementation Profile Template | Normative | Profile definition. |
| `phase_8/82_phase_8_directory_and_naming_conventions_v1.md` | Directory & Naming Conventions | Normative | Structure rules. |
| `phase_8/84_phase_8_manual_delivery_backlog_v1.md` | Manual Delivery Backlog | Informative | Human-managed steps. |
| `phase_8/profiles/*` | Implementation Profiles | Normative | Parameterized realizations. |
| `phase_8/stack_profile_proposals/*` | Stack Profile Proposals | Informative | Non-binding proposals. |

---

## Internal — Authoring & Review (90–99) — Library Governance

| File Name | Title | Type | Description |
| --------- | ------ | ---- | ----------- |
| `90_multi_tenancy_patterns_evaluation_and_completeness_checklist_v1.md` | Evaluation Checklist | Internal | Pattern quality control. |

---

## Notes

- Transient or exploratory files MUST NOT be treated as architecture artifacts.
- Documents marked **Normative** define architectural requirements.
- **Executable (Meta)** artifacts are consumed by CI, agents, or Safety Gates.
- **Internal** artifacts are never referenced by enforcement tooling.

---

## Version History

v1 — Taxonomy with layered conceptual projection and canonical artifact index.

- `architecture_library/patterns/caf_meta_v1/`: CAF framework meta-patterns and checklists.
