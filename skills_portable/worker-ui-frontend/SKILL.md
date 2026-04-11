---
name: worker-ui-frontend
description: >
  Worker skill that implements ui_frontend_scaffolding capability by generating a minimal web UI (SPA)
  scaffold and basic admin/demo pages per Task Graph. Bounded to companion repo write rails.
status: active
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.


# worker-ui-frontend

## Capabilities

- ui_frontend_scaffolding

## Inputs

Authoritative inputs (copied into companion repo by `caf-build-candidate` Step 0 when present):

- `caf/application_spec_v1.md`
- `caf/application_design_v1.md`
- `caf/control_plane_design_v1.md`
- `caf/contract_declarations_v1.yaml`

This worker MUST also open every `task.inputs[]` where `required: true`.

## TBP role-binding enforcement (mandatory)

Before choosing any UI tooling, directory layout, or build pipeline, you MUST resolve TBP role bindings for this capability and obey the manifest-declared paths.

Run (from repo root):
- `node tools/caf/resolve_tbp_role_bindings_v1.mjs <instance_name> --capability ui_frontend_scaffolding`

Then:
- If the returned expectations are non-empty, you MUST implement the UI using the TBP-declared layout and MUST materialize every returned role_binding output for this capability. Treat each returned `path_template` plus its `evidence_contains` markers as producer-owned requirements, not optional hints.
- If the returned expectations are empty, you MUST NOT introduce new build tools; fall back to static-browser UI scaffolding as described below.
- Do NOT invent alternate layouts (e.g., `ui/` at repo root) unless a TBP path_template explicitly requires it.
- If expectations are non-empty but you cannot satisfy them within write rails: FAIL-CLOSED with a feedback packet.

## Outputs

This worker is **task-driven**, not output-declaration-driven.

Supported tasks:

- `TG-15-ui-shell`
- `TG-18-ui-policy-admin`
- `TG-25-ui-page-<resource_key>`

Deterministic resource extraction:

- If `task_id` matches `TG-25-ui-page-<resource_key>`, parse `<resource_key>`.
- Otherwise, treat the task as cross-cutting (no resource key).
- If parsing fails → fail closed.

Write rails:

- Only write within the companion repo Guardrails rails.
- Place UI artifacts under: `profile_v1/code/ui/`.
- Do not modify AP/CP code unless the task DoD explicitly requires it.
- Any file you create or substantially rewrite MUST include a `CAF_TRACE:` header block at the top (see CAF Operating Contract: "CAF trace headers").

## Implementation rules (strict)

1) **No new technology decisions**

- UI framework choice must come from `reference_architectures/<name>/spec/guardrails/profile_parameters_resolved.yaml` → `ui.framework`.
- Product-facing shell/page wording must come from `reference_architectures/<name>/spec/playbook/application_spec_v1.md` → `ARCHITECT_EDIT_BLOCK: ui_product_surface_v1` when that block is populated.
- If the resolved pins prefer `react`, generate React-compatible UI code.
- If the resolved UI pins are missing or conflict with the task intent → fail closed.

2) **Build pipeline is TBP-driven**

- If TBP role-binding expectations exist for this capability, you MUST scaffold the selected UI stack and assume the build happens inside the candidate container build (no host Node required).
- For every returned expectation, open the owning TBP manifest when needed and emit the concrete artifact so the file content satisfies the declared `evidence_contains` markers. Do not substitute a near-equivalent build setup that omits required role-binding evidence.
- If the selected runtime intentionally uses a classic JSX fallback instead of the resolved managed runtime contract, every JSX-bearing file MUST import `React` explicitly and the task report must call out that deliberate choice.
- If no TBP expectations exist, default UI scaffolding MUST be runnable as static assets (browser-native ES modules; React via ESM CDN).

3) **Tenant + principal context is mandatory**

- If the UI makes API calls, it MUST pass tenant/principal context according to the design/contract sources.
- If the contract/design does not clearly declare how context is carried, fail closed.
- Read resolved rails plus the task's managed DoD / semantic-review lines.
- If the task carries a managed auth or tenant-context contract for the shared UI API helper, implement that exact contract in the helper and keep alternate carriers only to the extent the task / contract explicitly allows them.

4) **Wired SPA behavior is required for implemented shell/page tasks**

- Static descriptive pages are **not** acceptable completion for `TG-15-ui-shell`, `TG-18-ui-policy-admin`, or `TG-25-ui-page-<resource_key>`.
- `TG-15-ui-shell` MUST expose real navigation/router reachability to every implemented page and MUST centralize AP calls through the shared UI API helper (`src/api.js`).
- `TG-18-ui-policy-admin` MUST bind visible form state or action controls to a real preview/submit interaction path. If the authoritative inputs do not expose a real contract/action path, FAIL-CLOSED instead of emitting a mock admin page presented as implemented.
- `TG-25-ui-page-<resource_key>` MUST wire at least one concrete AP interaction aligned to the task/resource intent (for example list/read, or create/update when explicitly declared), using the shared API helper and the declared contract surface.
- For `TG-25-ui-page-<resource_key>`, the shared UI API helper and the rendered controls MUST implement exactly the operations declared for that resource in `caf/application_domain_model_v1.yaml`; do not invent extra verbs such as create/get when only list/update is declared.
- When a resource is relationship-shaped (for example multiple required foreign keys such as `collection_id` + `widget_id`), create/update forms MUST collect those declared fields instead of falling back to generic `name` / `description` placeholders.
- Browser-facing helper routes MUST correspond to runtime routes that are actually exposed by the generated AP/CP services and same-origin proxy wiring. Do not invent helper calls such as `/api/ready` or bare `/context` unless the runtime/proxy layer explicitly realizes those browser-visible routes.
- When the browser lane uses a fixed mock persona posture and no same-origin `/context` route is implemented, prefer a local session-context helper over pretending a backend session endpoint exists.
- API-backed pages MUST render observable loading, empty, success, and failure states. Silent no-op controls or prose-only mock pages are not acceptable completion.
- The shared UI API helper (`src/api.js`) MUST preserve backend failure detail for non-2xx responses when the emitted contract returns structured details (for example JSON `detail`) so runtime diagnosis is not reduced to status-code-only noise.
- If authoritative inputs are insufficient to identify a real interaction path for the task, FAIL-CLOSED instead of claiming implementation.

5) **Entity identity + UI fields (default)**

- UI MUST treat entity identifiers (`id`, `*_id`) as **server-generated** by default.
  - Create forms MUST NOT ask the user to type an id.
  - Only include an id input if the authoritative app spec explicitly declares the id as user-provided.
- UI pages MUST prioritize user-facing fields (e.g., title/name, description, contents/content) and MUST NOT display ids by default.

6) **No placeholders**

- No `TBD`, `TODO`, `UNKNOWN`, `{{ }}`, `REPLACE_ME`, `<...>`.
- Use explicit scaffold language in READMEs instead (e.g., "This is a minimal scaffold; extend by ...").

## Deterministic output structure

Always place UI artifacts under `profile_v1/code/ui/`.

### When TBP role-binding expectations exist (preferred: Vite/React)

Ensure these exist:

- every TBP-resolved source/config artifact returned for this capability (for example the package metadata, bundler config, and source entrypoint surfaces declared by the selected UI TBP)
- `profile_v1/code/ui/index.html`
- `profile_v1/code/ui/src/main.jsx`
- `profile_v1/code/ui/src/App.jsx`
- `profile_v1/code/ui/src/api.js`

### When no TBP expectations exist (static-browser fallback)

Ensure these exist:

- `profile_v1/code/ui/README.md`
- `profile_v1/code/ui/index.html`
- `profile_v1/code/ui/src/app.jsx`
- `profile_v1/code/ui/src/main.jsx`
- `profile_v1/code/ui/src/api.js`

Task-specific additions:

- For `TG-18-ui-policy-admin`: add `profile_v1/code/ui/src/pages/policy_admin.jsx`
- For `TG-25-ui-page-<resource_key>`: add `profile_v1/code/ui/src/pages/<resource_key>.jsx`
Implementation expectations for task outputs:

- Every implemented page MUST be reachable from the shell/router path that claims to expose it.
- Every implemented API-backed page MUST import/use the shared UI API helper rather than duplicating raw fetch logic.
- The shared UI API helper MUST translate non-2xx backend responses into failure messages that preserve backend detail when available (`detail`, structured JSON, or response text) instead of throwing status-code-only errors.
- `TG-25-ui-page-<resource_key>` outputs MUST do more than explanatory prose: they must materialize task-aligned interactions and rendered state.
- `TG-18-ui-policy-admin` outputs MUST do more than policy copy: they must materialize real state-bound action controls and an interaction path.

## Task report (required)

Write a task report to:

- `<companion_repo_target>/caf/task_reports/<task_id>.md`

The report MUST include:

- Inputs consumed (each required `task.inputs[]` + what you derived)
- Claims (1–5)
- Interaction matrix for every implemented page/action surface:
  - page/module
  - reachable from shell/router via
  - AP contract path or action surface used
  - shared API helper call(s) used
  - observable loading/success/empty/failure states rendered
- Evidence anchors (`<relative_path>:L<start>-L<end>` under `companion_repositories/<instance>/profile_v1/`)

## Fail-closed conditions

- Missing required inputs.
- `profile_parameters_resolved.yaml` missing/invalid UI rails when the task depends on them.
- Intended writes outside the derived allowed write paths.
- Any output artifact class outside derived allowed artifact classes.
- Any ambiguity about tenant/principal context carriers when API calls are scaffolded.
- Any task that would otherwise be satisfied only by descriptive/static SPA copy with no real interaction path.
- Any task report that claims implemented UI behavior but cannot provide the required interaction matrix evidence.
