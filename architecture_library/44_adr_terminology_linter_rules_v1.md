# ADR Terminology Linter Rules v1

## Purpose

This document defines **automatable linter rules** for detecting
terminology violations in Contura Architectural Decision Records (ADRs).

These rules are derived from:

- 04_contura_architecture_glossary_v1.md
- 43_adr_terminology_conformance_checklist_v1.md
- 40_contura_adr_standard_v1.md

Violations detected by these rules MUST block ADR approval
unless explicitly waived.

---

## Rule Set Structure

Each rule defines:

- Rule ID
- Detection Pattern (regex / AST hint)
- Severity
- Required Action

---

## T-ADR-001 — Forbidden Term: “Global User”

**Detection**

Regex:
\bglobal user(s)?\b

**Severity**

ERROR

**Rationale**

The glossary explicitly forbids “global user”.
The correct term is **Global Identity**.

**Required Action**

Replace with:
- “Global Identity”
- or explicit tenant-scoped identity description

---

## T-ADR-002 — Implicit Tenant Language

**Detection**

Regex:
\b(current tenant|implicit tenant|default tenant)\b

**Severity**

ERROR

**Rationale**

Tenant Context MUST be explicit and resolved at ingress.
Implicit tenant concepts are forbidden.

**Required Action**

ADR MUST describe explicit Tenant Context resolution
or fail closed behavior.

---

## T-ADR-003 — Identity Used as Authority

**Detection**

AST / heuristic:
- Identity noun used as the subject of permission-granting verbs
  without accompanying tenant context or policy reference

Examples (flag):
- “the user can access…”
- “the agent is allowed to…”

**Severity**

ERROR

**Rationale**

Identity ≠ Authority.
Authority is tenant-scoped and policy-derived.

**Required Action**

Rewrite authorization statements to reference:
- Tenant Context
- Policy evaluation
- Enforcement point

---

## T-ADR-004 — Billing Used as Governance Boundary

**Detection**

Regex:
\b(billing|invoice|payment).*(controls|governs|enforces)\b

**Severity**

ERROR

**Rationale**

Billing is a business operation.
Cost governance is the architectural control surface.

**Required Action**

Replace with:
- “cost governance”
- “budget / quota / entitlement enforcement”

---

## T-ADR-005 — Workspace Used as Tenant Boundary

**Detection**

Regex:
\bworkspace\b.*\b(tenant|isolation|governance)\b

**Severity**

ERROR

**Rationale**

Workspace is explicitly not a tenant or governance boundary.

**Required Action**

Clarify that workspace is a tenant-internal organizational construct only.

---

## T-ADR-006 — Plane Responsibility Leakage

**Detection**

AST / keyword heuristic:
- Control Plane described executing business workflows
- Application Plane described defining policy
- Data Plane described making governance decisions

**Severity**

ERROR

**Required Action**

Rewrite to align with:
20_contura_control_application_data_plane_pattern_guide_v1.md

---

## T-ADR-007 — Soft / Best-Effort Governance Language

**Detection**

Regex:
\b(soft|best[- ]?effort|advisory)\b.*\b(governance|policy|enforcement)\b

**Severity**

ERROR

**Rationale**

All governance is deterministic and enforceable.

**Required Action**

Replace with explicit enforcement semantics
(pre, mid, post execution).

---

## Output Requirements

A conformant ADR MUST produce:

- Zero ERROR-level findings
- Explicit waivers for any suppressed WARNING (future extension)

---

## Version History

v1 — Initial linter rule set derived from glossary and ADR checklist.
