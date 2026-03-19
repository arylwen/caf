<!-- CAF_TRACE: task_id=TG-15-ui-shell capability=ui_frontend_scaffolding trace_anchor=pinned_input:ui.present -->
# UI shell scaffold

This React/Vite scaffold provides the baseline UI shell for follow-on resource and policy pages.

## Extension seams

- Add resource pages under `code/ui/src/pages/` and route them through `src/App.jsx`.
- Keep API calls in `src/api.js` so auth-claim and tenant-context conflict handling stay consistent.
- Keep mock persona claim construction in `src/auth/mockAuth.js`.
- Use stable local contract paths (`/api/*`, `/cp/*`) for AP/CP integration.

