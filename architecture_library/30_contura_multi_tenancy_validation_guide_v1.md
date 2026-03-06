# Contura Multi-Tenancy Validation Guide v1

## 1. Global Tenancy Invariants

- [ ] Does every Resource belong to exactly one Tenant?
- [ ] Is explicit Tenant Context required for every request, action, and execution?
- [ ] Is implicit or inferred tenant context completely prohibited?
- [ ] Is AccountScope the sole authority for billing, authentication configuration, and compliance policy?
- [ ] Are Workspaces explicitly prevented from acting as tenant or governance boundaries?
- [ ] Are CostCenters prevented from influencing isolation, routing, or authorization?
- [ ] Are tenancy boundaries intentional and high-friction by design?

## 2. Routing & Tenant Context Validation

- [ ] Is tenant identity resolved exactly once per request or invocation?
- [ ] Is the tenant identifier sourced from an authoritative input (token, domain, or explicit selection)?
- [ ] Does the system fail closed if tenant context is missing or ambiguous?
- [ ] Is Tenant Context bound immutably at the start of execution?
- [ ] Is Tenant Context propagated across all synchronous calls?
- [ ] Is Tenant Context propagated across all asynchronous boundaries?
- [ ] Are background jobs prevented from executing without validated Tenant Context?
- [ ] Are routing decisions deterministic and auditable?
- [ ] Is tenant context validated against resource ownership at enforcement points?

## 3. Identity & Access Validation

- [ ] Is every identity action evaluated within explicit Tenant Context?
- [ ] Are user sessions scoped to exactly one tenant?
- [ ] Does tenant switching require minting a new tenant-scoped session or token?
- [ ] Are service identities prevented from bypassing tenant enforcement?
- [ ] Are agent identities explicitly tenant-scoped?
- [ ] Is delegated agent identity explicit, constrained, and auditable?
- [ ] Is privilege escalation without explicit policy prohibited?
- [ ] Do authorization checks always validate tenant ownership of resources?
- [ ] Are tokens or sessions prohibited from spanning multiple tenants?

## 4. Lifecycle Validation

- [ ] Is tenant creation deliberate and high-friction?
- [ ] Are Tenant and AccountScope created atomically?
- [ ] Is initial administrative identity explicitly bound at tenant creation?
- [ ] Are lifecycle state transitions explicit and auditable?
- [ ] Does suspension reliably prevent mutating actions?
- [ ] Are agents halted or degraded safely during tenant suspension?
- [ ] Is tenant termination irreversible at the logical level?
- [ ] Are all resources prevented from outliving their tenant?
- [ ] Are tenant migrations executed as explicit lifecycle workflows?
- [ ] Is Tenant Context preserved throughout migrations and rebalancing?

## 5. Isolation Validation

- [ ] Is the selected isolation mode explicit metadata governed by Control Plane policy?
- [ ] Are data access paths tenant-scoped by construction?
- [ ] Are cache keys guaranteed to include tenant identifiers?
- [ ] Is cross-tenant data access structurally impossible?
- [ ] Are hybrid or silo isolation modes enforced without bypassing Tenant Context rules?
- [ ] Is network isolation treated as supplementary, not authoritative?
- [ ] Is isolation strength consistent with declared tenancy mode?

## 6. Cost & Usage Enforcement Validation

- [ ] Is usage metered at well-defined execution boundaries?
- [ ] Does every metering event include tenant identifier and acting principal?
- [ ] Is AccountScope the authoritative source of entitlements and quotas?
- [ ] Are entitlements enforced before or during execution?
- [ ] Are long-running executions subject to continuous budget checks?
- [ ] Are agents assigned explicit, tenant-scoped cost budgets?
- [ ] Can agent or workflow execution be interrupted on budget exhaustion?
- [ ] Are CostCenters limited to attribution only?
- [ ] Is anomalous tenant spend detectable in near real time?

## 7. Observability, Audit & Safety Validation

- [ ] Do all logs include tenant identifiers?
- [ ] Do all metrics include tenant attribution?
- [ ] Do all traces include tenant and principal context?
- [ ] Are audit events immutable and tenant-scoped?
- [ ] Are lifecycle, identity, and policy changes auditable?
- [ ] Are Safety Gates evaluated with full Tenant Context?
- [ ] Do Safety Gates emit tenant-scoped telemetry?
- [ ] Is blast radius attributable to a single tenant?
- [ ] Can execution paths be reconstructed end-to-end per tenant?

## 8. Agent-Specific Validation

- [ ] Do agents always operate under explicit Tenant Context?
- [ ] Is agent identity immutable for the duration of a run?
- [ ] Are agents prohibited from inferring tenant context from stored state?
- [ ] Are agent tool permissions explicitly scoped and enforced?
- [ ] Are agent actions fully auditable as first-class principals?
- [ ] Are agent executions bound to tenant lifecycle state?
- [ ] Are agents prevented from running for suspended or terminated tenants?
- [ ] Are agent reasoning, tool usage, and cost observable per tenant?

## 9. Enterprise & Compliance Mode Validation

- [ ] Are compliance modes explicit, named, and policy-governed?
- [ ] Is the active compliance mode immutable per execution?
- [ ] Are isolation changes executed via lifecycle workflows?
- [ ] Are operator actions explicit, tenant-scoped, and auditable?
- [ ] Is cross-tenant operator access deliberate and logged?
- [ ] Are data residency constraints enforced via routing and placement?
- [ ] Are audit retention and legal hold policies governed by AccountScope?
- [ ] Are AI autonomy and budgets stricter under enterprise modes?
- [ ] Does enterprise operation avoid custom forks or snowflake tenants?

## 10. Anti-Pattern Detection Checklist

- [ ] Is any tenant context implicit or inferred?
- [ ] Are workspaces, projects, or folders acting as tenants?
- [ ] Are billing plans or cost tiers used for authorization or isolation?
- [ ] Is any identity operating without tenant scope?
- [ ] Are there multi-tenant sessions or tokens?
- [ ] Are agents executing without explicit identity or budgets?
- [ ] Are background jobs running without tenant binding?
- [ ] Is network isolation treated as sufficient on its own?
- [ ] Are enterprise customers handled via custom code paths?
- [ ] Is governance deferred or introduced late in the lifecycle?
