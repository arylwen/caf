# Phase 8 — Manual Delivery Backlog (v1)

## Status

Draft — Human-only delivery backlog.
This backlog does not authorize code, infrastructure, or automation.

## Purpose

This document defines the **manual (human-executed) delivery backlog**
derived from the current Phase 8 state.

It serves as:

- a legality baseline for Phase 8 execution
- a comparison point for agent-driven generation
- a proof that progress can occur without invention

---

## Binding Context

This backlog is derived from:

- Implementation Profile:
  architecture_library/phase_8/profiles/intentionally_boring_saas/implementation_profile_v1.md

- Authorized Parameter(s):
  Deployment Substrate Class = Managed Cloud Execution Environment

- Phase 8 Lifecycle (authoritative):
  reference_architectures/<name>/spec/guardrails/profile_parameters.yaml (lifecycle.*)

No other parameters are authorized.

---

## Backlog Rules (Normative)

All backlog items MUST:

- trace to an implementation profile section
- produce documentation or planning artifacts only
- avoid technology, vendor, or tool selection
- avoid executable outputs

If a task would normally result in code, it is out of scope.

---

## Epic 1 — Binding Integrity & Traceability

### BL-1.1 Verify Binding Consistency
Confirm all referenced upstream artifacts exist and are unchanged.

**Outputs**
- Manual verification notes

**Profile Trace**
- Section 2 — Binding Context

---

### BL-1.2 Binding Summary Artifact
Create a concise summary of all bindings.

**Output**
- companion_repositories/.../bindings/BINDINGS_SUMMARY.md

**Profile Trace**
- Section 2 — Binding Context

---

## Epic 2 — Authorized Parameter Clarification

### BL-2.1 Clarify Deployment Substrate Semantics
Document what the authorized deployment substrate means and does not mean.

**Output**
- notes/deployment_substrate_semantics.md

**Profile Trace**
- Section 4.1 — Deployment Substrate Class

---

### BL-2.2 Identify Parameter Dependencies
List downstream parameters influenced by the deployment substrate choice.

**Output**
- notes/parameter_dependency_map.md

**Profile Trace**
- Section 4 — Declared Parameter Surface

---

## Epic 3 — Companion Repository Readiness

### BL-3.1 Expand Companion Repo README
Explain why the repository is empty and which gates remain closed.

**Output**
- companion_repositories/.../README.md (expanded)

**Profile Trace**
- Section 8 — Profile Usage Rules

---

### BL-3.2 Evidence Expectations Index
List expected evidence categories without producing evidence.

**Output**
- validation/EVIDENCE_EXPECTATIONS.md

**Profile Trace**
- Section 6 — Required Evidence Artifacts

---

## Epic 4 — Traceability & Control

### BL-4.1 Backlog Traceability Table
Map backlog items to profile sections.

**Output**
- notes/backlog_traceability.md

**Profile Trace**
- Entire profile

---

## Epic 5 — Automation Readiness (No Automation)

### BL-5.1 Identify Automation Candidates
Identify backlog items that could later be automated.

**Output**
- notes/automation_candidates.md

**Profile Trace**
- Section 7 — Refusal Conditions

---

### BL-5.2 Human vs Agent Boundary Draft
Document which tasks must remain human-controlled.

**Output**
- notes/human_vs_agent_boundary.md

**Profile Trace**
- Section 8 — Profile Usage Rules

---

## Explicitly Out of Scope

- Code
- Infrastructure
- CI/CD
- Vendor selection
- Runtime configuration
- Agent execution

Any attempt to perform these is a Phase 8 violation.

---
