<!-- File: governance/incident/contura_multi_tenancy_incident_classification_v1.md -->

# Contura Multi-Tenancy Incident Classification Guide v1

This guide classifies tenancy failures and maps them back to validation checklist IDs
(from `61_contura_multi_tenancy_validation_schema_v1.yaml`) for fast triage and corrective action.

## 1. Severity Levels (Operational)

- **SEV-0 (Critical):** Confirmed cross-tenant data exposure or cross-tenant action.
- **SEV-1 (High):** Strong indicator of imminent exposure/action; containment required.
- **SEV-2 (Medium):** Tenancy control gap with limited blast radius; fix prioritized.
- **SEV-3 (Low):** Hygiene/observability gaps; schedule fix.

> Note: Operational severity correlates with checklist severity (P0/P1/...), but
> includes business impact (volume, sensitivity, customer impact).

## 2. Primary Incident Classes → Checklist Mapping

### A. Cross-Tenant Data Read Exposure (SEV-0)
**Signals**
- Tenant A can read Tenant B resource/data
- Retrieval returns cross-tenant documents
- Cache returns wrong-tenant data

**Likely root checklist failures**
- MT-CX-030 (Authz tenant scope)
- MT-CX-031 (Ownership validation)
- MT-CX-032 (Tenant-scoped caches/queries/tools)
- MT-CX-001/002 (Ingress binding/authoritative source)

**Immediate containment**
- Fail closed on suspected endpoints
- Disable or hard-scope retrieval/tooling
- Purge shared caches; rotate tokens if needed

---

### B. Cross-Tenant Write/Action (SEV-0)
**Signals**
- Mutations applied to another tenant
- Tool invocation performed actions under wrong tenant

**Likely root checklist failures**
- MT-CX-030, MT-CX-031, MT-CX-032
- MT-CX-021 (Async context loss)
- MT-CX-041 (Agent delegated identity)
- MT-CX-003 (Fail closed)

**Immediate containment**
- Suspend affected execution paths (agents/jobs)
- Disable external tool actions; switch to read-only mode

---

### C. “Out-of-Tenant” Background Execution (SEV-1 → SEV-0 if leakage)
**Signals**
- Jobs/consumers running without tenant_id
- Events missing tenant envelope
- Agents resume without validated context

**Likely root checklist failures**
- MT-CX-021 (Async propagation)
- MT-CX-020 (Downstream propagation)
- MT-CX-001 (Binding at ingress)

**Immediate containment**
- Pause schedulers/consumers; require tenant context validation on consume

---

### D. Privilege Escalation / Scope Widening (SEV-1)
**Signals**
- “Admin” powers without tenant scope
- Operator access not scoped/audited
- Agent obtains broader permissions than delegation

**Likely root checklist failures**
- MT-CX-040 (Principal explicit)
- MT-CX-041 (Delegated identity auditable)
- MT-CX-042 (Single-tenant tokens/sessions)
- MT-CX-030 (Authz tenant scope)

**Immediate containment**
- Lock down roles; enforce least privilege; add explicit scope selection

---

### E. Missing/Insufficient Auditability (SEV-1 → SEV-2)
**Signals**
- Unable to determine tenant/principal/resource for an action
- Audit events missing tenant_id
- Traces cannot reconstruct execution path

**Likely root checklist failures**
- MT-CX-050 (Telemetry tenant-scoped)
- MT-CX-051 (Audit events tenant-scoped)

**Immediate containment**
- Increase logging/audit sampling; deploy hotfix to include required fields

---

### F. Runaway Cost / Agent Loop (SEV-1 → SEV-2)
**Signals**
- Sudden spend spike attributed to a tenant/agent
- Tool fan-out explosion
- Quotas not enforced during long-running runs

**Likely root checklist failures**
- MT-CX-060 (Metering)
- MT-CX-061 (Runtime entitlements)
- MT-CX-062 (Bounded cost / stop conditions)

**Immediate containment**
- Suspend agents; enforce budget cutoffs; throttle tool calls

## 3. Triage Playbook (Fast Path)

1. **Identify tenant(s) impacted** (requires MT-CX-050/051 integrity)
2. **Determine class (A–F)** above
3. **Map to checklist IDs** and assign owners
4. **Containment first**, then root-cause fix
5. **Add/strengthen automated checks** so the same ID cannot regress

## 4. Post-Incident Requirements

For any SEV-0 / SEV-1:
- A Tenancy Readiness ADR update is required
- Add at least one automated test that fails without the fix
- Add monitoring/alerts tied to tenant_id and principal
