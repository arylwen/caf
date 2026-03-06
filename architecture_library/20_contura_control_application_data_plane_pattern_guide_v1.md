# Contura Control/Application/Data Plane Pattern Guide v1

## Table of Contents

- [Contura Control/Application/Data Plane Pattern Guide v1](#contura-controlapplicationdata-plane-pattern-guide-v1)
  - [Table of Contents](#table-of-contents)
  - [Upstream Documents](#upstream-documents)
  - [Document Status](#document-status)
  - [Purpose](#purpose)
  - [Scope and Non-Goals](#scope-and-non-goals)
    - [In scope](#in-scope)
    - [Out of scope](#out-of-scope)
  - [SaaS Foundation and Rationale for Tri-Plane Architecture](#saas-foundation-and-rationale-for-tri-plane-architecture)
    - [Why tri-plane for SaaS?](#why-tri-plane-for-saas)
  - [Core Plane Definitions](#core-plane-definitions)
    - [Control Plane (CP)](#control-plane-cp)
    - [Application Plane (AP)](#application-plane-ap)
    - [Data Plane (DP)](#data-plane-dp)
  - [Core Architectural Principles and Constraints](#core-architectural-principles-and-constraints)
    - [Separation of Concerns](#separation-of-concerns)
    - [SaaS-First Orientation](#saas-first-orientation)
    - [Tenant Context Propagation](#tenant-context-propagation)
    - [Zero Trust](#zero-trust)
    - [AI Safety and Governance](#ai-safety-and-governance)
    - [Evolvability and Replaceability](#evolvability-and-replaceability)
  - [Responsibilities and Boundaries per Plane](#responsibilities-and-boundaries-per-plane)
    - [Control Plane Responsibilities](#control-plane-responsibilities)
    - [Application Plane Responsibilities](#application-plane-responsibilities)
    - [Data Plane Responsibilities](#data-plane-responsibilities)
  - [Tenancy and Multi-Tenancy Pattern Overview](#tenancy-and-multi-tenancy-pattern-overview)
    - [Tenant as First-Class Concept](#tenant-as-first-class-concept)
    - [Shared vs Isolated Resources](#shared-vs-isolated-resources)
    - [Tenant Context Propagation Rules](#tenant-context-propagation-rules)
  - [Cross-Plane Interaction Patterns](#cross-plane-interaction-patterns)
    - [Allowed Patterns](#allowed-patterns)
    - [Prohibited Patterns](#prohibited-patterns)
  - [Workflow Patterns: Orchestration and Choreography](#workflow-patterns-orchestration-and-choreography)
    - [Control Plane: Orchestration Only](#control-plane-orchestration-only)
    - [Application Plane: Tenant Workflow Orchestration + Internal Choreography](#application-plane-tenant-workflow-orchestration--internal-choreography)
    - [Data Plane: No Orchestration of Governance](#data-plane-no-orchestration-of-governance)
  - [AI-First and Agentic Behavior Patterns](#ai-first-and-agentic-behavior-patterns)
    - [Control Plane AI Responsibilities](#control-plane-ai-responsibilities)
    - [Application Plane AI Responsibilities](#application-plane-ai-responsibilities)
    - [Data Plane AI Responsibilities](#data-plane-ai-responsibilities)
  - [Agent Identity Pattern (Normative Summary)](#agent-identity-pattern-normative-summary)
    - [Goals](#goals)
    - [Pattern Elements](#pattern-elements)
  - [Identity, Access, and Zero Trust Across Planes](#identity-access-and-zero-trust-across-planes)
    - [Identity Types](#identity-types)
    - [Control Plane Identity Role](#control-plane-identity-role)
    - [Application Plane Identity Role](#application-plane-identity-role)
    - [Data Plane Identity Role](#data-plane-identity-role)
    - [Zero Trust Norms](#zero-trust-norms)
  - [Observability, Telemetry, and Evaluation Hooks](#observability-telemetry-and-evaluation-hooks)
    - [Control Plane Telemetry](#control-plane-telemetry)
    - [Application Plane Telemetry](#application-plane-telemetry)
    - [Data Plane Telemetry](#data-plane-telemetry)
    - [AI Observability Hooks](#ai-observability-hooks)
  - [Safety, Guardrails, and AI Safety Gate Integration](#safety-guardrails-and-ai-safety-gate-integration)
    - [Control Plane Responsibilities (Safety \& Guardrails)](#control-plane-responsibilities-safety--guardrails)
    - [Application Plane Responsibilities (Safety \& Guardrails)](#application-plane-responsibilities-safety--guardrails)
    - [Data Plane Responsibilities (Safety \& Guardrails)](#data-plane-responsibilities-safety--guardrails)
  - [Versioning, Evolution, and ADR Integration](#versioning-evolution-and-adr-integration)
    - [Versioning Expectations](#versioning-expectations)
    - [ADR Integration](#adr-integration)
    - [Evolution](#evolution)
  - [Minimal Text Diagrams](#minimal-text-diagrams)
    - [Overall Tri-Plane SaaS View](#overall-tri-plane-saas-view)
    - [Agent Identity Flow (Simplified)](#agent-identity-flow-simplified)
  - [Version History](#version-history)
  - [Non-Normative References](#non-normative-references)

---

## Upstream Documents

This Pattern Guide is governed by, and must remain aligned with:

1. **Contura Architecture Framework (CAF) v1**  
2. **Contura Document Output Standards v1**  
3. **Contura Architecture Library Roadmap v1 (Phase 2 pattern libraries)**  
4. **Contura ADR Standard v1**  
5. **Contura AI Safety Gate Specification v1**  
6. **Contura AI Observability & Evaluation Specification v1**  
7. **Contura SaaS Foundation Statement v1** (AI-first, cloud-native, multi-tenant SaaS baseline)  

Where this guide is ambiguous, upstream documents prevail.

---

## Document Status

- **Type:** Phase 2 foundational pattern library document  
- **Stability:** Draft v1 (normative intent, subject to refinement)  
- **Intended audience:**  
  - Contura architects and platform engineers  
  - Product and application engineers  
  - Data and ML/AI platform engineers  
  - Security, compliance, and operations teams  
  - Automated agents participating in design, evaluation, or governance  

---

## Purpose

This guide defines the **Control/Application/Data Plane pattern** for the **Contura AI-first, cloud-native, multi-tenant SaaS platform**.

It establishes:

- A shared vocabulary for **Control Plane**, **Application Plane**, and **Data Plane**  
- The **normative boundaries** between planes  
- **Allowed and prohibited** cross-plane interactions  
- How tri-plane separation supports **SaaS multi-tenancy, safety, and AI governance**  
- How planes integrate with **ADRs**, **AI Safety Gates**, and **Observability/Evaluation** mechanisms  

It is intentionally **explanatory and normative**: it explains *why* the tri-plane separation exists in a SaaS context and prescribes how Contura implementations **must** behave.

The planes defined in this document describe architectural roles within the system.
Architectural intent is defined upstream in CAF and the Contura Architecture Library.
The Control Plane evaluates and enforces that intent at runtime, directly or via delegated enforcement; it does not introduce new architectural intent.

---

## Scope and Non-Goals

### In scope

- Definition of Control/Application/Data Plane for **Contura SaaS**  
- SaaS-first rationale for tri-plane architecture  
- Tenant, user, service, and agent responsibilities across planes  
- Tenancy propagation and isolation across planes  
- AI and agent behavior constraints per plane  
- Identity and policy expectations per plane  
- Cross-plane interaction rules (allowed vs prohibited)  
- Hooks for observability, evaluation, and AI safety gates  
- Normative guidance suitable for ADRs and pattern reuse  

### Out of scope

- Detailed technology selection (e.g., specific cloud providers, databases, message buses)  
- Low-level implementation details (e.g., exact table schemas, code APIs)  
- Product UX design beyond structural placement (e.g., pixel-perfect admin UIs)  
- Full AI evaluation frameworks (covered in AI Observability & Evaluation Spec v1)  
- Full AI safety classification and workflows (covered in AI Safety Gate Spec v1)  

This guide gives **architectural and behavioral constraints**, not vendor-specific cookbook recipes.

---

## SaaS Foundation and Rationale for Tri-Plane Architecture

Contura is explicitly an:

- **AI-first**  
- **Cloud-native**  
- **Multi-tenant SaaS platform**  

The tri-plane structure is not decorative; it is the **mechanism by which we make SaaS safe, governable, and scalable**.

### Why tri-plane for SaaS?

Tri-plane separation is the architectural answer to these SaaS realities:

1. **Multi-Tenancy & Isolation**  
   - Many tenants share infrastructure.  
   - We must ensure **no cross-tenant data leakage**, and **no tenant can affect platform-wide behavior**.  
   - The planes provide **clear containment zones** so that tenant behavior lives in the **Application/Data Planes**, while platform governance lives in the **Control Plane**.

2. **Platform Governance vs Tenant Business Workflows**  
   - SaaS platforms must manage: tenant lifecycle, feature entitlements, billing, AI policies, and compliance.  
   - Those responsibilities are **platform-level**, and belong to the **Control Plane**, not to tenant-facing code.  
   - This avoids scattering governance logic into all product services.

3. **Scaling Across Many Tenants**  
   - The number of tenants, workflows, and AI calls can grow by orders of magnitude.  
   - Each plane must scale **independently**:  
     - Control Plane: modest but **highly reliable** management traffic  
     - Application Plane: high-volume **tenant-facing workload**  
     - Data Plane: heavy **storage, computation, AI inference**  
   - Tri-plane separation protects the Control Plane from being overwhelmed by tenant workloads.

4. **AI Governance and Risk Management**  
   - AI models and agents can amplify mistakes and create new failure modes.  
   - AI governance (models, prompts, tools, guardrails) is inherently a **platform concern**.  
   - The Control Plane sets AI policy; the Application Plane executes AI workflows; the Data Plane performs inference.  
   - This separation makes AI behavior **auditable, enforceable, and reversible**.

5. **Zero Trust and Identity-Centric Security**  
   - In a multi-tenant SaaS, there is no “trusted internal network.”  
   - Every user, service, and agent must be authenticated and authorized per operation.  
   - The Control Plane holds the **identity and policy control**, while the Application and Data Planes **consume** identity and policy to decide what is allowed.

6. **Organizational Clarity**  
   - SaaS organizations naturally split into:  
     - Platform & Governance (Control Plane)  
     - Product & Experience (Application Plane)  
     - Data & ML Platform (Data Plane)  
   - The tri-plane pattern **mirrors how teams work**, improving clarity and accountability.

7. **Reliability and Blast Radius Management**  
   - A misconfiguration, noisy tenant, or misbehaving agent must not bring down the whole platform.  
   - The Control Plane acts as a **safety kernel** and **source of truth**, while the Application/Data Planes are replaceable and constrained.  

**Normative statement:**  

> All Contura SaaS systems **MUST** be designed and reasoned about in terms of Control, Application, and Data Planes. Any architecture that erodes these boundaries SHOULD be treated as an exception, justified explicitly in ADRs, and subject to heightened review.

---

## Core Plane Definitions

This section provides **canonical definitions** of the three planes in a SaaS context.

### Control Plane (CP)

The **Control Plane** is the **platform governance and management plane**.

It is responsible for:

- Managing **tenants** and their lifecycle  
- Managing **platform-level users** (Contura staff, automation, support), and governing tenant user identity integration  
- Hosting **global policies, configuration, and entitlements**  
- Coordinating **provisioning and lifecycle** of application and data resources  
- Governing **AI usage, models, and safety gates**  
- Aggregating **telemetry, audit logs, and billing usage**  

It is **not** where tenant business workflows run; it is where the **SaaS platform itself is operated and governed**.

### Application Plane (AP)

The **Application Plane** is the **tenant-facing SaaS product plane**.

It is responsible for:

- Delivering **tenant-visible features and experiences**  
- Executing **business workflows** for each tenant (including AI-assisted workflows)  
- Orchestrating **tenant-specific agents, tools, and APIs**  
- Enforcing **tenant-level policy** as configured by the Control Plane  
- Propagating **tenant context** and identity into the Data Plane  

From the tenant’s point of view, this **is** the “SaaS application.”

### Data Plane (DP)

The **Data Plane** is the **storage and computation plane**.

It is responsible for:

- Storing and retrieving tenant data  
- Executing queries, transactions, and analytics  
- Serving AI models (inference), embeddings, and vector/indexed retrieval  
- Enforcing **data-level isolation** and retention policies  

The Data Plane is **driven by** the Application and Control Planes; it does not self-govern.

---

## Core Architectural Principles and Constraints

The following principles are **normative** for all Contura systems.

### Separation of Concerns

- Control, Application, and Data Planes **MUST** have clearly defined, non-overlapping responsibilities.  
- Business workflows **MUST NOT** be implemented in the Control Plane.  
- Platform governance and multi-tenant operations **MUST NOT** be embedded ad-hoc inside Application or Data Plane code.

### SaaS-First Orientation

- All responsibilities **MUST** be evaluated in terms of their impact on:  
  - multi-tenancy and isolation  
  - SaaS operations and governance  
  - AI risk and compliance  
- Where ambiguity arises, **platform-wide concerns** belong to the Control Plane; **tenant-specific business behavior** belongs to the Application Plane.

### Tenant Context Propagation

- Every tenant-facing request **MUST** carry a **tenant context** from the first entry point through AP to DP.  
- Tenant context **MUST** be applied to logs, traces, metrics, and data operations.  
- Any processing path that cannot reliably propagate tenant context is **not allowed** for multi-tenant workloads.

### Zero Trust

- No implicit trust between planes or services.  
- Every cross-plane call **MUST** be authenticated and authorized.  
- Control Plane is the **primary source** of identity governance and authoritative policy intent; Application and Data Planes enforce authorization decisions within delegated scope.

### AI Safety and Governance

- AI policies, allowed models, and tool permissions **MUST** be controlled centrally via the Control Plane.  
- The Application Plane **MUST** treat AI outputs as untrusted input.  
- Data Plane AI components (e.g., model serving) **MUST NOT** bypass Control Plane policies.

### Evolvability and Replaceability

- Application and Data Plane components **MUST** be replaceable without compromising Control Plane invariants.  
- Planes **MUST** be designed so they can scale independently and be operated by distinct teams.

---

## Responsibilities and Boundaries per Plane

### Control Plane Responsibilities

The Control Plane is responsible for **platform-level concerns**:

- **Tenant lifecycle management**  
  - Create, update, suspend, resume, and delete tenants  
  - Track tenant metadata (plan, region, compliance posture)  
- **Platform and tenant identity governance**  
  - Manage Contura internal users, operators, and bots  
  - Integrate with tenant IdPs and govern tenant user identity patterns  
  - Govern service identities and agent identities (see Agent Identity Pattern)  
- **Policy and configuration**  
  - Global feature flags and entitlements  
  - Rate limits, quotas, usage policies  
  - AI and data governance policies  
- **Resource orchestration**  
  - Provision/adjust Application Plane deployments per tenant or per tier  
  - Provision/adjust Data Plane resources (schemas, databases, indexes, queues)  
- **Telemetry, observability, and cost governance signals**
  - Aggregate per-tenant and per-plane metrics
  - Derive cost attribution and cost governance signals (usage, quotas, budgets, entitlements)
  - Expose administrative views for operations and support

**Boundary constraints:**

- Control Plane **MUST NOT** implement end-user domain workflows (e.g., “create invoice,” “generate focus space content”).  
- Control Plane **MUST NOT** store bulk tenant business data (only metadata and governance data).  
- Control Plane **MUST** interact with Application and Data Planes through **stable, audited interfaces** (APIs or events).

### Application Plane Responsibilities

The Application Plane is responsible for **tenant-facing business capabilities**:

- **Tenant user experiences and APIs**  
  - Frontend and backend logic tenants interact with  
  - Public APIs and integrations under per-tenant identity  
- **Business workflows**  
  - Purchase flows, subscription usage flows, “focus space” workflows, etc.  
  - Any tenant-specific orchestration of steps that produce business outcomes  
- **AI orchestration**  
  - Running agents under policy from the Control Plane  
  - Managing prompts, retrievals, and tool calls at runtime  
- **Runtime policy enforcement**  
  - Applying feature flags and limits from the Control Plane  
  - Enforcing per-tenant and per-user authorization  
- **Tenant context propagation and isolation**  
  - Carrying tenant identity through services and into the Data Plane  

**Boundary constraints:**

- Application Plane **MUST NOT** bypass Control Plane for global policy or tenant lifecycle changes.  
- Application Plane **MUST NOT** invent independent notions of tenants or plans.  
- Application Plane **MUST NOT** act as an ad-hoc control plane (e.g., manually provisioning DBs without CP orchestration).

### Data Plane Responsibilities

The Data Plane is responsible for **data storage and computation**:

- **Storage**  
  - Transactional data stores  
  - Object stores and file repositories  
  - Vector stores and indexes  
- **Computation**  
  - Query and transaction execution  
  - Analytics workloads  
  - Model inference and embedding computation  
**Data governance execution (delegated)**  
  - Retention policies, deletion, encryption-at-rest, as defined by Control Plane policy  
  - Data-level isolation, e.g., row-level or namespace-level  

**Boundary constraints:**

- Data Plane **MUST NOT** make global governance decisions.  
- Data Plane **MUST NOT** originate tenant lifecycle changes.  
- Data Plane **MUST NOT** provide direct end-user access that bypasses Application Plane authorization.  

---

## Tenancy and Multi-Tenancy Pattern Overview

Tri-plane architecture is shaped by **SaaS multi-tenancy**.

### Tenant as First-Class Concept

- “Tenant” is a **first-class platform concept** defined and tracked in the Control Plane.  
- Tenant context is **mandatory** for all Application Plane and Data Plane operations that touch tenant data.  
- The same human user may belong to multiple tenants (e.g., *arylwen* in three tenants); identity and session design must support this.

### Shared vs Isolated Resources

- **Control Plane** is generally **shared** across all tenants (one global CP per environment).  
- **Application Plane** may be:
  - Shared across many tenants (pooled)  
  - Partially isolated per tier (e.g., dedicated app stacks for enterprise tenants)  
- **Data Plane** may be:
  - Fully pooled (logical isolation)  
  - Sharded (grouped tenants)  
  - Dedicated per tenant (silo)  

Hybrid patterns are expected and governed via Control Plane policy.

### Tenant Context Propagation Rules

- Tenant context **MUST** be established at first entry (e.g., subdomain, token claim).  
- Downstream calls (AP→AP, AP→DP) **MUST** carry this context explicitly.  
- Logs, traces, and metrics **MUST** include tenant identifiers unless explicitly justified in an ADR.

---

## Cross-Plane Interaction Patterns

This section defines **allowed and prohibited** interactions between planes.

### Allowed Patterns

- **Control → Application (orchestrated)**  
  - CP instructs AP to create tenant bootstrap data, rotate secrets, or trigger maintenance.  
- **Control → Data (policy distribution and provisioning)**  
  - CP creates databases, schemas, indexes, queues, retention rules.  
- **Application → Data (business operations)**  
  - AP executes tenant-scoped queries, retrievals, and inference calls.  
**Application → Control (feedback and requests)**  
  - AP sends usage events, anomaly alerts, or submits requests for CP to evaluate a tenant plan change (CP remains authoritative).  

### Prohibited Patterns

- **Data Plane → Control Plane autonomous changes**  
  - Data components must not autonomously create tenants or change policies.  
- **Application or Data bypassing Control Plane policy**  
  - No “backdoor” configuration or AI operations that bypass Control Plane policy or governance.  
- **Any cross-tenant data exposure**  
  - No shared caches, logs, or indexes without robust tenant scoping.  
- **Agents or services with unbounded authority**  
  - Agents must never hold privileges that exceed their configured identity (see Agent Identity Pattern).  

Where a design requires an exception, it **MUST** be captured and justified in an ADR.

---

## Workflow Patterns: Orchestration and Choreography

Contura recognizes both **orchestration** and **choreography** patterns, but assigns them carefully to planes.

### Control Plane: Orchestration Only

- Control Plane acts as a **central orchestrator** of platform workflows:  
  - Tenant provisioning and offboarding  
  - Resource scaling and migration  
  - Policy rollout and rollback  
- CP may use **events or message buses** to communicate with AP and DP, but these events are part of an **orchestrated workflow**, not free-form choreography.  
- Example:  
  - “TenantCreated” event emitted by CP → AP bootstrap service consumes event and initializes tenant data. CP remains the **source of truth**.

### Application Plane: Tenant Workflow Orchestration + Internal Choreography

- Application Plane orchestrates **tenant business workflows** (e.g., purchase flows, focus space workflows) using CP policy and DP data.  
- AP may use **choreography** between its own services (e.g., event-driven microservices) as long as:  
  - Tenant context is preserved.  
  - Global invariants defined by CP are not violated.

### Data Plane: No Orchestration of Governance

- Data Plane may orchestrate **data-internal** tasks (e.g., index maintenance), but **not** tenant lifecycle or platform policies.

**Normative statement:**  

> All platform-level workflows (tenant lifecycle, policy rollout, AI configuration) **MUST** be orchestrated by the Control Plane.  
> Tenant business workflows **MUST** be orchestrated in the Application Plane.

---

## AI-First and Agentic Behavior Patterns

Tri-plane separation is especially important for **AI-first** SaaS.

### Control Plane AI Responsibilities

- Define **allowed models**, providers, and regions.  
- Define and version **prompt templates**, agent workflows, and tool schemas.  
- Configure **AI Safety Gates**, thresholds, and human-in-the-loop requirements.  
- Apply **cost controls** (budgets, quotas, rate limits).  

### Application Plane AI Responsibilities

- Execute AI workflows and agents under CP policy.  
- Construct prompts, orchestrate retrieval, and tool calls.  
- Enforce Safety Gate decisions (reject, redact, escalate).  
- Treat AI outputs as untrusted, applying validation and post-processing.

### Data Plane AI Responsibilities

- Host model serving infrastructure, vector stores, and embedding computation.  
- Store AI logs, prompts, and traces when required.  
- Execute inference and retrieval operations under AP/CP instructions.

AI behavior must always be explainable in terms of **which plane decided what**:

- CP: *what is allowed*  
- AP: *what was attempted and executed*  
- DP: *what data and models were used*

---

## Agent Identity Pattern (Normative Summary)

This is a **normative summary** of the dedicated Agent Identity Pattern.  
A full ADR-style Agent Identity Pattern may be produced separately.

### Goals

- Ensure AI agents operate with **clear, constrained identities**.  
- Prevent agents from escalating privileges or crossing tenant/platform boundaries.  
- Preserve **auditability** of agent actions.

### Pattern Elements

1. **Agent as a First-Class Principal Type**  
   - Agents are modeled as principals distinct from humans and services.  
   - Each agent instance must have:  
     - a **tenant**  
     - a **principal type** (“agent”)  
     - an **actor identity** (see below)  

2. **Default Identity Inheritance**

   - By default, an agent **inherits the identity** of the **user** who initiated it:  
     - same tenant  
     - same roles or a safe subset of roles  
   - This ensures the agent cannot do more than the user could have done manually.

3. **Configurable Agent Identities**

   - Tenant admins and platform operators **MAY**, subject to Control Plane policy, configure agents to run under:
     - a **dedicated agent identity** (e.g., “tenant-analytics-agent@tenantX”)  
     - a **service principal identity** (e.g., “report-scheduler@contura”)  
   - Such identities must:  
     - be explicitly created and governed in the Control Plane  
     - have **principle-of-least-privilege** permissions  
     - be transparently visible in audit logs  

   Example:  
   - A tenant defines a recurring “adaptive youtube scheduling agent.”  
   - Admin configures it to run under a dedicated agent identity with rights restricted to scheduling workflows, not global platform configuration.

4. **Plane Responsibilities**

   - **Control Plane**  
     - Owns **agent identity definitions, roles, and policies**.  
     - Approves which planes and services may assume a given agent identity.  
     - Records **who configured** which agent identities that way.
   - **Application Plane**  
     - Instantiates and runs agents under an assigned identity.  
     - Ensures each tool call uses that identity for authorization.  
     - Attaches the correct identity and tenant context to all logs and traces.  
   - **Data Plane**  
     - Enforces access rules based on agent identity and tenant context.  
     - Must not accept raw end-user credentials from agents.

5. **Prohibitions**

   - Agents **MUST NOT** act with an identity that bypasses Safety Gate evaluation.  
   - Agents **MUST NOT** assume privileges broader than their configured identity.  
   - Agents **MUST NOT** change their own identity at runtime.  

**Normative statement:**  

> All Contura AI agents **MUST** operate under identities that are explicitly governed by the Control Plane and enforced by the Application and Data Planes.  
> Default inheritance is from the initiating user; deviations require explicit configuration and governance.

---

## Identity, Access, and Zero Trust Across Planes

### Identity Types

Contura recognizes at least four principal categories:

- **Platform users** (Contura employees, operators, bots)  
- **Tenant users** (end-users within a tenant)  
- **Services** (backend components)  
- **Agents** (AI or automated workflows)

### Control Plane Identity Role

- Acts as the **identity control layer** for the platform.  
- Governs:  
  - Contura-internal user and service identities  
  - Tenant identity integration patterns (e.g., SSO configurations)  
  - Agent identity definitions and policies  
- Does not need to store all tenant user attributes, but **MUST** be the source of truth for how tenants integrate identity.

### Application Plane Identity Role

- Validates tokens issued under CP governance.  
- Applies **authorization** to tenant workflows.  
- Propagates identity into logs, traces, and Data Plane operations.

### Data Plane Identity Role

- Enforces access at data level (e.g., roles, row-level security, key scoping).  
- Does not directly authenticate end-users; trusts **AP and CP** to establish identity.

### Zero Trust Norms

- All cross-plane calls **MUST** be authenticated and authorized.  
- Every principal’s access **MUST** be constrained to least privilege.  
- Identity and tenant context **MUST** be present in all critical logs.

---

## Observability, Telemetry, and Evaluation Hooks

Tri-plane SaaS must be **observable and evaluable**.

### Control Plane Telemetry

- Tenant lifecycle events  
- Policy changes and configuration history  
- AI governance decisions (e.g., model version assignments)  
- Operator and admin actions  

### Application Plane Telemetry

- Per-tenant request rates, latencies, errors  
- AI agent traces (tools called, steps taken)  
- Authorization failures  
- Feature usage metrics and workflow outcomes  

### Data Plane Telemetry

- Query performance and errors  
- Storage utilization per tenant / shard  
- Model inference metrics (latency, failures, cost)  
- Data policy execution (retention, deletion)  

### AI Observability Hooks

- Logs and traces for: prompts, retrieved context IDs, model outputs, Safety Gate decisions, and any actions taken by agents.  
- Evaluation pipelines (as defined in AI Observability & Evaluation Spec v1) **MUST** tie into these traces for quality and drift assessment.

**Normative statement:**  

> Any AI or multi-tenant behavior that cannot be observed and traced with tenant and principal context is not acceptable for production Contura systems.

---

## Safety, Guardrails, and AI Safety Gate Integration

This Pattern Guide is tightly coupled with the **AI Safety Gate Specification v1**.

### Control Plane Responsibilities (Safety & Guardrails)

- Define Safety Gate configurations (thresholds, escalation rules).  
- Register which AI flows require human review.  
- Ensure Safety Gates are applied consistently across all AP services.

### Application Plane Responsibilities (Safety & Guardrails)

- Integrate Safety Gate checks into AI workflows.  
- Respect Safety Gate decisions (block, redact, defer to human).  
- Surface meaningful error / explanation messages to users.

### Data Plane Responsibilities (Safety & Guardrails)

- Store Safety Gate logs where needed.  
- Ensure that AI-related data (e.g., prompts, outputs) are retained or deleted per policy.  

Any AI workflow that bypasses configured Safety Gates is **non-compliant**.

---

## Versioning, Evolution, and ADR Integration

Tri-plane architecture is a **living structure** that evolves over time.

### Versioning Expectations

- Major changes to responsibilities or boundaries **MUST** be recorded as ADRs.  
- AI model and prompt versions **MUST** be governed via the Control Plane.  
- Per-plane deployments **SHOULD** be independently versioned.

### ADR Integration

- ADRs that change cross-plane interactions **MUST** reference this Pattern Guide explicitly.  
- Conflicts between local ADRs and this Guide **MUST** be resolved by updating either the ADR or this Guide; silent divergence is not allowed.

### Evolution

- As Contura grows, more specialized patterns (e.g., “Multi-Region Control Plane Pattern,” “Agent Identity Pattern ADR”) may be added, but they **MUST** remain consistent with this guide’s principles.

---

## Minimal Text Diagrams

The diagrams below are **illustrative only** and intentionally minimal.

### Overall Tri-Plane SaaS View

Control Plane (CP)

- Tenant Catalog
- Identity & Policy
- AI Governance & Safety Gates
- Telemetry & Billing
- Orchestration

Application Plane (AP)

- Tenant APIs & UI
- Business Workflows
- Agent Orchestration
- Integration Services

Data Plane (DP)

- Databases & Schemas
- Object / File Storage
- Vector Stores & Indexes
- Model Serving & Analytics

Flow:
User → AP → DP  
CP → AP / DP orchestration & policy  
AP → CP feedback & telemetry  

### Agent Identity Flow (Simplified)

User (Tenant)  
  ↓ (auth)  
AP Entry / Gateway  
  ↓ (start agent with identity)  
Agent Runtime (AP)  
  ↓ (tool call)  
Application or Data Service  
  ↓ (data access)  
Data Plane

Control Plane:

- Defines agent identity and roles  
- Evaluates policy where needed  
- Receives telemetry and AI traces  

---

## Version History

- **v1.0** – Initial tri-plane pattern guide with SaaS-first framing, AI-first constraints, and Agent Identity Pattern summary.  

---

## Non-Normative References

These references are informative. They do not override Contura norms but provide context.

1. **AWS SaaS Control Plane Guidance**  
   Discussions of SaaS control vs application planes, tenant lifecycle management, and operational separation in multi-tenant SaaS.

2. **Azure Multitenant Control Plane Guidance**  
   Patterns for centralized control planes overseeing multi-tenant solutions, tenant catalogs, and automated provisioning/orchestration.

3. **SoftWhat – Aligning SaaS and Service Planes**  
   Conceptual mapping between service-level control/data planes and SaaS-level Control/Application/Data Planes.

4. **Multi-Tenant SaaS Architecture Practice (Industry Blogs and Talks)**  
   Practical experiences with pooled vs siloed tenancy, sharding, tenant isolation, and hybrid models in real-world SaaS.

5. **Service Mesh and Cloud-Native Control/Data Plane Patterns**  
   General patterns from Kubernetes, service mesh, and cloud provider management planes that inspired Contura’s tri-plane approach.

6. **AI Gateway and AI Control Plane Patterns**  
   Emerging patterns around AI gateways that manage model routing, budgets, and safety as a specialized control-plane for AI.

7. **LLM Observability and Evaluation Practice**  
   Industry guidance on tracing prompts, tool calls, guardrail decisions, and evaluation loops for large language model systems.

8. **Zero Trust and Identity Control Plane Research**  
   Research on Identity Control Planes and Zero Trust architectures that unify user, service, and agent identity and policy enforcement.

9. **SaaS Security and Multi-Tenancy Risk Analyses**  
   Overviews of common multi-tenant failure modes (noisy neighbors, data leaks, misconfigured APIs), and corresponding mitigation patterns.

10. **Industry Discussions on Multi-Tenant Evolution and Anti-Patterns**  
    Practitioner discussions on over-isolation, manual tenant ops, lack of control planes, and the importance of early governance patterns.

---
