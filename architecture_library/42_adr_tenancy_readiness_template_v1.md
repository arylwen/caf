<!-- File: governance/adr/templates/adr_tenancy_readiness_template_v1.md -->

# ADR: Tenancy Readiness — <System/Service/Component Name>

- **Status:** Draft | Proposed | Accepted | Superseded
- **Date:** YYYY-MM-DD
- **Owners:** <names / teams>
- **Related:** Contura Multi-Tenancy Patterns Guide v1; `61_contura_multi_tenancy_validation_schema_v1.yaml`
- **Scope:** (service / agent / job / integration / library)

## 1. Decision

Describe the tenancy readiness decision being made and what is being certified as “tenancy-safe”.

## 2. Context

- Component purpose and boundaries
- Tenant entry points (APIs, events, schedulers, agent runtimes)
- Data stores, caches, external tools/integrations
- Known constraints (compliance, residency, tiering)

## 3. Tenant Model Alignment

Confirm alignment with canonical model:

- Tenant → AccountScope → Workspaces → Resources
- What are the Resources and resource types?
- Where does Tenant Context enter and how is it represented?

## 4. Selected Pattern Composition

List chosen patterns and why:

- Isolation mode(s):
- Routing & context propagation:
- Identity & access:
- Lifecycle handling:
- Cost/metering enforcement:
- Observability/safety enforcement:

## 5. Tenancy Validation Checklist (Normative)

This ADR embeds the validation checklist items. For each item, provide:

- **Status:** PASS | FAIL | N/A | WAIVER
- **Evidence:** link(s) to code/tests/runtime proof
- **Notes:** short justification, if needed

### MT-CX — Did you bind tenant context?

| ID | Requirement | Status | Evidence | Notes |
|---|---|---|---|---|
| MT-CX-001 | Tenant Context established exactly once at ingress |  |  |  |
| MT-CX-002 | Authoritative tenant identifier source |  |  |  |
| MT-CX-003 | Fail closed if missing/ambiguous |  |  |  |
| MT-CX-010 | Tenant Context immutable |  |  |  |
| MT-CX-020 | Propagate to downstream calls |  |  |  |
| MT-CX-021 | Preserve across async boundaries |  |  |  |
| MT-CX-030 | Authz includes tenant scope |  |  |  |
| MT-CX-031 | Validate resource ownership |  |  |  |
| MT-CX-032 | Tenant-scope caches/queries/tools |  |  |  |
| MT-CX-040 | Acting principal explicit |  |  |  |
| MT-CX-041 | Agent delegated identity auditable |  |  |  |
| MT-CX-042 | Tokens/sessions single-tenant scoped |  |  |  |
| MT-CX-050 | Tenant IDs in logs/metrics/traces |  |  |  |
| MT-CX-051 | Tenant IDs in audit events |  |  |  |
| MT-CX-060 | Metering with tenant attribution |  |  |  |
| MT-CX-061 | Entitlements enforced at runtime |  |  |  |
| MT-CX-062 | Bounded cost/side effects (agents/fan-out) |  |  |  |

## 6. Exceptions / Waivers

Document any waivers explicitly:

- Waived item(s): list of waived IDs
- Risk rationale:
- Compensating controls:
- Expiry date / revisit trigger:

## 7. Consequences

- Positive outcomes
- New operational burdens (tests, dashboards, on-call runbooks)
- Migration/evolution implications

## 8. Verification Plan

How do we continuously verify tenancy readiness?

- CI checks (schema-driven)
- Runtime monitors / alerts
- Periodic audits
- Chaos tests / red-team style probes (if applicable)
