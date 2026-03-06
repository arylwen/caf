# Contura Architecture Glossary v1

Version: v1  
Status: Authoritative  
Last Updated: 2025-12-13

## 1. Purpose & Role in the Architecture Library

This document defines the **authoritative terminology** used across the Contura Architecture Library.

Its purpose is to eliminate ambiguity and resolve apparent contradictions by making **scope, authority, and enforcement boundaries** explicit.

This glossary is:

- Normative for terminology (definitions and disallowed meanings)

- Upstream of all Phase 1 governance documents, Phase 2 pattern libraries, and Phase 3 domain frameworks

- Intended to be referenced by ADRs to prevent terminology drift

If a downstream document uses a term inconsistently with this glossary, the downstream document MUST be corrected.

---

## 2. Upstream Authority and Conflict Rules

This glossary MUST remain consistent with:

- `03_contura_architecture_framework_v1.md`
- `05_contura_saas_architecture_commitment_v1.md`
- `02_contura_document_output_standards_v2.md`
- `20_contura_control_application_data_plane_pattern_guide_v1.md`

Where conflicts arise, **CAF v1 prevails**.

---

## 3. Semantic Invariants

These semantic invariants define the fixed assumptions under which all glossary terms are interpreted.  
They are not architectural choices and are not subject to variation or override.  
Without these invariants, individual term definitions may appear locally correct while becoming globally inconsistent.

1. **Identity may be global. Authority is never global.**  
   A principal may have a single identity across tenants, but every action MUST execute under an explicit tenant context.

2. **Context is mandatory and explicit.**  
   Execution MUST fail closed if tenant context is missing or ambiguous.

3. **Plane roles are semantic, not deployment artifacts.**  
    - Architectural intent is defined upstream by CAF and the Architecture Library  
    - Control Plane evaluates and enforces declared intent  
    - Application Plane executes workflows under issued authority  
    - Data Plane stores and processes data and enforces data-level constraints

4. **Cost is a governance signal; billing is a business operation.**  
   Cost governance constrains system behavior. Invoicing and payments do not define architectural control boundaries.

---

## 4. Authoritative Glossary Table

| Term | Authoritative Definition | Allowed Meaning | Disallowed / Common Misread |
| --- | --- | --- | --- |
| AccountScope | The authoritative scope for billing configuration, authentication configuration, and compliance posture. | Governance scope for entitlements, SSO configuration, and compliance. | Treating Workspace as the authority for billing or compliance. |
| Application Plane (AP) | The plane that executes tenant and AI-driven application logic under Control Plane constraints. | Workflow execution, orchestration, enforcement. | Inventing policy or governance rules. |
| Architectural Identity | The set of architectural commitments that define what the system *is*. Identity consists of invariants that must always remain true for the system to still be considered the same system. | Non-negotiable architectural properties defined at the intent level (e.g., test-driven architecture, AI-first design, multi-tenant SaaS). | Implementation choices, delivery posture, technology stack, UX modality, or any attribute that may change without redefining the system. |
| Authority | The effective permissions for a specific invocation, derived from tenant context, policy, and role. | Tenant-scoped, policy-governed permissions. | Global or system-wide permissions. |
| Billing | Commercial operations such as invoicing, payments, taxes, and receipts. | Business-domain functionality. | Definition of governance boundaries. |
| Control intent | An authoritative expression of a decision that determines system-wide behavior and must be consumed by downstream systems without reinterpretation. | Issued by the Control Plane; consumed without reinterpretation. | Analytics results, local decisions, inferred behavior, or application-owned configuration. |
| Control Plane (CP) | The plane that defines intent and governs system-wide behavior. | Identity, policy, orchestration, safety gates. | Running tenant business workflows or storing tenant data. |
| CostCenter | A reporting and attribution construct with no enforcement authority. | Tag for attribution and reporting. | Isolation boundary or authorization input. |
| Cost Governance | Governance that constrains and attributes cost as a first-class resource. | Budgets, quotas, entitlements, interruption. | Billing or invoicing workflows. |
| Data Plane (DP) | The plane that stores and processes data and enforces governance constraints defined upstream. | Storage, retrieval, compute, inference paths. | Independent governance decisions or direct end-user exposure. |
| Enforcement Point | A stage where policy or invariants are applied and may block execution. | Pre-, mid-, or post-execution checks. | Best-effort or advisory-only checks. |
| Evidence | Immutable artifacts emitted by normal system operation proving enforcement. | Telemetry, audit events, policy decisions. | Manual attestations or post-hoc reconstruction. |
| Fail-closed | A design-time posture where absence of explicit declaration is treated as absence of permission. | Preventing inference, assumption, or scope expansion when information is missing. | Runtime failure semantics or error-handling behavior. |
| Global Identity | A single identity associated with multiple tenants via membership. | One identity, many tenant memberships. | A user acting without tenant context. |
| Governance (Architectural) | Machine-enforceable constraints that shape allowable system behavior and produce evidence. | Policies, invariants, enforcement points. | Governance as meetings or documentation only. |
| Implementation Posture | The set of implementation and delivery choices that describe how the system is realized at a point in time, without redefining its architectural identity. | Evolutionary realization choices constrained by identity (e.g., mobile-first experience, cloud-native deployment, specific stacks or infrastructure). | Architectural invariants, identity-defining commitments, or claims that must always be true across all implementations. |
| Policy | A machine-evaluable artifact producing deterministic outcomes given explicit context. | Executable rules evaluated at runtime. | Ad-hoc conditional logic or unversioned behavior. |
| Principal | Any actor capable of invoking actions: human user, service, or agent. | Subject of authorization and auditing. | Replacement for tenant context. |
| Principal Identity | A stable identifier for a principal across planes. | Who is acting, with roles and claims. | Implicit authority across tenants. |
| Safety Gate | A deterministic evaluative mechanism controlling AI execution and escalation. | Pre-, mid-, or post-execution gating with evidence. | Optional or bypassable checks. |
| System Shape | The abstract structural form of a system, encompassing its boundaries, major responsibilities, interaction patterns, and permitted modes of structural change over time. | Reasoning about structure and evolution independent of implementation. | Static diagrams or deployment topology. |
| Tenant | The primary isolation and governance boundary for data, policy enforcement, and execution context. Every resource belongs to exactly one tenant. | A single governed customer boundary used for isolation, authorization, and evidence. | A workspace, project, or UI grouping without enforcement meaning. |
| Tenant Context | The explicit runtime envelope binding an execution to exactly one tenant; resolved at ingress and immutable for the invocation. | Mandatory input to execution, logging, policy evaluation, and data access. | Inferred tenant, global “current tenant”, or late-binding tenant. |
| Tenant Switching | Establishing a new explicit tenant context for a new invocation. | Deliberate, auditable context change. | Mid-request tenant mutation or implicit carryover. |
| Workspace | A tenant-internal grouping construct with no governance authority. | Organizational grouping for UX and resource organization only. | Driving billing, authentication, compliance, isolation, or routing. |

---

## 5. Mandatory Terminology Rules

1. Documents MUST use **Global Identity** (not “global user”) for cross-tenant identity.
2. Documents MUST use **Tenant Context** when referring to runtime execution scope.
3. Documents MUST reserve **Billing** for commercial operations and use **Cost Governance** for governance constraints.
4. Any use of “global” MUST explicitly state whether it refers to identity (allowed) or authority (forbidden).
5. Terms such as “workspace”, “project”, or “org” MUST NOT be treated as governance boundaries unless explicitly declared as such.

---

## 6. Version History

- **v1** — Initial authoritative glossary defining core Contura terms, semantic invariants, and explicitly disallowed interpretations to prevent cross-document drift.
