// CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
// CAF_TRACE: task_id=TG-18-ui-policy-admin
// CAF_TRACE: capability=ui_frontend_scaffolding
// CAF_TRACE: instance=codex-saas
// CAF_TRACE: trace_anchor=pattern_obligation_id:UI-02-policy-admin

import React, { useState } from "react";

import { previewPolicyDecision } from "../api";

const INITIAL_FORM = {
  action: "update",
  resource: "collections",
};

export function PolicyAdminPage({ personaKey }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [state, setState] = useState({ status: "idle", message: "", payload: null });

  async function submitPreview(event) {
    event.preventDefault();
    setState({ status: "loading", message: "Evaluating policy preview...", payload: null });

    try {
      const payload = await previewPolicyDecision(personaKey, form.action, form.resource);
      setState({ status: "success", message: "Preview completed.", payload });
    } catch (error) {
      setState({ status: "error", message: error.message, payload: null });
    }
  }

  return (
    <section>
      <h2>Policy Admin</h2>
      <p>Preview CP-governed decisions for admin operations before committing changes.</p>

      <form onSubmit={submitPreview} style={{ display: "grid", gap: "0.75rem", maxWidth: "480px" }}>
        <label>
          Action
          <input
            type="text"
            value={form.action}
            onChange={(event) => setForm((current) => ({ ...current, action: event.target.value }))}
          />
        </label>
        <label>
          Resource
          <input
            type="text"
            value={form.resource}
            onChange={(event) => setForm((current) => ({ ...current, resource: event.target.value }))}
          />
        </label>
        <button type="submit">Preview Decision</button>
      </form>

      {state.status === "loading" ? <p>Evaluating policy preview...</p> : null}
      {state.status === "error" ? <p role="alert">Policy preview failed: {state.message}</p> : null}
      {state.status === "success" ? (
        <article>
          <h3>Decision</h3>
          <pre>{JSON.stringify(state.payload, null, 2)}</pre>
        </article>
      ) : null}
      {state.status === "idle" ? <p>Set action/resource values and run a preview.</p> : null}
    </section>
  );
}
