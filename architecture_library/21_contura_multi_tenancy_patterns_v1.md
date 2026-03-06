# Contura Multi-Tenancy Patterns Guide  

> **SaaS, AI, and Enterprise-Grade Tenant Architecture**

## 1. Introduction & Scope

This document defines the **canonical multi-tenancy architecture patterns** for Contura SaaS systems.

It establishes:

- A **shared tenant model**
- A **normative pattern taxonomy**
- Concrete **runtime enforcement patterns**
- Explicit **enterprise and compliance evolution paths**
- Clear **anti-patterns and redesign failure modes**

The goal of this guide is to ensure that Contura systems:

- Are **tenant-safe by construction**
- Can **scale operationally and economically**
- Can **evolve into enterprise and regulated environments**
- Do **not require architectural redesign** as they grow

This guide is written to be:

- Read by humans (architects, engineers, reviewers)
- Enforced by tooling (CI, policy engines)
- Applied by agents generating or modifying code

Multi-tenancy is treated as a **first-class architectural concern**, not an implementation detail.

---

### 1.1 Why This Guide Exists

Multi-tenancy is one of the most common sources of:

- Cross-customer data leaks
- Authorization failures
- Cost overruns
- Compliance violations
- Late-stage architectural redesign

These failures rarely occur because teams are careless.  
They occur because tenancy is:

- Implicit instead of explicit
- Emergent instead of designed
- Conflated with UX or billing constructs
- Introduced too late in the system lifecycle

This guide exists to prevent those failure modes by:

- Defining **explicit tenant boundaries**
- Establishing **non-negotiable invariants**
- Providing **composable, evolvable patterns**
- Making trade-offs visible early

The cost of getting multi-tenancy wrong increases non-linearly over time.  
This document is an investment in **avoiding irreversible architectural debt**.

---

### 1.2 Audience

This guide is intended for:

- Platform and systems architects
- Backend and infrastructure engineers
- AI and agent system designers
- Security, compliance, and governance reviewers
- Developers integrating multi-tenant services
- Agents operating under Contura architectural rules

It assumes familiarity with:

- SaaS delivery models
- Distributed systems
- Identity and access control
- Basic cloud and data architecture concepts

It does **not** assume:

- A specific cloud provider
- A specific tech stack
- A specific product or domain

---

### 1.3 Normative vs Informative Content

This document contains **normative requirements**.

The following keywords are used intentionally:

- **MUST / MUST NOT** — mandatory architectural requirements  
- **SHOULD / SHOULD NOT** — strong recommendations with limited exceptions  
- **MAY** — optional or context-dependent behavior  

Any statement using **MUST** represents a **hard architectural invariant**.  
Violating such a requirement constitutes an architectural defect.

Informative sections explain *why* constraints exist, but do not weaken them.

---

### 1.4 What This Guide Covers

This guide defines:

- The **Canonical Tenant Model** (Section 3)
- A **multi-dimensional pattern taxonomy** (Section 4)
- **Runtime enforcement patterns** for:
  - Routing & tenant context
  - Identity & access
  - Lifecycle management
  - Cost and usage enforcement
  - Observability, audit, and safety
- **Enterprise and compliance evolution** without redesign (Section 6)
- **Anti-patterns and redesign triggers** (Section 7)

It also provides:

- Checklists suitable for human and agent validation
- Structures that can be translated into machine-readable policy

---

### 1.5 What This Guide Does *Not* Cover

This guide does **not**:

- Define UI or UX design
- Prescribe database schemas
- Mandate specific cloud services
- Describe product-specific workflows
- Replace security or compliance standards

Those concerns are constrained by this guide, but not defined by it.

---

### 1.6 How to Read This Document

This document is structured intentionally:

1. Section 2 defines the architectural pressures (SaaS-first, AI-first, mobile-first).
2. Section 3 defines the canonical tenant model and invariants.
3. Section 4 defines the pattern taxonomy and dimensions.
4. Section 5 provides concrete, enforceable runtime patterns.
5. Section 6 explains enterprise and compliance evolution.
6. Section 7 documents anti-patterns and redesign failure modes.

Readers are encouraged to:

- Read Sections 2–4 sequentially
- Use Section 5 as a reference and validation tool
- Treat Sections 6–7 as guardrails for future decisions

Skipping earlier sections often leads to misapplication of later patterns.

---

### 1.7 Core Principle

The core principle of this guide is simple:

> **Multi-tenancy is not achieved by a single mechanism.  
> It is achieved by consistent enforcement of explicit boundaries over time.**

Every section that follows elaborates on how those boundaries are:

- Defined
- Enforced
- Observed
- Evolved safely

### 1.8 Historical Context — Before Tenants

This subsection provides **historical context** for why modern SaaS systems require an explicit tenant model.

It is **informative, not normative**.  
No requirements are introduced here.

Its purpose is to explain:

- What architectural models existed *before* multi-tenancy
- Why they appeared reasonable at the time
- Why they systematically failed at scale
- What problems true multi-tenancy was designed to solve

Understanding this history helps prevent accidental regression to earlier failure modes.

---

#### 1.8.1 User-Centric Systems

Early software systems were **user-centric**.

Typical models included:

- `User`
- `Profile`
- `Preferences`
- Local or personal data stores

##### **User-Centric Systems Implicit assumption**

> One user is the primary boundary for identity, data, and behavior.

##### **User-Centric Systems - Why this worked**

- Desktop software
- Single-user tools
- Early consumer web applications

##### **User-Centric Systems - Why it failed**

- No shared ownership model
- No collaboration semantics
- No organizational governance
- Identity implicitly equated to authority

User-centric models collapse immediately when:

- Multiple people must collaborate
- Data must be shared safely
- Ownership outlives individual users

This model could not support SaaS.

---

#### 1.8.2 Customer and Account Records

As monetization emerged, systems introduced **Customer** or **Account** records.

Typical constructs:

- `Customer`
- `Account`
- `Subscription`
- Billing identifiers

##### **Customer and Account Records Implicit assumption**

> Billing entities can double as system boundaries.

##### **Why this worked (initially) - Customer and Account Records**

- Enabled payment processing
- Enabled basic entitlement checks
- Provided a notion of “ownership”

##### **Why it failed - Customer and Account Records**

- Billing concepts leaked into authorization logic
- “Account” meant different things across services
- Runtime enforcement was inconsistent
- Data isolation was implicit rather than guaranteed

Cost Governance is a governance concern; billing is a business operation and MUST NOT be treated as a runtime isolation primitive.

Systems that treated “customer accounts” as tenants accumulated hidden coupling that later forced redesign.

---

#### 1.8.3 Organizations, Teams, Projects, and Workspaces

To support collaboration, systems introduced **organizational constructs**.

Common models:

- `Organization`
- `Team`
- `Project`
- `Workspace`
- `Folder`

##### **Organizations, Teams, Projects, and Workspaces Implicit assumption**

> Collaboration units can serve as isolation and governance boundaries.

##### **Why this felt natural - Organizations, Teams, Projects, and Workspaces**

- Matched user mental models
- Aligned with UI navigation
- Enabled grouping and sharing

##### **Why it failed - Organizations, Teams, Projects, and Workspaces**

- Organizational units gained billing semantics
- Projects gained authentication rules
- Workspaces became de facto tenants
- Governance fragmented across layers

This led to:

- Inconsistent isolation
- Inability to centralize policy
- Enterprise features requiring breaking changes
- Ambiguous meanings of “admin” and “owner”

This is the most common *pre-tenant* failure mode in modern SaaS systems.

---

#### 1.8.4 Retrofitting “Enterprise Mode”

As systems grew, many attempted to **retrofit governance**.

Typical late additions:

- SSO
- Audit logs
- Compliance controls
- Data residency
- Stronger isolation
- Operator access tooling

##### **Common justification**

> “We’ll add this when we need it.”

##### **Observed outcome**

- Snowflake customers
- Forked code paths
- Manual exceptions
- Unsafe migrations
- Fear-driven stagnation

Enterprise retrofits exposed the absence of a true tenant boundary.
By the time the need became obvious, redesign was unavoidable.

---

#### 1.8.5 What Multi-Tenancy Actually Changed

True multi-tenancy introduced a fundamental architectural shift.

It separated:

- **Governance** from collaboration
- **Isolation** from UI structure
- **Ownership** from interaction
- **Billing** from authorization

A Tenant became:

- A first-class isolation boundary
- A stable unit of governance (billing, auth/authz, compliance)
- A runtime-enforced context
- An evolvable abstraction

This enabled:

- Safe sharing within tenants
- Strong isolation across tenants
- Centralized governance
- Incremental enterprise evolution
- AI- and agent-safe execution

Multi-tenancy is not about efficiency alone.
It is about **making boundaries explicit and enforceable over time**.

---

#### 1.8.6 Why This History Matters

Systems regress not because teams are careless, but because:

- Legacy models feel simpler
- Early shortcuts appear harmless
- UI constructs are mistaken for architecture
- Governance is postponed

This guide exists to prevent that regression.

By making tenants explicit, enforced, and evolvable from the start, Contura systems avoid the redesign cliffs that defined earlier SaaS generations.

---

#### 1.8.7 **Contextual Principle**

> Multi-tenancy did not emerge to optimize software.  
> It emerged to correct structural failures that only appear at scale.

The sections that follow define how to apply this lesson rigorously.

## 2. SaaS-First, Mobile-First, AI-First Foundations

This section establishes the **foundational framing** for the Contura Multi-Tenancy Patterns Guide.  
It explains *why* multi-tenancy exists in this architecture, *what pressures shape it*, and *which assumptions are explicitly in scope*.

This section is intentionally **conceptual and normative**, not pattern-heavy.  
It defines the forces that the Canonical Tenant Model (Section 3) and the Pattern Taxonomy (Section 4) must satisfy.

---

### 2.1 Why “SaaS-First” Is the Primary Lens

Multi-tenancy is not a feature — it is a **core property of SaaS delivery**.

A SaaS-first system assumes:

- One continuously evolving product
- A shared **product/service surface** serving many customers
- Many customers concurrently using the system
- Strong isolation without duplicating the full stack per customer

From this lens:

- **Tenancy is inevitable**
- **Isolation is mandatory**
- **Governance must be centralized**
- **Operational efficiency matters**

Multi-tenancy is therefore not an optimization; it is a **structural requirement**.

> If the system is SaaS, it must have a tenant model.  
> If it has a tenant model, that model must be explicit, enforced, and evolvable.

---

### 2.2 Are “SaaS” and “Multi-Tenant” Redundant?

They are **related but not redundant**.

| Concept | Meaning |
|------|------|
| SaaS | Product delivery and business model |
| Multi-tenancy | Architectural strategy to serve multiple customers |

A system can be:

- SaaS but poorly multi-tenant (leading to isolation bugs, cost explosions, or redesigns)
- Multi-tenant without being a product (e.g., internal platforms)

In Contura:

- **SaaS-first** sets the *why*
- **Multi-tenancy architecture** defines the *how*

This guide treats multi-tenancy as a **first-class architectural concern**, not an emergent property.

---

### 2.3 Mobile-First as a Routing & Identity Pressure

“Mobile-first” does **not** mean mobile-only.

It means:

- Sessions are shorter
- Connectivity is intermittent
- Context switches are frequent
- Authentication must be friction-aware
- Routing must be lightweight and resilient

From a tenancy perspective, mobile-first introduces constraints:

- Tenant context must be:
  - Explicit
  - Compact
  - Fast to rehydrate
- Workspace and resource selection must survive:
  - App restarts
  - Backgrounding
  - Token refreshes
- Cross-tenant ambiguity is unacceptable in small-screen UX

As a result:

- Tenant context cannot be implicit
- Workspace switching must be deliberate
- Routing and authorization must tolerate statelessness

Mobile-first therefore **strengthens**, not weakens, the case for a clean tenant model.

---

### 2.4 AI-First Changes the Blast Radius

AI-first systems amplify multi-tenancy risk.

Why:

- AI systems process unstructured input
- Outputs may be probabilistic
- Inference can leak context if isolation fails
- Costs scale with usage, not users
- Agents may act continuously, not only per request

In AI-first SaaS:

- A single isolation bug can leak *semantic meaning*, not just rows
- A single tenant can generate disproportionate cost
- A single tool mis-scope can cause cross-tenant action, not only cross-tenant read

This forces the following requirements:

- Explicit tenant context in **every inference**
- Strong boundaries around:
  - Retrieval
  - Memory
  - Tool access
  - Observability
- Clear attribution of cost and behavior to tenants

AI-first makes **implicit multi-tenancy unacceptable**.

---

### 2.5 Channel / Client as a First-Class Dimension

Contura systems assume **multiple client types**:

- Web
- Mobile
- Programmatic API
- Agent-driven execution

Clients are **not tenants**, but they influence:

- Routing
- Authentication flows
- Context hydration
- Session lifecycle

Therefore:

- Client/channel is a **dimension**, not an entity
- Tenant identity must be independent of client type
- The same tenant model must work across all channels

This is why tenancy is anchored in **identity and routing**, not UI constructs.

---

### 2.6 Control / Application / Data Planes as Classification, Not Entities

The Control Plane, Application Plane, and Data Plane are:

- **Architectural classifications**
- **Analytical boundaries**
- **Responsibility groupings**

They are **not entities**, tenants, or deployable units by default.

They are used to:

- Reason about isolation
- Assign responsibilities
- Describe patterns consistently

Actual implementations may:

- Physically separate planes
- Co-locate them
- Evolve over time

But the planes themselves are **conceptual lenses**, not objects in the tenant model.

---

### 2.7 Why Governance Must Be Centralized Early

Many systems delay governance until “enterprise mode”.

This is a failure pattern.

In Contura:

- Governance constructs (billing, auth, compliance) are **explicit from v1**
- They are centralized to avoid later redesign
- They are decoupled from user-facing constructs

This leads directly to:

- The AccountScope concept (Section 3)
- The separation of governance from workspaces and resources
- A clean evolution path without breaking tenants

---

### 2.8 Design vs Architecture: Staying on the Right Side

This guide is architectural, not product-specific design.

Architecture answers:

- What entities exist?
- What boundaries are inviolable?
- What must always be true?

Design answers:

- How users interact
- What screens exist
- What workflows look like

This section intentionally stays architectural:

- It defines pressures and invariants
- It avoids UX or implementation details
- It constrains future design safely

When design decisions appear later, they must **respect these foundations**.

---

### 2.9 Summary

By adopting a **SaaS-first, Mobile-first, AI-first** framing, Contura systems require:

- Explicit tenant boundaries
- Strong isolation semantics
- Centralized governance
- Channel-agnostic identity
- Evolvable structure

These pressures make an explicit Canonical Tenant Model **non-negotiable**.

Section 3 defines that model.

## 3. Canonical Tenant Model

This section defines the **canonical tenant model** for Contura SaaS systems.  
It establishes the **core entities, boundaries, and invariants** that all multi-tenant designs MUST adhere to.

The purpose of this model is to:

- Prevent semantic drift (“tenant”, “workspace”, “resource” meaning different things in different places)
- Provide a stable foundation for growth, enterprise features, and compliance
- Enable future evolution without architectural redesign

This model is **normative**. All subsequent patterns, lifecycle flows, and plane responsibilities are derived from it.

---

### 3.1 Canonical Terms

The following terms have **fixed meaning** throughout this guide and across the Contura Architecture Library.

#### Tenant

A **Tenant** represents a customer organization and is the **primary boundary** for isolation, governance, and accountability.

A Tenant:

- Is the unit of legal agreement and contractual relationship
- Is the default boundary for data isolation
- Is the unit users switch between when belonging to multiple organizations
- Owns all Workspaces, Resources, and configuration

A Tenant is **not**:

- A workspace, project, folder, or UX grouping
- A cost bucket
- A casually created object

---

#### AccountScope

An **AccountScope** is an internal governance construct associated with a Tenant.

In v1:

- Each Tenant has **exactly one** AccountScope
- AccountScopes are **not user-visible** and **not user-creatable**

An AccountScope owns:

- Billing profile and entitlements
- Authentication configuration (e.g., SSO, SCIM)
- Compliance and retention policies
- Audit scope and governance metadata

AccountScopes exist to centralize governance concerns and enable future enterprise evolution without redesign.

---

#### Workspace

A **Workspace** is an optional organizational namespace **within a Tenant**.

(“Container” may be used informally, but this guide uses **Workspace** as the canonical term.)

A Workspace:

- Groups related Resources for collaboration and UX organization
- Is cheap to create and delete
- Does not constitute a tenant boundary
- Does not introduce separate billing or authentication by default

Workspaces are a **resource-scoping construct**, not a governance boundary.

---

#### Resource

A **Resource** is any user- or system-created object that belongs to a Tenant.

Examples include:

- Widgets (e.g., Focus Spaces)
- Workflows or Jobs
- Artifacts (documents, generated media)
- Agent instances
- Data objects or indexes

Every Resource:

- MUST belong to exactly one Tenant
- SHOULD belong to a Workspace when organizational grouping is desired
- MUST carry explicit Tenant Context

---

#### Resource Type (Widget)

A **Resource Type** defines the category and behavior of a Resource.

“Widget” is used as a general term for a Resource Type that represents a user-facing capability (e.g., Focus Space, Dashboard, Generator).

Resource Types enable:

- Extensibility across products
- Consistent governance without hardcoding domain concepts
- Reuse of the tenant model across multiple SaaS offerings

---

#### User

A **User** is a human principal with a global identity.

A User:

- May belong to multiple Tenants
- Has access determined by membership, roles, and policies
- Always operates within an explicit Tenant Context

---

#### Agent

An **Agent** is a non-human actor that performs actions on behalf of a Tenant.

An Agent:

- Always operates within a Tenant Context
- Uses an explicit agent or delegated identity
- Is subject to the same tenancy, policy, and audit rules as human users

Agent identity semantics are governed by the Agent Identity Pattern ADR.

---

#### CostCenter

A **CostCenter** is an optional attribution construct used for billing allocation and reporting.

A CostCenter:

- MAY be associated with a Workspace or a Resource
- MUST resolve to exactly one **effective CostCenter** per Resource using deterministic inheritance:
  - Resource CostCenter (if present)
  - Workspace CostCenter (if present)
  - Tenant default (AccountScope)
- MUST NOT affect isolation, authorization, routing, or compliance

CostCenters are metadata, not boundaries.

---

#### Tenant Context

**Tenant Context** is the explicit runtime context required to evaluate any request, action, or data access.

Tenant Context includes:

- Tenant identifier
- Optional Workspace identifier
- Acting principal (user, service, or agent)
- Applicable policy and entitlements

Implicit or inferred tenant context is forbidden.

---

### 3.2 Canonical Tenant Structure

The canonical ownership and containment model is:

- A Tenant owns exactly one AccountScope (v1)
- A Tenant owns zero or more Workspaces
- Workspaces contain Resources
- Resources are typed and tenant-scoped
- CostCenters attach orthogonally to Workspaces or Resources

This structure deliberately separates:

- **Governance concerns** (AccountScope)
- **Organizational concerns** (Workspaces)
- **Functional concerns** (Resources)

---

### 3.3 Normative Invariants

The following invariants MUST hold for all Contura SaaS systems:

1. Every Resource MUST belong to exactly one Tenant.
2. No Resource may be accessed, executed, or evaluated without explicit Tenant Context.
3. AccountScope is the sole authority for billing, authentication configuration, and compliance policy.
4. Workspaces MUST NOT be treated as tenants.
5. CostCenters MUST NOT alter isolation or access semantics.
6. Tenancy boundaries MUST be intentional and high-friction.

Violations of these invariants constitute architectural defects.

---

### 3.4 Enterprise Evolution (Non-Normative)

While v1 supports exactly one AccountScope per Tenant, future enterprise configurations MAY allow multiple AccountScopes per Tenant.

Such configurations introduce:

- Independent billing profiles
- Independent authentication configuration
- Explicit scope switching
- Stronger compliance isolation

This evolution is additive and does not alter the core tenant model defined above.

---

This Canonical Tenant Model is the foundation upon which all multi-tenancy patterns, lifecycle flows, and governance rules are built.

## 4. Canonical Multi-Tenancy Pattern Taxonomy

This section introduces the **canonical pattern taxonomy** used throughout the Contura Multi-Tenancy Patterns Guide.

It does **not** prescribe specific implementations.  
Instead, it establishes:

- The *categories* of patterns that exist
- The *dimensions* along which they vary
- The *constraints* that govern their composition

This taxonomy is presented before detailed patterns so later sections can remain consistent and composable.

---

### 4.1 Purpose and Scope of the Pattern Catalog

The purpose of this pattern catalog is to provide a **shared architectural vocabulary** for reasoning about multi-tenancy.

These patterns exist to:

- Prevent ad-hoc, inconsistent tenant handling
- Make trade-offs explicit rather than accidental
- Enable safe evolution from small-scale to enterprise deployments
- Reduce redesign risk by clarifying invariants early

This catalog is intentionally:

- **Normative** at the boundary level
- **Flexible** at the implementation level
- **Composable**, not prescriptive

Patterns in this guide:

- Describe *what problem is being solved*
- Define *what must remain true*
- Identify *where trade-offs occur*

Patterns do **not**:

- Mandate specific cloud services or vendors
- Dictate UI or workflow design
- Assume a particular scale or customer profile

A pattern may be:

- Applicable in isolation
- Combined with others
- Deferred until scale or compliance requires it

However, all patterns must respect the **Canonical Tenant Model** defined in Section 3.

---

### 4.2 Pattern Dimensions (Orthogonal Axes)

Multi-tenancy patterns vary along several **orthogonal dimensions**.

These dimensions are independent axes, not layers or phases.  
Most real systems apply multiple patterns across multiple dimensions simultaneously.

The primary dimensions are:

- Isolation Dimension
- Routing & Context Dimension
- Identity & Access Dimension
- Lifecycle Dimension
- Cost & Attribution Dimension
- Observability & Safety Dimension

Each dimension is described below.

---

#### Isolation Dimension

Defines *how strongly tenant data and execution are separated*.

Isolation patterns range from:

- Logical isolation (shared infrastructure, enforced by policy)
- Physical isolation (dedicated infrastructure)
- Hybrid approaches (selective isolation by tenant, resource, or tier)

Isolation strength impacts:

- Security posture
- Blast radius
- Cost efficiency
- Operational complexity

Isolation is never binary; it is a spectrum.

---

#### Routing & Context Dimension

Defines *how tenant context is identified, propagated, and enforced*.

Routing patterns govern:

- How requests are associated with a tenant
- Where tenant context is introduced
- How it flows across services, agents, and data access

This dimension is foundational:

- All other patterns depend on correct tenant routing
- Implicit or inferred routing is forbidden

---

#### Identity & Access Dimension

Defines *who or what is acting*, and *under which tenant authority*.

This includes:

- User identity across tenants
- Agent identity and delegation
- Service-to-service identity
- Role and policy evaluation

Identity patterns must:

- Be tenant-aware
- Support explicit context switching
- Integrate with governance constructs (AccountScope)

---

#### Lifecycle Dimension

Defines *how tenants and their assets change over time*.

Lifecycle patterns include:

- Tenant creation and provisioning
- Resource onboarding
- Tenant migration and rebalancing
- Suspension, deletion, and retention

Lifecycle patterns are high-risk moments for isolation failure and must be explicit.

---

#### Cost & Attribution Dimension

Defines *how usage and cost are measured and attributed*.

Patterns in this dimension ensure:

- Clear cost attribution without creating new boundaries
- Support for future chargeback or reporting
- Separation of billing concerns from access control

Cost attribution is informational, not authoritative.

---

#### Observability & Safety Dimension

Defines *how tenant behavior is observed, audited, and constrained*.

This includes:

- Tenant-aware logs, metrics, and traces
- Audit trails
- AI safety and evaluation hooks
- Blast-radius detection

Observability patterns ensure that failures are:

- Detectable
- Attributable
- Containable

---

These dimensions form the **pattern space** for multi-tenancy.

Each subsequent section explores one dimension in depth, describing:

- Canonical patterns
- Trade-offs
- Failure modes
- Safe composition strategies

---

### 4.3 Tenant Isolation Patterns (Overview)

Tenant isolation patterns define **how strongly tenants are separated** across data, execution, and operational boundaries.

Isolation is the most visible aspect of multi-tenancy, but it is also the most commonly misunderstood.

Isolation is:

- Not binary
- Not static
- Not solved by a single mechanism

Instead, isolation exists on a **spectrum**, and must be evaluated across multiple dimensions simultaneously.

This section introduces the three canonical isolation pattern families used throughout this guide.

---

#### 4.3.1 Logical (Pooled) Isolation

Logical isolation places multiple tenants on **shared infrastructure**, with separation enforced by software and policy.

Characteristics:

- Shared compute
- Shared storage
- Shared deployment surface
- Explicit Tenant Context required everywhere

Isolation is enforced through:

- Tenant-scoped identifiers
- Policy checks
- Query filtering
- Context propagation
- Guardrails and invariants

Logical isolation offers:

- High operational efficiency
- Low marginal cost per tenant
- Rapid onboarding

However, it introduces:

- Higher blast radius
- Strong dependency on correctness
- Increased need for observability and testing

Logical isolation is common in early-stage SaaS and remains viable at scale **only when combined with rigorous enforcement and monitoring**.

---

#### 4.3.2 Physical (Siloed) Isolation

Physical isolation assigns tenants **dedicated infrastructure** or strongly separated environments.

Examples include:

- Dedicated databases
- Dedicated compute clusters
- Dedicated network boundaries
- Separate accounts or projects

Characteristics:

- Strong blast-radius containment
- Reduced reliance on application-level enforcement
- Higher cost and operational overhead

Physical isolation:

- Simplifies some security concerns
- Complicates lifecycle management
- Reduces density and efficiency

Physical isolation is often driven by:

- Regulatory requirements
- Large enterprise customers
- Extreme workload asymmetry

It is **not** the default model for SaaS-first systems, but an important tool in the isolation toolkit.

---

#### 4.3.3 Hybrid Isolation

Hybrid isolation combines logical and physical approaches **selectively**.

In hybrid models:

- Most tenants share pooled infrastructure
- Some tenants, resources, or workloads receive stronger isolation
- Isolation strength varies by context, not by ideology

Hybrid isolation enables:

- Cost-efficient scaling
- Tiered offerings
- Incremental enterprise support
- Evolution without redesign

Hybrid models introduce complexity:

- Routing becomes more dynamic
- Lifecycle operations become more complex
- Observability requirements increase

However, hybrid isolation is the **dominant pattern** in mature SaaS platforms.

It allows systems to:

- Start simple
- Adapt over time
- Avoid architectural dead ends

---

#### 4.3.4 Isolation Is a Composition, Not a Choice

No isolation pattern operates in isolation.

Effective tenant isolation depends on:

- Routing correctness
- Identity enforcement
- Lifecycle controls
- Observability and safety mechanisms

Choosing an isolation pattern without addressing these dimensions results in:

- False confidence
- Hidden coupling
- Late-stage redesign

Subsequent sections detail how isolation patterns interact with routing, identity, lifecycle, cost, and observability to form a complete multi-tenant architecture.

### 4.4 Routing & Tenant Context Propagation

Routing and tenant context propagation are the **foundational enforcement mechanisms** of multi-tenancy.

All isolation, identity, lifecycle, cost, and observability patterns depend on the correct identification and propagation of **Tenant Context**.

If routing fails, every other control becomes unreliable.

---

#### 4.4.1 Purpose of Tenant-Aware Routing

Tenant-aware routing ensures that:

- Every request, action, and execution is associated with exactly one Tenant
- Tenant Context is introduced early and preserved end-to-end
- Cross-tenant ambiguity is structurally impossible

Routing patterns do not merely direct traffic; they establish **authority and scope**.

Tenant-aware routing is therefore:

- Mandatory
- Non-optional
- Central to system correctness

---

#### 4.4.2 Tenant Context as a First-Class Invariant

Tenant Context is the minimal information required to evaluate any operation safely.

Tenant Context MUST include:

- Tenant identifier
- Acting principal (user, agent, or service)
- Applicable entitlements and policies
- Optional Workspace identifier

Tenant Context MUST be:

- Explicit
- Immutable for the duration of an operation
- Available to all downstream components

Implicit, ambient, or inferred tenant context is forbidden.

---

#### 4.4.3 Context Introduction Points

Tenant Context is typically introduced at **system boundaries**, including:

- API gateways
- Edge services
- Authentication endpoints
- Agent execution entry points
- Event ingestion boundaries

At introduction:

- Tenant Context MUST be validated
- Authorization MUST be evaluated
- Context integrity MUST be established

Once introduced, Tenant Context becomes authoritative for the remainder of the execution.

---

#### 4.4.4 Context Propagation Across Services

Tenant Context MUST propagate across:

- Service-to-service calls
- Asynchronous workflows
- Background jobs
- Agent actions
- Tool invocations
- Data access layers

Propagation mechanisms may vary (headers, envelopes, metadata), but semantics MUST remain consistent.

Propagation MUST ensure:

- No loss of tenant identity
- No context substitution
- No silent widening of scope

---

#### 4.4.5 Routing in Synchronous and Asynchronous Flows

Synchronous flows:

- Carry Tenant Context inline with the request
- Fail fast if context is missing or invalid

Asynchronous flows:

- MUST explicitly bind Tenant Context to messages, events, or jobs
- MUST re-validate context at execution time
- MUST not rely on execution environment defaults

Delayed execution increases risk; explicit context is mandatory.

---

#### 4.4.6 Routing and Agent Execution

Agents introduce unique routing risks:

- Long-lived execution
- Tool fan-out
- Autonomous action

Agent execution MUST:

- Always operate under an explicit Tenant Context
- Never assume tenant identity implicitly
- Never cross tenant boundaries

Agent identity MAY be delegated or scoped, but Tenant Context MUST remain unchanged.

---

#### 4.4.7 Failure Modes and Guardrails

Common failure modes include:

- Missing tenant identifiers
- Context loss in async pipelines
- Implicit defaults in data access
- Shared caches without tenant scoping

Architectural guardrails MUST include:

- Mandatory tenant context validation
- Context propagation testing
- Tenant-aware middleware
- Tenant-scoped caching strategies

Failure to enforce these guardrails leads to:

- Cross-tenant data leakage
- Incorrect billing attribution
- Undetectable security violations

---

#### 4.4.8 Routing Is Not a Network Concern Alone

Tenant-aware routing is **not limited to network routing**.

It applies equally to:

- Application-level dispatch
- Job schedulers
- Agent orchestration
- Tool invocation
- Data access paths

Network-level routing may support tenancy, but it cannot replace application-level enforcement.

---

#### 4.4.9 Summary

Routing and Tenant Context propagation form the **backbone** of multi-tenancy.

Without explicit, end-to-end Tenant Context:

- Isolation degrades
- Identity becomes unreliable
- Cost attribution breaks
- Observability loses meaning

All subsequent patterns assume that Tenant Context is:

- Introduced early
- Propagated correctly
- Enforced consistently

### 4.5 Identity & Access Patterns

Identity and access patterns define **who or what is acting**, **on whose behalf**, and **within which tenant authority**.

In a multi-tenant SaaS system, identity is inseparable from tenancy.  
An identity without explicit tenant scope is incomplete and unsafe.

This section defines the canonical identity actors, access boundaries, and enforcement patterns required for tenant-safe operation.

---

#### 4.5.1 Identity Is Tenant-Scoped by Definition

All identities operate **within a Tenant Context**.

There is no such thing as a “global action” inside a multi-tenant SaaS system.

Every authenticated action MUST be evaluated as:

- *Who is acting*
- *Within which Tenant*
- *Under which authority*

Identity without tenant scope is invalid.

---

#### 4.5.2 Identity Actors

The system recognizes three canonical identity actor classes.

---

##### User Identity

A **User** represents a human principal.

User identity characteristics:

- Global identity across the platform
- Membership in one or more Tenants
- Roles and permissions evaluated per Tenant
- Explicit tenant context required for all actions

Users MUST explicitly select or be routed into a Tenant Context before performing tenant-scoped actions.

---

##### Agent Identity

An **Agent** is a non-human actor performing actions on behalf of a Tenant.

Agent identity characteristics:

- Always tenant-scoped
- May be system-owned or user-delegated
- Operates under constrained authority
- Fully auditable

Agents MUST NOT:

- Act without explicit Tenant Context
- Escalate privileges implicitly
- Cross tenant boundaries

Agent identity semantics are further defined in the Agent Identity Pattern ADR.

---

##### Service Identity

A **Service Identity** represents a trusted internal system component.

Service identity characteristics:

- Used for service-to-service interactions
- Scoped to a Tenant Context for execution
- Subject to the same authorization rules as other actors

Service identities MUST NOT bypass tenant enforcement, even when internally trusted.

---

#### 4.5.3 Identity and AccountScope Governance

AccountScope is the **governance anchor** for identity configuration.

AccountScope owns:

- Authentication configuration (e.g., SSO, SCIM)
- Tenant-wide identity policies
- Identity lifecycle controls

Identity providers, federation rules, and directory integrations are configured at the AccountScope level.

Identity enforcement remains **tenant-scoped**, regardless of authentication source.

---

#### 4.5.4 Role and Permission Evaluation

Access control is evaluated as a function of:

- Identity actor (user, agent, service)
- Tenant Context
- Assigned roles
- Applicable policies

Roles and permissions MUST be:

- Explicit
- Tenant-scoped
- Evaluated at request time

Roles MUST NOT:

- Imply cross-tenant access
- Be inferred from identity provider metadata alone

---

#### 4.5.5 Context Switching and Identity Boundaries

Users and agents may belong to or operate across multiple Tenants.

Context switching:

- MUST be explicit
- MUST be auditable
- MUST not preserve state across tenants unless explicitly designed

Implicit carryover of identity context between tenants is forbidden.

---

#### 4.5.6 Identity in Asynchronous and Agent-Driven Execution

Asynchronous execution amplifies identity risk.

For background jobs, workflows, and agents:

- Identity MUST be bound at creation time
- Identity MUST be re-validated at execution time
- Identity MUST be recorded for audit

Long-lived executions MUST periodically reaffirm identity and tenant scope.

---

#### 4.5.7 Common Failure Modes

Common identity-related failure modes include:

- Treating authentication as authorization
- Implicit tenant inference from identity provider claims
- Privilege accumulation in agents
- Shared service identities without tenant scoping

These failure modes lead to:

- Cross-tenant access
- Undetectable privilege escalation
- Compliance violations

---

#### 4.5.8 Summary

Identity and access patterns enforce **who may act, and under which tenant authority**.

Correct identity design ensures:

- Tenant isolation
- Predictable authorization
- Auditable behavior
- Safe agent execution

All identity patterns assume:

- Explicit Tenant Context
- Centralized governance (AccountScope)
- Strict separation between authentication and authorization

### 4.6 Lifecycle Patterns

Lifecycle patterns define **how tenants and their assets change over time**.

In a multi-tenant SaaS system, lifecycle events are the **highest-risk moments** for isolation, identity, and governance failures.  
Most cross-tenant incidents occur not during steady-state operation, but during creation, migration, suspension, or deletion.

This section establishes the canonical lifecycle phases and the architectural patterns required to manage them safely.

---

#### 4.6.1 Lifecycle as an Architectural Concern

Lifecycle is not an operational afterthought.

Lifecycle patterns determine:

- When tenant context is introduced
- When governance is established
- When identity and access are activated or revoked
- When data must be isolated, migrated, or destroyed

Incorrect lifecycle handling leads to:

- Orphaned data
- Zombie access
- Billing leakage
- Undetectable compliance violations

Lifecycle transitions MUST therefore be explicit, auditable, and tenant-aware.

---

#### 4.6.2 Canonical Tenant Lifecycle Phases

All tenants progress through a bounded set of lifecycle phases.

The canonical phases are:

1. **Prospective**
2. **Provisioned**
3. **Active**
4. **Suspended**
5. **Terminated**

These phases are conceptual and may be implemented using different mechanisms, but their semantics MUST be preserved.

---

#### 4.6.3 Tenant Creation and Provisioning

Tenant creation is the moment when:

- A Tenant identity is established
- An AccountScope is created
- Governance configuration begins

Provisioning MUST:

- Create the Tenant and its AccountScope atomically
- Establish default entitlements and policies
- Bind initial administrative identity explicitly
- Record audit metadata from the first action

Tenant creation MUST NOT:

- Implicitly grant access beyond the creating principal
- Bypass governance configuration
- Allow resource creation before Tenant Context is valid

Tenant creation is a **control-plane responsibility**, even when initiated from application-facing flows.

---

#### 4.6.4 Activation and Normal Operation

A Tenant becomes **Active** when:

- Governance configuration is valid
- Authentication is enabled
- Billing and entitlements are enforceable

In the Active state:

- Users, agents, and services may operate under explicit Tenant Context
- Resources may be created, modified, and deleted
- Cost attribution and observability are mandatory

Steady-state operation assumes that lifecycle invariants are already satisfied.

---

#### 4.6.5 Suspension Patterns

Suspension temporarily disables tenant activity without destroying state.

Suspension MAY be triggered by:

- Billing failure
- Administrative action
- Policy or compliance enforcement

During suspension:

- Authentication MAY remain valid
- Authorization MUST deny mutating actions
- Agent execution MUST halt or degrade safely
- Data MUST remain intact

Suspension MUST be:

- Reversible
- Auditable
- Explicitly enforced at authorization and execution layers

Suspension MUST NOT rely solely on UI or client-side enforcement.

---

#### 4.6.6 Termination and Deletion Patterns

Termination represents the irreversible end of a tenant’s lifecycle.

Termination includes:

- Revocation of all access
- Deactivation of agents and services
- Data deletion or retention according to policy
- Final billing reconciliation

Deletion MUST:

- Be intentional and high-friction
- Be governed by AccountScope retention policies
- Be executed in a controlled, auditable manner

Immediate physical deletion is not always required, but **logical irreversibility** is.

---

#### 4.6.7 Resource Lifecycle Within a Tenant

Resources have their own lifecycle, bounded by the tenant lifecycle.

Resource lifecycle events MUST:

- Always occur within a valid Tenant Context
- Respect tenant suspension and termination states
- Emit tenant-scoped audit and observability signals

Resources MUST NOT:

- Outlive their Tenant
- Be reassigned across tenants
- Persist beyond termination policies

---

#### 4.6.8 Migration and Evolution Patterns

Migrations include:

- Data re-partitioning
- Isolation model changes
- Infrastructure evolution
- Enterprise feature enablement

Migration patterns MUST:

- Preserve Tenant Context throughout
- Be reversible where possible
- Avoid cross-tenant co-mingling
- Emit explicit lifecycle events

Migrations are architectural events, not operational shortcuts.

---

#### 4.6.9 Lifecycle and Agent Execution

Agents complicate lifecycle handling due to autonomy and longevity.

Lifecycle-aware agent patterns require:

- Agents to bind to tenant lifecycle state
- Automatic suspension or termination on tenant state changes
- Explicit reactivation after suspension

Agents MUST NOT continue execution for suspended or terminated tenants.

---

#### 4.6.10 Summary

Lifecycle patterns govern **when tenancy exists, changes, and ends**.

Correct lifecycle handling ensures:

- Isolation integrity
- Predictable governance
- Accurate billing
- Compliance correctness

Lifecycle transitions are **architectural choke points** and must be treated with the same rigor as routing and identity enforcement.

### 4.7 Cost & Metering Patterns

Cost and metering patterns define **how usage is measured, attributed, and governed** in a multi-tenant SaaS system.

In AI-first systems, cost is not a secondary concern.  
It is a **first-order architectural pressure** that shapes isolation, lifecycle, and governance decisions.

This section establishes cost and metering as **informational and governance constructs**, not access-control or isolation mechanisms.

---

#### 4.7.1 Cost Is an Architectural Dimension

Cost emerges from:

- Compute execution
- Storage consumption
- Network usage
- External service invocation
- AI inference and tool usage

In multi-tenant systems:

- Costs are shared
- Usage patterns vary widely
- A small number of tenants may dominate spend

Architectural patterns must therefore:

- Attribute cost accurately
- Enforce entitlements predictably
- Avoid coupling cost accounting to isolation or authorization logic

---

#### 4.7.2 AccountScope as the Billing Authority

AccountScope is the **authoritative unit for billing and entitlements**.

AccountScope owns:

- Billing profile
- Subscription plan
- Usage limits and quotas
- Pricing and entitlement configuration

All cost aggregation MUST roll up to AccountScope, regardless of:

- Resource type
- Workspace structure
- CostCenter attribution

This ensures a single, consistent billing model.

---

#### 4.7.3 Metering at the Resource Boundary

Metering MUST occur at **well-defined execution boundaries**.

Examples include:

- API request execution
- Job or workflow execution
- Agent inference steps
- Tool invocations
- Storage operations

Metering events MUST include:

- Tenant identifier
- Acting identity
- Resource identifier and type
- Timestamp and quantity
- Cost-relevant dimensions (tokens, duration, size, calls)

Metering without tenant context is invalid.

---

#### 4.7.4 CostCenter Attribution Patterns

CostCenters provide **cost attribution**, not control.

Patterns include:

- Workspace-level attribution (team or project accounting)
- Resource-level attribution (expensive or experimental workloads)
- Default tenant-level attribution

CostCenter attribution MUST:

- Resolve to exactly one effective CostCenter per metered event
- Follow deterministic inheritance rules
- Be auditable and explainable

CostCenters MUST NOT:

- Influence authorization
- Influence routing
- Create isolation boundaries

---

#### 4.7.5 Entitlements, Quotas, and Limits

Entitlements define **what a tenant is allowed to consume**.

Entitlements may include:

- Request rate limits
- Storage quotas
- Agent concurrency limits
- AI inference or token budgets

Entitlement enforcement MUST:

- Be tenant-scoped
- Occur at execution time
- Fail safely and predictably

Entitlements are enforced via AccountScope configuration, not via CostCenters.

---

#### 4.7.6 AI-Specific Cost Patterns

AI workloads introduce unique cost characteristics:

- Non-linear pricing
- Tool fan-out
- Long-running agent loops
- Unpredictable usage bursts

AI cost patterns require:

- Fine-grained metering
- Early detection of anomalous spend
- Per-tenant attribution of inference and tool usage

AI cost governance MUST:

- Be tenant-aware
- Be observable in near real time
- Integrate with lifecycle controls (e.g., suspension)

---

#### 4.7.7 Cost, Isolation, and Hybrid Models

Cost considerations often influence isolation decisions.

Examples:

- High-cost tenants may justify stronger isolation
- Shared workloads may require stricter entitlements
- Enterprise tiers may combine physical isolation with pooled billing models

However:

- Isolation MUST NOT be driven solely by cost
- Cost optimization MUST NOT weaken isolation or security

Hybrid models must balance:

- Efficiency
- Predictability
- Governance clarity

---

#### 4.7.8 Failure Modes and Guardrails

Common cost-related failure modes include:

- Missing tenant context in metering
- Unattributed or double-counted usage
- CostCenter misuse as a control mechanism
- Agent loops generating unbounded cost

Architectural guardrails MUST include:

- Mandatory tenant-scoped metering
- Budget and quota enforcement
- Cost anomaly detection
- Clear audit trails linking usage to tenant actions

---

#### 4.7.9 Summary

Cost and metering patterns ensure that:

- Usage is measurable
- Cost is attributable
- Entitlements are enforceable
- AI workloads remain governed

Correct cost architecture enables:

- Sustainable scaling
- Enterprise readiness
- Trust with customers

Cost must be visible and governed, but **never confused with access or isolation**.

### 4.8 Observability & Safety Patterns

Observability and safety patterns define **how tenant behavior is made visible, attributable, and governable**.

In multi-tenant SaaS systems—especially AI-first systems—observability is not optional instrumentation.  
It is a **primary safety mechanism**.

Without tenant-aware observability, failures may occur silently, propagate across tenants, and remain undiagnosed until harm is irreversible.

---

#### 4.8.1 Observability Is a Tenancy Requirement

Observability in a multi-tenant system must answer, at minimum:

- Which Tenant was affected?
- Which identity acted?
- Which resources were involved?
- What execution path occurred?
- What policies were evaluated?
- What cost and impact resulted?

Observability that cannot answer these questions is insufficient for multi-tenant operation.

---

#### 4.8.2 Tenant-Aware Telemetry

All telemetry MUST be tenant-aware.

This includes:

- Logs
- Metrics
- Traces
- Events
- Audit records
- AI evaluation artifacts

Tenant-aware telemetry MUST include:

- Tenant identifier
- Acting identity (user, agent, service)
- Resource identifiers and types
- Timestamp and execution context

Telemetry without Tenant Context is invalid.

---

#### 4.8.3 Observability Across Planes

Observability MUST span all architectural planes:

- **Control Plane**: tenant lifecycle events, policy changes, entitlement updates
- **Application Plane**: request handling, agent execution, workflow orchestration
- **Data Plane**: data access, retrieval, mutation, and deletion

Plane boundaries MUST NOT obscure tenant attribution.

Cross-plane correlation is required to understand full execution paths.

---

#### 4.8.4 Safety as Continuous Enforcement

Safety is not a one-time check.

Safety patterns require:

- Continuous evaluation
- Runtime enforcement
- Post-execution analysis

Safety applies to:

- Identity usage
- Tool invocation
- Data access
- Agent autonomy
- AI inference and output handling

Safety mechanisms MUST be tenant-scoped and auditable.

---

#### 4.8.5 AI-Specific Observability Requirements

AI systems introduce additional observability needs:

- Prompt and context provenance
- Retrieval sources and scope
- Tool usage paths
- Model version and configuration
- Evaluation and scoring outputs

All AI observability MUST:

- Be tenant-scoped
- Preserve privacy and isolation
- Support replay and analysis
- Enable post-hoc investigation

AI systems without these capabilities cannot be safely multi-tenant.

---

#### 4.8.6 Safety Gates and Enforcement Points

Safety Gates are **explicit enforcement points** where execution may be:

- Allowed
- Modified
- Deferred
- Blocked

Safety Gates MAY occur:

- Before execution (pre-flight)
- During execution (runtime)
- After execution (post-analysis)

Safety Gates MUST:

- Receive full Tenant Context
- Emit tenant-scoped telemetry
- Be governed by explicit policy

Safety Gates MUST NOT rely on implicit assumptions or best-effort checks.

---

#### 4.8.7 Blast Radius Detection and Containment

Observability enables blast radius detection.

Blast radius indicators include:

- Unusual cost spikes
- Unexpected agent behavior
- Cross-resource fan-out
- Abnormal access patterns

Systems MUST be able to:

- Attribute blast radius to a Tenant
- Contain impact to that Tenant
- Trigger lifecycle or entitlement controls if required

Containment is only possible with correct attribution.

---

#### 4.8.8 Auditability and Compliance

Auditability is a core outcome of observability.

Audit records MUST:

- Be tenant-scoped
- Be immutable
- Cover identity, access, and execution
- Support compliance and forensic analysis

Auditability MUST survive:

- Asynchronous execution
- Agent autonomy
- Long-running workflows

Audit gaps are compliance failures.

---

#### 4.8.9 Failure Modes and Guardrails

Common observability and safety failure modes include:

- Logs without tenant identifiers
- Aggregated metrics that hide tenant impact
- Missing agent execution traces
- Safety checks without audit output

Architectural guardrails MUST include:

- Mandatory tenant-scoped telemetry
- Correlation across planes and services
- Automated safety evaluation
- Alerting tied to tenant context

---

#### 4.8.10 Summary

Observability and safety patterns ensure that multi-tenant systems are:

- Visible
- Auditable
- Governable
- Correctable

Without tenant-aware observability, safety cannot be enforced.

Without safety, multi-tenancy becomes a liability rather than an asset.

Observability and safety are therefore **first-class architectural responsibilities**, not optional features.

### 4.9 Section 4 Summary — How to Use This Taxonomy

Section 4 defines the **canonical pattern taxonomy** for multi-tenancy in Contura systems.

It does not prescribe a single “right” architecture.  
Instead, it provides a **shared vocabulary and constraint framework** so teams can:

- Make trade-offs intentionally
- Compose patterns safely
- Evolve without redesign
- Detect and prevent common failure modes

Key takeaways:

- **Multi-tenancy is multi-dimensional.**  
  Isolation alone is not a solution; it is only one axis.

- **Tenant Context is the anchor.**  
  Routing and context propagation are prerequisites for every other pattern family.

- **Identity governs authority.**  
  User, service, and agent actions MUST be tenant-scoped and auditable.

- **Lifecycle events are high-risk.**  
  Provisioning, migration, suspension, and deletion require explicit workflows and guardrails.

- **Cost attribution must remain metadata.**  
  Metering and cost centers inform billing and reporting but MUST NOT alter access or isolation semantics.

- **Observability and safety are enforcement mechanisms.**  
  Tenant-aware telemetry and safety gates are required to constrain blast radius and enable investigation.

All subsequent sections build on this taxonomy by defining:

- canonical patterns,
- trade-offs,
- composition rules,
- and failure modes.

---

## 5. Canonical Multi-Tenancy Patterns (Deep Dives)

Section 5 provides the **pattern catalog proper**.

Where Section 4 defines *the dimensions*, Section 5 defines *the patterns*:

- what they are,
- when to use them,
- what they cost,
- how they fail,
- and how to evolve between them safely.

Section 5 is organized by the same dimensions defined in Section 4, so readers can navigate predictably and compare options.

### 5.1 How to Read the Pattern Catalog

Each pattern in this section follows a consistent structure:

- **Intent** — what problem the pattern solves  
- **Applies When** — contexts where the pattern is appropriate  
- **Forces & Trade-offs** — what the pattern optimizes vs. sacrifices  
- **Normative Requirements** — what MUST be true when applying it  
- **Common Variants** — typical forms seen in practice  
- **Failure Modes** — how the pattern commonly breaks  
- **Safe Composition** — how it interacts with other patterns  
- **Evolution Path** — when/how to move to a stronger pattern without redesign  

Patterns are written to be meaningful for:

- humans (architects, engineers, product builders)
- bots (agents applying rules consistently)

---

### 5.2 Isolation Patterns (Deep Dives)

This subsection expands the Section 4.3 isolation families into canonical patterns that can be selected and composed.

#### 5.2.1 Pooled Everything (Logical Isolation Baseline)

##### **Pooled Everything Intent**  

Maximize operational efficiency by serving all tenants from shared infrastructure, enforcing isolation via tenant-aware software and policy.

##### **Pooled Everything Applies When**

- Early-stage SaaS
- Many small tenants with low-to-moderate variance
- Fast onboarding is a priority
- Compliance requirements allow logical isolation

##### **Pooled Everything: Forces & Trade-offs**

- optimizes +: Lowest marginal cost per tenant
- optimizes +: Simplest provisioning
- sacrifices −: Highest reliance on correctness (tenant scoping everywhere)
- sacrifices −: Larger blast radius if isolation fails
- sacrifices −: Requires strong tenant-aware observability to remain safe

##### **Pooled Everything Normative Requirements**

- Every data access MUST be tenant-scoped (defense in depth preferred)
- Tenant Context MUST be explicit end-to-end
- Cross-tenant cache keys are forbidden
- Tenant-aware telemetry MUST exist from v1
- Safety gates MUST receive full Tenant Context for AI/tool execution paths

##### **Pooled Everything: Common Variants**

- Shared DB + row-level tenant_id filtering
- Shared compute pool + tenant-aware throttles
- Shared object store with tenant-prefixed paths

##### **Pooled Everything: Failure Modes**

- Missing tenant filter (cross-tenant data leak)
- Cache key collisions across tenants
- “Noisy neighbor” causing tenant-wide latency spikes
- Implicit tenant context via UI/session leading to ambiguity

##### **Pooled Everything: Safe Composition**

- Strongly recommended with:
  - Routing & Context hardening patterns (Section 5.3)
  - Tenant-aware authorization patterns (Section 5.4)
  - Per-tenant usage enforcement - rate limiting and quotas (Section 5.6)
  - Tenant-scoped observability & safety enforcement - observability and safety gates (Section 5.7)

##### **Pooled Everything: Evolution Path**

- Promote to hybrid isolation by carving out:
  - specific tenants (tier-based isolation)
  - specific workloads (high-risk compute isolation)
  - specific data domains (DB-per-tenant or shard-per-cohort)

---

#### 5.2.2 Pooled Compute + Partitioned Data (Bridge Isolation)

**Pooled Compute + Partitioned Data: Intent**  
Retain shared application infrastructure while increasing isolation and lifecycle flexibility by partitioning tenant data.

##### **Pooled Compute + Partitioned Data: Applies When**

- A single shared database becomes a bottleneck
- Backup/restore per tenant becomes necessary
- Data residency needs begin to emerge
- Some tenants outgrow pooled data constraints

##### **Pooled Compute + Partitioned Data: Forces & Trade-offs**

- optimizes: + Stronger data-level blast radius containment
- optimizes: + Enables tenant-specific retention and deletion workflows
- optimizes: + Supports tiering and gradual enterprise upgrades
- sacrifices: − Adds routing complexity (data location lookup)
- sacrifices: − Requires connection management discipline

##### **Pooled Compute + Partitioned Data: Normative Requirements**

- Data location MUST be resolved from trusted metadata (not client input)
- Tenant Context MUST be bound to data access paths
- Tenant migrations MUST be supported as explicit workflows
- Tenant placement MUST be auditable

##### **Pooled Compute + Partitioned Data: Common Variants**

- Schema-per-tenant
- DB-per-tenant within shared cluster/pool
- Shard-per-cohort (groups of tenants per shard)

##### **Pooled Compute + Partitioned Data: Failure Modes**

- Wrong shard routing (read/write divergence)
- Partial migrations leaving orphaned data
- Inconsistent enforcement across mixed storage systems

##### **Pooled Compute + Partitioned Data: Safe Composition**

- Strongly recommended with:
  - Tenant Directory / Placement Catalog patterns (Section 5.6)
  - Lifecycle migration playbooks (Section 5.6)
  - Tenant-aware observability tags in all data paths (Section 5.8)

##### **Pooled Compute + Partitioned Data: Evolution Path**

- Extend to hybrid by:
  - carving out “whale” tenants into dedicated clusters
  - adding regional deployments for residency
  - isolating specific workloads into sandbox execution

---

#### 5.2.3 Silo Tenants (Dedicated Infrastructure)

**Silo Tenants: Intent**  
Provide maximal isolation by giving one tenant dedicated infrastructure boundaries.

##### **Silo Tenants: Applies When**

- Strong compliance requirements demand physical separation
- A tenant’s workload dominates shared environments
- Contractual SLAs require hard blast-radius containment
- Customer-managed keys or residency constraints require dedicated stacks

##### **Silo Tenants: Forces & Trade-offs**

- optimizes + Strongest containment and compliance posture
- optimizes + Reduced reliance on application-layer filtering
- sacrifices − Highest operational overhead
- sacrifices − Requires automation to avoid “silo sprawl”
- sacrifices − Release management complexity increases

##### **Silo Tenants: Normative Requirements**

- Silo tenancy MUST remain consistent with Canonical Tenant Model
- The same Tenant Context rules apply (no bypass)
- Operational access MUST be auditable and tenant-scoped
- Provisioning and upgrades MUST be automated
- Network and account boundaries MUST be explicit if used

##### **Silo Tenants: Common Variants**

- Dedicated DB cluster
- Dedicated compute cluster / namespace / node pool
- Separate cloud account/project per tenant
- Dedicated regional deployment for residency

##### **Silo Tenants: Failure Modes**

- Silo sprawl causing operational collapse
- Divergent configurations across tenants leading to drift
- “Special” bypass tooling that breaks auditability

##### **Silo Tenants: Safe Composition**

- Recommended with:
  - deployment stamp automation
  - strict policy-as-code
  - centralized observability across silos
  - hardened operator access workflows

##### **Silo Tenants: Evolution Path**

- Most commonly introduced as an enterprise tier after pooled/hybrid maturity.
- Must be treated as a managed mode, not a custom fork.

---

#### 5.2.4 Hybrid Isolation (Selective and Tiered)

##### **Hybrid Isolation Intent**  

Allow a SaaS platform to start pooled, then selectively apply stronger isolation where justified—without redesign.

##### **Hybrid Isolation Applies When**

- Tenant variance grows (size, compliance, performance sensitivity)
- Enterprise tier emerges
- AI workloads introduce cost and risk asymmetry
- Data residency requirements expand

##### **Hybrid Isolation: Forces & Trade-offs**

- optimizes + Enables pragmatic scaling and tiered offerings
- optimizes + Controls blast radius while preserving density
- sacrifices − Increases routing, lifecycle, and observability complexity
- sacrifices − Requires explicit placement and migration governance

##### **Hybrid Isolation: Normative Requirements**

- Isolation mode MUST be explicit metadata governed by Control Plane policy
- Tenant routing MUST be deterministic and verifiable
- Migrations MUST be first-class lifecycle workflows
- Observability MUST support comparing behavior across modes

##### **Hybrid Isolation: Common Variants**

- Pooled baseline + carve-out whales
- Tiered pools (free vs paid vs enterprise)
- Dedicated data + pooled compute for most
- Regional pools + dedicated residency zones

##### **Hybrid Isolation: Failure Modes**

- Implicit placement logic hidden in code
- Untracked carve-outs (“snowflake tenants”)
- Inconsistent security posture across tiers
- Operational confusion (support can’t tell where tenant lives)

##### **Hybrid Isolation: Safe Composition**

- Requires strong:
  - placement catalogs
  - migration automation
  - per-tenant telemetry and cost attribution
  - policy-driven entitlements

##### **Hybrid Isolation: Evolution Path**

- Hybrid is not a final stage; it is an operating model.
- Over time, hybrid systems often converge on:
  - fewer, more standardized isolation modes
  - automated tenant promotion/demotion workflows
  - clearer enterprise partitions (residency/compliance zones)

---

### 5.3 Runtime Routing & Tenant Context Patterns

Routing and Tenant Context patterns define **how a request, action, or execution is bound to the correct tenant** and how that context is preserved across system boundaries.

This is the **foundational pattern family** for all multi-tenant systems.

If tenant routing fails:

- Isolation fails
- Authorization fails
- Observability fails
- Cost attribution fails
- AI safety fails

For this reason, routing and tenant context patterns are **non-optional** and **precede all other multi-tenancy concerns**.

---

#### 5.3.1 Core Principle: Tenant Context Must Be Explicit

A Contura system MUST never rely on:

- Implicit tenant inference
- UI-selected state alone
- Client-supplied tenant identifiers without verification
- Global or ambient tenant defaults

**Every meaningful operation MUST execute within explicit Tenant Context.**

Tenant Context includes:

- Tenant identifier
- Optional Workspace identifier
- Acting principal (user, service, or agent)
- Applicable policy and entitlements

If Tenant Context is missing, ambiguous, or unverifiable, the operation MUST fail closed.

---

#### 5.3.2 Canonical Routing Stages

Tenant routing occurs across **multiple stages**, not just at ingress.

The canonical routing stages are:

1. **Ingress Identification**
2. **Context Binding**
3. **Context Propagation**
4. **Context Enforcement**
5. **Context Validation (Defense-in-Depth)**

Each stage has distinct responsibilities and failure modes.

---

#### 5.3.3 Ingress Tenant Identification Patterns

Ingress patterns determine **how the system identifies which tenant a request belongs to**.

Ingress identification MUST be:

- Deterministic
- Verifiable
- Resistant to spoofing

Canonical patterns include:

---

##### A. Domain / Subdomain-Based Routing

###### **Domain / Subdomain-Based Routing Intent**  

Bind tenant identity via DNS or host-level routing.

###### **Domain / Subdomain-Based Routing: Example**

- `tenantA.contura.app`
- `tenantB.api.contura.app`

###### **Domain / Subdomain-Based Routing: Properties**

- Tenant identity resolved before application logic
- Naturally compatible with CDNs and edge routing
- Strong user mental model

###### **Domain / Subdomain-Based Routing: Normative Requirements**

- Hostname MUST map to exactly one Tenant
- Host-based tenant claims MUST NOT be overridden by headers or payloads
- TLS configuration MUST prevent domain hijacking

###### **Domain / Subdomain-Based Routing: Failure Modes**

- Shared wildcard domains without validation
- Internal services trusting Host headers without sanitization

---

##### B. Token-Embedded Tenant Claims

###### **Token-Embedded Tenant Claims Intent**  

Bind tenant identity via cryptographically signed credentials.

###### **Token-Embedded Tenant Claims Example**

- JWT containing `tenant_id`, `workspace_id`, roles

###### **Token-Embedded Tenant Claims Properties**

- Works across web, mobile, API, and agent flows
- Supports explicit tenant switching
- Strongly auditable

###### **Token-Embedded Tenant Claims Normative Requirements**

- Tenant claims MUST be issued by a trusted authority
- Tokens MUST be tenant-scoped (no multi-tenant tokens by default)
- Token refresh MUST preserve tenant binding

###### **Token-Embedded Tenant Claims Failure Modes**

- Tokens valid across tenants
- Client-controlled tenant fields outside token claims

---

##### C. Explicit Tenant Selection with Session Binding

###### **Explicit Tenant Selection with Session Binding Intent**

Allow users who belong to multiple tenants to explicitly select context.

###### **Explicit Tenant Selection with Session Binding Properties**

- Common in enterprise and MSP scenarios
- Requires clear UX and state handling

###### **Explicit Tenant Selection with Session Binding Normative Requirements**

- Tenant switching MUST mint a new tenant-scoped session/token
- Prior tenant context MUST be invalidated
- Background or agent execution MUST use the active tenant context explicitly

###### **Explicit Tenant Selection with Session Binding Failure Modes**

- Silent tenant switching
- Mixed-tenant sessions
- Cached context reused across tenants

---

Ingress patterns may be combined, but **exactly one authoritative tenant identifier MUST win**.

---

#### 5.3.4 Context Binding Patterns

Once tenant identity is identified, it MUST be **bound to execution context**.

Binding patterns ensure:

- Tenant context is immutable for the duration of an operation
- Downstream systems cannot alter tenant identity

Canonical binding mechanisms include:

- Request-scoped context objects
- Thread-local or async-local storage
- Explicit context parameters in function calls
- Signed internal context tokens for async execution

##### **Context Binding Patterns Normative Requirements**

- Tenant Context MUST be bound once and treated as read-only
- Late binding (e.g., resolving tenant inside business logic) is forbidden
- Default/global tenant context is forbidden

---

#### 5.3.5 Context Propagation Patterns

Tenant Context MUST propagate across:

- Service-to-service calls
- Background jobs
- Event streams
- Agent executions
- AI inference and tool invocation

Propagation mechanisms include:

- Auth tokens passed downstream
- Internal signed context headers
- Context envelopes for async messages
- Trace/span context augmentation

##### **Context Propagation Patterns Normative Requirements**

- Tenant Context MUST NOT be dropped during propagation
- Services MUST reject requests missing required tenant context
- Async consumers MUST validate tenant context before execution

##### **Context Propagation Patterns Failure Modes**

- Background jobs running “out of tenant”
- Event handlers defaulting to global context
- Agents executing without verified tenant binding

---

#### 5.3.6 Context Enforcement Patterns

Enforcement ensures Tenant Context is **actually used**, not just carried.

Enforcement points include:

- Authorization checks
- Data access layers
- Cache key construction
- Tool access policies
- AI retrieval filters
- Observability tagging

##### **Context Enforcement Patterns Normative Requirements**

- All data access MUST be tenant-scoped by construction
- Cache keys MUST include tenant identifiers
- Tool and agent permissions MUST evaluate tenant context
- AI systems MUST apply tenant filters at retrieval time

Enforcement MUST occur at multiple layers (defense in depth).

---

#### 5.3.7 Context Validation & Defense-in-Depth

Even with correct routing, systems MUST assume mistakes occur.

Validation patterns include:

- Cross-checking tenant context against resource ownership
- Verifying data-layer tenant identifiers match context
- Rejecting mismatches aggressively
- Auditing violations as security events

##### **Context Validation & Defense-in-Depth Example**

> A request scoped to Tenant A attempting to access a Resource owned by Tenant B MUST fail, even if identifiers match.

##### **Context Validation & Defense-in-Depth Normative Requirements**

- Validation MUST exist at least at authorization and data access layers
- Violations MUST be logged with tenant-aware audit events

---

#### 5.3.8 Mobile and Agent-Specific Considerations

##### **Mobile Context**

- Sessions are short-lived
- Background execution may resume later
- Tenant context MUST be recoverable without ambiguity

##### **Agent Context**

- Agents act continuously
- Agents MUST use explicit delegated identity
- Agents MUST NEVER infer tenant context from stored state alone

Agent routing MUST:

- Bind tenant context at invocation time
- Re-validate context for each execution step
- Respect suspension, policy, and lifecycle state

---

#### 5.3.9 Anti-Patterns (Explicitly Forbidden)

The following are architectural defects:

- Implicit tenant resolution
- Global “current tenant” variables
- Tenant context inferred from resource IDs alone
- Background jobs without tenant binding
- Reusing tokens across tenants
- Allowing clients to specify tenant identifiers directly

These anti-patterns are responsible for the majority of real-world cross-tenant incidents.

---

#### 5.3.10 Summary

Routing & Tenant Context patterns:

- Anchor all multi-tenancy guarantees
- Enable safe composition of isolation, identity, lifecycle, and cost patterns
- Are mandatory for AI-first systems
- Must be explicit, verifiable, and enforced at every layer

No other multi-tenancy pattern is valid without correct tenant routing.

---

#### 5.3.11 Routing & Tenant Context Flow (Canonical)

This diagram illustrates the **canonical flow of tenant context** from ingress to execution.
It applies equally to:

- Web clients
- Mobile clients
- APIs
- Agent-driven execution

All Contura systems MUST conform to this flow.

```ascii

+-------------------+
|   Client / Agent  |
|-------------------|
| - Web / Mobile    |
| - API Client      |
| - Agent Runtime   |
+---------+---------+
          |
          | ① Request / Invocation
          |    (token, host, or explicit selection)
          v
+---------------------------+
| Ingress / Edge Boundary   |
|---------------------------|
| - Domain or API Gateway   |
| - Auth Front Door         |
| - Agent Invocation API   |
+-------------+-------------+
              |
              | ② Tenant Identification
              |    (authoritative source)
              v
+---------------------------+
| Tenant Context Resolver   |
|---------------------------|
| - Validate tenant claim   |
| - Resolve Tenant ID       |
| - Resolve Workspace ID*   |
| - Reject ambiguity        |
+-------------+-------------+
              |
              | ③ Context Binding (immutable)
              v
+---------------------------+
| Execution Context         |
|---------------------------|
| Tenant Context = {        |
|   tenant_id               |
|   workspace_id?           |
|   principal (user/agent)  |
|   entitlements            |
| }                         |
+-------------+-------------+
              |
              | ④ Context Propagation
              |    (sync + async)
              v
+---------------------------+
| Application Services      |
|---------------------------|
| - APIs                    |
| - Workflows               |
| - Agents                  |
| - Background Jobs         |
+------+------+-------------+
       |      |
       |      | ⑤ Context Enforcement
       |      |    (defense in depth)
       |      v
       |  +------------------------+
       |  | Authorization Layer    |
       |  |------------------------|
       |  | - Tenant check         |
       |  | - Role / Policy check  |
       |  +-----------+------------+
       |              |
       |              | ⑥ Scoped Access
       |              v
       |  +------------------------+
       |  | Data / Tool Access     |
       |  |------------------------|
       |  | - Tenant-scoped query  |
       |  | - Cache keys include   |
       |  |   tenant_id            |
       |  | - AI retrieval filters |
       |  +-----------+------------+
       |              |
       |              | ⑦ Observability
       |              v
       |  +------------------------+
       |  | Logs / Metrics / Audit |
       |  |------------------------|
       |  | tenant_id REQUIRED     |
       |  | principal REQUIRED    |
       |  +------------------------+
       |
       v
+---------------------------+
| Result / Side Effects     |
|---------------------------|
| - Response                |
| - Events                  |
| - Stored artifacts        |
+---------------------------+

* Workspace context is optional but must be explicit when present.

```

#### How to Read This Diagram

This diagram is **normative**, not illustrative.

Each numbered step represents a **mandatory architectural responsibility**.
Skipping or collapsing steps is a common source of multi-tenant failures.

##### **① Request / Invocation**

- Every interaction enters the system as a request or invocation.
- Clients and agents are treated uniformly at the boundary.

##### **② Tenant Identification**

- Tenant identity is determined exactly once.
- The source must be authoritative (domain, signed token, or explicit selection).
- Ambiguity or mismatch MUST fail closed.

##### **③ Context Binding**

- Tenant Context is bound immutably to the execution.
- No downstream system may alter tenant identity.

##### **④ Context Propagation**

- Tenant Context flows with the execution across services, jobs, and agents.
- Async boundaries MUST preserve context explicitly.

##### **⑤ Context Enforcement**

- Authorization, policy, and entitlement checks occur here.
- Enforcement is not optional and not centralized to one layer.

##### **⑥ Scoped Access**

- All data, cache, tools, and AI retrieval are tenant-scoped.
- Resource ownership is validated against Tenant Context.

##### **⑦ Observability**

- Tenant identity is attached to logs, metrics, traces, and audit events.
- Missing tenant observability is an architectural defect.

The diagram flows **left-to-right, top-to-bottom**.
There is no “fast path” that bypasses Tenant Context.

If a developer cannot point to where their code fits in this diagram,
the code is not tenancy-safe.

### 5.4 Runtime Identity & Access Patterns

Identity & Access patterns define **who or what is acting**, **on whose behalf**, and **under which tenant authority**.

In a multi-tenant SaaS system:

- Identity without tenant context is meaningless
- Authorization without tenant scoping is dangerous
- “Admin” without scope is a vulnerability

Identity & Access patterns MUST be designed together with routing and tenant context.
They cannot be layered on afterward.

---

#### 5.4.1 Core Principle: Identity Is Always Tenant-Scoped

All identities in Contura systems are evaluated **within Tenant Context**.

This includes:

- Human users
- Agents
- Services
- Automated workflows

There is no such thing as:

- A global user
- A global admin
- A tenant-agnostic role

Any identity operating without explicit tenant scope is invalid.

---

#### 5.4.2 Identity Categories

Contura systems recognize four identity categories:

---

##### A. User Identity (Human)

A **User** is a global identity that may belong to one or more tenants.

Properties:

- Users authenticate globally
- Authorization is tenant-scoped
- Sessions are tenant-bound

Normative rules:

- A user session MUST be scoped to exactly one tenant
- Tenant switching MUST mint a new session or token
- Role evaluation MUST include tenant context

---

##### B. Agent Identity (Non-Human)

An **Agent** is a non-human actor performing actions on behalf of a tenant.

Agents:

- May be user-initiated or system-initiated
- Act continuously and asynchronously
- Have cost, safety, and compliance impact

Normative rules:

- Agents MUST have explicit tenant identity
- Agents MUST NOT infer tenant context from stored state
- Agents MUST respect suspension, policy, and lifecycle state
- Agents MUST be auditable as first-class principals

Agent semantics are governed by the Agent Identity Pattern ADR.

---

##### C. Service Identity (Internal)

Services act as **delegated actors**, not autonomous authorities.

Normative rules:

- Services MUST authenticate to each other
- Services MUST propagate tenant context
- Services MUST NOT widen scope beyond incoming context

Service identity exists to:

- Verify call authenticity
- Enforce least privilege
- Support zero-trust boundaries

---

##### D. Operator Identity (Contura Staff)

Operators are internal human or automated identities.

Normative rules:

- Operator access MUST be explicit and auditable
- Cross-tenant access MUST require deliberate scope selection
- “God mode” access is forbidden

Operator actions MUST:

- Be tenant-scoped
- Leave an audit trail
- Respect customer isolation

---

#### 5.4.3 Authorization Patterns

Authorization answers:
> “Is this principal allowed to perform this action on this resource in this tenant?”

Canonical authorization patterns include:

- Tenant-scoped RBAC
- Policy-based access (ABAC)
- Capability-based access for agents
- Entitlement checks via AccountScope

Normative requirements:

- Authorization MUST validate tenant ownership of the resource
- Role names without tenant context are invalid
- Policy evaluation MUST fail closed

---

#### 5.4.4 Identity and AccountScope Integration

AccountScope is the **authority for governance**, not identity execution.

AccountScope governs:

- Authentication configuration (SSO, SCIM)
- Entitlements and plan limits
- Compliance and retention policies

Identity patterns MUST:

- Query AccountScope for configuration
- Enforce AccountScope policies at runtime
- Avoid duplicating governance logic elsewhere

---

#### 5.4.5 Anti-Patterns (Explicitly Forbidden)

The following are architectural defects:

- Global users or admins
- Multi-tenant sessions
- Reusing tokens across tenants
- Agent execution without delegated identity
- Authorization checks that ignore tenant context
- Relying on UI state for authorization

These anti-patterns are common root causes of:

- Cross-tenant data exposure
- Privilege escalation
- Audit failures
- Compliance violations

---

#### 5.4.6 Summary

Identity & Access patterns ensure that:

- Every action is attributable
- Every permission is scoped
- Every tenant boundary is enforced

Correct identity design:

- Enables safe delegation
- Prevents accidental privilege widening
- Supports enterprise evolution without redesign

#### 5.4.7 Developer Checklist — Did You Bind Tenant Context?

This checklist applies to **all code paths**, whether written by:

- Human developers
- Internal tools
- Agents generating or modifying code

If any item cannot be answered **YES**, the code is not tenancy-safe.

---

#### Tenant Context Binding

- [ ] Is Tenant Context established exactly once at ingress?
- [ ] Is the tenant identifier sourced from an authoritative input (token, domain, explicit selection)?
- [ ] Does execution fail closed if tenant context is missing or ambiguous?

---

#### Context Propagation

- [ ] Is tenant context propagated to all downstream calls?
- [ ] Is tenant context preserved across async boundaries (jobs, events, agents)?
- [ ] Is tenant context immutable once bound?

---

#### Authorization & Access

- [ ] Does every authorization check include tenant scope?
- [ ] Is resource ownership validated against tenant context?
- [ ] Are cache keys, queries, and tool calls tenant-scoped?

---

#### Identity & Delegation

- [ ] Is the acting principal (user, agent, service) explicit?
- [ ] If an agent is acting, is its delegated identity clear and auditable?
- [ ] Are tokens or sessions scoped to exactly one tenant?

---

#### Observability & Audit

- [ ] Are tenant identifiers present in logs, metrics, and traces?
- [ ] Are tenant identifiers present in audit events?
- [ ] Can actions be attributed to a tenant and principal after the fact?

---

#### Cost & Safety

- [ ] Is usage metered with tenant attribution?
- [ ] Are entitlements enforced at execution time?
- [ ] Can this code path generate unbounded cost or side effects?

---

#### **Rule of Thumb**

If you cannot point to where tenant context is:

- Introduced
- Bound
- Enforced
- Observed

Then tenant context is **not real**, only assumed.

Assumed tenancy is a defect.

### 5.5 Lifecycle Patterns

Lifecycle patterns operate primarily in the Control Plane, but MUST be enforced consistently across Application and Data Planes.

Lifecycle patterns define **how tenants and their assets change over time**.

Unlike steady-state execution, lifecycle events are:

- Infrequent
- High-impact
- Operationally complex
- Prone to isolation failures

For this reason, lifecycle patterns are **first-class architectural concerns**.

---

#### 5.5.1 Lifecycle as a Risk Surface

Tenant lifecycle events include:

- Tenant creation
- Workspace and resource onboarding
- Plan changes and entitlement updates
- Migration and rebalancing
- Suspension and deletion

Each lifecycle transition represents a moment where:

- Isolation can be violated
- Data can be misattributed
- Policy can be bypassed
- Cost can spike or leak

Lifecycle patterns exist to **make these transitions explicit and controlled**.

---

#### 5.5.2 Tenant Provisioning Patterns

Tenant provisioning establishes a new tenant and its initial governance state.

Normative requirements:

- Tenant creation MUST be deliberate and high-friction
- AccountScope MUST be created atomically with the tenant
- Default policies and entitlements MUST be explicit

Provisioning MUST:

- Allocate governance constructs before user-facing assets
- Establish audit scope
- Avoid partial or implicit tenant creation

A tenant is not “created” until governance exists.

---

#### 5.5.3 Workspace and Resource Onboarding

Workspaces and resources are **low-friction constructs**, but still tenant-scoped.

Normative rules:

- All workspaces MUST belong to exactly one tenant
- Workspace creation MUST NOT create new governance boundaries
- Resource creation MUST inherit tenant context explicitly

Onboarding patterns MUST:

- Validate tenant ownership
- Attach default policies
- Register assets for observability and metering

---

#### 5.5.4 Entitlement Changes and Plan Transitions

Plan upgrades, downgrades, and entitlement changes are lifecycle events.

Normative rules:

- Entitlement changes MUST be evaluated at execution time
- In-flight executions MUST respect updated limits
- Changes MUST be auditable and attributable

Entitlements are enforced via AccountScope, not via resource state.

---

#### 5.5.5 Tenant Migration and Rebalancing

Migration includes:

- Moving tenants across infrastructure
- Changing isolation strength
- Region or shard relocation

Migration patterns MUST:

- Preserve tenant identity
- Preserve audit and cost attribution
- Avoid cross-tenant data movement

Tenant migration is an **operational action**, not a user action.

---

#### 5.5.6 Suspension and Quarantine Patterns

Tenants may be suspended due to:

- Billing issues
- Policy violations
- Security incidents

Suspension MUST:

- Be enforced centrally
- Apply uniformly across services, agents, and workflows
- Prevent new execution while preserving data

Quarantine MAY introduce stronger isolation temporarily.

---

#### 5.5.7 Tenant Deletion and Retention

Tenant deletion is irreversible and high-risk.

Normative rules:

- Deletion MUST be explicit and deliberate
- Active execution MUST be halted before deletion
- Data retention policies MUST be enforced consistently

Deletion patterns MUST:

- Avoid orphaned resources
- Respect compliance and retention obligations
- Be auditable end-to-end

---

#### 5.5.8 Lifecycle and Agents

Agents complicate lifecycle patterns:

- They may run asynchronously
- They may span long durations
- They may generate cost autonomously

Lifecycle patterns MUST:

- Terminate or pause agents on suspension
- Prevent agents from resurrecting deleted resources
- Ensure agent execution respects tenant state transitions

---

#### 5.5.9 Summary

Lifecycle patterns ensure that:

- Tenancy remains intact over time
- Governance changes are enforced consistently
- High-risk transitions are controlled

Lifecycle is where many multi-tenant systems fail.
Explicit lifecycle patterns prevent silent corruption and late redesign.

### 5.6 Cost, Metering, and Usage Enforcement

This section defines **how cost is measured, attributed, and constrained at execution time**.

Where Section 4.7 establishes **cost as an architectural dimension**, this section defines **runtime enforcement patterns** that ensure cost governance is real, not theoretical.

In AI-first SaaS systems, cost enforcement is a **safety mechanism**, not merely a billing concern.

---

#### 5.6.1 Cost as a Runtime Responsibility

Cost is incurred at runtime, not at billing time.

Therefore:

- Cost attribution MUST occur at execution boundaries
- Cost enforcement MUST occur before or during execution
- Cost visibility MUST be near real-time

Deferred or offline-only cost accounting is insufficient for:

- AI workloads
- Agent loops
- Unbounded background execution

---

#### 5.6.2 Metering as a First-Class Execution Step

Metering MUST be treated as a mandatory execution step, not a side effect.

Canonical metering points include:

- API request handling
- Job or workflow execution
- Agent action or inference step
- Tool invocation
- Storage read/write operations

Each metering event MUST include:

- Tenant identifier
- Acting principal (user, agent, service)
- Resource identifier and type
- Quantity (time, tokens, bytes, calls)
- Timestamp

Metering without tenant context is invalid.

---

#### 5.6.3 Enforcement Before Execution

Usage enforcement MUST occur **before execution begins**, whenever possible.

Examples:

- Pre-flight budget checks
- Validate budget availability
- Reject an agent invocation if token budget is exhausted
- Throttle API calls beyond tenant rate limits
- Prevent workflow fan-out beyond entitlement limits

Failing fast is preferable to:

- Partial execution
- Cost leakage
- Post-hoc billing disputes

---

#### 5.6.4 Enforcement During Execution

Some workloads require **continuous enforcement**.

Examples:

- Long-running agents
- Streaming inference
- Batch jobs with fan-out
- Recursive or adaptive workflows

Patterns include:

- Periodic budget checks
- Step-level quota evaluation
- Hard execution cutoffs
- Progressive throttling

Execution MUST terminate safely when limits are reached.

---

#### 5.6.5 AccountScope as Enforcement Authority

AccountScope is the authoritative source for:

- Entitlements
- Quotas
- Usage limits
- Plan constraints

Runtime systems MUST:

- Query AccountScope-derived policy
- Cache limits carefully with invalidation
- Respect updates immediately where feasible

Cost enforcement logic MUST NOT be duplicated across services.

---

#### 5.6.6 AI- and Agent-Specific Enforcement Patterns

AI workloads introduce unique cost risks:

- Non-deterministic execution length
- Tool fan-out
- Autonomous loops
- Hidden inference cost

Normative rules:

- Agents MUST have explicit cost budgets
- Budgets MUST be tenant-scoped
- Agent execution MUST be interruptible
- Cost attribution MUST identify agent identity

Agents that cannot be stopped are architectural defects.

---

#### 5.6.7 Graceful Degradation Patterns

When limits are reached, systems SHOULD:

- Degrade gracefully where possible
- Provide clear feedback
- Avoid partial or corrupt outputs

Examples:

- Reduce inference depth
- Switch to cheaper models
- Pause agent execution
- Require explicit user confirmation to continue

Silent degradation without observability is forbidden.

---

#### 5.6.8 Observability and Audit Integration

Cost enforcement MUST emit:

- Metering events
- Enforcement decisions
- Budget exhaustion signals

These events MUST:

- Include tenant and principal identifiers
- Be auditable
- Be traceable to execution paths

Cost without observability is a governance failure.

---

#### 5.6.9 Failure Modes and Guardrails

Common failure modes include:

- Missing metering on background jobs
- Agents executing without budgets
- Cached entitlements becoming stale
- CostCenters mistakenly used as enforcement boundaries

Guardrails MUST include:

- Mandatory tenant-scoped metering
- Centralized entitlement evaluation
- Enforcement at multiple execution layers
- Automated alerts on anomalous spend

---

#### 5.6.10 Summary

Cost, metering, and usage enforcement ensure that:

- Tenants cannot accidentally or maliciously overspend
- AI workloads remain bounded
- Agents operate safely
- Billing reflects reality

In Contura systems, **cost is governed at runtime, not reconciled afterward**.

### 5.7 Observability, Audit, and Safety Enforcement

This section defines **how multi-tenant systems remain visible, accountable, and governable at runtime**.

Observability and audit are not passive diagnostics.  
They are **active enforcement mechanisms** that enable safety, compliance, and rapid containment of failures.

In AI-first, multi-tenant SaaS systems:

- If behavior cannot be observed, it cannot be governed
- If actions cannot be audited, they cannot be trusted
- If safety cannot be enforced continuously, it degrades silently

---

#### 5.7.1 Observability as an Enforcement Primitive

Observability is often treated as “after-the-fact” telemetry.

In Contura systems, observability is:

- A prerequisite for safety
- A requirement for isolation
- An enforcement signal for lifecycle and cost controls

Observability MUST enable the system to answer, at any point:

- Which tenant is involved?
- Which identity acted?
- Which resources were accessed?
- What execution path occurred?
- What policies were evaluated?
- What cost and impact resulted?

Any execution path that cannot answer these questions is unsafe.

---

#### 5.7.2 Tenant-Scoped Telemetry (Normative)

All telemetry MUST be tenant-scoped.

This includes:

- Logs
- Metrics
- Traces
- Events
- Audit records
- AI evaluation artifacts

Each telemetry signal MUST include:

- Tenant identifier
- Acting principal (user, agent, service)
- Resource identifiers (where applicable)
- Timestamp and execution context

Telemetry that aggregates across tenants without attribution is forbidden.

---

#### 5.7.3 Observability Across Execution Boundaries

Tenant-aware observability MUST span:

- **Ingress**  
  Authentication, routing, and tenant resolution

- **Application Execution**  
  APIs, workflows, agents, background jobs

- **Data and Tool Access**  
  Queries, retrieval, mutation, external integrations

- **Asynchronous Paths**  
  Queues, schedulers, event handlers

Tenant context MUST be preserved across all boundaries so that execution can be reconstructed end-to-end.

---

#### 5.7.4 Audit Trails as First-Class Artifacts

Audit trails are **authoritative records**, not derived logs.

Audit events MUST:

- Be immutable
- Be tenant-scoped
- Be identity-scoped
- Capture intent and outcome

Canonical audit events include:

- Tenant lifecycle changes
- Identity and role changes
- Policy and entitlement changes
- Resource creation, modification, deletion
- Agent execution and tool usage
- Safety gate decisions

Audit trails MUST survive:

- Asynchronous execution
- Long-running agents
- Partial failures

Missing audit events constitute compliance failures.

---

#### 5.7.5 Safety Gates as Runtime Control Points

Safety Gates are **explicit enforcement points** where execution may be:

- Allowed
- Modified
- Paused
- Blocked
- Escalated

Safety Gates MAY occur:

- Before execution (pre-flight checks)
- During execution (runtime evaluation)
- After execution (post-hoc analysis)

Safety Gates MUST:

- Receive full Tenant Context
- Evaluate policy explicitly
- Emit tenant-scoped audit and telemetry
- Be deterministic and explainable

Safety Gates MUST NOT rely on best-effort or implicit checks.

---

#### 5.7.6 AI-Specific Safety and Observability Patterns

AI workloads introduce unique safety risks:

- Probabilistic outputs
- Semantic data leakage
- Tool misuse
- Autonomous execution loops

AI observability MUST include:

- Prompt and context provenance
- Retrieval sources and scope
- Tool invocation paths
- Model version and configuration
- Evaluation and scoring results

AI safety enforcement MUST:

- Be tenant-scoped
- Be continuous
- Be observable
- Support replay and investigation

An AI system that cannot explain *why* it acted is not safe to operate multi-tenant.

---

#### 5.7.7 Blast Radius Detection and Containment

Observability enables **blast radius detection**.

Blast radius indicators include:

- Sudden cost spikes
- Abnormal agent behavior
- Unexpected fan-out
- Policy violation patterns

Systems MUST be able to:

- Attribute blast radius to a tenant
- Contain impact within that tenant
- Trigger lifecycle or entitlement controls automatically

Containment actions MAY include:

- Throttling
- Agent suspension
- Tenant suspension
- Safety gate escalation

---

#### 5.7.8 Observability for Agents and Autonomous Execution

Agents amplify observability requirements.

Agent execution MUST:

- Emit step-level telemetry
- Record decision points
- Attribute tool usage and cost
- Support interruption and rollback

Agents MUST NOT operate as “black boxes”.

Agent observability is a **non-negotiable safety requirement**.

---

#### 5.7.9 Failure Modes and Guardrails

Common observability and safety failure modes include:

- Logs without tenant identifiers
- Aggregated metrics hiding tenant impact
- Missing audit events for agent actions
- Safety checks without enforcement hooks

Architectural guardrails MUST include:

- Mandatory tenant-scoped telemetry schemas
- Cross-plane correlation (control, application, data)
- Automated safety evaluation
- Alerts tied to tenant context

---

#### 5.7.10 Summary

Observability, audit, and safety enforcement ensure that:

- Tenant behavior is visible
- Actions are attributable
- Failures are detectable
- Impact is containable

In Contura systems:

- Observability is enforcement
- Audit is authority
- Safety is continuous

Without these patterns, multi-tenancy becomes ungovernable at scale.

### 5.8 Section 5 Summary — Pattern Composition & Evolution

Section 5 defines the **canonical execution patterns** for multi-tenancy in Contura systems.

Where earlier sections establish:

- *why* multi-tenancy exists (Section 2),
- *what the tenant model is* (Section 3),
- and *how the pattern space is structured* (Section 4),

Section 5 defines **how multi-tenancy actually works at runtime**.

---

#### 5.8.1 Patterns Are Composable, Not Exclusive

No real system uses a single multi-tenancy pattern.

Instead:

- Isolation, routing, identity, lifecycle, cost, and observability patterns
- Are **composed across dimensions**
- And may vary **per tenant, per resource, or per workload**

For example:

- A tenant may be logically isolated for most workloads
- Physically isolated for sensitive data
- Subject to stricter cost enforcement for agents
- Observed more aggressively during migration or incident response

Composition is intentional and policy-driven, not accidental.

---

#### 5.8.2 Tenant Context Is the Unifying Primitive

Across all patterns in Section 5, one invariant appears repeatedly:

> **Nothing is safe unless Tenant Context is explicit, bound, enforced, and observed.**

Tenant Context:

- Anchors routing
- Scopes identity
- Governs lifecycle
- Enables cost attribution
- Makes observability meaningful
- Enables AI safety enforcement

Any pattern that weakens tenant context undermines the entire architecture.

---

#### 5.8.3 Evolution Without Redesign Is the Primary Goal

The patterns in Section 5 are explicitly designed to support **evolution without architectural redesign**.

Systems SHOULD be able to:

- Start pooled and simple
- Add hybrid isolation selectively
- Introduce enterprise governance incrementally
- Strengthen safety and observability over time

Evolution is expected.

Redesign due to implicit assumptions, hidden coupling, or missing invariants is a failure mode this guide exists to prevent.

---

#### 5.8.4 High-Risk Areas Deserve Extra Rigor

Across all patterns, the highest-risk areas are:

- Routing and tenant context propagation
- Identity and delegation (especially agents)
- Lifecycle transitions (provisioning, migration, deletion)
- Cost enforcement for autonomous execution
- Observability gaps across async boundaries

These areas deserve:

- Defense in depth
- Explicit audits
- Checklists and validation
- Conservative defaults

Most real-world multi-tenant incidents occur here.

---

#### 5.8.5 Patterns Are Written for Humans and Agents

Patterns in this guide are intentionally:

- Explicit
- Normative
- Checklist-friendly

They are designed to be:

- Read by architects
- Implemented by engineers
- Enforced by tooling
- **Applied by agents generating or modifying code**

If a pattern cannot be checked, enforced, or reasoned about mechanically, it is incomplete.

---

#### 5.8.6 How to Use Section 5

Readers should use Section 5 to:

- Validate existing architectures
- Design new systems safely
- Review code and workflows
- Guide agent behavior
- Plan enterprise evolution

Patterns may be adopted incrementally, but **their invariants must be respected immediately**.

---

#### 5.8.7 Closing Principle

Multi-tenancy is not achieved by:

- A database schema
- A network boundary
- A billing model
- Or a single design choice

Multi-tenancy is achieved by **consistent enforcement of explicit boundaries over time**.

Section 5 defines those enforcement patterns.

## 6. Enterprise Evolution & Compliance Modes

Section 6 defines how a Contura multi-tenant SaaS system **evolves safely from baseline SaaS operation into enterprise and regulated environments**—*without redesign*.

This section does **not** introduce new tenant primitives.
Instead, it defines:

- Controlled **modes of operation**
- Additional **constraints and obligations**
- Explicit **trade-offs and costs**

Enterprise readiness is treated as an **architectural evolution**, not a fork.

---

### 6.1 Enterprise Is a Mode, Not a Different Architecture

A common failure pattern in SaaS platforms is treating “enterprise” as:

- A separate product
- A parallel architecture
- A set of one-off exceptions

This guide explicitly rejects that model.

In Contura systems:

- Enterprise is a **mode of operation**
- Activated per tenant (or per AccountScope)
- Governed by explicit policy
- Enforced by the same primitives defined in Sections 3–5

If enterprise support requires redefining tenants, identity, routing, or lifecycle semantics, the base architecture is incomplete.

---

### 6.2 Enterprise Drivers and Architectural Pressure

Enterprise and regulated customers introduce **predictable pressures**:

- Stronger isolation requirements
- Explicit compliance controls
- Operator access constraints
- Data residency guarantees
- Audit and retention mandates
- Contractual SLAs
- Change management expectations

These pressures do not invalidate SaaS-first design.
They **narrow acceptable choices** within the existing pattern space.

---

### 6.3 Compliance Modes as Explicit Policy

Enterprise evolution is expressed via **Compliance Modes**.

A Compliance Mode is:

- A named, explicit policy profile
- Associated with an AccountScope
- Evaluated at runtime
- Auditable and enforceable

Examples (non-exhaustive):

- `standard`
- `enterprise`
- `regulated`
- `high-isolation`
- `data-residency-eu`
- `customer-managed-keys`

Compliance Modes MUST be:

- Explicitly assigned
- Versioned
- Immutable per execution
- Observable in telemetry and audit logs

Implicit “enterprise behavior” is forbidden.

---

### 6.4 Isolation Evolution Under Enterprise Modes

Enterprise modes often require **stronger isolation**, but not universally.

Patterns include:

- Promoting a tenant from pooled → hybrid → siloed
- Isolating specific resources or workloads
- Introducing dedicated data planes while retaining pooled control planes
- Applying network-level boundaries (accounts, VPCs, projects) where required

Normative rules:

- Isolation mode MUST be explicit metadata
- Routing MUST be deterministic and auditable
- Migration MUST be a lifecycle workflow, not an operational shortcut
- Isolation changes MUST preserve Tenant Context invariants

Network-level isolation MAY be used to satisfy compliance or due diligence requirements,
but it **supplements** application-level enforcement—it does not replace it.

---

### 6.5 Identity, Operator Access, and Enterprise Governance

Enterprise customers require **stronger guarantees around who can access what, and how**.

Patterns include:

- Strict separation of customer identities and operator identities
- Explicit operator roles with tenant-scoped access
- Time-bound and purpose-bound elevated access
- Break-glass workflows with mandatory audit

Normative rules:

- Operator access MUST be explicit, scoped, and auditable
- Cross-tenant operator access MUST require deliberate context selection
- “God mode” access is forbidden
- All operator actions MUST emit tenant-scoped audit events

Enterprise governance strengthens identity enforcement—it does not weaken it.

---

### 6.6 Data Residency and Sovereignty Modes

Some enterprise tenants require guarantees about **where data lives and is processed**.

Residency modes MAY impose:

- Regional data placement
- Restricted cross-region processing
- Dedicated regional deployments
- Jurisdiction-specific retention policies

Normative rules:

- Residency MUST be enforced via placement and routing, not convention
- Tenant Context MUST include residency constraints where applicable
- Violations MUST be detectable via observability
- Residency constraints MUST apply to agents and AI workloads equally

Residency is a constraint on execution, not a separate tenant model.

---

### 6.7 Audit, Retention, and Legal Hold Patterns

Enterprise and regulated tenants often require:

- Extended audit retention
- Immutable audit logs
- Legal hold capabilities
- Explicit data deletion guarantees

Normative rules:

- Audit and retention policies MUST be governed by AccountScope
- Retention behavior MUST be deterministic and testable
- Legal holds MUST override deletion workflows safely
- Audit integrity MUST survive async execution and agent autonomy

Retention and audit requirements are **governance overlays**, not execution logic.

---

### 6.8 AI, Agents, and Enterprise Risk Profiles

AI-first systems amplify enterprise risk.

Enterprise modes MAY require:

- Stricter agent budgets
- Reduced autonomy
- Mandatory human approval for certain actions
- Enhanced AI observability and evaluation
- Model or tool allowlists

Normative rules:

- Agent autonomy MUST be explicitly constrained by policy
- AI execution MUST remain tenant-scoped under all modes
- Safety gates MUST be mode-aware
- AI behavior MUST remain explainable and auditable

Enterprise AI is governed AI—not special AI.

---

### 6.9 Cost, Contracts, and Predictability

Enterprise tenants expect:

- Predictable cost
- Transparent usage
- Contract-aligned enforcement

Patterns include:

- Hard usage caps
- Pre-approved overage workflows
- Contractual entitlements enforced at runtime
- Enhanced anomaly detection

Normative rules:

- Cost enforcement MUST remain runtime-bound
- Contracts MUST map to AccountScope policy
- Predictability MUST not compromise isolation or safety

Enterprise contracts constrain behavior; they do not bypass architecture.

---

### 6.10 Evolution Without Fragmentation

The defining success criterion of enterprise evolution is **lack of fragmentation**.

A healthy system:

- Supports multiple compliance modes simultaneously
- Does not fork code paths per customer
- Does not introduce snowflake tenants
- Does not weaken baseline invariants

Enterprise features that require exceptions indicate architectural debt.

---

### 6.11 Summary

Enterprise readiness in Contura systems is achieved by:

- Explicit compliance modes
- Stronger constraints, not different primitives
- Policy-driven evolution
- Enforcement via existing routing, identity, lifecycle, cost, and observability patterns

Enterprise is not a different architecture.

It is the **disciplined application of the same architecture under stricter rules**.

## 7. Anti-Patterns & Redesign Failure Modes

This section documents **anti-patterns and redesign failure modes** commonly observed in multi-tenant SaaS systems.

These are not hypothetical mistakes.
They are patterns repeatedly seen in real systems that:

- Initially “worked”
- Passed early reviews
- Became catastrophic at scale, under AI load, or during enterprise adoption

This section is intentionally **direct and normative**.
Each anti-pattern represents a **known architectural defect**.

---

### 7.1 Implicit Tenancy

#### **Implicit Tenancy Description**  

Tenant identity is inferred rather than explicitly bound.

Common forms:

- “Current tenant” stored in global or thread-local state
- Tenant inferred from resource IDs alone
- UI-selected tenant assumed to persist across calls
- Background jobs running without tenant binding

#### **Implicit Tenancy: Why It Happens**

- Early prototypes
- Convenience during rapid iteration
- Assumption that “the UI will handle it”

#### **Implicit Tenancy: Why It Fails**

- Cross-tenant data leakage
- Undetectable authorization bypass
- Incorrect cost attribution
- Non-reproducible bugs

#### **Implicit Tenancy: Normative Rule**

> If Tenant Context is not explicit, immutable, and validated, tenancy does not exist.

Implicit tenancy is the **single most common root cause** of multi-tenant failures.

---

### 7.2 Treating Workspaces (or Projects) as Tenants

#### **Treating Workspaces (or Projects) as Tenants: Description**  

Workspaces, projects, folders, or teams are treated as de facto tenants.

Symptoms:

- Workspaces have billing
- Workspaces own auth configuration
- Workspaces are used as isolation boundaries
- Users “switch tenants” by switching workspaces

#### **Treating Workspaces (or Projects) as Tenants: Why It Happens**

- UX-driven thinking
- Borrowing patterns from single-tenant tools
- Confusing organization with governance

#### **Treating Workspaces (or Projects) as Tenants: Why It Fails**

- Governance fragmentation
- Inconsistent isolation
- Inability to evolve enterprise features
- Redesign required to reintroduce real tenants

#### **Treating Workspaces (or Projects) as Tenants: Normative Rule**

> Workspaces are organizational constructs, not governance boundaries.

If a workspace behaves like a tenant, the tenant model is broken.

---

### 7.3 Coupling Billing, Authorization, and Isolation

#### **Coupling Billing, Authorization, and Isolation Description**  

Cost centers, plans, or billing tiers are used as:

- Authorization mechanisms
- Isolation selectors
- Routing logic

Examples:

- “Enterprise plan gets dedicated DB”
- “Free plan users can’t access this endpoint”
- “Cost center determines data visibility”

#### **Coupling Billing, Authorization, and Isolation: Why It Happens**

- Pressure to monetize quickly
- Overloading billing metadata
- Shortcutting governance design

#### **Coupling Billing, Authorization, and Isolation: Why It Fails**

- Security vulnerabilities
- Inconsistent enforcement
- Entitlement drift
- Compliance failures

#### **Coupling Billing, Authorization, and Isolation: Normative Rule**

> Billing signals MAY inform Cost Governance; billing MUST NOT be treated as governance.

Cost is metadata.
Isolation and authorization are security primitives.

---

### 7.4 Identity Without Tenant Scope

#### **Identity Without Tenant Scope Description**

Identity is treated as global, with tenant scope applied “later”.

Examples:

- Global admin users
- Tokens valid across multiple tenants
- Agent identities without tenant binding
- Operator tools without explicit tenant selection

#### **Identity Without Tenant Scope: Why It Happens**

- Misunderstanding of authentication vs authorization
- Over-trusting identity providers
- Operator convenience

#### **Identity Without Tenant Scope: Why It Fails**

- Privilege escalation
- Cross-tenant access
- Audit impossibility
- Regulatory non-compliance

#### **Identity Without Tenant Scope Normative Rule**

> Identity without tenant scope is incomplete and unsafe.

Every identity action MUST answer:
“Who is acting, in which tenant, under what authority?”

---

### 7.5 Treating Enterprise as a Fork

#### **Treating Enterprise as a Fork: Description**

Enterprise customers are supported via:

- Custom code paths
- Special-case deployments
- Manual overrides
- “Snowflake tenants”

#### **Treating Enterprise as a Fork: Why It Happens**

- Sales pressure
- Urgent deals
- Underestimating long-term cost

#### **Treating Enterprise as a Fork: Why It Fails**

- Operational collapse
- Inconsistent behavior
- Inability to scale support
- Permanent architectural debt

#### **Treating Enterprise as a Fork: Normative Rule**

> Enterprise is a mode, not a fork.

If enterprise support requires breaking invariants, the base architecture is incomplete.

---

### 7.6 Late Introduction of Governance

#### **Late Introduction of Governance: Description**

Governance (billing, auth, audit, compliance) is deferred until “later”.

Common rationalizations:

- “We’ll add it when we need it”
- “Only enterprise needs this”
- “We’ll refactor later”

#### **Late Introduction of Governance: Why It Happens**

- Early-stage speed bias
- Fear of over-engineering

#### **Late Introduction of Governance: Why It Fails**

- Governance entangled with business logic
- Unsafe migrations
- Breaking changes for existing tenants
- Loss of trust

#### **Late Introduction of Governance: Normative Rule**

> Governance delayed is governance denied.

Governance constructs must exist from v1, even if lightly used.

---

### 7.7 Agent Autonomy Without Boundaries

#### **Agent Autonomy Without Boundaries: Description**

Agents are introduced without:

- Explicit tenant identity
- Cost budgets
- Lifecycle binding
- Observability

Examples:

- Agents executing indefinitely
- Agents sharing memory across tenants
- Agents invoking tools without tenant checks

#### **Agent Autonomy Without Boundaries: Why It Happens**

- Underestimating AI blast radius
- Treating agents as “helpers” instead of actors

#### **Agent Autonomy Without Boundaries: Why It Fails**

- Unbounded cost
- Cross-tenant leakage
- Safety incidents
- Irreversible trust loss

#### **Agent Autonomy Without Boundaries: Normative Rule**

> An agent is a first-class principal, not a background task.

Agents without explicit boundaries are architectural defects.

---

### 7.8 Assuming Network Isolation Is Sufficient

**Assuming Network Isolation Is Sufficient: Description**  

Relying on:

- VPCs
- Accounts
- Projects
- Clusters

…as the primary tenant boundary.

#### **Assuming Network Isolation Is Sufficient: Why It Happens**

- Cloud-provider defaults
- Security theater
- Misplaced trust in infrastructure isolation

#### **Assuming Network Isolation Is Sufficient: Why It Fails**

- Application-level bugs bypass network boundaries
- Agents and async execution cross boundaries
- Observability and audit gaps remain

#### **Assuming Network Isolation Is Sufficient: Normative Rule**

> Network isolation supplements application isolation; it never replaces it.

Tenancy is enforced by **context, identity, and policy**, not topology.

---

### 7.9 Redesign Trigger Indicators

The following signals indicate **impending or required redesign**:

- “We can’t tell which tenant this belongs to”
- “We’ll special-case this customer”
- “This only works for now”
- “We’ll clean it up later”
- “It’s too risky to change”
- “We need a migration that touches everything”

These are not operational issues.
They are architectural warnings.

---

### 7.10 Summary

Multi-tenancy fails not because it is hard, but because it is **assumed instead of designed**.

The most expensive redesigns stem from:

- Implicit tenancy
- Overloaded concepts
- Late governance
- Identity ambiguity
- Enterprise exceptions

All anti-patterns in this section are prevented by:

- Explicit Tenant Context
- Canonical tenant model
- Centralized governance (AccountScope)
- Runtime enforcement
- Tenant-aware observability

If a system avoids these failure modes, it can evolve indefinitely.

If it does not, redesign is not a possibility—it is an inevitability.
