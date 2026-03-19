# Platform Posture / Architecture Brief  -  Example (Governed Agentic Review SaaS)

> This is a filled-in example PLATFORM_PRD intended for architects.
> It describes the platform posture for a boring SaaS review workflow that has been extended with governed agentic automation.

---

## Platform Framing

### One-liner

A governed execution platform for agent-assisted review workflows where agents can prepare evidence, retrieve tenant-scoped context, draft findings, and propose outcomes while policy, safety gates, and human approvals remain explicit.

### Target users / customers

- Platform engineers who own guarded execution and integration boundaries
- Review operations leads who need predictable human checkpoints
- Auditors and security stakeholders who need a complete trace of agent behavior

### Problem statement

Teams want to accelerate repetitive review work with AI, but they cannot afford hidden tool use, unbounded automation, or weak auditability. The platform must let agents help meaningfully without becoming an opaque authority path.

### Value proposition

Policy-derived authority, explicit step boundaries, tenant-scoped retrieval and memory, inline evidence, and human approval for consequential outcomes.

---

## Scope

### In scope

- Multi-step agent orchestration for review preparation, retrieval, drafting, and verification
- Explicit policy and safety-gate checks at step and tool boundaries
- Human approval checkpoints for guarded outcome classes
- Tenant-scoped retrieval, memory, and evidence storage
- Traceable final report publication from approved state

### Out of scope

- Open-ended autonomous action execution outside the review domain
- Cross-tenant shared memory or pooled retrieval indices
- Dynamic workflow programming by end users

### Assumptions

- First release remains single-region and local-friendly for demo and reference implementation purposes
- The agent runtime may call external model providers, but all control, policy, and evidence responsibilities stay inside the CAF-governed architecture

### Dependencies

- Organization identity provider for authentication (OIDC or SAML)
- Managed LLM / inference provider or equivalent internal inference runtime
- Durable storage for reports, evidence, and tenant-scoped memory

---

## Capabilities

### Capabilities index

| Capability ID | Name | Primary Actor | Trigger (short) | Notes |
| --- | --- | --- | --- | --- |
| CAP-001 | Manage review policies and thresholds | Policy Admin | Update review policy or approval threshold | Control-plane owned |
| CAP-002 | Execute a governed agentic review session | Review Workflow | Submission enters review | Multi-step agent workflow with gates |
| CAP-003 | Review, approve, or reject proposed outcomes | Review Lead | Proposal is ready for human decision | Human-in-the-loop |
| CAP-004 | Inspect evidence and export the trace | Auditor | Open a review session or export history | End-to-end correlation required |
| CAP-005 | Tenant administration and data lifecycle | Tenant Admin | Manage tenant settings or retention | Tenant-scoped admin |

### Capability blocks

### CAP-001  -  Manage review policies and thresholds

#### Actor

Policy Admin

#### Trigger

Policy Admin creates or updates review policy, approval thresholds, or guarded action classes.

#### Main Flow

1. Policy Admin edits policy or threshold settings.
2. The platform validates required fields and policy structure.
3. Policy Admin submits changes for review and approval.
4. On approval, the active policy set is updated for subsequent review sessions.

#### Postconditions

- Policy versions are attributable and versioned.
- Approval thresholds and guarded action classes are explicit.
- Policy change evidence exists.

#### Domain Entities

- Review Policy
- Policy Version
- Approval Threshold
- Policy Change Audit Record

---

### CAP-002  -  Execute a governed agentic review session

#### Actor

Review Workflow

#### Trigger

A submission reaches the ready-for-review state.

#### Main Flow

1. The platform starts a review session under explicit tenant context.
2. The preparation step validates submission completeness.
3. The retrieval step fetches tenant-scoped rules, prior decisions, and examples.
4. The reviewer step drafts findings and recommends an outcome.
5. The verifier step checks grounding, completeness, and policy coverage.
6. Safety gates run at required tool and escalation boundaries.
7. The workflow records evidence and either escalates for human approval or marks the proposal ready for final confirmation.

#### Postconditions

- Every review session has a correlated evidence chain.
- Tool use, retrieval, and escalation steps are attributable.
- No guarded outcome bypasses approval requirements.

#### Domain Entities

- Review Session
- Agent Review Proposal
- Review Evidence Record
- Delegation Evidence Record

---

### CAP-003  -  Review, approve, or reject proposed outcomes

#### Actor

Review Lead

#### Trigger

A review proposal is ready for human decision or requires escalation.

#### Main Flow

1. Review Lead inspects the proposal, verifier feedback, and evidence trace.
2. Review Lead approves, rejects, or requests revision.
3. The platform records the human decision and updates the session state.

#### Postconditions

- Consequential outcomes remain human-attributed.
- Approval state is explicit, bounded, and auditable.
- Review session state is updated deterministically.

#### Domain Entities

- Approval Decision
- Review Session
- Agent Review Proposal

---

### CAP-004  -  Inspect evidence and export the trace

#### Actor

Auditor

#### Trigger

Auditor opens a review session or requests a time-range export.

#### Main Flow

1. Auditor searches by tenant, submission, reviewer, outcome, or time range.
2. Auditor opens the review session to inspect request, findings, policy versions, safety-gate outcomes, and final decision.
3. Auditor requests an export of selected sessions.
4. The platform produces an export artifact and records the export event.

#### Postconditions

- The evidence chain is viewable end to end.
- Export artifacts are tied to the requesting identity.
- Export events are themselves auditable.

#### Domain Entities

- Review Evidence Record
- Export Request
- Export Artifact

---

### CAP-005  -  Tenant administration and data lifecycle

#### Actor

Tenant Admin

#### Trigger

Tenant Admin updates tenant settings, retention rules, or requests deletion.

#### Main Flow

1. Tenant Admin updates review and governance settings for the tenant.
2. Tenant Admin sets retention rules for evidence and reports.
3. Tenant Admin requests tenant-scoped deletion or backup export.
4. The platform performs the action and records an auditable lifecycle event.

#### Postconditions

- Tenant-scoped governance settings are updated.
- Retention and deletion actions are attributable and auditable.
- Backup and export remain tenant-scoped.

#### Domain Entities

- Tenant
- Tenant Setting
- Retention Rule
- Deletion Request
- Backup Export

---

## Quality Attributes

| Attribute | Target / SLO | Measurement / Evidence | Notes |
| --- | --- | --- | --- |
| Availability | 99.9 percent | Uptime checks and incident log | Single region initially |
| Latency | p95 500ms for review-state reads | API metrics | Multi-step review work may take longer |
| Security | Least privilege, explicit delegation, audit trail | Security checklist and trace review | Guardrails first |
| Privacy | Tenant separation | Access logs and data inventory | No cross-tenant retrieval or memory |
| Trust | Human approval on guarded outcomes | Approval and escalation logs | Bounded autonomy only |

---

## Constraints

| Constraint | Type (Business/Tech/Legal) | Rationale | Notes |
| --- | --- | --- | --- |
| Tenant scope must be explicit everywhere | Tech | Prevent cross-tenant leakage | Applies to retrieval and memory |
| Step and tool boundaries must be policy-checked | Tech | Prevent hidden or ambient authority | No bypass paths |
| Human approval required for guarded outcomes | Business | Preserve accountability and trust | Thresholds and classes are explicit |
| Keep the first release intentionally small | Business | Demonstrate modernization path clearly | One boring workflow is enough |

---

## Platform Posture

This architecture does not treat agentic workflows as a separate authority layer. It extends a simple SaaS review product with governed agentic automation: explicit delegation, bounded tool use, tenant-scoped retrieval and memory, visible escalation, and human approval where the outcome matters.
