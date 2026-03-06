# Product Requirements Document (PRD)  -  v1 Template

> CAF note: This template is designed to be **human-friendly** while still being **machine-extractable**.
> Fill it in using normal Markdown. No YAML authoring is required.

---

## Product Framing

### One-liner

<What is the product? Who is it for? What outcome does it produce?>

### Target users / customers

- <User segment 1>
- <User segment 2>

### Problem statement

<What pain/problem exists today? What is the cost of doing nothing?>

### Value proposition

<Why will users choose this? What is the "so what"?>

---

## Scope

### In scope

- <In-scope item>
- <In-scope item>

### Out of scope

- <Explicitly not doing>
- <Explicitly not doing>

### Assumptions

- <Assumption>

### Dependencies

- <Dependency>

---

## Capabilities

### Capabilities index

List the capabilities this product must support.

| Capability ID | Name | Primary Actor | Trigger (short) | Notes |
|---|---|---|---|---|
| CAP-001 | <Capability name> | <Actor> | <Trigger> | <Optional> |
| CAP-002 | <Capability name> | <Actor> | <Trigger> | <Optional> |

---

### Capability blocks

Fill **one block per Capability ID** listed above.

#### Conventions (for deterministic extraction)

- Capability block heading **must** be: `### CAP-XXX  -  <Name>`
- Field headings **must** be exactly:  - `#### Actor`  - `#### Trigger`  - `#### Main Flow`  - `#### Postconditions`  - `#### Domain Entities`

---

### CAP-001  -  <Capability name>

#### Actor

<Who performs/initiates this capability?>

#### Trigger

<What event triggers it? (user action, schedule, webhook, system state)>

#### Main Flow

1. <Step>
2. <Step>
3. <Step>

#### Postconditions

- <What is true after it completes? (state changes, records created, external effects)>
- <Include measurable / auditable results where possible>

#### Domain Entities

- <Noun / object / record involved>
- <Noun / object / record involved>

---

### CAP-002  -  <Capability name>

#### Actor

<...>

#### Trigger

<...>

#### Main Flow

1. <...>

#### Postconditions

- <...>

#### Domain Entities

- <...>

---

## Quality Attributes

Capture non-functional requirements in a structured way.

| Attribute | Target / SLO | Measurement / Evidence | Notes |
|---|---|---|---|
| Availability | <e.g., 99.9%> | <How measured> | <Optional> |
| Latency | <e.g., p95 < 300ms> | <How measured> | <Optional> |
| Security | <e.g., OWASP baseline> | <How evidenced> | <Optional> |
| Privacy | <e.g., data minimization> | <How evidenced> | <Optional> |
| Cost | <budget envelope> | <How tracked> | <Optional> |

---

## Constraints

Capture hard constraints (business, technical, legal).

| Constraint | Type (Business/Tech/Legal) | Rationale | Notes |
|---|---|---|---|
| <Constraint> | <Type> | <Why> | <Optional> |

---

## Product Posture

Quick, PM-oriented choices to establish posture. Choose one option per question.

> Conventions (for deterministic extraction):
> - Use the table below.
> - Put the selected option in **Answer**.
> - If none fit, use `Other: <your answer>`.

| Question ID | Question | Answer |
|---|---|---|
| PP-01 | Delivery posture | Prototype / MVP / Production / Other: |
| PP-02 | Data sensitivity | Public / Internal / Confidential / Regulated / Other: |
| PP-03 | Multi-tenancy expectation | Single-tenant / Multi-tenant / Unknown / Other: |
| PP-04 | Identity & access | None / Basic login / SSO / Enterprise IAM / Other: |
| PP-05 | Integrations | None / Webhooks / API-first / Enterprise integrations / Other: |
| PP-06 | AI / agentic behavior | None / Assisted / Agentic / Unknown / Other: |
