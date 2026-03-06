# 07_contura_parameterized_architecture_templates_v1.md

Version: v1  
Status: Draft  
Type: Phase 2 / Meta (Parameterized, Non-Opinionated)

---

## Note on File Numbering and Authority

This document is the **authoritative definition of Parameterized Architecture
Templates** within the Contura Architecture Framework (CAF).

The `07_` filename prefix is **intentional** and **does not encode phase or
procedural ordering**.

Rationale:

- File numbering in the Contura Architecture Library reflects
  **library taxonomy and stability**, not lifecycle or execution phases.
- Architectural authority is defined explicitly via CAF meta-artifacts,
  including `_meta/contura_phase_index_v1.yaml`.
- This document serves as a **foundational anchor** reused by multiple
  downstream CAF layers and therefore resides in the early, stable portion
  of the library.

Consumers (human or automated) MUST NOT infer semantic meaning from filename prefixes alone.

---

## Purpose

This document defines **Parameterized Architecture Templates** for Contura.

These templates are **not reference implementations** and **do not prescribe concrete technologies**.
They define **structured degrees of freedom** that allow humans and agents to generate architectures that are **provably compatible** with the Contura Architecture Library.

This document exists to bridge:

- Contura as an intentional architecture framework (CAF, governance, patterns, validation-as-enforcement), and
- The need for **architecture generation** by humans and agents without violating architectural truth.

---

## What This Document Is

This document provides:

- Parameterized templates that expose **explicit architectural choices**
- Allowed value sets and constraints for those choices
- Required outputs and artifacts per template
- Mappings from template outputs to:
  - CAF principles
  - Governance specifications
  - Pattern guides
  - Validation checklists
  - ADR requirements

Templates describe **how architectures may be generated**, not **what architectures should look like**.

---

## What This Document Is Not

This document does NOT contain:

- Best practices
- Recommended cloud providers or services
- Reference architectures
- Concrete service selections
- Code, IaC, or deployment instructions
- Performance or cost optimizations

All opinionated guidance belongs **downstream** in reference implementations.

---

## Position in the Architecture Library

Parameterized Architecture Templates are:

- Downstream of:
  - CAF
  - Governance specifications (AI Safety, Observability, FinOps, Compliance)
  - Core Pattern Guides (tri-plane, multi-tenancy, policy, data governance)
  - Validation Guides and executable checks
- Upstream of:
  - Reference implementations
  - Product- or system-specific architecture specs
  - Code, IaC, and operational tooling

Templates **cannot redefine truth**.
They only expose **choices already permitted** by upstream documents.

---

## Template Instantiation as the Only Sanctioned Derivation Path

This document defines the **only sanctioned mechanism** by which Contura architecture may derive from architectural truth into buildable intent.

Any architecture, system specification, reference implementation, or generated code that claims compatibility with the Contura Architecture Library **MUST** be derived from one or more explicitly instantiated **Parameterized Architecture Templates** defined in this document.

The following rules are **normative**:

1. **Template Declaration Requirement**  
   Any downstream artifact (architecture specification, reference implementation, or generated code) MUST explicitly declare:
   - which parameterized template(s) it instantiates
   - the version of each template

2. **Explicit Parameter Pinning**  
   All parameters exposed by an instantiated template MUST be explicitly pinned to allowed values.  
   Implicit defaults, inferred choices, or undeclared parameters are forbidden.

3. **No Architectural Invention**  
   Humans and agents:
   - MAY select among exposed parameters
   - MUST NOT invent architectural structures, boundaries, or responsibilities outside the declared template(s)

   Any architectural element not representable as a template parameter is non-compliant.

4. **ADR Production Requirement**  
   Each template instantiation MUST produce one or more Architectural Decision Records (ADRs) that:
   - capture the chosen parameter values
   - justify those choices
   - reference applicable governance documents
   - reference applicable validation checklist IDs

5. **Validation Mapping Requirement**  
   Each instantiation MUST include an explicit mapping from:
   - template → pattern guides
   - pattern guides → validation guides and checklist IDs

6. **Agent Execution Constraints**  
   Automated agents generating architecture, specifications, or code:
   - MUST fail if required parameters are missing
   - MUST fail if a requested structure cannot be expressed via available templates
   - MUST treat template parameters as authoritative architectural input

7. **Reference Implementation Boundary**  
   Reference implementations are:
   - illustrative
   - non-authoritative
   - replaceable

   A reference implementation MUST:
   - declare which template(s) it instantiates
   - list all pinned parameters
   - reference produced ADRs
   - list applicable validation checklist IDs

   Reference implementations MUST NOT redefine architectural truth, introduce new invariants, or expand the permitted shape space.

Parameterized Architecture Templates are therefore the **only sanctioned derivation path** from Contura architectural truth into construction-oriented artifacts. Any artifact not traceable to a template instantiation is architecturally invalid.

---

## Initial Parameterized Architecture Template Set (v1)

This section enumerates the **initial, minimum viable set of Parameterized Architecture Templates** defined by this document.

These templates collectively span the full architectural shape space required to derive from Contura architectural truth into buildable intent **without redefining invariants, governance, or validation rules**.

This enumeration is **normative**.

No architecture, system specification, reference implementation, or generated code may claim Contura compatibility unless it instantiates one or more templates from this set (or a future, explicitly added template).

---

### 1. SaaS Control Plane Architecture Template

#### **CP Intent**

Define the architectural shape of the Contura **Control Plane**, responsible for governance, intent, policy, lifecycle orchestration, and system-wide configuration.

#### **CP Scope**

- Tenant lifecycle management
- Identity, policy, and entitlement governance
- AI Safety Gate orchestration
- Cost, compliance, and observability aggregation
- Cross-plane orchestration (without tenant workflow execution)

This template constrains *what the Control Plane is allowed to be*, not how it is implemented.

---

### 2. SaaS Application Plane Architecture Template

#### **AP Intent**

Define the architectural shape of the **Application Plane**, where tenant-facing business workflows and AI-assisted execution occur under Control Plane constraints.

#### **AP Scope**

- Tenant-scoped workflow execution
- Agent orchestration under policy
- API and product surface execution
- Runtime policy enforcement
- Tenant context propagation into the Data Plane

This template defines the execution surface that realizes governance intent.

---

### 3. Data Plane Architecture Template

#### **DP Intent**

Define the architectural shape of the **Data Plane**, responsible for storage, processing, retrieval, inference execution, and enforcement of data-level governance.

#### **DP Scope**

- Tenant-scoped data storage and retrieval
- Data isolation and partitioning strategies
- Retention, deletion, and lifecycle enforcement
- Model inference and embedding execution
- Emission of immutable audit and observability artifacts

This template constrains how data and computation may be hosted and accessed.

---

### 4. AI / Agent Execution Architecture Template

#### **AI / Agent Intent**

Define the architectural shape of **AI and agent execution** within Contura systems.

#### **AI / Agent Scope**

- Agent identity and authority boundaries
- Tool invocation constraints
- Retrieval, memory, and context usage
- Safety Gate integration points
- Cost, observability, and evaluation hooks

This template governs *how autonomous or semi-autonomous execution is permitted* under Contura invariants.

---

### 5. Multi-Tenant Data Storage Architecture Template

#### **DSA Intent**

Define the architectural shape of **multi-tenant data storage and isolation**, independent of specific storage technologies.

#### **DSA Scope**

- Tenant isolation models (logical, physical, hybrid)
- Partitioning and placement strategies
- Tenant migration and lifecycle considerations
- Cross-tenant failure prevention
- Validation and incident classification alignment

This template constrains how tenant data may be co-located, isolated, or evolved over time.

---

## Template Set Completeness Statement

In v1, the following five templates are fully specified with complete parameter surfaces; additional templates listed are declared but not yet expanded.

This initial template set is intentionally minimal.

Together, these templates:

- Cover all three architectural planes
- Isolate AI/agent behavior as a first-class concern
- Isolate multi-tenancy as a first-class concern
- Provide sufficient structure to support:
  - ADR generation
  - validation mapping
  - agent-constrained architecture and code generation

Additional templates MAY be introduced only if:

- the architectural intent cannot be expressed via parameterization of an existing template, and
- the addition is explicitly justified and reviewed against CAF and governance specifications.

Until such justification exists, **this template set defines the complete sanctioned derivation surface**.

---

## Architectural vs Implementation Responsibility Boundary

Contura explicitly separates **architecture definition** from **implementation realization**.

This document belongs to the **architecture library** and therefore operates at the level of
**shape space, constraints, and parameterized choice surfaces**.

In Contura terms:

- **Architecture library**  
  = *shape space + constraints + parameterized templates*

- **Reference implementations**  
  = *paved roads + pinned choices + code*

The architecture library defines:

- what architectural shapes are allowed or forbidden
- which choices are legitimate
- which invariants must always hold
- how compliance is validated

It does **not** define:

- concrete technologies
- preferred cloud services
- implementation recipes
- optimization strategies

Reference implementations exist downstream to demonstrate
**one valid traversal** of the permitted shape space by:

- pinning template parameters
- selecting concrete technologies
- providing code and infrastructure artifacts

This separation is intentional.

Architecture remains **truth-defining and evaluative**.  
Reference implementations remain **illustrative and replaceable**.

Parameterized Architecture Templates are the **only sanctioned bridge**
between these two layers.

---

## Conceptual Model

Each template defines:

1. **Intent**
   - What kind of system or subsystem is being described

2. **Parameters**
   - Explicit architectural choices that must be supplied
   - Each parameter has:
     - Allowed values
     - Constraints
     - Architectural consequences

3. **Invariants**
   - Conditions that MUST hold regardless of parameter values
   - Derived directly from CAF and governance documents

4. **Required Artifacts**
   - What must be produced for the architecture to be valid:
     - ADRs
     - Diagrams
     - Validation mappings
     - Evidence placeholders

5. **Validation Mapping**
   - Which validation guides and checklist IDs apply
   - Where enforcement must occur (Control / Application / Data Plane)

---

## Template Structure (Normative)

Each parameterized template MUST follow this structure:

1. Template Name and Scope  
2. Architectural Intent  
3. Exposed Parameters  
4. Fixed Invariants  
5. Required Outputs  
6. Validation and Enforcement Mapping  
7. ADR Integration Requirements  

Templates that deviate from this structure are invalid.

---

## Parameter Quality Checklist (Normative)

This checklist is a **mandatory authoring gate** for all parameters defined in
Parameterized Architecture Templates.

Its purpose is to prevent **accidental architectural invention** and ensure that
templates expose **only permitted architectural choices** already defined by
upstream Contura documents.

A proposed parameter is **invalid** if it fails any mandatory check.

This checklist applies equally to:

- human authors
- automated agents
- template reviewers

---

### A. Authority & Provenance (Hard Gate)

#### **PQ-A1 — Upstream Authority Exists**

- [ ] The parameter maps to an explicit concept in one or more upstream documents:
  - CAF
  - Governance specifications
  - Core Pattern Guides
- [ ] The upstream document(s) are explicitly cited

**FAIL if:**  
The parameter exists only because “a choice seems necessary”.

---

#### **PQ-A2 — No New Architectural Capability Introduced**

- [ ] The parameter does not enable a system shape otherwise forbidden
- [ ] All allowed values are already permitted by upstream documents

**FAIL if:**  
The parameter creates new architectural affordances.

---

### B. Boundedness & Explicitness

#### **PQ-B1 — Finite, Explicit Value Set**

- [ ] Allowed values are enumerated or structurally bounded
- [ ] No free-text, “custom”, or “other” values exist

**FAIL if:**  
Instantiation requires invention.

---

#### **PQ-B2 — No Implicit Defaults**

- [ ] All values must be explicitly chosen
- [ ] No value is implied as recommended or typical

**FAIL if:**  
Omission still yields a valid-looking architecture.

---

### C. Semantic Purity

#### **PQ-C1 — Architectural, Not Implementation-Level**

- [ ] The parameter controls architectural shape, authority, or responsibility
- [ ] The parameter does not select:
  - cloud providers
  - services
  - databases
  - frameworks
  - libraries
  - vendors

**FAIL if:**  
The parameter smells like a technology choice.

---

#### **PQ-C2 — Single Decision Axis**

- [ ] The parameter controls exactly one architectural dimension
- [ ] Changing its value does not implicitly change unrelated concerns

**FAIL if:**  
Multiple decisions are bundled into one parameter.

---

### D. Invariant Preservation

#### **PQ-D1 — Invariants Are Preserved for All Values**

- [ ] No allowed value weakens:
  - tenant isolation
  - explicit identity
  - safety gate enforcement
  - cost governance
  - control/application/data plane separation

**FAIL if:**  
One value is “convenient but unsafe”.

---

#### **PQ-D2 — Fail-Closed Compatibility**

- [ ] Missing or conflicting values cause instantiation failure
- [ ] No silent fallback behavior exists

**FAIL if:**  
Ambiguity is tolerated.

---

### E. Validation & Enforcement Traceability

#### **PQ-E1 — Validation Mapping Exists**

- [ ] The parameter maps to one or more validation checklist IDs or policy rules
- [ ] Enforcement plane(s) are identified

**FAIL if:**  
The parameter cannot be validated.

---

#### **PQ-E2 — Evidence Expectations Are Clear**

- [ ] Instantiating this parameter implies concrete evidence
- [ ] Evidence type is describable (ADR, test, config, telemetry, audit)

**FAIL if:**  
Compliance cannot be proven.

---

### F. Agent Safety

#### **PQ-F1 — Agent-Instantiable Without Reasoning Leap**

- [ ] An agent can select a value without inventing semantics
- [ ] Consequences of each value are explicit

**FAIL if:**  
The agent must infer intent.

---

#### **PQ-F2 — Explicit Refusal Conditions Exist**

- [ ] It is clear when an agent must refuse instantiation
- [ ] Conflicting or missing values result in failure, not guessing

**FAIL if:**  
The agent can “muddle through”.

---

### Checklist Outcome

A parameter MAY be included in a template **only if all mandatory checks pass**.

Parameters failing any check MUST be:

- revised, or
- removed, or
- escalated as a proposal to modify upstream architectural documents.

---

## Required Outputs from Template Instantiation

The following section restates template-level requirements for emphasis; no additional outputs are introduced.

Any instantiation of a parameterized template MUST produce:

- One or more ADRs capturing chosen parameters and rationale
- At least one architecture diagram (view-dependent)
- A validation mapping table:
  - Template → Pattern Guides
  - Pattern Guides → Validation Checklists
- A declaration of enforcement points per plane

Instantiation without these outputs is non-compliant.

---

## SaaS Control Plane Architecture Template (v1)

### 1. CP Template Identity and Scope

**Template Name:** SaaS Control Plane Architecture Template  
**Version:** v1  
**Applies To:**  

- System-level or platform-level Control Plane designs  
- Control Plane subsystems within a larger Contura-compatible architecture  

**Architectural Scope:**

This template constrains the **architectural shape, authority boundaries, and responsibilities**
of the **Control Plane** in a Contura-compatible SaaS system.

It governs **intent definition, governance, and evaluation**, not tenant workflow execution.

---

### 2. CP Architectural Intent

The Control Plane is the **authoritative plane for governance and intent**.

This template exists to ensure that any Control Plane design:

- defines *what is allowed*, not *what is executed*
- governs identity, tenancy, policy, safety, cost, and compliance
- evaluates and validates architectural and governance artifacts
- orchestrates enforcement across planes without directly performing tenant work
- remains auditable, deterministic, and enforceable

This template does **not** define:

- user-facing product features
- tenant business workflows
- runtime request handling
- data storage or inference execution
- application-plane orchestration logic

---

### 3. CP Exposed Architectural Parameters

All parameters defined below are **mandatory**.
No defaults exist.
Instantiation MUST explicitly select a value for each parameter.

Each parameter has been validated against the **Parameter Quality Checklist**.

---

#### CP-1: Control Plane Authority Model

**Intent:**  
Define how the Control Plane expresses and evaluates authoritative intent.

**Allowed Values:**

- **Declarative Only**  
  Control Plane expresses intent exclusively via declarative artifacts
  (policies, configurations, desired state).

- **Declarative + Evaluative**  
  Control Plane expresses intent declaratively and performs **definition-time
  and configuration-time evaluation** of governance artifacts
  (e.g., policy validation, Safety Gate definition validation, completeness checks).

**Constraints:**

- Control Plane MUST NOT perform per-request or per-invocation runtime evaluation
  of tenant actions.
- Evaluative responsibility is limited to:
  - schema and completeness validation
  - version approval and rollout gating
  - risk taxonomy and rule-set validation
- Runtime evaluation authority resides downstream and MUST reference
  Control Plane–issued versions.

**Upstream Sources:**  
CAF v1; Control/Application/Data Plane Pattern Guide; Policy Engine Architecture Guide

---

#### CP-2: Tenant Lifecycle Authority

**Intent:**  
Define the Control Plane’s role in tenant lifecycle management.

**Allowed Values:**

- **Authoritative Lifecycle Owner**  
  Control Plane is the system of record for tenant creation, state transitions,
  suspension, and termination.

- **Delegated Lifecycle Authority**  
  Control Plane defines lifecycle rules and validations, while execution of lifecycle
  actions occurs in downstream planes under Control Plane governance.

**Constraints:**

- Tenant identity and lifecycle state MUST originate from Control Plane authority.
- Lifecycle transitions MUST be policy-governed, auditable, and version-attributed.
- Tenant lifecycle transitions MUST define required effects on:
  - tenant memberships and entitlements
  - tenant-scoped credentials, tokens, and keys
- Execution MUST fail closed when tenant state is non-operational.

**Upstream Sources:**  
Multi-Tenancy Patterns Guide; CAF v1

---

#### CP-3: Identity and Principal Governance Scope

**Intent:**  
Define the scope of identity governance owned by the Control Plane.

**Allowed Values:**

- **Human and Service Identity Governance**  
  Control Plane governs identity lifecycle and registration for
  human users and non-agent services.

- **Human, Service, and Agent Identity Governance**  
  Control Plane governs identity lifecycle and registration for
  all principals, including AI agents.

**Constraints:**

- Identity MAY be global; **authority is never global**.
- Tenant membership and entitlement are distinct from identity.
- Authority MUST be derived per invocation from:
  tenant context + policy + membership.
- Tenant lifecycle transitions MUST explicitly affect
  tenant-scoped memberships and authority artifacts for all principals,
  including agents.
- Agent identity governance MUST integrate with Safety Gate requirements.

**Upstream Sources:**  
CAF v1; Agent Identity ADR; AI Safety Gate Specification

---

#### CP-4: Policy Definition and Distribution Model

**Intent:**  
Define how policies are authored, versioned, and distributed.

**Allowed Values:**

- **Centralized Policy Authoring**  
  Policies are authored and versioned exclusively within the Control Plane.

- **Federated Policy Authoring with Central Governance**  
  Policies may be authored in multiple subsystems but are validated,
  versioned, and distributed by the Control Plane.

**Constraints:**

- Policy semantics MUST be deterministic and versioned.
- Runtime enforcement MUST reference Control Plane–issued policy versions.
- Policy distribution MUST be auditable and reproducible.

**Upstream Sources:**  
Policy Engine Architecture Guide; Compliance Automation Framework

---

#### CP-5: Safety Gate Orchestration Responsibility

**Intent:**  
Define the Control Plane’s responsibility for AI Safety Gate orchestration.

**Allowed Values:**

- **Centralized Safety Gate Orchestration**  
  All Safety Gate definitions, risk classes, and escalation rules
  are owned and coordinated by the Control Plane.

- **Central Definition with Distributed Invocation**  
  Safety Gate definitions are owned and versioned by the Control Plane;
  invocation occurs in downstream planes under Control Plane-defined contracts.

**Constraints:**

- Control Plane evaluation responsibility is limited to:
  - Safety Gate definition validation
  - risk taxonomy completeness
  - version approval and rollout control
- Runtime invocation and outcome determination occur downstream.
- Distributed invocation MUST emit evidence containing, at minimum:
  - Safety Gate identifier and version
  - invocation context hash
  - outcome and escalation result
  - correlation and trace identifiers
- All outcomes MUST be attributable to Control Plane–issued versions.

**Upstream Sources:**  
AI Safety Gate Specification; CAF v1

---

#### CP-6: Cost and Compliance Governance Integration

**Intent:**  
Define how cost governance and compliance enforcement are integrated.

**Allowed Values:**

- **Unified Governance Integration**  
  Cost, compliance, and entitlement rules are governed as a single,
  integrated policy surface.

- **Separated but Coordinated Governance**  
  Cost and compliance policies are defined separately but coordinated
  through shared lifecycle rules, versioning boundaries, and evidence models.

**Constraints:**

- Cost enforcement MUST be runtime-effective, not advisory.
- Compliance enforcement MUST produce system-generated evidence.
- Coordination MUST ensure:
  - consistent version attribution
  - shared evidence semantics
  - deterministic enforcement outcomes

**Upstream Sources:**  
Cost Governance / FinOps Specification; Compliance Automation Framework

---

### 4. CP Fixed Invariants (Non-Parameterizable)

Regardless of parameter values, the following MUST hold:

- Control Plane does not execute tenant business workflows.
- Control Plane does not perform per-request runtime evaluation.
- Tenant Context is mandatory, explicit, and immutable per invocation.
- Identity, membership, and authority are distinct concepts.
- Authority is tenant-scoped and policy-derived.
- Policy, Safety Gates, and governance rules are versioned and auditable.
- Control Plane decisions produce evidence consumable by CI and runtime gates.

---

### 5. CP Required Outputs from Template Instantiation

Any instantiation of this template MUST produce:

- One or more ADRs capturing:
  - selected parameter values
  - justification for each choice
- At least one architecture diagram showing:
  - Control Plane boundaries
  - interactions with Application and Data Planes
- A validation mapping table:
  - template parameters → pattern guides → checklist IDs
- A declaration of enforcement points per plane

Instantiation without these outputs is non-compliant.

---

### 6. CP Validation and Enforcement Mapping (Template-Level)

Instantiation of this template implicates, at minimum:

- Control/Application/Data Plane Pattern Guide
- Multi-Tenancy Validation Guide
- AI Safety Gate validation checks
- Cost governance and compliance checks

Enforcement occurs across:

- **Control Plane:** definition-time validation, versioning, rollout gating
- **Application Plane:** runtime invocation, context binding, enforcement
- **Data Plane:** governance enforcement and audit emission

Checklist IDs and enforcement stages MUST be enumerated in produced ADRs.

---

### 7. CP ADR Integration Requirements

ADR(s) produced from this template MUST:

- Explicitly list all parameter values (CP-1 through CP-6)
- Reference applicable governance documents
- Reference relevant validation checklist IDs
- Declare required evidence artifacts
- Explicitly document and justify any waivers (with expiry)

Claims of Control Plane compliance without ADR-backed evidence are invalid.

---

## SaaS Application Plane Architecture Template (v1)

### 1. AP Template Identity and Scope

**Template Name:** SaaS Application Plane Architecture Template  
**Version:** v1  
**Applies To:**  

- System-level or platform-level Application Plane designs  
- Application Plane subsystems executing tenant workflows under Control Plane governance  

**Architectural Scope:**

This template constrains the **execution shape, behavioral responsibilities,
and enforcement obligations** of the **Application Plane** in a Contura-compatible SaaS system.

It governs **how tenant-scoped workflows, APIs, and agent execution are performed**
under Control Plane–defined intent.

---

### 2. AP Architectural Intent

The Application Plane is the **primary execution plane**.

This template exists to ensure that any Application Plane design:

- executes tenant-facing workflows and APIs
- binds and propagates Tenant Context deterministically
- invokes policies and Safety Gates defined upstream
- enforces authorization, cost, and compliance at runtime
- emits complete, tenant-scoped evidence and telemetry
- remains strictly subordinate to Control Plane authority

This template does **not** define:

- governance intent or policy semantics
- tenant lifecycle authority
- global configuration or orchestration
- data storage or long-term persistence responsibilities

---

### 3. AP Exposed Architectural Parameters

All parameters defined below are **mandatory**.
No defaults exist.
Instantiation MUST explicitly select a value for each parameter.

Each parameter has been validated against the **Parameter Quality Checklist**.

---

#### AP-1: Tenant Context Binding Strategy

**Intent:**  
Define how Tenant Context is established and enforced for execution.

**Allowed Values:**

- **Ingress-Bound Context**  
  Tenant Context is resolved exactly once at ingress
  and is immutable for the duration of execution.

- **Ingress + Explicit Delegation**  
  Tenant Context is resolved at ingress and may be explicitly delegated
  to downstream tasks or async continuations via bounded propagation mechanisms.

**Constraints:**

- Execution MUST fail closed if Tenant Context is missing or ambiguous.
- Tenant Context MUST NOT be inferred from ambient state.
- Context mutation mid-execution is forbidden.

**Delegation Contract (Normative):**

If **Ingress + Explicit Delegation** is selected, every delegated continuation MUST carry
a **Context Delegation Bundle** that includes, at minimum:

- Tenant Context identifier
- Invoking Identity identifier
- Authority or membership reference sufficient for policy-derived authorization
- Policy version identifiers relevant to the continuation
- Safety Gate version identifiers relevant to the continuation
- Correlation identifiers (trace / workflow / invocation IDs)

A delegated continuation MUST fail closed if the Context Delegation Bundle is missing,
incomplete, inconsistent, or unverifiable.

**Upstream Sources:**  
CAF v1; Multi-Tenancy Patterns Guide; Validation Guide (tenant context invariants)

---

#### AP-2: Authorization Enforcement Model

**Intent:**  
Define how authorization decisions are enforced during execution.

**Allowed Values:**

- **Inline Enforcement**  
  Authorization checks are enforced synchronously
  as part of request or workflow execution.

- **Inline + Step-Level Enforcement**  
  Authorization is enforced both at entry
  and at explicit workflow or agent execution steps.

**Constraints:**

- Authorization MUST include tenant scope, identity, and policy context.
- Authorization outcomes MUST be attributable to policy versions.
- Authorization failures MUST block execution deterministically.

**Step Boundary Rule (Normative):**

If step-level enforcement is selected, “steps” MUST be explicit boundaries at least for:

- any tool invocation
- any external side effect
- any cross-plane operation that changes persisted state
- any privileged or high-impact action

Steps MUST be declared in the instantiation outputs (diagram and ADR) and MUST NOT be implicit.

**Upstream Sources:**  
Policy Engine Architecture Guide; Multi-Tenancy Patterns Guide

---

#### AP-3: Policy Evaluation Invocation Pattern

**Intent:**  
Define how and when policy evaluations occur at runtime.

**Allowed Values:**

- **Pre-Execution Evaluation**  
  Policies are evaluated before execution begins.

- **Pre- and Mid-Execution Evaluation**  
  Policies are evaluated before execution
  and at defined execution checkpoints.

**Constraints:**

- Policy evaluation MUST reference Control Plane–issued versions.
- Missing policy context MUST cause execution failure.
- Policy outcomes MUST be emitted as evidence.
- If mid-execution evaluation is selected, evaluation checkpoints MUST include
  all step boundaries defined by AP-2.

**Upstream Sources:**  
Policy Engine Architecture Guide; Compliance Automation Framework

---

#### AP-4: Safety Gate Invocation Pattern

**Intent:**  
Define how AI Safety Gates are invoked during execution.

**Allowed Values:**

- **Pre-Invocation Safety Gates**  
  Safety Gates are invoked before AI or agent execution begins.

- **Pre- and Mid-Invocation Safety Gates**  
  Safety Gates are invoked before execution
  and at defined intermediate steps.

**Constraints:**

- Safety Gate invocation MUST be deterministic.
- Outcomes MUST be traceable to Control Plane–defined versions.
- Execution MUST halt or escalate on Safety Gate denial.

**Mandatory Gate Boundaries (Normative):**

If mid-invocation safety gates are selected, Safety Gates MUST be invoked at least:

- at agent session start (pre-invocation)
- before any tool invocation capable of external side effects
- before any escalation boundary or privileged operation
- before any cross-plane operation that changes persisted state
- at any step classified as higher risk by policy or risk taxonomy

Safety Gate placement MUST NOT be advisory. Coverage MUST prevent bypass paths.

**Upstream Sources:**  
AI Safety Gate Specification; CAF v1

---

#### AP-5: Agent Execution Responsibility

**Intent:**  
Define the Application Plane’s responsibility for agent execution.

**Allowed Values:**

- **Agent Invocation Only**  
  Application Plane invokes agents under policy and Safety Gate constraints
  but does not host agent orchestration state.

- **Agent Orchestration Execution**  
  Application Plane hosts agent orchestration,
  including step sequencing and tool invocation,
  under Control Plane–defined constraints.

**Constraints:**

- All agent actions MUST execute under explicit Tenant Context.
- Agent authority MUST be policy-derived and bounded.
- Recursive or unbounded agent execution is forbidden.

**Tool Invocation as Step Boundary (Normative):**

If agent orchestration execution is selected, every tool invocation MUST be treated as an explicit step boundary requiring:

- Tenant Context assertion
- authorization enforcement (AP-2)
- policy evaluation at the boundary (AP-3, if applicable)
- Safety Gate evaluation at the boundary (AP-4, if applicable)
- evidence emission (AP-6)

No tool invocation may occur outside declared step boundaries.

**Upstream Sources:**  
Agent Identity ADR; AI Safety Gate Specification

---

#### AP-6: Runtime Evidence and Telemetry Emission

**Intent:**  
Define how execution produces evidence and observability artifacts.

**Allowed Values:**

- **Synchronous Emission**  
  Evidence and telemetry are emitted inline with execution.

- **Synchronous + Deferred Aggregation**  
  Evidence is emitted synchronously;
  aggregation and analysis may occur asynchronously.

**Constraints:**

- Evidence MUST be tenant-scoped and identity-attributed.
- Evidence MUST include required correlation identifiers.
- Missing required evidence constitutes a compliance failure.

**Minimal Evidence Bundle (Normative):**

At minimum, Application Plane execution MUST emit evidence containing:

- Tenant Context identifier
- Identity identifier
- policy identifier(s) and version(s) consulted
- Safety Gate identifier(s) and version(s) consulted
- outcome(s) (allow/deny/escalate/constraint)
- invocation context hash (or equivalent deterministic context fingerprint)
- correlation identifiers (trace / workflow / invocation IDs)

**Deferred Aggregation Rule:**

If deferred aggregation is selected, aggregation MAY be delayed,
but required evidence emission MUST occur synchronously at the enforcement points.
Aggregation MUST NOT be the only source of evidence.

**Upstream Sources:**  
AI Observability & Evaluation Specification; Compliance Automation Framework

---

### 4. AP Fixed Invariants (Non-Parameterizable)

Regardless of parameter values, the following MUST hold:

- Application Plane executes tenant workflows; it does not define governance intent.
- Tenant Context is mandatory, explicit, and immutable per execution.
- Authorization and policy enforcement are mandatory for all execution paths.
- Safety Gate outcomes are binding and auditable.
- Application Plane does not weaken Control Plane–defined constraints.
- All execution produces tenant-scoped, attributable evidence.
- Async continuations MUST fail closed without an explicit Context Delegation Bundle.

---

### 5. AP Required Outputs from Template Instantiation

Any instantiation of this template MUST produce:

- One or more ADRs capturing:
  - selected parameter values
  - justification for each choice
  - declared step boundaries and gate boundaries
- Architecture diagrams showing:
  - Application Plane boundaries
  - interactions with Control and Data Planes
  - step boundaries and enforcement points
- A validation mapping table:
  - template parameters → pattern guides → checklist IDs
- A declaration of runtime enforcement points

Instantiation without these outputs is non-compliant.

---

### 6. AP Validation and Enforcement Mapping (Template-Level)

Instantiation of this template implicates, at minimum:

- Multi-Tenancy validation (tenant context binding and propagation)
- Policy Engine validation checks
- AI Safety Gate validation checks
- Observability and evidence requirements

Enforcement occurs across:

- **Application Plane:** runtime binding, invocation, enforcement, evidence emission
- **Control Plane:** versioned definitions referenced at runtime
- **Data Plane:** downstream governance enforcement and audit emission

Checklist IDs and enforcement stages MUST be enumerated in produced ADRs.

---

### 7. AP ADR Integration Requirements

ADR(s) produced from this template MUST:

- Explicitly list all parameter values (AP-1 through AP-6)
- Reference applicable Control Plane template instantiation
- Reference applicable governance documents
- Reference relevant validation checklist IDs
- Declare required runtime evidence artifacts
- Document and justify any waivers (with expiry)

Claims of Application Plane compliance without ADR-backed evidence are invalid.

---

## Data Plane Architecture Template (v1)

### 1. DP Template Identity and Scope

**Template Name:** Data Plane Architecture Template  
**Version:** v1  
**Applies To:**

- System-level or platform-level Data Plane designs  
- Data Plane subsystems responsible for tenant-scoped storage, retrieval, processing, and inference execution  

**Architectural Scope:**

This template constrains the **storage, retrieval, processing, and enforcement shape** of the **Data Plane** in a Contura-compatible SaaS system.

It governs **where tenant data lives, how it is accessed, and how governance is enforced** under Control Plane intent and Application Plane execution.

---

### 2. DP Architectural Intent

The Data Plane is the plane responsible for:

- tenant-scoped data storage and retrieval
- enforcement of data-level governance constraints
- tenant-scoped processing and compute over data (including inference execution)
- emission and retention of auditable evidence artifacts for data access and governance

This template exists to ensure that any Data Plane design:

- enforces tenant isolation and fails closed on scope violations
- supports policy-driven access control and governance constraints
- prevents cross-tenant access by construction and by enforcement
- produces evidence required for audits and incident classification
- remains subordinate to Control Plane–defined policy and Application Plane–bound execution context

This template does **not** define:

- policy semantics or governance intent
- application workflow orchestration
- user-facing product APIs

---

### 3. DP Exposed Architectural Parameters

All parameters defined below are **mandatory**.  
No defaults exist.  
Instantiation MUST explicitly select a value for each parameter.

Each parameter has been validated against the **Parameter Quality Checklist**.

---

#### DP-1: Tenant Data Isolation Model

**Intent:**  
Define the isolation model used to prevent cross-tenant data access.

**Allowed Values:**

- **Logical Isolation (Enforced)**  
  Tenants share physical infrastructure; isolation is enforced through
  mandatory tenant-scoped access constraints and fail-closed query patterns.

- **Physical Isolation (Siloed)**  
  Tenants are isolated through separate physical storage or compute boundaries
  with no cross-tenant co-location of governed data.

- **Hybrid Isolation**  
  Tenants are logically isolated by default, with bounded physical isolation for
  specific tenant cohorts or workloads under explicit governance rules.

**Constraints:**

- Cross-tenant access MUST be forbidden by construction and enforcement.
- Isolation MUST be compatible with validation and incident classification semantics.

**Cohorting and Placement Contract (Normative):**

If **Hybrid Isolation** is selected:

- Cohort assignment MUST be policy-driven and versioned under Control Plane authority.
- Cohort assignment MUST be auditable; changes MUST emit evidence.
- Cohort assignment MUST NOT be inferred from ambient state.
- Cohorts MUST NOT become authority boundaries:
  - cohort membership MUST NOT grant access
  - tenant remains the sole isolation and authorization boundary.

**Cohort Change Rule (Normative):**

Any change to a tenant’s cohort assignment MUST be treated as an explicit lifecycle event:

- explicitly authorized
- evidence-emitting
- migration-safe (must not create cross-tenant exposure during transition)

Physical placement MAY reduce blast radius, but MUST NOT replace tenant scope enforcement.

**Upstream Sources:**  
Multi-Tenancy Patterns Guide; Data Governance & Quality Standards

---

#### DP-2: Tenant Scope Enforcement Point

**Intent:**  
Define where tenant scope is enforced for data access and computation.

**Allowed Values:**

- **Data-Access-Layer Enforcement**  
  Tenant scope is enforced at the storage/retrieval access boundary
  for all reads and writes.

- **Query/Computation Enforcement**  
  Tenant scope is enforced for both data access and computation/query execution,
  including filtering, joins, aggregation, and derived results.

**Constraints:**

- Enforcement MUST fail closed if tenant scope is missing or ambiguous.
- Enforcement MUST be deterministic and auditable.

**Scope Safety Rule (Normative):**

If **Query/Computation Enforcement** is selected:

- All queries and computations MUST be provably single-tenant scoped.
- Cross-tenant joins, aggregations, and derived results over tenant-governed data are forbidden.
- “Global” queries over tenant-governed datasets are forbidden.
- Any operation that cannot be proven single-tenant scoped MUST fail closed.

**Upstream Sources:**  
Multi-Tenancy Validation Guide; Multi-Tenancy Patterns Guide

---

#### DP-3: Governance Constraint Enforcement Coverage

**Intent:**  
Define which governance constraints are enforced within the Data Plane.

**Allowed Values:**

- **Access + Retention Enforcement**  
  Data Plane enforces access constraints and retention/deletion rules.

- **Access + Retention + Lineage Enforcement**  
  Data Plane enforces access constraints, retention/deletion rules,
  and records lineage/provenance artifacts for governed datasets.

**Constraints:**

- Governance enforcement MUST be policy-driven and version-attributable.
- Evidence MUST be emitted for enforcement outcomes.

**Lineage Subject Rule (Normative):**

If lineage enforcement is selected, lineage MUST be recorded at least for:

- governed datasets and records
- derived datasets and transformations
- embeddings and inference outputs produced from governed inputs

**Minimal Lineage Evidence Bundle (Normative):**

At minimum, lineage evidence MUST include:

- Tenant Context identifier
- input dataset/resource identifier(s)
- transformation or derivation identifier (or deterministic transform fingerprint)
- output dataset/resource identifier(s)
- policy identifier(s) and version(s) relevant to the enforcement
- correlation identifiers (trace / workflow / invocation IDs)
- timestamp and outcome (recorded / rejected)

**Upstream Sources:**  
Data Governance & Quality Standards; Compliance Automation Framework

---

#### DP-4: Inference and Embedding Execution Placement

**Intent:**  
Define whether inference/embedding workloads execute in the Data Plane.

**Allowed Values:**

- **Data Plane Executes Inference**  
  Inference and embedding generation execute within Data Plane boundaries,
  with tenant-scoped controls and evidence emission.

- **Data Plane Hosts Inputs/Outputs Only**  
  Inference executes outside the Data Plane; Data Plane stores inputs/outputs
  and enforces tenant-scoped access and governance.

**Constraints:**

- Any inference-related data access MUST remain tenant-scoped.
- Evidence for inference data access MUST remain auditable and attributable.
- Data Plane MUST NOT define AI policy semantics; it enforces upstream decisions.

**Inference Request Contract (Normative):**

If **Data Plane Executes Inference** is selected, any request to execute inference in the Data Plane MUST include, at minimum:

- Tenant Context identifier (single-tenant scope)
- Calling principal / identity reference (or authenticated calling service identity)
- Policy identifier(s) and version(s) relevant to the invocation
- Safety Gate identifier(s) and version(s), plus outcome reference where required
- Correlation identifiers (trace / workflow / invocation IDs)
- invocation context hash (deterministic context fingerprint of inputs + scope metadata)

The Data Plane MUST fail closed if required scope, policy, or Safety Gate attribution is missing, ambiguous, or unverifiable.

**Scope-Safe Retrieval Rule (Normative):**

Any retrieval, feature extraction, or embedding lookup performed as part of inference MUST be subject to the same tenant scope enforcement as standard data access.
No cross-tenant retrieval is permitted for tenant-governed data.

**Upstream Sources:**  
CAF v1; AI Observability & Evaluation Specification

---

#### DP-5: Data Plane Evidence Emission Model

**Intent:**  
Define how the Data Plane emits evidence for access and governance.

**Allowed Values:**

- **Inline Evidence Emission**  
  Evidence is emitted synchronously with data access and governance enforcement.

- **Inline + Deferred Aggregation**  
  Evidence is emitted inline; aggregation and analysis may occur asynchronously.

**Constraints:**

- Evidence MUST be tenant-scoped and attributable to the calling principal where applicable.
- Evidence MUST include correlation identifiers linking to Application Plane execution.
- Missing evidence constitutes a compliance failure.

**Minimal Data Plane Evidence Bundle (Normative):**

At minimum, Data Plane enforcement MUST emit evidence containing:

- Tenant Context identifier
- calling principal / identity reference (or calling service identity reference)
- operation class (read/write/query/compute/inference/retention/lineage)
- resource or dataset identifier(s) accessed or affected
- policy identifier(s) and version(s) consulted
- Safety Gate identifier(s) and version(s) consulted where relevant
- enforcement outcome (allow/deny/constraint/applied rule)
- invocation context hash (or deterministic scope fingerprint)
- correlation identifiers (trace / workflow / invocation IDs)
- timestamp

**Deferred Aggregation Rule:**

If deferred aggregation is selected, aggregation MAY be delayed,
but required evidence emission MUST occur inline at enforcement points.
Aggregation MUST NOT be the only source of evidence.

**Upstream Sources:**  
AI Observability & Evaluation Specification; Compliance Automation Framework

---

### 4. DP Fixed Invariants (Non-Parameterizable)

Regardless of parameter values, the following MUST hold:

- Data Plane MUST fail closed on missing or ambiguous tenant scope.
- Tenant isolation MUST prevent cross-tenant access.
- Tenant scope enforcement MUST apply regardless of physical placement or cohort.
- Cross-tenant computation over tenant-governed data is forbidden.
- Governance constraints enforced in the Data Plane MUST be policy-driven and auditable.
- Data Plane does not define policy semantics; it enforces policies defined upstream.
- Data access, governance enforcement, and inference execution (if present) MUST emit tenant-scoped evidence.

---

### 5. DP Required Outputs from Template Instantiation

Any instantiation of this template MUST produce:

- One or more ADRs capturing:
  - selected parameter values
  - justification for each choice
  - cohorting rules and cohort change semantics (if hybrid isolation)
  - inference request contract expectations (if inference executes in DP)
- Architecture diagrams showing:
  - Data Plane boundaries
  - isolation and enforcement points
  - interactions with Application and Control Planes
- A validation mapping table:
  - template parameters → pattern guides → checklist IDs
- A declaration of enforcement points and evidence emission points

Instantiation without these outputs is non-compliant.

---

### 6. DP Validation and Enforcement Mapping (Template-Level)

Instantiation of this template implicates, at minimum:

- Multi-Tenancy validation (tenant scope, isolation enforcement, fail-closed behavior)
- Data Governance & Quality Standards (retention, lineage, provenance)
- Observability and evidence requirements

Enforcement occurs across:

- **Data Plane:** data access enforcement, governance enforcement, inference enforcement, evidence emission
- **Application Plane:** tenant context binding and propagation to data access
- **Control Plane:** policy and Safety Gate versions referenced at enforcement

Checklist IDs and enforcement stages MUST be enumerated in produced ADRs.

---

### 7. DP ADR Integration Requirements

ADR(s) produced from this template MUST:

- Explicitly list all parameter values (DP-1 through DP-5)
- Reference applicable Control Plane and Application Plane template instantiations
- Reference applicable governance documents
- Reference relevant validation checklist IDs
- Declare required evidence artifacts
- Document and justify any waivers (with expiry)

Claims of Data Plane compliance without ADR-backed evidence are invalid.

---

## AI / Agent Execution Architecture Template (v1)

### 1. AI / Agent Template Identity and Scope

**Template Name:** AI / Agent Execution Architecture Template  
**Version:** v1  
**Applies To:**  

- Agentic or AI-assisted execution surfaces within the Application Plane  
- Any autonomous or semi-autonomous tool-invoking execution operating under Contura governance  

**Architectural Scope:**

This template constrains the **architectural shape of agent execution**:
identity, authority, tool invocation boundaries, retrieval/memory usage, and
Safety Gate + policy integration.

It governs **how agents are permitted to act**, not which tools or models are selected.

---

### 2. AI / Agent Architectural Intent

AI/Agent execution introduces new action paths and blast radius risks.

This template exists to ensure that agent execution:

- is always tenant-scoped and identity-attributed
- derives authority from policy, not from implementation convenience
- cannot invent privileged operations or bypass governance
- invokes Safety Gates and policy evaluation at required boundaries
- emits auditable evidence for decisions, actions, and tool use
- fails closed on missing context, authority, or required gate outcomes

This template does **not** define:

- model provider or model selection
- prompt content and prompt engineering strategy
- concrete tool implementations
- business workflow definitions

---

### 3. AI / Agent Exposed Architectural Parameters

All parameters defined below are **mandatory**.  
No defaults exist.  
Instantiation MUST explicitly select a value for each parameter.

Each parameter has been validated against the **Parameter Quality Checklist**.

---

#### AI-1: Agent Identity Binding Model

**Intent:**  
Define how agent identity is bound and attributed during execution.

**Allowed Values:**

- **Single-Principal Agent Identity**  
  Each agent execution session is bound to exactly one principal identity
  (human, service, or agent principal) for the duration of the session.

- **Delegated Agent Identity**  
  Agent execution is bound to a principal identity, and may act via explicit,
  bounded delegation (e.g., acting on behalf of a user) under policy constraints.

**Constraints:**

- Identity MUST be explicit and auditable.
- Delegation MUST be explicit and bounded; ambient delegation is forbidden.
- Execution MUST fail closed on missing or ambiguous identity.

**Delegation Contract (Normative):**

If **Delegated Agent Identity** is selected:

- Delegation MUST NOT grant authority.
- Authority remains policy-derived per invocation under tenant context.
- Each delegated execution MUST carry a **Delegation Evidence Record** including, at minimum:
  - delegator identity reference
  - delegatee (agent) identity reference
  - tenant context identifier
  - permitted action classes (explicitly enumerated)
  - expiry / validity bounds
  - correlation identifiers (trace / workflow / invocation IDs)

Execution MUST fail closed if the Delegation Evidence Record is missing, expired,
inconsistent with tenant context, or unverifiable.

**Upstream Sources:**  
Agent Identity ADR; CAF v1

---

#### AI-2: Agent Authority Derivation Model

**Intent:**  
Define how an agent’s authority is determined during execution.

**Allowed Values:**

- **Policy-Derived Authority**  
  Agent authority is derived strictly from policy evaluations bound to
  tenant context, identity, and declared action intent.

- **Policy + Explicit Approval Authority**  
  Agent authority is policy-derived and additionally requires explicit approvals
  for certain action classes before execution proceeds.

**Constraints:**

- Authority MUST be tenant-scoped and policy-derived.
- Authority MUST NOT be global or inferred.
- Approvals (when required) MUST be attributable and auditable.

**Approval Boundary Rule (Normative):**

If explicit approvals are selected:

- Approval requirements MUST be defined in terms of explicitly enumerated **action classes**
  and/or policy-defined risk classes.
- Approvals MUST NOT be implicit, cached as ambient state, or inferred.
- Approval validity MUST be bounded (scope + expiry) and attributable to:
  - approving identity reference
  - action class
  - tenant context
  - correlation identifiers

Execution MUST fail closed when approval is required but missing, expired, or unverifiable.

**Upstream Sources:**  
Policy Engine Architecture Guide; AI Safety Gate Specification

---

#### AI-3: Tool Invocation Boundary Model

**Intent:**  
Define how tool invocation is bounded and evaluated.

**Allowed Values:**

- **Pre-Invocation Evaluation Only**  
  Tool invocation is permitted only after required policy and Safety Gate
  checks succeed for the declared tool/action.

- **Pre-Invocation + Step Boundary Evaluation**  
  Tool invocation requires pre-invocation checks and additional checks at
  explicit step boundaries (e.g., before side effects, before escalation).

**Constraints:**

- Tool invocation MUST be treated as a step boundary.
- Tool invocation MUST fail closed if required checks are missing.
- Tool invocation MUST emit evidence including tool identity, requested action class,
  and gate/policy version attribution.

**Mandatory Tool Boundary Checks (Normative):**

At every tool invocation boundary, execution MUST ensure:

- Tenant Context is asserted
- identity and delegation evidence (if applicable) is present and valid
- policy evaluation outcomes (with version attribution) are available where required
- Safety Gate outcomes (with version attribution) are available where required
- evidence emission occurs inline (see AI-6)

No tool invocation may occur outside declared step boundaries.

**Upstream Sources:**  
AI Safety Gate Specification; Policy Engine Architecture Guide; CAF v1

---

#### AI-4: Retrieval and Memory Usage Model

**Intent:**  
Define the allowed use of retrieval and memory during agent execution.

**Allowed Values:**

- **Session-Scoped Context Only**  
  Agent context is limited to session inputs and explicitly retrieved,
  tenant-scoped data for the current execution session.

- **Session + Tenant-Scoped Memory**  
  Agent may use tenant-scoped memory across sessions, subject to governance,
  retention, and audit requirements.

**Constraints:**

- Retrieval MUST be tenant-scoped and fail closed on missing scope.
- Memory MUST NOT introduce implicit tenant context or cross-tenant leakage.
- Any persisted memory MUST be governed by retention and audit rules.

**Memory Contract (Normative):**

If tenant-scoped memory is selected:

- Memory MUST be tenant-scoped and attributable to identity where applicable.
- Memory MUST emit evidence on write and on retrieval (tenant, identity, correlation IDs).
- Memory MUST NOT store:
  - credentials, secrets, or access tokens
  - approvals or Safety Gate outcomes as substitutes for re-evaluation
  - implicit “current tenant” state
- Memory retrieval MUST NOT bypass required policy or Safety Gate checks for subsequent actions.

**Memory-to-Action Rule (Normative):**

If retrieved memory influences a tool invocation or side-effecting action,
the tool/action MUST still pass required policy and Safety Gate checks at the boundary.

**Upstream Sources:**  
Data Governance & Quality Standards; Multi-Tenancy Patterns Guide

---

#### AI-5: Safety Gate Integration Pattern

**Intent:**  
Define how Safety Gates integrate into agent execution.

**Allowed Values:**

- **Pre-Action Safety Gates**  
  Safety Gates are invoked before agent execution begins and before each
  action class that can cause side effects.

- **Pre-Action + Continuous Safety Gates**  
  Safety Gates are invoked before execution begins, before side-effecting actions,
  and at defined intermediate checkpoints for higher-risk sessions.

**Constraints:**

- Safety Gate outcomes are binding.
- Safety Gate invocation MUST be attributable to Control Plane–defined versions.
- Safety Gate coverage MUST prevent bypass paths for tool use and escalation.

**Mandatory Gate Boundaries (Normative):**

If continuous safety gates are selected, Safety Gates MUST be invoked at least:

- at agent session start (pre-action)
- before any tool invocation capable of external side effects
- before any escalation boundary or privileged operation
- before any cross-plane operation that changes persisted state
- at any step classified as higher risk by policy or risk taxonomy

Safety Gate placement MUST NOT be advisory. Coverage MUST prevent bypass paths.

**Upstream Sources:**  
AI Safety Gate Specification

---

#### AI-6: Agent Evidence and Audit Emission Model

**Intent:**  
Define how agent execution produces auditable evidence.

**Allowed Values:**

- **Synchronous Evidence Emission**  
  Evidence is emitted inline for decisions, tool invocations, and gate outcomes.

- **Synchronous + Deferred Aggregation**  
  Evidence is emitted inline; aggregation and analysis may occur asynchronously.

**Constraints:**

- Evidence MUST be tenant-scoped and identity-attributed.
- Evidence MUST include correlation identifiers linking agent actions to workflows.
- Missing required evidence constitutes a compliance failure.

**Minimal Agent Evidence Bundle (Normative):**

At minimum, agent execution MUST emit evidence containing:

- Tenant Context identifier
- agent identity and invoking principal identity references
- delegation evidence record reference (if applicable)
- declared action intent and action class
- policy identifier(s) and version(s) consulted
- Safety Gate identifier(s) and version(s) consulted
- approval record reference (if applicable)
- outcome(s) (allow/deny/escalate/constraint)
- tool invocation records (tool identifier + requested operation class)
- correlation identifiers (trace / workflow / invocation IDs)
- timestamp

**Deferred Aggregation Rule:**

If deferred aggregation is selected, aggregation MAY be delayed,
but required evidence emission MUST occur inline at decision and enforcement points.
Aggregation MUST NOT be the only source of evidence.

**Upstream Sources:**  
AI Observability & Evaluation Specification; Compliance Automation Framework

---

### 4. AI / Agent Fixed Invariants (Non-Parameterizable)

Regardless of parameter values, the following MUST hold:

- Agent execution MUST be tenant-scoped and identity-attributed.
- Identity, delegation, and authority are distinct concepts.
- Authority MUST be policy-derived and bounded per invocation.
- Tool invocation MUST be step-bounded and fail closed on missing checks.
- Safety Gate outcomes are binding and attributable to versioned definitions.
- Retrieval and memory MUST NOT introduce implicit or cross-tenant context.
- Memory MUST NOT substitute for policy, approvals, or Safety Gates.
- Agent decisions and actions MUST emit auditable evidence.

---

### 5. AI / Agent Required Outputs from Template Instantiation

Any instantiation of this template MUST produce:

- One or more ADRs capturing:
  - selected parameter values
  - justification for each choice
  - explicitly enumerated **action classes**
  - declared step boundaries and tool boundaries
  - approval requirements by action class (if approvals are used)
- Architecture diagrams showing:
  - agent execution boundaries and enforcement points
  - interactions with policy evaluation and Safety Gates
  - retrieval/memory access boundaries
- A validation mapping table:
  - template parameters → pattern guides → checklist IDs
- A declaration of enforcement points and evidence emission points

Instantiation without these outputs is non-compliant.

---

### 6. AI / Agent Validation and Enforcement Mapping (Template-Level)

Instantiation of this template implicates, at minimum:

- AI Safety Gate validation checks
- Policy evaluation and enforcement checks
- Multi-tenancy validation (tenant context binding and propagation)
- Data governance (memory, retention, auditability)
- Observability and evaluation requirements

Enforcement occurs across:

- **Application Plane:** agent orchestration, tool invocation gating, evidence emission
- **Control Plane:** versioned policies and Safety Gate definitions referenced at runtime
- **Data Plane:** tenant-scoped retrieval/memory enforcement and audit emission

Checklist IDs and enforcement stages MUST be enumerated in produced ADRs.

---

### 7. AI / Agent ADR Integration Requirements

ADR(s) produced from this template MUST:

- Explicitly list all parameter values (AI-1 through AI-6)
- Reference applicable Control Plane, Application Plane, and Data Plane template instantiations
- Reference applicable governance documents
- Reference relevant validation checklist IDs
- Declare required evidence artifacts
- Document and justify any waivers (with expiry)

Claims of agent execution compliance without ADR-backed evidence are invalid.

---

## Multi-Tenant Data Storage Architecture Template (v1)

### 1. MT Template Identity and Scope

**Template Name:** Multi-Tenant Data Storage Architecture Template  
**Version:** v1  
**Applies To:**  

- Persistent storage systems holding tenant-governed data  
- Storage subsystems supporting Data Plane and Application Plane workloads  
- Any shared storage layer used across multiple tenants

**Architectural Scope:**

This template constrains the **persistent storage shape** for multi-tenant systems:
partitioning, isolation boundaries, tenancy keys, retention/deletion semantics,
and auditable access patterns.

It governs **how data is stored and separated**, not how workflows execute.

---

### 2. MT Architectural Intent

Multi-tenant storage is a primary source of cross-tenant risk.

This template exists to ensure that storage designs:

- enforce tenant isolation by construction and by access enforcement
- provide deterministic tenant-scoped addressing for all persisted objects
- support retention, deletion, and evidence requirements
- support incident classification and forensic reconstruction
- avoid implicit tenant inference, ambient tenant state, or global-user semantics

This template does **not** define:

- compute/query execution semantics (covered by Data Plane template)
- policy semantics or governance intent (Control Plane)
- application workflow orchestration (Application Plane)

---

### 3. MT Exposed Architectural Parameters

All parameters defined below are **mandatory**.  
No defaults exist.  
Instantiation MUST explicitly select a value for each parameter.

Each parameter has been validated against the **Parameter Quality Checklist**.

---

#### ST-1: Storage Isolation Topology

**Intent:**  
Define the isolation topology used for persistent multi-tenant storage.

**Allowed Values:**

- **Shared Storage with Logical Isolation**  
  Tenants share storage infrastructure; isolation is enforced via tenant-scoped
  keys, access patterns, and fail-closed enforcement.

- **Siloed Storage per Tenant**  
  Each tenant has a separate storage boundary for governed data.

- **Hybrid Storage Topology**  
  Shared-by-default logical isolation with bounded siloing for specific cohorts
  under explicit governance rules.

**Constraints:**

- Cross-tenant access MUST be forbidden by construction and enforcement.

**Cohort Unification Contract (Normative):**

If **Hybrid Storage Topology** is selected:

- Cohort assignment MUST have exactly one authoritative definition under Control Plane governance.
- Storage cohorting MUST reuse the **Data Plane cohorting contract** (same authority, versioning, evidence semantics, and lifecycle treatment).
- Cohort assignment MUST be policy-driven, versioned, and auditable.
- Cohort assignment MUST NOT be inferred from ambient state.
- Cohorts MUST NOT become authority boundaries:
  - cohort membership MUST NOT grant access
  - tenant remains the sole isolation and authorization boundary.

**Cohort Change Rule (Normative):**

Any change to a tenant’s cohort assignment MUST be treated as an explicit lifecycle event:

- explicitly authorized
- evidence-emitting
- migration-safe (must not create cross-tenant exposure during transition)

**Upstream Sources:**  
Multi-Tenancy Patterns Guide; Data Plane Architecture Template; Data Governance & Quality Standards

---

#### ST-2: Tenant Keying and Addressing Model

**Intent:**  
Define how tenant identity participates in persisted object addressing.

**Allowed Values:**

- **Tenant-Keyed Primary Addressing**  
  All persisted objects are addressable via tenant-scoped primary keys
  (tenant key is a required component of the object’s identity).

- **Tenant-Keyed Namespace with Internal IDs**  
  Objects are in tenant-scoped namespaces; internal identifiers may exist but
  are not valid without an explicit tenant scope.

**Constraints:**

- Tenant scope MUST be explicit for all reads/writes.
- Tenant inference from object ID alone is forbidden.
- “Global object IDs” usable without tenant scope are forbidden for tenant-governed data.

**Internal ID Refusal Rule (Normative):**

If internal IDs exist, no access path may accept an internal ID without an explicit tenant scope.
Any operation that cannot be proven tenant-scoped MUST fail closed.

**Upstream Sources:**  
Multi-Tenancy Validation Guide; Multi-Tenancy Patterns Guide

---

#### ST-3: Partitioning and Placement Strategy

**Intent:**  
Define how tenant data is partitioned and placed within storage.

**Allowed Values:**

- **Tenant-Partitioned Placement**  
  Storage placement is partitioned by tenant identity as a first-class key.

- **Tenant-Cohort Placement**  
  Storage placement is partitioned by cohorts of tenants under explicit,
  policy-governed cohort assignment.

- **Workload-Oriented Placement with Tenant Enforcement**  
  Placement is optimized by workload class, while strict tenant key enforcement
  remains mandatory for all access paths.

**Constraints:**

- Partitioning MUST NOT weaken tenant-scoped access enforcement.
- Placement choices MUST be observable via evidence for forensic reconstruction.

**Cohort Placement Consistency Rule (Normative):**

If **Tenant-Cohort Placement** is selected:

- Cohort assignment MUST follow the **single cohort authority** defined in ST-1.
- Cohorts MUST NOT be treated as access or authority boundaries.
- Cohort changes MUST follow the cohort change lifecycle rule.

**Upstream Sources:**  
Data Plane Architecture Template; Multi-Tenancy Patterns Guide; Compliance Automation Framework

---

#### ST-4: Retention, Deletion, and Tenant Offboarding Semantics

**Intent:**  
Define the storage system’s obligations for retention and deletion.

**Allowed Values:**

- **Retention + Hard Deletion**  
  Data is retained per policy and deleted irreversibly when required.

- **Retention + Logical Deletion with Enforced Tombstones**  
  Data may be logically deleted via tombstones that are enforced as non-readable,
  with bounded retention and eventual purge obligations.

**Constraints:**

- Retention and deletion MUST be policy-driven and version-attributable.
- Tenant offboarding MUST be expressible as a deterministic storage lifecycle event.
- Reads MUST fail closed on deleted/tombstoned records.

**Deletion Coverage Rule (Normative):**

Deletion semantics MUST apply across all access paths for governed data, including:

- direct reads/writes
- scans and bulk export paths
- indexes and projections
- materialized views
- derived artifacts (including embeddings and search indexes) governed by the same retention policy

If deletion coverage cannot be proven for an access path, the access path MUST fail closed.

**Upstream Sources:**  
Data Governance & Quality Standards; Compliance Automation Framework; Multi-Tenancy Patterns Guide

---

#### ST-5: Backup, Restore, and Forensic Isolation Model

**Intent:**  
Define how backups and restores preserve tenant isolation and auditability.

**Allowed Values:**

- **Tenant-Scoped Backup and Restore**  
  Backup and restore operations can be performed per tenant without exposing
  or requiring access to other tenants’ data.

- **System-Level Backup with Tenant-Scoped Restore Controls**  
  Backups are system-level, but restores enforce strict tenant scoping,
  evidence emission, and access controls.

**Constraints:**

- Restore operations MUST be tenant-scoped and authorized.
- Restore MUST emit evidence suitable for incident classification and audit.
- Backup/restore MUST NOT introduce cross-tenant data mixing.

**Restore Contract (Normative):**

Any restore MUST satisfy:

- restore scope is explicitly tenant-scoped
- restore is authorized and evidence-emitting
- restore MUST NOT write outside the tenant’s namespace or placement boundary
- restore MUST fail closed if tenant scoping cannot be proven

**Restore Compatibility Contract (Normative):**

Restore operations MUST preserve retention and deletion semantics:

- deleted/tombstoned records MUST remain non-readable after restore
- offboarded tenant data MUST NOT become accessible due to restore
- derived artifacts governed by retention policy MUST remain deletion-compliant post-restore
  (purged/invalidated/recomputed under deletion rules)

If restore cannot guarantee deletion compliance, restore MUST fail closed.

**Upstream Sources:**  
Incident Classification Guide; Compliance Automation Framework; Data Governance & Quality Standards

---

#### ST-6: Storage Evidence Emission Model

**Intent:**  
Define how storage emits auditable evidence for access and lifecycle events.

**Allowed Values:**

- **Inline Evidence Emission**  
  Evidence is emitted synchronously with reads/writes/deletes/restores.

- **Inline + Deferred Aggregation**  
  Evidence is emitted inline; aggregation may occur asynchronously.

**Constraints:**

- Evidence MUST be tenant-scoped and attributable to a calling principal where applicable.
- Evidence MUST include correlation identifiers linking back to Data Plane / Application Plane execution.
- Missing required evidence constitutes a compliance failure.

**Minimal Storage Evidence Bundle (Normative):**

At minimum, storage MUST emit evidence containing:

- Tenant Context identifier
- calling principal / identity reference (or calling service identity reference)
- operation class (read/write/delete/purge/restore/backup/scan)
- object/resource identifier(s) and namespace
- retention/deletion policy identifier(s) and version(s) where applicable
- cohort / placement rule reference(s) and version attribution where applicable
- enforcement outcome (allow/deny/constraint/applied rule)
- correlation identifiers (trace / workflow / invocation IDs)
- timestamp

**Deferred Aggregation Rule:**

If deferred aggregation is selected, aggregation MAY be delayed,
but required evidence emission MUST occur inline at enforcement points.
Aggregation MUST NOT be the only source of evidence.

**Upstream Sources:**  
AI Observability & Evaluation Specification; Compliance Automation Framework

---

### 4. MT Fixed Invariants (Non-Parameterizable)

Regardless of parameter values, the following MUST hold:

- Tenant scope is mandatory and explicit for all storage operations.
- Tenant inference from ambient state is forbidden.
- Cross-tenant reads/writes are forbidden.
- Cohorts MUST NOT be treated as authority boundaries.
- Deletion semantics MUST be enforceable (deleted data is non-readable) across all governed access paths.
- Backup/restore MUST preserve tenant isolation and deletion/retention semantics.
- Storage operations MUST emit tenant-scoped evidence.

---

### 5. MT Required Outputs from Template Instantiation

Any instantiation of this template MUST produce:

- One or more ADRs capturing:
  - selected parameter values
  - justification for each choice
  - declared keying/addressing model and refusal conditions
  - cohort assignment/placement rules and cohort change semantics (if used)
  - retention/deletion semantics and tenant offboarding behavior
  - restore constraints and deletion compatibility guarantees
- Architecture diagrams showing:
  - storage boundaries and namespaces
  - partitioning/placement strategy
  - isolation boundaries and evidence emission points
- A validation mapping table:
  - template parameters → pattern guides → checklist IDs
- A declaration of enforcement points and evidence emission points

Instantiation without these outputs is non-compliant.

---

### 6. MT Validation and Enforcement Mapping (Template-Level)

Instantiation of this template implicates, at minimum:

- Multi-Tenancy validation (tenant keying, explicit scope, fail-closed semantics)
- Data Governance & Quality Standards (retention, deletion, offboarding)
- Incident Classification (restore/forensics evidence)
- Observability and evidence requirements

Enforcement occurs across:

- **Storage Layer:** tenant key enforcement, retention/deletion enforcement, restore enforcement, evidence emission
- **Data Plane:** query/compute enforcement and governance integration
- **Application Plane:** correlation identifiers and principal attribution
- **Control Plane:** policy versions and lifecycle definitions referenced by enforcement

Checklist IDs and enforcement stages MUST be enumerated in produced ADRs.

---

### 7. MT ADR Integration Requirements

ADR(s) produced from this template MUST:

- Explicitly list all parameter values (ST-1 through ST-6)
- Reference applicable Control Plane, Application Plane, and Data Plane template instantiations
- Reference applicable governance documents
- Reference relevant validation checklist IDs
- Declare required evidence artifacts
- Document and justify any waivers (with expiry)

Claims of storage compliance without ADR-backed evidence are invalid.

---

## Example Template Categories (Non-Exhaustive)

This document may define templates such as:

- SaaS Control Plane Architecture Template
- SaaS Application Plane Architecture Template
- Data Plane Architecture Template
- AI / Agent Execution Architecture Template
- Policy Evaluation and Enforcement Template
- Multi-Tenant Data Storage Template

Each template exposes **only the minimum necessary choices**.

---

## Parameter Design Rules

All parameters MUST be:

- Explicit (no implied defaults)
- Bounded (finite allowed values)
- Architecturally meaningful (not implementation trivia)
- Traceable to downstream impact

Parameters MUST NOT:

- Hide cloud-specific assumptions
- Collapse multiple independent choices into one
- Implicitly select technologies

---

## Agent Compatibility Requirements

Templates MUST be consumable by automated agents.

This implies:

- Deterministic parameter schemas
- Clear success and failure conditions
- Explicit mappings to validation artifacts
- No reliance on narrative-only interpretation

Agents are expected to **select parameters**, not invent architecture.

---

## Relationship to Reference Implementations

Reference implementations are explicitly out of scope for this document.

A reference implementation MAY:

- Pin parameter values
- Introduce concrete cloud services
- Include code, IaC, and operational tooling

A reference implementation MUST:

- Declare which template(s) it instantiates
- List all pinned parameters
- Reference applicable validation checklist IDs
- Produce or stub required evidence artifacts

---

## Change and Evolution Rules

- Adding a new template requires:
  - Clear upstream justification
  - Mapping to existing validation mechanisms
- Modifying parameters is a **breaking change**
- Templates evolve more slowly than reference implementations
- Template changes MUST be reviewed against CAF and governance specs

---

## Summary

Parameterized Architecture Templates define **how architectures may be generated without violating truth**.

They do not prescribe solutions.
They define **safe choice surfaces**.

Contura remains an intentional architecture framework, enforced through validation. Templates make that framework constructively navigable without inventing architecture.

---

## Final Rule

Architecture defines **what must be true**.  
Templates define **what may be chosen**.  
Reference implementations show **one way it can work**.

These layers must never be collapsed.
