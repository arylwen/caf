# CAF Pattern Inventory Longlist v1

This document is the **Layer 1 pattern inventory (longlist)**: a broad set of common architecture patterns, grouped by category.

Each pattern includes:
- an identifier,
- a short intent,
- why it matters,
- whether it is a **Layer 1 core candidate** or a **Layer 2 overlay** (and why).

> Note: L1 patterns are preferred when they can be validated structurally. L2 patterns are typically optional overlays or require runtime/operational verification.

## Assembly/Composition Patterns

- **PATTERN_ID:** ASM-01  
  **NAME:** Layered Architecture  
  **CATEGORY:** Assembly/Composition  
  **INTENT:** Enforce a strict separation of the system into layers (e.g. presentation, domain, data) with one-way dependency flow.  
  **WHY_IT_MATTERS:** Simplifies maintenance and testing by decoupling concerns and preventing higher-level policies from depending on lower-level details.  
  **L1_OR_L2:** L1 – Fundamental for structuring complex applications and verifiable via module dependency analysis.

- **PATTERN_ID:** ASM-02  
  **NAME:** Microkernel (Plugin) Architecture  
  **CATEGORY:** Assembly/Composition  
  **INTENT:** Establish a core system with a plug-in mechanism so optional features/extensions can be assembled and isolated as independent modules.  
  **WHY_IT_MATTERS:** Supports extensibility and independent evolution by loading modules via stable interfaces, minimizing impact on the core.  
  **L1_OR_L2:** L2 – Specialized; verification is deferred (runtime plugin wiring, not purely static).

- **PATTERN_ID:** ASM-03  
  **NAME:** Service Decomposition (Microservices)  
  **CATEGORY:** Assembly/Composition  
  **INTENT:** Partition the system into self-contained services/processes, each owning a business capability and communicating via explicit interfaces.  
  **WHY_IT_MATTERS:** Improves scalability and deployability via reduced coupling and independent development/deployment.  
  **L1_OR_L2:** L2 – Deployment-style; verified at system level (inter-service contracts), not internal code structure alone.

- **PATTERN_ID:** ASM-04  
  **NAME:** Dependency Injection Composition  
  **CATEGORY:** Assembly/Composition  
  **INTENT:** Assemble dependencies externally (composition root/container) rather than hard-coding, using inversion-of-control to supply components.  
  **WHY_IT_MATTERS:** Increases modularity and testability by decoupling from concrete implementations.  
  **L1_OR_L2:** L2 – Mechanism-level; static verification is limited (IoC container/factory configuration).

## Boundaries and Interface Patterns

- **PATTERN_ID:** BND-01  
  **NAME:** Service Layer (Application Facade)  
  **CATEGORY:** Boundaries  
  **INTENT:** Define a layer of services/facades as the application boundary, encapsulating related operations (often CRUD for a resource/use-case).  
  **WHY_IT_MATTERS:** Provides a unified interface for clients and isolates UI/integration from business logic, centralizing coordination and transaction control.  
  **L1_OR_L2:** L1 – Core boundary; enforceable by ensuring external layers call through service interfaces.

- **PATTERN_ID:** BND-02  
  **NAME:** Bounded Context  
  **CATEGORY:** Boundaries  
  **INTENT:** Divide the domain model into distinct contexts with clear boundaries, each owning its domain concepts and logic.  
  **WHY_IT_MATTERS:** Prevents concept leakage/conflicts and supports parallel work.  
  **L1_OR_L2:** L2 – Primarily conceptual; verified through design artifacts (context maps) more than code structure alone.

- **PATTERN_ID:** BND-03  
  **NAME:** Context Propagation (Request Session)  
  **CATEGORY:** Boundaries  
  **INTENT:** Establish consistent context (user identity, tenant ID, request ID) at request boundary and pass through all layers/modules.  
  **WHY_IT_MATTERS:** Enables multi-tenant isolation, auditing, and consistent policy enforcement across boundaries.  
  **L1_OR_L2:** L1 – Cross-cutting SaaS core; partially verifiable via context objects/parameters in interfaces.

## Data/Persistence Patterns

- **PATTERN_ID:** DAT-01  
  **NAME:** Repository  
  **CATEGORY:** Data/Persistence  
  **INTENT:** Provide an abstraction layer for data access, encapsulating queries and persistence operations for domain entities.  
  **WHY_IT_MATTERS:** Decouples business logic from database/ORM specifics, enabling testing and substitution.  
  **L1_OR_L2:** L1 – Key persistence boundary; verifiable by checking domain logic accesses data only via repository interfaces.

- **PATTERN_ID:** DAT-02  
  **NAME:** Active Record  
  **CATEGORY:** Data/Persistence  
  **INTENT:** Merge data access and business logic by having domain objects handle saving/loading (object maps to a DB row with CRUD methods).  
  **WHY_IT_MATTERS:** Simplifies simple CRUD apps at the cost of coupling domain logic to persistence.  
  **L1_OR_L2:** L2 – Alternative strategy; should not be combined with Repository in the same context.

- **PATTERN_ID:** DAT-03  
  **NAME:** Data Mapper  
  **CATEGORY:** Data/Persistence  
  **INTENT:** Separate the in-memory object model from DB schema via mappers/frameworks (objects unaware of persistence).  
  **WHY_IT_MATTERS:** Keeps domain objects persistence-agnostic but adds mapping complexity.  
  **L1_OR_L2:** L2 – Often provided by ORMs; not a primary L1 concern when Repository is used.

- **PATTERN_ID:** DAT-04  
  **NAME:** Unit of Work  
  **CATEGORY:** Data/Persistence  
  **INTENT:** Maintain a transaction scope that tracks changes and coordinates writing them out as one atomic operation.  
  **WHY_IT_MATTERS:** Ensures integrity across a business transaction (commit/rollback) and improves efficiency.  
  **L1_OR_L2:** L2 – Transaction management; full verification requires runtime behavior.

- **PATTERN_ID:** DAT-05  
  **NAME:** CQRS (Command Query Responsibility Segregation)  
  **CATEGORY:** Data/Persistence  
  **INTENT:** Split read model from write model (possibly separate stores/modules) for queries vs commands/updates.  
  **WHY_IT_MATTERS:** Lets reads and writes evolve independently; can improve scalability/performance.  
  **L1_OR_L2:** L2 – Advanced; requires explicit design commitment.

- **PATTERN_ID:** DAT-06  
  **NAME:** Event Sourcing  
  **CATEGORY:** Data/Persistence  
  **INTENT:** Persist entity state as a sequence of events; reconstruct state by replaying events.  
  **WHY_IT_MATTERS:** Provides full audit trail and supports high-integrity/history-centric systems.  
  **L1_OR_L2:** L2 – Specialized; requires event store + replay logic.

## Integration Patterns

- **PATTERN_ID:** INT-01  
  **NAME:** External Integration Adapter  
  **CATEGORY:** Integration  
  **INTENT:** Isolate calls to external systems/libraries in dedicated adapter modules that implement an abstract port used by the internal application.  
  **WHY_IT_MATTERS:** Shields core logic from external API volatility by containing integration code, enabling easy replacement.  
  **L1_OR_L2:** L1 – Core for stack-independent architecture; validated via ports + adapters per integration.

- **PATTERN_ID:** INT-02  
  **NAME:** Publish-Subscribe Messaging  
  **CATEGORY:** Integration  
  **INTENT:** Integrate components/services asynchronously via event bus/queue (publish events, subscribers react).  
  **WHY_IT_MATTERS:** Decouples producers/consumers and improves resilience and scalability via buffering.  
  **L1_OR_L2:** L2 – Requires infrastructure + event schema design; verification is design/system-level.

- **PATTERN_ID:** INT-03  
  **NAME:** API Gateway  
  **CATEGORY:** Integration  
  **INTENT:** Provide a single entry point for external clients that routes/orchestrates calls to internal services/modules.  
  **WHY_IT_MATTERS:** Centralizes cross-cutting concerns (auth/logging/aggregation) and simplifies clients.  
  **L1_OR_L2:** L2 – Optional; evident in system context, beyond core internal design.

- **PATTERN_ID:** INT-04  
  **NAME:** Anti-Corruption Layer  
  **CATEGORY:** Integration  
  **INTENT:** Translate between core and external/legacy systems to prevent external concepts from leaking into the core domain model.  
  **WHY_IT_MATTERS:** Protects core integrity and keeps evolution of either side from polluting the other.  
  **L1_OR_L2:** L2 – Applied selectively for ill-fitting integrations; verified by design as a translation component.

- **PATTERN_ID:** INT-05  
  **NAME:** Backend-for-Frontend (BFF)  
  **CATEGORY:** Integration  
  **INTENT:** Create dedicated service facades per client type (e.g., web vs mobile) tailoring backend call composition and shaping.  
  **WHY_IT_MATTERS:** Improves client performance and decouples client-specific logic.  
  **L1_OR_L2:** L2 – Useful in multi-client scenarios; not required for homogeneous/single-client cases.

## Security/Policy Patterns

- **PATTERN_ID:** SEC-01  
  **NAME:** Authorization Boundary (Policy Enforcement)  
  **CATEGORY:** Security/Policy  
  **INTENT:** Establish checkpoints at boundaries where authorization policies are enforced before protected operations.  
  **WHY_IT_MATTERS:** Prevents bypasses and privilege escalation by making enforcement consistent.  
  **L1_OR_L2:** L1 – Core security boundary; verified by presence of enforcement hooks at boundaries.

- **PATTERN_ID:** SEC-02  
  **NAME:** Input Validation  
  **CATEGORY:** Security/Policy  
  **INTENT:** Validate/sanitize external inputs at the earliest boundary against formats, ranges, and rules.  
  **WHY_IT_MATTERS:** Prevents malformed/malicious data from propagating, reducing errors and vulnerabilities.  
  **L1_OR_L2:** L1 – Essential robustness/security; often combined with a general validation + error-handling pattern.

- **PATTERN_ID:** SEC-03  
  **NAME:** Role-Based Access Control (RBAC)  
  **CATEGORY:** Security/Policy  
  **INTENT:** Define roles + permissions and implement checks so users can only perform allowed actions.  
  **WHY_IT_MATTERS:** Enables structured, auditable access control and least privilege.  
  **L1_OR_L2:** L2 – Policy model; enforcement is via code/config and validated via tests/review.

- **PATTERN_ID:** SEC-04  
  **NAME:** Tenant Isolation (Multi-Tenancy)  
  **CATEGORY:** Security/Policy  
  **INTENT:** Ensure every operation is scoped to tenant context and data/config are isolated per tenant.  
  **WHY_IT_MATTERS:** Prevents cross-tenant data leakage and supports tenant customization/scaling.  
  **L1_OR_L2:** L1 – Critical in SaaS; partially verifiable structurally (tenant IDs + scoped queries).

- **PATTERN_ID:** SEC-05  
  **NAME:** Sensitive Data Protection  
  **CATEGORY:** Security/Policy  
  **INTENT:** Identify sensitive data and apply encryption/tokenization/masking at rest and in transit, including logs/UIs.  
  **WHY_IT_MATTERS:** Mitigates breach impact and supports compliance by reducing cleartext exposure.  
  **L1_OR_L2:** L2 – Often technology-dependent; design can state intent, enforcement is validated via security review/testing.

## Reliability Patterns

- **PATTERN_ID:** REL-01  
  **NAME:** Circuit Breaker  
  **CATEGORY:** Reliability  
  **INTENT:** Detect failures/timeouts and stop repeated attempts for a cooldown period, returning fast errors/fallbacks.  
  **WHY_IT_MATTERS:** Prevents cascading failures and resource exhaustion.  
  **L1_OR_L2:** L2 – Runtime behavior via libraries/policies; design may mention it.

- **PATTERN_ID:** REL-02  
  **NAME:** Retry Policy  
  **CATEGORY:** Reliability  
  **INTENT:** Retry transient failures a limited number of times with delays/backoff.  
  **WHY_IT_MATTERS:** Improves reliability by handling intermittent faults, at risk of added latency.  
  **L1_OR_L2:** L2 – Usually config/library-driven; partially verifiable via config/code, not purely structural.

- **PATTERN_ID:** REL-03  
  **NAME:** Timeout Policy  
  **CATEGORY:** Reliability  
  **INTENT:** Enforce time limits on external/long-running operations; abort when exceeded.  
  **WHY_IT_MATTERS:** Prevents indefinite hangs and preserves responsiveness.  
  **L1_OR_L2:** L2 – Primarily config/implementation; design should state timeouts.

- **PATTERN_ID:** REL-04  
  **NAME:** Bulkhead Isolation  
  **CATEGORY:** Reliability  
  **INTENT:** Partition resources into isolated pools so overload/failure in one area can’t exhaust others.  
  **WHY_IT_MATTERS:** Contains damage and improves resilience.  
  **L1_OR_L2:** L2 – Achieved via deployment/resource allocation; verification is largely operational.

- **PATTERN_ID:** REL-05  
  **NAME:** Saga (Compensating Transactions)  
  **CATEGORY:** Reliability  
  **INTENT:** Manage long-running distributed transactions via local transactions + compensating actions (no global transaction).  
  **WHY_IT_MATTERS:** Maintains consistency under partial failures without two-phase commit.  
  **L1_OR_L2:** L2 – Requires explicit design of steps + compensations.

- **PATTERN_ID:** REL-06  
  **NAME:** Idempotent Operation  
  **CATEGORY:** Reliability  
  **INTENT:** Design operations so repeated execution produces the same result as a single execution.  
  **WHY_IT_MATTERS:** Prevents harm from duplicates (retries/messages), avoiding inconsistent state (e.g., double charge).  
  **L1_OR_L2:** L2 – Validated by implementation review/tests; not purely structural.

## Ops/Observability Patterns

- **PATTERN_ID:** OBS-01  
  **NAME:** Centralized Logging & Monitoring  
  **CATEGORY:** Ops/Observability  
  **INTENT:** Emit structured logs/metrics to a centralized sink, tagged with context (timestamp, request ID) for correlation.  
  **WHY_IT_MATTERS:** Enables monitoring and post-mortems by aggregating events across components.  
  **L1_OR_L2:** L1 – Core operational pattern; design evidence includes log categories/metrics.

- **PATTERN_ID:** OBS-02  
  **NAME:** Health Endpoint  
  **CATEGORY:** Ops/Observability  
  **INTENT:** Provide standardized health-check interface (e.g., `/health`) for external monitors.  
  **WHY_IT_MATTERS:** Enables automated detection and remediation (restart/failover).  
  **L1_OR_L2:** L2 – Often handled by frameworks/infra; verifiable by existence of endpoint/module.

- **PATTERN_ID:** OBS-03  
  **NAME:** Distributed Tracing  
  **CATEGORY:** Ops/Observability  
  **INTENT:** Propagate trace IDs through calls and collect timing/metadata to reconstruct end-to-end flows.  
  **WHY_IT_MATTERS:** Helps debug performance/failure points across boundaries.  
  **L1_OR_L2:** L2 – Usually instrumentation libraries; design can mandate trace ID propagation.

## Documentation/Traceability Patterns

- **PATTERN_ID:** DOC-01  
  **NAME:** Architecture Decision Records (ADR)  
  **CATEGORY:** Documentation/Traceability  
  **INTENT:** Record significant decisions (context, decision, consequences) in lightweight docs versioned with code.  
  **WHY_IT_MATTERS:** Preserves rationale for maintainers and auditors.  
  **L1_OR_L2:** L2 – Practice; verifiable by presence of ADR directory and entries.

- **PATTERN_ID:** DOC-02  
  **NAME:** Requirements Traceability Matrix  
  **CATEGORY:** Documentation/Traceability  
  **INTENT:** Map requirements/user stories to design/code/tests that realize them.  
  **WHY_IT_MATTERS:** Ensures completeness and navigability (important in regulated environments).  
  **L1_OR_L2:** L2 – Often tooling/manual; partial evidence via requirement IDs in artifacts.

- **PATTERN_ID:** DOC-03  
  **NAME:** Audit Trail  
  **CATEGORY:** Documentation/Traceability  
  **INTENT:** Record key user/system actions in an immutable audit log for compliance and troubleshooting.  
  **WHY_IT_MATTERS:** Enables accountability and forensic analysis; often required by policy/regulation.  
  **L1_OR_L2:** L2 – Cross-cutting; verified by implementation and coverage review.
