# CAF Pattern Selection Guidance v1

This document defines deterministic guidance for selecting patterns from the CAF inventory for a given architecture instance.

## Selection rules

1. **Map requirements to core concerns**  
   Identify which concerns are explicitly present (persistence, multi-user security, external integrations, etc.). For each concern, select the corresponding required core pattern(s).

2. **Include all core patterns that cover stated commitments**  
   The Core Pattern Set is intended to be minimal but sufficient. By default, include the core set unless the system explicitly excludes a concern (e.g., *truly no persistence*).

3. **Fail closed on missing coverage**  
   If a requirement/design commitment has no matching pattern, stop and treat it as a gap:
   - refine an existing pattern (via a new version), or
   - introduce a new pattern (L2 overlay or new L1 candidate).

4. **Avoid overlap and over-selection**  
   Choose the smallest set that covers the needs. Do not select two patterns that address the same concern in the same scope (e.g., do not mix Active Record and Repository in one bounded context).

5. **Use L2 overlays judiciously**  
   L2 patterns are selected only when demanded by explicit requirements or quality goals. L2 overlays must not weaken or replace L1 structure; they add mechanisms on top of it.

6. **Respect pattern dependencies**  
   Some patterns rely on others (e.g., Saga relies on a service boundary to define steps). Ensure prerequisites are present before adding overlays.

7. **Document rationale for omitted core patterns**  
   If you omit a core pattern, record the reason (to distinguish a deliberate omission from an oversight).

8. **Prevent pattern thrash**  
   Once selected, keep the pattern set stable unless the specification changes materially. If changes are necessary, treat them as an architecture version update.

9. **Identify L2 needs early, isolate their implementation**  
   During requirements analysis, flag potential overlays early (e.g., audit trail, circuit breaker). Plan L1 structure first, then schedule overlays after the base is established.

## Coverage map

The table below maps longlist categories to the core patterns that typically cover them. An “X” indicates that the core pattern addresses concerns in that category.

| Category | CMP-01 (Layering) | CTX-01 (Context) | SVC-01 (Service) | POL-01 (AuthZ) | PST-01 (Persist) | INT-01 (Adapter) | VAL-01 (Validation) | OBS-01 (Observability) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Assembly/Composition | X |  |  |  |  |  |  |  |
| Boundaries | X | X | X | X |  |  |  |  |
| Data/Persistence |  |  |  |  | X |  |  |  |
| Integration |  |  |  |  |  | X |  |  |
| Security/Policy |  | X |  | X |  |  | X |  |
| Reliability (baseline) | X | X | X | X | X | X | X | X |
| Ops/Observability |  | X |  |  |  |  |  | X |
| Documentation/Traceability (baseline) |  | X | X |  |  |  |  | X |

Notes:
- Validation (`VAL-01`) and authorization (`POL-01`) are the baseline security/policy mechanisms; context (`CTX-01`) carries identity/tenant/request IDs.
- Reliability is distributed: the core patterns reduce common failure modes (validation, isolation, clear boundaries), while advanced reliability mechanisms are typically L2 overlays.

## Deferred areas and gaps

The core set intentionally defers some concerns:

- **Advanced reliability mechanisms:** circuit breaker, bulkhead, saga, etc. (L2 overlays).
- **UI/presentation architecture:** MVC/MVVM and client patterns (out of scope for backend-focused core).
- **Deployment/DevOps patterns:** canary/blue-green/IaC, etc. (handled outside L1 application structure).
- **Documentation processes:** ADRs and traceability matrices are valuable but are process artifacts, not core runtime structure.

## Evidence and validation philosophy

CAF’s Layer 1 approach is **structural and textual**:

- Evidence must be **explicit and traceable** in design artifacts (file + section references).
- Validations are **static** (no runtime execution at L1).
- Verification is **fail-fast, fail-closed**: missing required evidence or structure is treated as a design failure.
- Checks should be **tool-agnostic** and repeatable (e.g., dependency direction, presence of required boundaries, presence of enforcement hooks).
