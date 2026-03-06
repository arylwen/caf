# Contura Channel-Resilient Delivery Pattern Guide v1

## Upstream Documents

1. **Contura Architecture Framework (CAF) v1**  
   `03_contura_architecture_framework_v1.md`
2. **Contura Document Output Standards v1**  
   `02_contura_document_output_standards_v2.md`
3. **Contura Control/Application/Data Plane Pattern Guide v1**  
   `20_contura_control_application_data_plane_pattern_guide_v1.md`
4. **Contura ADR Standard v1**  
   `40_contura_adr_standard_v1.md`

---

## Purpose

This guide defines **channel-resilient delivery patterns** for Contura systems.

A *channel* is an interaction surface such as **web**, **mobile**, **voice/IVR**, or **wearables**.
Channel constraints affect how systems expose and execute user/operator interactions,
but do not change plane authority or architectural invariants.

This guide captures reusable, enforceable patterns to ensure channel reliability under real-world constraints.

---

## Scope and Non-Goals

### In Scope

- Channel-specific delivery constraints as reusable patterns
- Reliability patterns for mobile and other constrained channels
- Normative constraints on request semantics, workflow execution shape, and API interaction contracts

### Out of Scope

- Vendor or protocol specifics
- UI/UX design systems
- Network infrastructure or edge product choices
- Plane authority, control intent, or identity governance semantics (defined upstream)

---

## Channel Model (Normative)

Channels are treated as **delivery constraints** applied to specific interaction surfaces.

- A plane (Control/Application/Data) may expose one or more channel-facing surfaces.
- Channel constraints apply to the surface and its interaction patterns, not to plane authority.
- Channel constraints must not be used to justify authority leakage between planes.

---

## Mobile Channel Reliability Patterns (MRAD)

The mobile channel assumes:

- intermittent connectivity
- variable latency and bandwidth
- constrained device execution (battery, memory, background limits)
- strong need for coarse-grained operations and resumable workflows

The following patterns are normative for mobile-facing surfaces.

### MRAD-1: Idempotent Command Pattern

Mobile-triggered state changes **MUST** be retry-safe.

Under this pattern:

- write operations support idempotent execution (e.g., idempotency key or equivalent)
- duplicate submissions do not create duplicate effects
- clients may safely retry under uncertain network outcomes

---

### MRAD-2: Resumable Workflow Pattern

Long-running actions **MUST** be resumable.

Under this pattern:

- operations return a durable identifier for progress tracking
- clients can reconnect and observe status without restarting the operation
- workflows are not dependent on continuous client connectivity

---

### MRAD-3: Bounded Payload and Collection Pattern

Mobile-facing APIs **MUST** provide bounded response shapes.

Under this pattern:

- unbounded collections are paginated/cursor-based
- responses avoid unbounded nested expansions by default
- payload size growth is controlled via explicit contract shape

---

### MRAD-4: Coarse-Grained Interaction Pattern

Mobile interactions **MUST** avoid chatty sequences on critical paths.

Under this pattern:

- workflows are expressed as coarse-grained operations
- read models are shaped for screen-level needs where appropriate
- aggregation occurs server-side rather than requiring many client calls

---

### MRAD-5: Offline/Degraded Mode Pattern (Where Applicable)

For workflows where degraded mode is meaningful, systems **SHOULD** support offline/degraded behavior.

Under this pattern:

- draft capture is allowed without continuous connectivity
- sync/reconcile is explicit and auditable
- conflict resolution and reconciliation are handled deterministically

---

### MRAD-6: Background Execution Constraint Pattern

Mobile clients must not be required to remain active for workflow completion.

Under this pattern:

- background work is represented as durable server-side jobs
- completion is observable via status retrieval and/or notifications
- client background limitations are assumed

---

## Backend-for-Frontend (BFF) Pattern

The Backend-for-Frontend (BFF) pattern is a **recommended structural pattern** for implementing channel-resilient delivery, particularly for mobile clients.

A BFF is an Application Plane component that:

- serves a specific client channel (e.g., mobile)
- aggregates and shapes responses for that channel’s constraints
- enforces bounded payloads and coarse-grained interactions
- mediates authentication, session, and versioning concerns
- isolates client-specific concerns from internal service topology

### When the BFF Pattern Applies

The BFF pattern **SHOULD** be used when:

- client devices operate under strict latency or bandwidth constraints
- workflows would otherwise require chatty client-to-service interactions
- response shaping or aggregation is required for efficient rendering
- client contract versioning must be isolated from backend evolution
- multiple internal services would otherwise be exposed directly to clients

### Boundary Constraints

Under this pattern:

- The BFF **MUST NOT** introduce new business logic or authority
- The BFF **MUST** operate under Application Plane identity and policy constraints
- The BFF **MUST NOT** bypass Control Plane governance or Data Plane enforcement
- The BFF **MUST NOT** become a second Control Plane

The BFF is a delivery adapter, not a source of intent.

### Non-Goal

The BFF pattern does **not** mandate:

- a specific protocol (REST, GraphQL, gRPC)
- a specific deployment topology
- one BFF per client platform (decisions are contextual)

The goal is channel resilience, not architectural uniformity.

---

**Normative statement:**

> Mobile channel surfaces must be resilient to retries, disconnects, bounded payload constraints, and device execution limits; channel constraints apply to delivery surfaces and must not alter plane authority.
