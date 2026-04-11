---
name: worker-ux-frontend
description: >
  Worker skill that implements ux_frontend_realization by generating a separate UX-lane web UI
  surface under the companion repo UX namespace/root. Keeps the smoke-test UI lane untouched.
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.

# worker-ux-frontend

## Capabilities

- ux_frontend_realization

## Inputs

Authoritative inputs mirrored into the companion repo when present:

- `caf/profile_parameters_resolved.yaml`
- `caf/application_product_surface_v1.md`
- `caf/application_spec_v1.md`
- `caf/application_design_v1.md`
- `caf/control_plane_design_v1.md`
- `caf/contract_declarations_v1.yaml`
- `caf/ux_design_v1.md`
- `caf/ux_visual_system_v1.md`
- `caf/retrieval_context_blob_ux_design_v1.md`
- `caf/ux_task_graph_v1.yaml`

This worker MUST also open every required `task.inputs[]` path.

## TBP role-binding enforcement (mandatory)

Before choosing any UX tooling, layout, or build pipeline, you MUST resolve TBP role bindings for this capability and obey the manifest-declared paths.

Run:
- `node tools/caf/resolve_tbp_role_bindings_v1.mjs <instance_name> --capability ux_frontend_realization`

Then:
- If returned expectations are non-empty, you MUST use the TBP-declared layout and MUST materialize every returned role-binding output for this capability. Treat each returned `path_template` plus its `evidence_contains` markers as producer-owned requirements, not optional hints.
- If returned expectations are empty, you MUST NOT invent new build tools; fall back to static-browser UX scaffolding.
- Do NOT write into `profile_v1/code/ui/`; the smoke-test UI lane remains separate.
- When the selected UX realization uses a managed bundle/build surface, assume the build happens inside the candidate container build surface. For every returned expectation, open the owning TBP manifest when needed and emit the concrete artifact so the file content satisfies the declared `evidence_contains` markers. If a bounded repair intentionally keeps a classic JSX fallback instead of the resolved managed runtime contract, every JSX-bearing file MUST import `React` explicitly and the task report must call out that deliberate choice. Do not run host-side `npm install`, `npm ci`, `npm run build`, `pnpm`, or `yarn` commands inside `profile_v1/code/ux/` merely to prove completion.

## Supported tasks

- `UX-TG-00-ux-shell-and-visual-system`
- `UX-TG-10-rest-client-and-session-wiring`
- `UX-TG-20-primary-worklist-surface`
- `UX-TG-30-detail-review-report-surface`
- `UX-TG-40-collections-publish-surface`
- `UX-TG-50-admin-and-activity-governance-surface`
- `UX-TG-90-ux-polish`

## Write rails

- Only write within companion repo Guardrails rails.
- Place UX artifacts under `profile_v1/code/ux/`.
- Do not modify `profile_v1/code/ui/`.
- Do not modify AP/CP code unless the task DoD explicitly requires it.
- Any file you create or substantially rewrite MUST include a `CAF_TRACE:` header block at the top.

## Implementation rules

1) **No new technology decisions**
- UI framework choice must come from `profile_parameters_resolved.yaml` → `ui.framework`.
- When present, `ui.component_system` must come from `profile_parameters_resolved.yaml` and stay an implementation substrate, not a new owner of UX meaning.
- UX-facing wording and surface grouping must come from `ux_design_v1.md`, `ux_visual_system_v1.md`, `retrieval_context_blob_ux_design_v1.md`, `application_product_surface_v1.md`, and the assigned task.
- If the resolved pins prefer `react`, generate React-compatible UX code.
- If resolved UI rails are missing or conflict with the task intent → fail closed.
- When `ui.component_system == shadcn`, map semantic primitive/composite families from `ux_visual_system_v1.md` into shadcn-backed React primitives under `code/ux/`; do not invent a competing component library.

2) **REST/OpenAPI posture is preserved**
- The separate UX lane must remain on top of the current REST/OpenAPI AP/CP surfaces.
- Do not invent a new integration model.
- Keep tenant/principal/session consequences explicit in the UX shell, pages, empty states, and guarded actions.
- Product data list/detail/create/update/delete flows for the richer UX lane must use the AP/browser data surface, not a CP contract gateway as the only runtime path.
- A CP contract/policy boundary may still be used for preview, explainability, or explicit governed confirmation flows, but it must not become the sole source of worklist/detail/admin/activity data.
- Do not collapse all UX domain helpers into one generic `contractRequest(...)` that posts every product action to `'/cp/contracts/.../enforce'`.

3) **Wired UX behavior is required**
- Static descriptive screens are not acceptable completion.
- The shared UX API helper (`profile_v1/code/ux/src/api.js`) must centralize browser-side AP/CP calls.
- Prefer explicit helper exports for product data actions (for example list/create/update helpers) rather than page-local fetch logic.
- Browser-facing helper routes MUST correspond to routes that are actually exposed by the generated runtime + same-origin proxy layer. Do not invent helper calls such as `/api/ready` or bare `/context` unless the runtime wiring explicitly realizes those browser-visible routes.
- When the richer UX lane uses a fixed mock persona and no proxied session endpoint exists, prefer a local session-context helper rather than depending on a nonexistent backend `/context` call.
- When AP resource rows are shaped as `{ id, data }` or `{ id, attributes }`, `profile_v1/code/ux/src/api.js` MUST export shared normalization helpers (for example `normalizeResourceItem(...)` and `normalizeResourcePayload(...)`) that flatten the realized payload object (`data` or `attributes`) over top-level metadata while preserving canonical identifiers such as `id` and resource-specific `*_id` aliases needed by the rendered pages.
- Richer UX pages MUST consume normalized resource items from the shared UX API helper instead of reaching into nested `.data` or `.attributes` ad hoc.
- Collections/create flows MUST import `createCollection` from the shared UX API helper and use a distinct local handler name (for example `handleCreateCollection`) rather than declaring a same-name local `createCollection` function that shadows the imported helper.
- Implemented surfaces must render observable loading, empty, success, and failure states.
- Preserve backend error detail when available.

4) **Primary actions and shell expectations must survive realization**
- Treat explicit primary actions and shell expectations from `application_product_surface_v1.md` as hard requirements for the richer UX lane.
- Declared primary actions must remain visibly reachable from an implemented surface, not only implied in prose or buried in future-work notes.
- Declared main surfaces must be either visibly realized, clearly co-located into another realized surface, or explicitly deferred through blocker feedback.
- When a task implements create/update/publish semantics, the rendered controls must call a real shared API/helper path that matches the named action.
- Shared UX API helpers and richer UX pages MUST implement exactly the operations declared for each resource in `caf/application_domain_model_v1.yaml`; do not expose unsupported create/get flows for resources that only declare list/update.
- Relationship-shaped resources must preserve their declared foreign-key fields in richer UX forms and helper payloads (for example `collection_id`, `widget_id`, `user_id`, `role_id`) instead of generic `name` / `description` scaffolds.

5) **Namespace separation is mandatory**
- Keep the separate UX lane under `code/ux/`.
- Do not rewrite smoke-test UI shell/pages under `code/ui/`.
- When auth mock helpers are required, keep them under the UX root selected by role bindings (for example `code/ux/src/auth/mockAuth.js`).

6) **No placeholders**
- No `TBD`, `TODO`, `UNKNOWN`, `{{ }}`, `REPLACE_ME`, `<...>`.

## Deterministic output structure

Always place UX artifacts under `profile_v1/code/ux/`.

### When TBP role-binding expectations exist (preferred: Vite/React)

Ensure these exist:

- every TBP-resolved source/config artifact returned for this capability (for example the package metadata, bundler config, source entrypoint, and component-system surfaces declared by the selected UX TBPs)
- `profile_v1/code/ux/index.html`
- `profile_v1/code/ux/src/main.jsx`
- `profile_v1/code/ux/src/App.jsx`
- `profile_v1/code/ux/src/api.js`

Task-specific additions are required once the corresponding surfaces are realized:

- `UX-TG-20-primary-worklist-surface` → `profile_v1/code/ux/src/pages/CatalogPage.jsx`
- `UX-TG-30-detail-review-report-surface` → `profile_v1/code/ux/src/pages/DetailPage.jsx`
- `UX-TG-40-collections-publish-surface` → `profile_v1/code/ux/src/pages/CollectionsPage.jsx` and `profile_v1/code/ux/src/pages/PublishedPage.jsx`
- `UX-TG-50-admin-and-activity-governance-surface` → `profile_v1/code/ux/src/pages/AdminPage.jsx` and `profile_v1/code/ux/src/pages/ActivityPage.jsx`
- shared primitives/helpers under `profile_v1/code/ux/src/components/*` as needed
- `profile_v1/code/ux/src/auth/mockAuth.js` when the resolved auth contract requires it

`profile_v1/code/ux/src/App.jsx` remains the shell/router composition surface. Once task-specific UX pages exist, do not collapse all major surfaces back into a monolithic `App.jsx`.

### When no TBP expectations exist

Ensure these exist:

- `profile_v1/code/ux/README.md`
- `profile_v1/code/ux/index.html`
- `profile_v1/code/ux/src/main.jsx`
- `profile_v1/code/ux/src/App.jsx`
- `profile_v1/code/ux/src/api.js`

## Task report (required)

Write a task report to:

- `<companion_repo_target>/caf/task_reports/<task_id>.md`

The report MUST include:

- inputs consumed
- claims (1–5)
- UX interaction matrix for every implemented UX surface
- primary action coverage matrix with columns:
  - declared action
  - source surface
  - realized surface/module
  - visible entry control or path
  - shared API/helper call path
  - evidence anchor or explicit deferred note
- evidence anchors under `companion_repositories/<instance>/profile_v1/`

## Fail-closed conditions

- Missing required inputs.
- Missing or conflicting UI rails.
- Intended writes outside `profile_v1/code/ux/`.
- Any task that would otherwise be satisfied only by static descriptive UX prose.
- Any ambiguity about tenant/principal/session carriers when API calls are scaffolded.
- Any output that claims explicit product actions are covered but cannot show where those actions are visibly reachable.
