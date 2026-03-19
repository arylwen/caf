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

### Bounded context: Review Workspace

**Scope**
Manage the tenant-facing workflow for submitting items, reviewing findings, and publishing reports.

**Key invariants**

- every record is tenant-scoped
- a submission belongs to exactly one workspace
- a report is produced from a completed review state

### Aggregate: Workspace

**Description**
A tenant-scoped container that groups review activity and provides a stable place for users to manage submissions.

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
A business item submitted by a user for review.

**Fields**

- submission_id: identifier
- tenant_id: identifier
- workspace_id: identifier
- title: text
- source_uri: text, optional
- submitted_by: identifier
- status: enum (`draft | submitted | in_review | approved | rejected`)
- submitted_at: timestamp, optional

**Invariants**

- a submission belongs to one workspace
- only `draft` submissions can be edited freely
- a submission must reach a terminal review status before report publication

**Persistence intent**
Persist as a core application-plane aggregate. Query by tenant, workspace, status, and submitter.

### Entity: Review

**Description**
Tracks the current evaluation state and findings for a submission.

**Fields**

- review_id: identifier
- submission_id: identifier
- decision: enum (`pending | approved | rejected`)
- findings_summary: text
- reviewed_by: identifier, optional
- reviewed_at: timestamp, optional

**Invariants**

- at most one active review per submission in the first release
- a final decision requires a review timestamp

**Persistence intent**
Persist with the submission lifecycle; may be stored as a separate table/entity if that keeps status history cleaner.

### Entity: Report

**Description**
A generated or stored representation of the final review outcome.

**Fields**

- report_id: identifier
- submission_id: identifier
- tenant_id: identifier
- format: enum (`html | pdf | json`)
- generated_at: timestamp
- published_by: identifier, optional

**Invariants**

- reports are produced only for completed reviews
- a published report must be reproducible from the final review state

**Persistence intent**
Persist report metadata in the application plane; the binary/rendered artifact may live in object storage if pinned elsewhere.

---

## Use cases

### Submit item for review

**Intent**
A tenant user submits an item into the review workflow.

**Touches**

- Workspace
- Submission

### Complete review decision

**Intent**
A reviewer inspects findings and marks the submission approved or rejected.

**Touches**

- Submission
- Review

### Publish report

**Intent**
A user exports or publishes the final review outcome.

**Touches**

- Review
- Report

---

## API candidates (optional)

These are only starter hints for the architect. Planner derivation should come from the domain content above, not from this section alone.

- workspaces: list, create, get, update, archive
- submissions: list, create, get, update, submit
- reviews: get, decide
- reports: list, get, publish

---

## Open questions

Starter examples:

- do we need revision history for submissions in the first release?
- should reports be immutable snapshots or regenerated views?
- do approvals require one reviewer or more than one?

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
