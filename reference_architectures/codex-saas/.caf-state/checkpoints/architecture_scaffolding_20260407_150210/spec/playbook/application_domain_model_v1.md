<!-- CAF_PROJECTED_SOURCE: application_domain_model_v1 from PRD.resolved.md -->
# Application Domain Model (v1)

## Domain overview

The product is a tenant-scoped widget management SaaS. The core domain is widget lifecycle management with organization, sharing, and tenant administration capabilities.

Primary bounded contexts:

- Widget Catalog Management
- Organization and Sharing
- Tenant Administration
- Activity and Audit Trail

## Aggregates and entities

### Aggregate: Widget

**Description**
Tenant-scoped reusable artifact created and maintained by team members.

**Fields**

- widget_id: uuid, required
- tenant_id: uuid, required
- name: string, required
- summary: string, optional
- content: text/json payload, required
- status: enum(draft|published|archived), required
- created_by_user_id: uuid, required
- created_at: datetime, required
- updated_at: datetime, required

**Invariants**

- `tenant_id` is mandatory and immutable after creation.
- `name` is required and non-empty within tenant scope.
- Every create/update emits a widget activity event.

**Persistence intent**
Store in tenant-keyed relational tables with indexes on `(tenant_id, widget_id)` and `(tenant_id, updated_at)`.

### Entity: WidgetVersion

**Description**
Snapshot of widget content changes for history and audit traceability.

**Fields**

- version_id: uuid, required
- tenant_id: uuid, required
- widget_id: uuid, required
- version_number: integer, required
- content_snapshot: text/json payload, required
- changed_by_user_id: uuid, required
- changed_at: datetime, required

**Invariants**

- Version numbers increase monotonically per widget.
- Version history is tenant-scoped and append-only.

**Persistence intent**
Append-only table keyed by `(tenant_id, widget_id, version_number)`.

### Aggregate: Collection

**Description**
Tenant-scoped grouping of widgets used for curation and sharing.

**Fields**

- collection_id: uuid, required
- tenant_id: uuid, required
- name: string, required
- description: string, optional
- created_by_user_id: uuid, required
- published: boolean, required
- created_at: datetime, required
- updated_at: datetime, required

**Invariants**

- Collections only reference widgets from the same tenant.
- Published collections must carry explicit role permissions.

**Persistence intent**
Relational aggregate with child membership and permission tables.

### Entity: CollectionMembership

**Description**
Association between a collection and widgets it contains.

**Fields**

- tenant_id: uuid, required
- collection_id: uuid, required
- widget_id: uuid, required
- sort_order: integer, optional
- added_by_user_id: uuid, required
- added_at: datetime, required

**Invariants**

- Membership requires existing collection and widget in same tenant.
- Duplicate widget membership per collection is not allowed.

**Persistence intent**
Join table with unique `(tenant_id, collection_id, widget_id)` constraint.

### Aggregate: TenantRoleAssignment

**Description**
Tenant user-to-role mapping used by sharing and admin authorization.

**Fields**

- assignment_id: uuid, required
- tenant_id: uuid, required
- user_id: uuid, required
- role_id: uuid, required
- assigned_by_user_id: uuid, required
- assigned_at: datetime, required

**Invariants**

- Role assignment is always tenant-scoped.
- Authorization checks for publish/admin actions use current assignment state.

**Persistence intent**
Tenant-keyed authorization tables with uniqueness on `(tenant_id, user_id, role_id)`.

### Entity: ActivityEvent

**Description**
Audit-friendly event stream for widget, collection, sharing, and admin changes.

**Fields**

- event_id: uuid, required
- tenant_id: uuid, required
- event_type: enum(widget_change|collection_change|publish_change|admin_change), required
- actor_user_id: uuid, required
- subject_type: string, required
- subject_id: uuid, required
- occurred_at: datetime, required
- metadata: json, optional

**Invariants**

- Event emission is synchronous with authoritative state changes.
- Event records are immutable once written.

**Persistence intent**
Append-only tenant-partitioned table optimized for time-range and subject queries.

## Use cases

### Create or update widget

**Intent**
Allow a team member to create new widgets or update existing widget content.

**Touches**

- Widget
- WidgetVersion
- ActivityEvent

### Organize widgets into collections

**Intent**
Allow a team lead to curate widgets using tags/collections for internal discovery.

**Touches**

- Widget
- Collection
- CollectionMembership
- ActivityEvent

### Publish collection to tenant roles

**Intent**
Allow a team lead to grant role-based visibility/edit rights for a collection.

**Touches**

- Collection
- TenantRoleAssignment
- ActivityEvent

### Administer tenant users, roles, and settings

**Intent**
Allow tenant admins to maintain role assignments and baseline tenant configuration.

**Touches**

- TenantRoleAssignment
- ActivityEvent

## API candidates (optional)

- widgets: list, create, get, update, delete
- widget_versions: list, get
- collections: list, create, get, update, delete
- collection_memberships: list, add, remove
- collection_permissions: list, update
- tenant_role_assignments: list, create, delete
- activity_events: list, get

## Open questions

- Should widget version retention be bounded by policy in the first release?
- Are collection permissions role-only, or can explicit user grants exist later?
