# ADR Terminology Conformance Checklist v1

## Purpose

This checklist ensures that Architectural Decision Records (ADRs) use
**authoritative Contura terminology consistently and correctly**.

Its goal is to prevent:

- Conceptual drift
- Implicit authority
- Accidental redefinition of governance boundaries
- Conflicts between ADRs and upstream architecture documents

This checklist is **normative for ADR review**.

Failure to conform MAY result in ADR rejection.

---

## Authoritative Sources

ADR terminology MUST conform to:

- `03_contura_architecture_framework_v1.md`
- `05_contura_saas_architecture_commitment_v1.md`
- `20_contura_control_application_data_plane_pattern_guide_v1.md`
- `04_contura_architecture_glossary_v1.md`

Where conflicts arise, **CAF v1 prevails**.

---

## How to Use This Checklist

For each item:

- Mark **PASS**, **FAIL**, or **N/A**
- Provide a short note for any FAIL
- Resolve all FAIL items before ADR approval

This checklist MAY be enforced manually or via automated linting.

---

## 1. Tenant and Tenancy Terminology

- [ ] **Tenant** is used exclusively as the primary isolation and governance boundary  
- [ ] No workspace, project, folder, or UI construct is described as a tenant  
- [ ] Every resource described in the ADR belongs to exactly one tenant  
- [ ] No “shared tenant”, “default tenant”, or implicit tenant is introduced  

**FAIL if:**  
Tenant is treated as a UI concept, optional scope, or inferred context.

---

## 2. Tenant Context Usage

- [ ] The ADR explicitly uses the term **Tenant Context** for runtime execution scope  
- [ ] Tenant Context is resolved at ingress and described as immutable per invocation  
- [ ] Execution without Tenant Context is explicitly rejected or forbidden  
- [ ] No “current tenant”, ambient tenant, or implicit carryover is described  

**FAIL if:**  
Tenant scope is inferred, mutable, or implied rather than explicit.

---

## 3. Identity vs Authority

- [ ] **Identity** is used only to mean “who is acting”  
- [ ] **Authority** is described as tenant-scoped and policy-derived  
- [ ] Identity alone is never described as granting permissions  
- [ ] Authorization decisions always reference tenant context + policy  

**FAIL if:**  
Identity is treated as inherently powerful or globally authorized.

---

## 4. Global Identity and Tenant Membership

- [ ] The ADR uses **Global Identity**, not “global user”  
- [ ] Global Identity is described as spanning multiple tenants via membership  
- [ ] No action is described as occurring outside tenant context  
- [ ] Tenant switching is explicit, deliberate, and auditable  

**FAIL if:**  
A user is described as acting “globally” or outside tenant context.

---

## 5. Control / Application / Data Plane Terms

- [ ] Control Plane is used only for governance, intent, and policy  
- [ ] Application Plane is used only for execution of tenant workflows  
- [ ] Data Plane is used only for storage, processing, and enforcement  
- [ ] No plane is described as performing another plane’s responsibilities  

**FAIL if:**  
Planes are blurred, merged, or treated as deployment-only concepts.

---

## 6. Governance vs Business Operations

- [ ] **Governance** refers only to machine-enforceable constraints  
- [ ] Governance is described as architectural, not organizational  
- [ ] Business workflows are not described as governance mechanisms  

**FAIL if:**  
Governance is equated with meetings, approvals, or documentation.

---

## 7. Cost Governance vs Billing

- [ ] **Cost Governance** is used for budgets, quotas, and enforcement  
- [ ] **Billing** is used only for invoicing, payments, and commercial ops  
- [ ] Billing systems are not described as governance authorities  
- [ ] Cost enforcement is described as runtime and policy-backed  

**FAIL if:**  
Billing is treated as an architectural control boundary.

---

## 8. Policy Terminology

- [ ] **Policy** is described as a machine-evaluable artifact  
- [ ] Policy outcomes are deterministic and versioned  
- [ ] Policy is not described as ad-hoc logic or configuration flags  
- [ ] Policy enforcement points are explicit  

**FAIL if:**  
Policy is treated as documentation or informal rules.

---

## 9. Evidence and Audit Language

- [ ] **Evidence** refers to system-generated, immutable artifacts  
- [ ] Evidence is emitted by normal system operation  
- [ ] Manual attestations are not described as sufficient evidence  
- [ ] Auditability is tenant- and identity-scoped  

**FAIL if:**  
Evidence relies on human explanation or post-hoc reconstruction.

---

## 10. AI and Agent Terminology

- [ ] Agents are described as principals with identity  
- [ ] Agents always operate under explicit tenant context  
- [ ] Agent authority is bounded by policy and identity  
- [ ] No agent behavior bypasses Safety Gates or policy enforcement  

**FAIL if:**  
Agents are described as autonomous without governance boundaries.

---

## 11. Explicitly Forbidden Terminology

The ADR MUST NOT use the following terms in ways that conflict with the glossary:

- “Global user”
- “Current tenant”
- “Implicit tenant”
- “Shared authority”
- “System-wide permissions” (without tenant scope)
- “Soft enforcement”
- “Best-effort governance”

Any occurrence MUST be corrected or explicitly justified and reviewed.

---

## 12. Final Conformance Assertion

- [ ] All terminology in this ADR conforms to the Contura Architecture Glossary  
- [ ] No upstream term has been redefined or overloaded  
- [ ] Any unavoidable ambiguity is explicitly resolved in the text  

**ADR reviewers MUST NOT approve an ADR with unresolved terminology violations.**

---

## Version History

v1 — Initial release defining mandatory terminology conformance checks for ADR review.
