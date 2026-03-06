# Contura Multi-Tenancy Validation Guide v1 — User Guide (Examples)

## Purpose

This document provides **positive (PASS)** and **negative (FAIL)** examples for each validation question in the **Contura Multi-Tenancy Validation Guide v1**.

This guide is **informative**, not normative.  
It introduces **no new requirements** and does **not reinterpret** the source guide.  
Each example illustrates how a checklist item may be satisfied or violated in practice.

---

## 1. Global Tenancy Invariants

**Does every Resource belong to exactly one Tenant?**

- PASS: A document record includes a single immutable `tenant_id` set at creation and validated on every access.
- FAIL: A document can exist without a `tenant_id`, or can be reassigned to a different tenant.

**Is explicit Tenant Context required for every request, action, and execution?**

- PASS: Every API handler requires a resolved Tenant Context object before execution.
- FAIL: Business logic executes assuming a “current tenant” stored in global state.

**Is implicit or inferred tenant context completely prohibited?**

- PASS: Tenant identity is derived only from signed tokens or verified domains.
- FAIL: Tenant is inferred from a resource ID prefix or UI selection alone.

**Is AccountScope the sole authority for billing, authentication configuration, and compliance policy?**

- PASS: Entitlements and SSO configuration are loaded only from AccountScope metadata.
- FAIL: Individual services maintain their own billing or SSO logic.

**Are Workspaces explicitly prevented from acting as tenant or governance boundaries?**

- PASS: Workspaces group resources but do not own billing, auth, or compliance settings.
- FAIL: Workspace admins can configure authentication or billing rules.

**Are CostCenters prevented from influencing isolation, routing, or authorization?**

- PASS: CostCenters are used only for reporting and attribution.
- FAIL: Requests are routed or authorized differently based on CostCenter.

**Are tenancy boundaries intentional and high-friction by design?**

- PASS: Tenant creation requires explicit provisioning and audit.
- FAIL: Tenants are auto-created implicitly during normal user actions.

---

## 2. Routing & Tenant Context Validation

**Is tenant identity resolved exactly once per request or invocation?**

- PASS: Tenant is resolved at ingress and treated as immutable.
- FAIL: Tenant is re-resolved inside downstream business logic.

**Is the tenant identifier sourced from an authoritative input?**

- PASS: Tenant ID comes from a signed token claim.
- FAIL: Tenant ID is accepted directly from a request body field.

**Does the system fail closed if tenant context is missing or ambiguous?**

- PASS: Requests without valid Tenant Context are rejected.
- FAIL: Requests default to a “global” or “system” tenant.

**Is Tenant Context bound immutably at the start of execution?**

- PASS: Tenant Context is read-only once created.
- FAIL: Code mutates tenant context mid-request.

**Is Tenant Context propagated across all synchronous calls?**

- PASS: Downstream service calls require tenant-scoped headers.
- FAIL: Internal calls omit tenant information.

**Is Tenant Context propagated across all asynchronous boundaries?**

- PASS: Jobs and events carry signed tenant envelopes.
- FAIL: Background workers run without tenant validation.

**Are background jobs prevented from executing without validated Tenant Context?**

- PASS: Job consumers reject messages lacking tenant binding.
- FAIL: Cron jobs run globally and infer tenant later.

**Are routing decisions deterministic and auditable?**

- PASS: Routing decisions are logged with tenant identifiers.
- FAIL: Routing logic depends on dynamic runtime heuristics.

**Is tenant context validated against resource ownership at enforcement points?**

- PASS: Resource access checks confirm matching tenant ownership.
- FAIL: Resource IDs are trusted without ownership validation.

---

## 3. Identity & Access Validation

**Is every identity action evaluated within explicit Tenant Context?**

- PASS: Authorization checks always include tenant scope.
- FAIL: Identity checks run without tenant awareness.

**Are user sessions scoped to exactly one tenant?**

- PASS: Switching tenants issues a new session token.
- FAIL: A single session spans multiple tenants.

**Does tenant switching require minting a new tenant-scoped session or token?**

- PASS: Old tokens are invalidated on tenant switch.
- FAIL: Tenant switching updates UI state only.

**Are service identities prevented from bypassing tenant enforcement?**

- PASS: Services propagate and enforce incoming tenant context.
- FAIL: Internal services access data without tenant checks.

**Are agent identities explicitly tenant-scoped?**

- PASS: Agent tokens include tenant and role claims.
- FAIL: Agents run under a generic system identity.

**Is delegated agent identity explicit, constrained, and auditable?**

- PASS: Delegated roles are approved and logged.
- FAIL: Agents assume elevated permissions implicitly.

**Is privilege escalation without explicit policy prohibited?**

- PASS: Permission requests are denied unless policy allows.
- FAIL: Agents gain permissions dynamically during execution.

**Do authorization checks always validate tenant ownership of resources?**

- PASS: Authorization verifies both role and tenant ownership.
- FAIL: Role checks ignore tenant boundaries.

**Are tokens or sessions prohibited from spanning multiple tenants?**

- PASS: Tokens contain exactly one tenant claim.
- FAIL: Tokens are valid across multiple tenants.

---

## 4. Lifecycle Validation

**Is tenant creation deliberate and high-friction?**

- PASS: Tenant creation requires explicit admin action.
- FAIL: Tenants are auto-created on first login.

**Are Tenant and AccountScope created atomically?**

- PASS: Both are provisioned in a single transaction.
- FAIL: Tenant exists without governance metadata.

**Is initial administrative identity explicitly bound at tenant creation?**

- PASS: Creator is recorded as initial admin.
- FAIL: Admin role is assigned later implicitly.

**Are lifecycle state transitions explicit and auditable?**

- PASS: State changes emit audit events.
- FAIL: State changes are inferred from data absence.

**Does suspension reliably prevent mutating actions?**

- PASS: Writes are blocked during suspension.
- FAIL: Suspended tenants can still modify data.

**Are agents halted or degraded safely during tenant suspension?**

- PASS: Agents are paused automatically.
- FAIL: Agents continue running during suspension.

**Is tenant termination irreversible at the logical level?**

- PASS: Access is permanently revoked.
- FAIL: Terminated tenants can be reactivated silently.

**Are all resources prevented from outliving their tenant?**

- PASS: Resources are deleted or archived with tenant.
- FAIL: Resources persist after tenant deletion.

**Are tenant migrations executed as explicit lifecycle workflows?**

- PASS: Migration jobs are tracked and auditable.
- FAIL: Data is moved manually without lifecycle tracking.

**Is Tenant Context preserved throughout migrations and rebalancing?**

- PASS: Migration steps enforce tenant context.
- FAIL: Migration scripts operate globally.

---

## 5. Isolation Validation

**Is the selected isolation mode explicit metadata governed by Control Plane policy?**

- PASS: Isolation mode is stored and enforced centrally.
- FAIL: Isolation logic is hard-coded per service.

**Are data access paths tenant-scoped by construction?**

- PASS: Queries require tenant filters by default.
- FAIL: Queries rely on developer discipline.

**Are cache keys guaranteed to include tenant identifiers?**

- PASS: Cache keys are prefixed with tenant ID.
- FAIL: Shared cache keys are reused across tenants.

**Is cross-tenant data access structurally impossible?**

- PASS: Enforcement exists at multiple layers.
- FAIL: Single missing check can leak data.

**Are hybrid or silo isolation modes enforced without bypassing Tenant Context rules?**

- PASS: Dedicated infrastructure still enforces tenant context.
- FAIL: Dedicated stacks bypass application-level checks.

**Is network isolation treated as supplementary, not authoritative?**

- PASS: Application checks remain mandatory.
- FAIL: Network boundaries replace application enforcement.

**Is isolation strength consistent with declared tenancy mode?**

- PASS: Observability confirms isolation behavior.
- FAIL: Actual behavior diverges from declared mode.

---

## 6. Cost & Usage Enforcement Validation

**Is usage metered at well-defined execution boundaries?**

- PASS: Each API call emits a metering event.
- FAIL: Usage is estimated offline.

**Does every metering event include tenant identifier and acting principal?**

- PASS: Metering records include tenant and identity.
- FAIL: Metering aggregates across tenants.

**Is AccountScope the authoritative source of entitlements and quotas?**

- PASS: Runtime checks query AccountScope policy.
- FAIL: Services define local limits.

**Are entitlements enforced before or during execution?**

- PASS: Requests are rejected when limits are exceeded.
- FAIL: Limits are enforced only after billing.

**Are long-running executions subject to continuous budget checks?**

- PASS: Budgets are checked periodically.
- FAIL: Long jobs run unchecked.

**Are agents assigned explicit, tenant-scoped cost budgets?**

- PASS: Agents stop when budgets are exhausted.
- FAIL: Agents run indefinitely.

**Can agent or workflow execution be interrupted on budget exhaustion?**

- PASS: Execution halts safely.
- FAIL: Execution continues despite exhaustion.

**Are CostCenters limited to attribution only?**

- PASS: CostCenters do not affect execution.
- FAIL: CostCenters gate access.

**Is anomalous tenant spend detectable in near real time?**

- PASS: Alerts trigger on spend spikes.
- FAIL: Spend anomalies are discovered post-factum.

---

## 7. Observability, Audit & Safety Validation

**Do all logs include tenant identifiers?**

- PASS: Logs are tenant-tagged.
- FAIL: Logs omit tenant context.

**Do all metrics include tenant attribution?**

- PASS: Metrics are partitioned per tenant.
- FAIL: Metrics aggregate across tenants.

**Do all traces include tenant and principal context?**

- PASS: Traces correlate tenant and identity.
- FAIL: Traces lack tenant information.

**Are audit events immutable and tenant-scoped?**

- PASS: Audit logs are append-only and scoped.
- FAIL: Audit records can be modified.

**Are lifecycle, identity, and policy changes auditable?**

- PASS: All changes emit audit events.
- FAIL: Changes occur silently.

**Are Safety Gates evaluated with full Tenant Context?**

- PASS: Gates receive tenant and identity.
- FAIL: Gates evaluate without tenant scope.

**Do Safety Gates emit tenant-scoped telemetry?**

- PASS: Gate outcomes are logged per tenant.
- FAIL: Gate outcomes are global.

**Is blast radius attributable to a single tenant?**

- PASS: Incidents are traceable to one tenant.
- FAIL: Impact cannot be localized.

**Can execution paths be reconstructed end-to-end per tenant?**

- PASS: Full trace reconstruction is possible.
- FAIL: Gaps prevent reconstruction.

---

## 8. Agent-Specific Validation

**Do agents always operate under explicit Tenant Context?**

- PASS: Agents receive tenant-scoped tokens.
- FAIL: Agents infer tenant from memory.

**Is agent identity immutable for the duration of a run?**

- PASS: Identity cannot change mid-run.
- FAIL: Agents swap roles dynamically.

**Are agents prohibited from inferring tenant context from stored state?**

- PASS: Tenant context is always passed explicitly.
- FAIL: Agents reuse prior context implicitly.

**Are agent tool permissions explicitly scoped and enforced?**

- PASS: Tools validate tenant and role.
- FAIL: Tools trust agent blindly.

**Are agent actions fully auditable as first-class principals?**

- PASS: Agent actions emit audit records.
- FAIL: Agent actions are logged anonymously.

**Are agent executions bound to tenant lifecycle state?**

- PASS: Agents stop on suspension.
- FAIL: Agents ignore lifecycle changes.

**Are agents prevented from running for suspended or terminated tenants?**

- PASS: Execution is blocked.
- FAIL: Execution continues.

**Are agent reasoning, tool usage, and cost observable per tenant?**

- PASS: Observability captures all agent activity.
- FAIL: Agent internals are opaque.

---

## 9. Enterprise & Compliance Mode Validation

**Are compliance modes explicit, named, and policy-governed?**

- PASS: Mode is declared and enforced.
- FAIL: Enterprise behavior is implicit.

**Is the active compliance mode immutable per execution?**

- PASS: Mode cannot change mid-run.
- FAIL: Mode toggles dynamically.

**Are isolation changes executed via lifecycle workflows?**

- PASS: Changes follow audited workflows.
- FAIL: Isolation is changed manually.

**Are operator actions explicit, tenant-scoped, and auditable?**

- PASS: Operator actions require tenant selection.
- FAIL: Operators act globally.

**Is cross-tenant operator access deliberate and logged?**

- PASS: Access requires explicit approval.
- FAIL: Operators switch tenants silently.

**Are data residency constraints enforced via routing and placement?**

- PASS: Routing enforces residency.
- FAIL: Residency is advisory only.

**Are audit retention and legal hold policies governed by AccountScope?**

- PASS: Policies are centrally enforced.
- FAIL: Retention varies per service.

**Are AI autonomy and budgets stricter under enterprise modes?**

- PASS: Enterprise mode enforces tighter limits.
- FAIL: Enterprise mode relaxes controls.

**Does enterprise operation avoid custom forks or snowflake tenants?**

- PASS: Same architecture supports all modes.
- FAIL: Enterprise uses custom code paths.

---

## 10. Anti-Pattern Detection Checklist

**Is any tenant context implicit or inferred?**

- PASS: Tenant context is always explicit.
- FAIL: “Current tenant” globals exist.

**Are workspaces, projects, or folders acting as tenants?**

- PASS: Workspaces are non-governing.
- FAIL: Workspaces control billing or auth.

**Are billing plans or cost tiers used for authorization or isolation?**

- PASS: Billing informs policy only.
- FAIL: Billing gates access.

**Is any identity operating without tenant scope?**

- PASS: All identities are tenant-scoped.
- FAIL: Global admin identities exist.

**Are there multi-tenant sessions or tokens?**

- PASS: Tokens are single-tenant.
- FAIL: Tokens span tenants.

**Are agents executing without explicit identity or budgets?**

- PASS: Agents have scoped identity and limits.
- FAIL: Agents run unchecked.

**Are background jobs running without tenant binding?**

- PASS: Jobs validate tenant context.
- FAIL: Jobs infer tenant later.

**Is network isolation treated as sufficient on its own?**

- PASS: Application checks remain mandatory.
- FAIL: Network boundaries replace logic.

**Are enterprise customers handled via custom code paths?**

- PASS: Enterprise is a mode, not a fork.
- FAIL: Special-case code exists.

**Is governance deferred or introduced late in the lifecycle?**

- PASS: Governance exists from v1.
- FAIL: Governance is postponed.
