# Application Domain Model (v1)

## How to use this file

This is the **human-edit source of truth** for the detailed application-plane domain model.
CAF will later derive planner-facing YAML from this document.

Use this file when you want to define:

- bounded contexts
- aggregates and entities
- fields and invariants
- persistence intent
- use cases that touch those entities

Tips:

- You do not need perfect modeling on the first pass.
- It is acceptable to keep the starter example below for an initial CAF walkthrough.
- Replace names and details only when you know your real domain.
- Preserve the overall structure so later derivation stays easy and predictable.

---

## Starter example

### Bounded context: Governed Review Workspace

**Scope**
Manage the tenant-facing workflow for submitting items, running a governed agentic review, collecting human decisions, and publishing final reports.

**Key invariants**

- every record is tenant-scoped
- a submission belongs to exactly one workspace
- at most one active review session exists per submission in the first release
- a final report is produced only from an approved review state
- guarded outcomes require an attributable human approval decision before publication

### Aggregate: Workspace

**Description**
A tenant-scoped container that groups review activity and provides a stable place for users to manage submissions and review sessions.

**Fields**

- workspace_id: identifier
- tenant_id: identifier
- name: text
- description: text, optional
- status: enum (`active | archived`)
- created_at: timestamp

**Invariants**

- `tenant_id` is required
- archived workspaces cannot accept new submissions
- workspace names are unique within a tenant

**Persistence intent**
Persist as a primary application-plane aggregate with tenant-keyed storage and standard CRUD operations.

**Canonical normalization (optional)**

```yaml
canonical:
  term_id: workspace
  status: exact
  matched_by: architect_selected
```

### Aggregate: Submission

**Description**
A business item submitted by a user for governed review.

**Fields**

- submission_id: identifier
- tenant_id: identifier
- workspace_id: identifier
- title: text
- source_uri: text, optional
- submitted_by: identifier
- status: enum (`draft | submitted | in_review | awaiting_approval | approved | rejected`)
- submitted_at: timestamp, optional

**Invariants**

- a submission belongs to one workspace
- only `draft` submissions can be edited freely
- a submission must reach an approved terminal state before report publication

**Persistence intent**
Persist as a core application-plane aggregate. Query by tenant, workspace, status, and submitter.

### Aggregate: Review Session

**Description**
Tracks the active workflow state for a governed review, including agent steps, verifier outcomes, and escalation state.

**Fields**

- review_session_id: identifier
- submission_id: identifier
- tenant_id: identifier
- status: enum (`preparing | retrieving | drafting | verifying | awaiting_approval | approved | rejected | revision_requested`)
- started_at: timestamp
- completed_at: timestamp, optional
- current_step: text
- escalation_reason: text, optional

**Invariants**

- at most one active review session exists per submission in the first release
- terminal session states require `completed_at`
- escalation state must remain visible while approval is pending

**Persistence intent**
Persist as a workflow aggregate tied to the submission lifecycle. Query by tenant, submission, status, and reviewer queue.

### Entity: Agent Review Proposal

**Description**
The draft findings and recommended outcome produced by the governed agent workflow for a review session.

**Fields**

- proposal_id: identifier
- review_session_id: identifier
- recommended_outcome: enum (`approve | reject | revise`)
- findings_summary: text
- verifier_summary: text, optional
- confidence_score: decimal, optional
- created_at: timestamp

**Invariants**

- a proposal belongs to exactly one review session
- a proposal does not become final by itself
- verifier feedback must be retained when present

**Persistence intent**
Persist proposal state and reviewer-visible summaries in the application plane. Trace details may reference separate evidence records.

### Entity: Approval Decision

**Description**
The attributable human decision that accepts, rejects, or sends back a guarded proposal.

**Fields**

- approval_decision_id: identifier
- review_session_id: identifier
- decided_by: identifier
- decision: enum (`approved | rejected | revision_requested`)
- decision_note: text, optional
- decided_at: timestamp

**Invariants**

- approval decisions require a human identity
- a published report must reference a final approval decision
- approval decisions are immutable after publication in the first release

**Persistence intent**
Persist as a review-governance entity optimized for audit and replay of the final decision path.

### Entity: Report

**Description**
A generated or stored representation of the final approved review outcome.

**Fields**

- report_id: identifier
- submission_id: identifier
- tenant_id: identifier
- format: enum (`html | pdf | json`)
- generated_at: timestamp
- published_by: identifier, optional

**Invariants**

- reports are produced only for approved review sessions
- a published report must be reproducible from the final approved state

**Persistence intent**
Persist report metadata in the application plane; the binary or rendered artifact may live in object storage if pinned elsewhere.

---

## Use cases

### Submit item for governed review

**Intent**
A tenant user submits an item into the review workflow.

**Touches**

- Workspace
- Submission

### Run governed agent review

**Intent**
The workflow prepares context, retrieves tenant-scoped material, drafts findings, and verifies the proposed outcome.

**Touches**

- Submission
- Review Session
- Agent Review Proposal

### Approve or reject proposed outcome

**Intent**
A human reviewer inspects the proposal and records the final decision for guarded outcomes.

**Touches**

- Review Session
- Agent Review Proposal
- Approval Decision

### Publish report

**Intent**
A user exports or publishes the final approved review outcome.

**Touches**

- Approval Decision
- Report

---

## API candidates (optional)

These are only starter hints for the architect. Planner derivation should come from the domain content above, not from this section alone.

- workspaces: list, create, get, update, archive
- submissions: list, create, get, update, submit
- review-sessions: get, list, restart
- proposals: get
- approvals: decide
- reports: list, get, publish

---

## Open questions

Starter examples:

- do we need revision history for proposals in the first release?
- should low-risk outcomes still require human confirmation, or only review visibility?
- should reports be immutable snapshots or regenerated views?

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
