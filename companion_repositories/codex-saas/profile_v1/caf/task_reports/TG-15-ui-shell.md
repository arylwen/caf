## Task Spec Digest
- task_id: `TG-15-ui-shell`
- title: `Scaffold UI shell (web SPA)`
- primary capability: `ui_frontend_scaffolding`
- task graph source: `caf/task_graph_v1.yaml`

## Inputs declared by task
- required: `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- required: `reference_architectures/codex-saas/spec/playbook/application_spec_v1.md`
- required: `reference_architectures/codex-saas/design/playbook/application_design_v1.md`

## Inputs consumed
- `caf/profile_parameters_resolved.yaml`: confirmed `ui.present: true`, `ui.kind: web_spa`, `ui.framework: react`.
- `caf/application_spec_v1.md`: consumed `ui_product_surface_v1` navigation/product language for shell routes.
- `caf/application_design_v1.md`: confirmed AP-side UI constraints and no additional architecture choices.
- `node tools/caf/resolve_tbp_role_bindings_v1.mjs codex-saas --capability ui_frontend_scaffolding`: enforced TBP-UI-REACT-VITE-01 path expectation at `code/ui/package.json`.

## Step execution evidence
- Read resolved UI pins and confirmed web_spa/react posture from `caf/profile_parameters_resolved.yaml`.
- Created minimal SPA shell with route baseline and navigation in `code/ui/src/App.jsx`.
- Added shared layout and API seam files in `code/ui/src/main.jsx` and `code/ui/src/api.js`.
- Materialized TBP-driven Vite/React surface in `code/ui/package.json`, `code/ui/vite.config.js`, and `code/ui/index.html`.
- Captured extension points for downstream resource/policy pages via route keys and shell summary in `code/ui/src/App.jsx`.

## Outputs produced
- `code/ui/package.json`
- `code/ui/vite.config.js`
- `code/ui/index.html`
- `code/ui/src/main.jsx`
- `code/ui/src/App.jsx`
- `code/ui/src/api.js`

## Rails and TBP satisfaction
- All writes remained under `companion_repositories/codex-saas/profile_v1/code/**`.
- TBP role-binding expectation for `ui_frontend_scaffolding` was satisfied at `code/ui/package.json` with required evidence strings (`vite`, `react`, `build`).
- For `package.json` (JSON, non-comment format), trace was recorded in this task report evidence per CAF operating contract 5B(5).
