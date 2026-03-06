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
- If the returned expectations are non-empty, you MUST implement the UI using the TBP-declared layout and role_binding outputs (for example, a Vite/React project rooted at the returned `path_template`).
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

- UI framework preference must come from `ui_requirements_v1` (architect-edit).
- If the requirements prefer `react`, generate React-compatible UI code.
- If the requirements are missing or conflict with the task intent → fail closed.

2) **Build pipeline is TBP-driven**

- If TBP role-binding expectations exist for this capability (e.g., a Vite/React UI TBP), you MUST scaffold a Vite/React project and assume the build happens inside the candidate container build (no host Node required).
- If no TBP expectations exist, default UI scaffolding MUST be runnable as static assets (browser-native ES modules; React via ESM CDN).

3) **Tenant + principal context is mandatory**

- If the UI makes API calls, it MUST pass tenant/principal context according to the design/contract sources.
- If the contract/design does not clearly declare how context is carried, fail closed.

4) **Entity identity + UI fields (default)**

- UI MUST treat entity identifiers (`id`, `*_id`) as **server-generated** by default.
  - Create forms MUST NOT ask the user to type an id.
  - Only include an id input if the authoritative app spec explicitly declares the id as user-provided.
- UI pages MUST prioritize user-facing fields (e.g., title/name, description, contents/content) and MUST NOT display ids by default.

5) **No placeholders**

- No `TBD`, `TODO`, `UNKNOWN`, `{{ }}`, `REPLACE_ME`, `<...>`.
- Use explicit scaffold language in READMEs instead (e.g., "This is a minimal scaffold; extend by ...").

## Deterministic output structure

Always place UI artifacts under `profile_v1/code/ui/`.

### When TBP role-binding expectations exist (preferred: Vite/React)

Ensure these exist:

- `profile_v1/code/ui/package.json`
- `profile_v1/code/ui/vite.config.js`
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

## Task report (required)

Write a task report to:

- `<companion_repo_target>/caf/task_reports/<task_id>.md`

The report MUST include:

- Inputs consumed (each required `task.inputs[]` + what you derived)
- Claims (1–5)
- Evidence anchors (`<relative_path>:L<start>-L<end>` under `companion_repositories/<instance>/profile_v1/`)

## Fail-closed conditions

- Missing required inputs.
- `ui_requirements_v1` missing/invalid when the task depends on it.
- Intended writes outside the derived allowed write paths.
- Any output artifact class outside derived allowed artifact classes.
- Any ambiguity about tenant/principal context carriers when API calls are scaffolded.
