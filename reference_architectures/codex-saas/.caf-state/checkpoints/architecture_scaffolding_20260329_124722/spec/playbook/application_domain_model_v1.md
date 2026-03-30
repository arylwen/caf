<!-- CAF_PROJECTED_SOURCE: application_domain_model_v1 from PRD.resolved.md -->
# Application Domain Model (v1)

## Domain overview

Tenant-scoped widget management for team collaboration. The first release centers on creating, organizing, sharing, and auditing widgets inside each tenant boundary.

Bounded contexts:
- Widget Catalog: authoring/versioning of widgets.
- Organization and Sharing: tags, collections, and tenant-role access to published collections.
- Tenant Administration: tenant settings and role assignments.
- Activity and Audit: immutable activity events for key domain changes.

## Aggregates and entities

### Aggregate: Widget

**Description**
Primary tenant-owned business object representing a reusable widget entry.

**Fields**
- tenant_id: string (tenant scope key)
- widget_id: string (stable identifier)
- title: string
- description: string
- status: enum (draft|published|archived)
- current_version_id: string
- created_at: datetime
- updated_at: datetime
- created_by_user_id: string

**Invariants**
- `tenant_id` is required on all widget operations.
- Widget identifiers are unique within a tenant.
- `current_version_id` must reference an existing Widget Version for the same widget.

**Persistence intent**
Stored as a tenant-partitioned root record with indexed list/read paths by tenant and status.

### Entity: Widget Version

**Description**
Immutable version snapshots for widget edits.

**Fields**
- tenant_id: string
- widget_id: string
- version_id: string
- payload: json
- created_at: datetime
- created_by_user_id: string

**Invariants**
- Version records are append-only.
- Each version belongs to exactly one widget in the same tenant.

**Persistence intent**
Append-only child records keyed by `(tenant_id, widget_id, version_id)`.

### Aggregate: Collection

**Description**
Tenant-scoped grouping of widgets used for organization and sharing.

**Fields**
- tenant_id: string
- collection_id: string
- name: string
- description: string
- published: boolean
- created_at: datetime
- updated_at: datetime

**Invariants**
- Collection names are unique per tenant.
- Publish actions require at least one permission rule.

**Persistence intent**
Root collection record plus membership and permission child entities.

### Entity: Collection Membership

**Description**
Association between a collection and its widgets.

**Fields**
- tenant_id: string
- collection_id: string
- widget_id: string
- added_at: datetime

**Invariants**
- Membership references existing widget and collection in same tenant.
- Duplicate `(tenant_id, collection_id, widget_id)` memberships are disallowed.

**Persistence intent**
Join table keyed by tenant/collection with widget lookup index.

### Entity: Tag

**Description**
Tenant-defined labels attached to widgets.

**Fields**
- tenant_id: string
- tag_id: string
- label: string
- created_at: datetime

**Invariants**
- Tag labels are unique per tenant.

**Persistence intent**
Tenant-scoped dictionary with widget-tag mapping relation.

### Entity: Collection Permission

**Description**
Role-based access configuration for published collections.

**Fields**
- tenant_id: string
- collection_id: string
- role_id: string
- permission: enum (view|edit)
- granted_at: datetime

**Invariants**
- Permission is valid only for roles defined in tenant admin context.
- Unpublished collections cannot be visible outside explicit role assignment.

**Persistence intent**
Tenant-scoped permission rows keyed by collection and role.

### Aggregate: User Role Assignment

**Description**
Assignment of tenant users to roles used by sharing/admin controls.

**Fields**
- tenant_id: string
- user_id: string
- role_id: string
- assigned_at: datetime
- assigned_by_user_id: string

**Invariants**
- A user-role pair is unique per tenant.
- Only tenant admins may mutate assignments.

**Persistence intent**
Tenant-scoped assignment records with query paths by user and role.

### Aggregate: Tenant Setting

**Description**
Tenant-level configuration surface managed by tenant admins.

**Fields**
- tenant_id: string
- setting_key: string
- setting_value: string|json
- updated_at: datetime
- updated_by_user_id: string

**Invariants**
- Setting keys are unique per tenant.
- Updates must produce an admin activity event.

**Persistence intent**
Tenant key-value configuration store with audit linkage.

### Aggregate: Activity Event

**Description**
Audit-friendly event trail for widget, sharing, and admin changes.

**Fields**
- tenant_id: string
- event_id: string
- event_type: string
- actor_user_id: string
- target_type: string
- target_id: string
- occurred_at: datetime
- metadata: json

**Invariants**
- Events are append-only.
- Every mutating widget/collection/admin action emits exactly one or more activity events.

**Persistence intent**
Append-only tenant event log indexed by time, actor, and target.

## Use cases

### Create or update widget

**Intent**
Allow team members to author and revise widgets within tenant scope.

**Touches**
- Widget
- Widget Version
- Activity Event

### Organize widgets with tags and collections

**Intent**
Allow team leads to structure widget catalog for discoverability.

**Touches**
- Widget
- Tag
- Collection
- Collection Membership
- Activity Event

### Publish collection to tenant roles

**Intent**
Allow controlled sharing of curated widget sets within tenant.

**Touches**
- Collection
- Collection Permission
- User Role Assignment
- Activity Event

### Manage tenant roles and settings

**Intent**
Allow tenant admins to manage access model and core tenant configuration.

**Touches**
- User Role Assignment
- Tenant Setting
- Activity Event

## API candidates (optional)

- widgets: list, create, get, update, delete
- widget_versions: list
- collections: list, create, get, update, publish
- collection_memberships: add, remove, list
- tags: list, create, attach, detach
- collection_permissions: set, list
- tenant_users_roles: list, assign, revoke
- tenant_settings: get, update
- activity_events: list

## Open questions

- Should widget publication status be tied only to collection publication, or also to widget-level workflow state?
- Are tag taxonomies free-form per tenant, or should controlled vocabularies be supported in later phases?
- Which activity events are required to be immutable/exportable in phase-one compliance posture?