# UX Operator Notes (codex-saas)

## Access
- Richer UX lane URL: `http://localhost:8081`
- Smoke-test UI lane stays separate at: `http://localhost:8080`
- Compose file: `docker/compose.candidate.yaml`

## Runtime Truth
- Navigation order is fixed to: `Dashboard -> Catalog -> Collections -> Activity -> Admin`.
- Demo personas are fixed options in the shell selector:
- `Tenant Admin` (`tenant_admin`)
- `Catalog Editor` (`catalog_editor`)
- Session and tenant context are visible in the top context bar for every surface.

## Primary Actions
- `Create Widget`:
- Visible from `Catalog` header action bar.
- Calls shared helper: `createWidget` in `code/ux/src/api.js`.
- `Publish Collection`:
- Visible from `Collections` header action bar.
- Calls shared helper: `updateCollection(..., { published: true })`.
- `Manage Roles`:
- Visible from `Admin` header action bar.
- Calls shared helper: `createTenantRoleAssignment`.

## Validation Checklist
- Create Widget:
- Open `Catalog`, set new widget name, click `Create Widget`, then click `Refresh`.
- Verify row appears in catalog list and status panel remains success/empty/error explicit.
- Publish Collection:
- Open `Collections`, select a collection row, click `Publish Collection`.
- Verify success or deny/error message is explicit and non-silent.
- Manage Roles:
- Open `Admin`, enter `user_id`, choose role, click `Manage Roles`.
- Verify assignment appears in role list and can be selected/removed.
- Activity visibility:
- Open `Activity`, click `Refresh Timeline`, select an event, then `Load Selected Event`.
- Verify request/decision/outcome payload is visible in detail panel.

## Bounded Scope / Deferred
- No cross-tenant marketplace or public sharing flows.
- No real-time collaborative editing.
- No dynamic persona provisioning beyond the two fixed local mock personas.
- No optimistic claims about unimplemented flows; runtime behavior is limited to the implemented `code/ux/src/pages/*` and `code/ux/src/api.js` helpers.
