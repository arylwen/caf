# Contura Architecture Library — Coherence Audit Checklist v1

## Purpose

This checklist verifies **cross-document coherence**
across the entire Contura Architecture Library.

It is intended for:

- Periodic audits
- Pre–Phase 3 freeze
- Major version transitions

---

## 1. Terminology Consistency

- [ ] All documents use glossary-defined terms exclusively
- [ ] No document uses “global user”
- [ ] Identity is never described as authority
- [ ] Tenant Context is always explicit and immutable
- [ ] Workspace is never used as a governance boundary

---

## 2. Tenant Model Consistency

- [ ] Every document treats Tenant as the primary isolation boundary
- [ ] AccountScope is the sole authority for billing and compliance
- [ ] CostCenter is used only for attribution
- [ ] Tenant switching is always explicit and auditable

---

## 3. Cost vs Billing Coherence

- [ ] Cost governance is described as runtime enforcement
- [ ] Billing is described only as business operations
- [ ] No document uses billing systems as control boundaries
- [ ] Budgets, quotas, and entitlements appear in governance contexts

---

## 4. Plane Responsibility Integrity

- [ ] Control Plane defines intent and policy only
- [ ] Application Plane executes tenant workflows only
- [ ] Data Plane enforces constraints but does not define governance
- [ ] No document assigns cross-plane responsibilities implicitly

---

## 5. Governance Language Integrity

- [ ] Governance is described as machine-enforceable
- [ ] Evidence is system-generated and immutable
- [ ] No document relies on manual attestations
- [ ] No “best-effort” or “soft” enforcement language appears

---

## 6. AI and Agent Alignment

- [ ] Agents are always principals with identity
- [ ] Agents always operate under Tenant Context
- [ ] AI behavior is always Safety-Gate mediated
- [ ] Data usage by agents respects classification and quality rules

---

## 7. Cross-Reference Hygiene

- [ ] Phase 2 documents only depend on Phase 1 and CAF
- [ ] Downstream documents do not redefine upstream concepts
- [ ] ADRs reference glossary and relevant pattern guides
- [ ] No circular normative dependencies exist

---

## Audit Outcome

- PASS — Library is coherent
- FAIL — Specific documents must be corrected
- WARN — Minor drift detected; track and remediate

---

## Version History

v1 — Initial library-wide coherence audit checklist.
