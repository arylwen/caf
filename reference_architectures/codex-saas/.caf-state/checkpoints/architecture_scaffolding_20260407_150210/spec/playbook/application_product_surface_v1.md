<!-- CAF_PROJECTED_SOURCE: application_product_surface_v1 from PRD.resolved.md -->
# Application Product Surface (v1)

## Product surface summary

The product is a tenant-scoped widget workspace for team members, team leads, and tenant admins. The UX should prioritize clarity and trustworthy status visibility over feature breadth in the first release.

Core outcomes:

- team members can create and maintain widgets
- team leads can organize and publish collections within tenant boundaries
- tenant admins can manage roles/settings with clear audit visibility

## Primary journeys

- open the widget catalog, create/edit a widget, and confirm save outcome
- organize widgets with tags and collections, then verify collection membership
- publish a collection to tenant roles and validate who can view/edit
- review activity history for widget, collection, and admin changes
- manage tenant users/roles/settings from admin surfaces

## Main surfaces

- Dashboard: recent widget activity, quick actions, and pending publication/admin signals
- Widget Catalog: searchable/sortable list with tenant-scoped filters and status
- Widget Detail and Editor: metadata + content editing with version/history access
- Collections Workspace: collection list, membership management, and publish controls
- Sharing and Permissions: role-targeted access configuration for published collections
- Activity History: timeline/list surface for auditable change events
- Tenant Admin: user-role assignments and tenant settings

## Navigation and shell expectations

- Web-first application shell with persistent left navigation and top context bar.
- Tenant identity, user role, and key consequences (save/publish/admin) remain visible at all times.
- Primary actions (`Create Widget`, `Publish Collection`, `Manage Roles`) should be one click from relevant surfaces.
- Navigation prioritizes: Dashboard -> Catalog -> Collections -> Activity -> Admin.

## Product-facing constraints

- Tenant isolation must be explicit in every user-facing list, detail, and permission action.
- Keep first release intentionally bounded:
  - no cross-tenant marketplace/public sharing
  - no real-time collaborative editing
  - no complex automation workflows
- Favor readable, keyboard-friendly operational layouts with medium density for desktop use.
- Destructive actions require explicit confirmation and clear outcome messaging.
- Activity/audit visibility is a first-class product concern, not a hidden admin-only feature.
