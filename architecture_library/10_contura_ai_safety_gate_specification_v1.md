# Contura AI Safety Gate Specification v1

## Purpose

The Contura AI Safety Gate Specification defines the mandatory governance, evaluative structure, risk taxonomy, guardrails, observability expectations, and lifecycle integration requirements for all AI components, agents, tools, and reasoning workflows within Contura systems. As a Phase 1 governance document, it serves as a constitutional evaluator, enforcing compliance with the Contura Architecture Framework (CAF) v1, the Contura Document Output Standards v1, and the Contura Architecture Library Roadmap v1.

The Safety Gate governs all AI-related architectural decisions, validation workflows, and system behaviors across lifecycle stages. It ensures that AI systems operate with accountability, transparency, traceability, and controlled autonomy.

## Role within the Architecture Library

The AI Safety Gate is an upstream governance instrument. All domain frameworks, ADRs, system specifications, and AI-related components must reference and comply with this specification. No AI workflow, agentic subsystem, or model lifecycle can be considered production-grade without passing the Safety Gate evaluations defined herein.

The Safety Gate complements:

- CAF principles (AI-first, automation, identity, safety, cost minimalism, migration, traceability)
- CAF pillars (AI safety, observability, operational excellence, security, cost efficiency)
- ADR Standard v1 (mandatory inclusion of AI Safety Gate Assessment)
- Roadmap Phase 1 sequencing (evaluation documents precede domain frameworks)

## Definition of an AI Safety Gate

An AI Safety Gate is a structured evaluation mechanism that determines whether an AI component or workflow is allowed to execute, escalate authority, perform a high-impact action, or graduate between lifecycle stages. Safety Gates apply to:

- Agents (planning, orchestration, autonomous loops)
- Models (LLMs, embeddings, fine-tuned models)
- Tools (agent-accessible actions, APIs, platform capabilities)
- Reasoning traces (intermediate thoughts, chains of reasoning)
- Workflows (retrieval-augmented, policy-governed, multi-agent)
- User-facing generative interactions
- System-level AI behaviors

A Safety Gate may be invoked:

- **Pre-execution** (prevent unsafe execution)
- **Mid-execution** (halt or redirect during anomalies)
- **Post-execution** (validate outputs before externalization)

## Required Structure of a Safety Gate

Each Safety Gate must include the following evaluative components:

1. **Identity Boundary Check**  
   - Validates agent, model, and tool identities.  
   - Confirms least-privilege access.

2. **Intent & Scope Evaluation**  
   - Determines whether the planned action fits allowed operational scope.  
   - Assesses potential misuse or overreach.

3. **Risk Classification**  
   - Maps proposed action to Contura’s risk classes (defined below).  
   - Determines required guardrail posture.

4. **Guardrail Bundle Selection**  
   - Pre-execution rules  
   - Mid-execution monitors  
   - Post-execution validators

5. **Contextual Awareness Evaluation**  
   - Tenancy context  
   - Data governance constraints  
   - User-provided vs. system-generated data provenance

6. **Chain-of-Thought / Reasoning Trace Review**  
   - Evaluates permissible exposure and redaction rules.  
   - Enforces trace observability.

7. **HITL Decision Point**  
   - Determines whether human approval is required.

8. **Output Policy Enforcement**  
   - Applies safety, legality, compliance, and brand-aligned filters.

9. **Logging, Telemetry, and Trace Emission**  
   - Ensures full auditability and lineage.

10. **Lifecycle Stage Justification**  

- Confirms that action is appropriate for the system’s CAF stage.

## Classification of AI Risks and Misuse Modes

Each behavioral risk falls into one of the following classes:

1. **Class 0 — Benign**  
   - No external impact; ephemeral; local reasoning.

2. **Class 1 — Low Impact**  
   - User-facing but reversible outputs; low operational complexity.

3. **Class 2 — Medium Impact**  
   - Writes data; modifies configuration; internal tool usage.

4. **Class 3 — High Impact**  
   - Multi-tenant or cross-tenant exposure; irreversible operations.

5. **Class 4 — Critical**  
   - Financial actions; identity controls; privacy-bound data; compliance-sensitive operations.

Misuse modes include:

- Unauthorized access attempts or privilege escalation (e.g., using tools beyond assigned permissions, crossing identity boundaries, or attempting cross-tenant elevation)
- Over-broad tool invocation  
- Hidden intent or covert action  
- Data leakage across tenants  
- Unsafe autonomy (unchecked loops)  
- Incorrect reasoning propagation  
- Hallucinated actions or fabricated system components  
- Non-compliant outputs  
- Unsafe migrations or batch operations  

## Required Evaluations for Agents, Tools, Models, and Reasoning Traces

Each category must pass specialized evaluative rules.

### Agents

- Validate autonomy levels (bounded, semi-autonomous, autonomous-with-approval).  
- Confirm tool boundary definitions.  
- Assess planning depth, recursion, and halting conditions.  
- Enforce explicit HITL at critical risk levels.

### Tools

- Must declare allowed operations, input schemas, and constraints.  
- Must expose deterministic or bounded behavior.  
- Must reject malformed or unsafe invocations.  
- Require explicit tenancy and identity guards.

### Models

- Must declare training lineage and update provenance.  
- Require evaluation for bias, hallucination rate, factual accuracy, and safety posture.  
- Must support versioning and rollback.

### Reasoning Traces

- Must be stored or redacted based on policy.  
- Must be available for audit under observability rules.  
- Must not be exposed to end users beyond allowed safety thresholds.

## Integration with ADRs, Domain Frameworks, and Lifecycle Stages

Safety Gate rules must appear in:

- **ADRs** (mandatory AI Safety Gate Assessment)  
- **Domain Frameworks** (as architectural constraints)  
- **Stage transitions** (CAF lifecycle boundaries)  

Lifecycle integration examples:

- **Stage 0**: Minimal checks, no autonomy, local use only.  
- **Stage 1**: Identity-based gating, simple evaluation.  
- **Stage 2**: Observability and HITL required for agentic workflows.  
- **Stage 3**: Multi-model routing, advanced monitors, expanding tool permissions.  
- **Stage 4**: Autonomous agents with scheduled human review.  
- **Stage 5**: Enterprise-grade evaluations, full compliance integration.

## Human-in-the-Loop (HITL) Policies

A Safety Gate must define explicit HITL triggers:

1. High-risk actions  
2. Cross-tenant effects  
3. Identity or permission updates  
4. Large-scale migrations or deletions  
5. Financial commitments  
6. Regulatory or compliance-sensitive workflows

HITL escalation path (plain text diagram):

User/Agent Request  
→ Safety Gate Risk Classifier  
→ HITL Required?  
→ If Yes: Human Review Queue  
→ Approved/Rejected  
→ Execution or Abort

## Guardrail Expectations

### Pre-Execution Guardrails

- Schema validation  
- Policy checks  
- Role and identity validation  
- Prompt and reasoning sanitization  
- Context isolation (tenant boundaries)

### Mid-Execution Guardrails

- Anomaly detection  
- Recursion depth limits  
- Execution time caps  
- Tool usage monitoring  
- Output drift detection (semantic deviation)

### Post-Execution Guardrails

- Output classification  
- Redaction rules  
- Compliance checks  
- Consistency checks against user intent  
- Shadow evaluation (A/B validation)

## Observability and Evaluation Requirements

Every AI action must emit minimally:

- Reasoning trace ID  
- Model identity and version  
- Agent and tool identities  
- Input-output pair hashes  
- Tenancy context  
- Safety posture score  
- Guardrail triggers (if any)  
- Approval artifacts (if HITL applied)

All Safety Gates must integrate with future AI Observability & Evaluation Specification v1.

## Reasoning Trace Requirements

Reasoning traces must be:

- Captured or redacted based on policy  
- Indexed for review  
- Attached to Safety Gate decisions  
- Included in ADRs when relevant  
- Available to evaluators, but restricted from end users unless safe  
- Stored with lineage and version metadata

## Safety Metrics, Thresholds, and Monitoring Rules

Metrics include:

1. Hallucination rate  
2. Unsafe action attempt rate  
3. Tool boundary breach rate  
4. Cross-tenant leakage attempts  
5. Approval override frequency  
6. Output non-compliance rate  
7. Drift in model behavior over time  
8. Observability completeness score  
9. Safety Gate bypass attempts  

Thresholds:

- Class 0–1: Low thresholds  
- Class 2: Medium, requires continuous monitoring  
- Class 3–4: Zero-tolerance for critical violations  

## Change Control and Versioning

Safety Gate configurations must be versioned.

- Structural updates → new Safety Gate version  
- Model or agent updates → re-evaluation  
- Tool capability expansions → Safety Gate update + ADR  
- Cross-plane impact updates → mandatory review (control/application/data planes)

Version metadata must include:

- Semantic version  
- Author and reviewer  
- Rationale for change  
- Migration strategy  
- Deprecation path for old gates

## Minimal Examples

### Example 1: Low-Risk User Query

Action: Summarize user-provided text.  
Risk: Class 1.  
Gate outcome: Approved.  
Guardrails: Output filtering + trace logging.

### Example 2: Medium-Risk Configuration Edit

Action: Agent modifies tenant-specific configuration.  
Risk: Class 2 → HITL optional depending on stage.  
Gate outcome: Pending HITL.  
Guardrails: Identity validation + post-execution validation.

### Example 3: High-Risk Financial Action

Action: Approve cost-increasing deployment plan.  
Risk: Class 4.  
Gate outcome: HITL required.  
Guardrails: Full evaluation bundle + compliance review.

### Example 4: Unsafe Tool Invocation Attempt

Agent attempts a prohibited deletion operation.  
Gate outcome: Blocked.  
Guardrails: Isolation + alerting + trace retention.

## Version History

v1 — Initial release establishing Safety Gate purpose, structure, risk taxonomy, guardrail expectations, observability requirements, reasoning trace policies, lifecycle integration, HITL patterns, and governance alignment.
