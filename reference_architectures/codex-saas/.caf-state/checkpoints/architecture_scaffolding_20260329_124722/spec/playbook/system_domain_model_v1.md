# System Domain Model (v1)

## How to use this file

This is the **human-edit source of truth** for the detailed system/control-plane domain model.
CAF will later derive planner-facing YAML from this document.

Use this file when you want to define:

- platform-owned contexts
- policy/governance/audit/configuration entities
- fields and invariants
- persistence intent for control-plane records
- operational use cases that the control plane must support

Tips:

- Keep real platform-owned entities here even if the application plane also references them.
- It is fine to leave the starter example in place for a first CAF run.
- This file is the main place to make control-plane persistence visible to planning.
- If you author `### Aggregate: <Name>` with direct `Fields`, CAF should normalize those fields into the aggregate-root entity in the planner-facing YAML. Use separate `### Entity:` sections only for distinct child records.

---

## Starter example

### System context: Policy and Governance

**Scope**
Own policy definition, policy versioning, and approval decisions that govern downstream behavior.

**Key invariants**

- policy lifecycle is platform-owned
- changes are auditable
- activation state is explicit

### Aggregate: Policy

**Description**
A logical governance artifact that represents a named rule set or evaluation policy.

**Fields**

- policy_id: identifier
- tenant_scope: enum (`platform | tenant`)
- name: text
- description: text, optional
- status: enum (`draft | active | retired`)
- created_at: timestamp

**Invariants**

- policy names are unique within their scope
- retired policies cannot receive new versions

**Persistence intent**
Persist as a control-plane aggregate with lifecycle ownership in the control plane.

**Canonical normalization (optional)**

```yaml
canonical:
  term_id: policy
  status: exact
  matched_by: architect_selected
```

### Entity: Policy Version

**Description**
An immutable versioned snapshot of policy content used for approval and activation.

**Fields**

- policy_version_id: identifier
- policy_id: identifier
- version_label: text
- content_hash: text
- created_by: identifier
- created_at: timestamp
- activation_state: enum (`draft | approved | active | superseded`)

**Invariants**

- a policy version is immutable after approval
- only one version may be active per policy at a time

**Persistence intent**
Persist as a control-plane child entity of Policy. Query by policy and activation state.

### Entity: Approval Decision

**Description**
A recorded approval or rejection of a change that matters for governance.

**Fields**

- approval_decision_id: identifier
- subject_type: text
- subject_id: identifier
- decision: enum (`approved | rejected`)
- decided_by: identifier
- decided_at: timestamp
- rationale: text, optional

**Invariants**

- every approval decision has an actor and timestamp
- approval decisions are append-only records

**Persistence intent**
Persist as an auditable control-plane record.

---

### System context: Execution and Evidence

**Scope**
Track governed executions and the evidence they produce.

### Aggregate: Execution Record

**Description**
A platform-owned record of a governed execution or evaluation run.

**Fields**

- execution_record_id: identifier
- tenant_id: identifier
- subject_type: text
- subject_id: identifier
- started_at: timestamp
- completed_at: timestamp, optional
- outcome: enum (`pending | passed | failed | blocked`)

**Invariants**

- every execution record has a start time
- terminal outcomes require completion metadata

**Persistence intent**
Persist as a control-plane aggregate used for audit and operations.

### Entity: Evidence Record

**Description**
A traceable record emitted by a governed action, decision, or execution.

**Fields**

- evidence_record_id: identifier
- execution_record_id: identifier, optional
- evidence_type: text
- emitted_at: timestamp
- principal_id: identifier
- payload_ref: text, optional

**Invariants**

- evidence records are append-only
- the emitting principal and timestamp are mandatory

**Persistence intent**
Persist as append-only control-plane evidence.

---

### System context: Retention and Lifecycle

**Scope**
Make retention and deletion behavior explicit and auditable.

### Entity: Retention Rule

**Description**
A platform-owned rule defining how long a category of records should be retained.

**Fields**

- retention_rule_id: identifier
- target_type: text
- retention_period_days: integer
- hard_delete_allowed: boolean
- status: enum (`draft | active | retired`)

**Invariants**

- active retention rules must have a positive retention period
- only one active default rule should exist per target type in the first release

**Persistence intent**
Persist as a control-plane configuration record.

### Entity: Deletion Request

**Description**
A tracked request to delete or purge governed data.

**Fields**

- deletion_request_id: identifier
- tenant_id: identifier
- target_type: text
- target_id: identifier
- requested_by: identifier
- requested_at: timestamp
- status: enum (`requested | approved | completed | rejected`)

**Invariants**

- every deletion request is auditable
- completion requires a terminal timestamp in downstream implementation

**Persistence intent**
Persist as a control-plane lifecycle record.

---

## Operational use cases

Authoring rule:
- Every name listed under `**Touches**` must match an aggregate or entity declared above in this same plane document.
- If an operational use case depends on a concept that is not yet modeled in this plane, add the platform-owned aggregate/entity above or leave the use case out until ownership is clear.
- Do not rely on another plane document to satisfy `Touches` names for this system-plane file.

### Approve a policy change

**Intent**
An authorized actor approves or rejects a new policy version.

**Touches**

- Policy
- Policy Version
- Approval Decision

### Record a governed execution

**Intent**
The platform records an execution and its outcome.

**Touches**

- Execution Record
- Evidence Record

### Manage retention and deletion

**Intent**
An operator defines retention rules and tracks deletion requests.

**Touches**

- Retention Rule
- Deletion Request

---

## Admin/UI candidates (optional)

Starter examples:

- policy catalog
- policy version detail and approval screen
- execution audit view
- evidence explorer
- retention settings
- deletion request queue

---

## Open questions

Starter examples:

- which system actions require approval in the first release?
- should evidence payloads live inline, by reference, or both?
- do retention rules apply platform-wide, per tenant, or both?

---

## Canonical normalization notes (optional)

- preserve the source entity / aggregate name
- add optional canonical metadata only when useful
- preferred fields:
  - `canonical.term_id`
  - `canonical.status: exact | alias | suggested | none`
  - `canonical.matched_by: alias_table | semantic_suggestion | architect_selected | none`
  - `canonical.confidence` (0-1 when suggested)
- use vocabulary: `architecture_library/phase_8/87c_phase_8_canonical_domain_normalization_vocabulary_v1.yaml`
- normalization is advisory metadata only; it MUST NOT replace the source name
