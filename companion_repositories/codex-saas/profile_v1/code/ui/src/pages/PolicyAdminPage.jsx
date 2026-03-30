// CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
// CAF_TRACE: task_id=TG-18-ui-policy-admin
// CAF_TRACE: capability=ui_frontend_scaffolding
// CAF_TRACE: instance=codex-saas

import React from "react";
import { apiPost } from "../api.js";

export function PolicyAdminPage() {
  const [form, setForm] = React.useState({
    action: "widgets.list",
    resource_id: "",
  });
  const [state, setState] = React.useState({ status: "idle", message: "", decision: null });

  async function runDecision(event, mode) {
    event.preventDefault();
    setState({ status: "loading", message: `${mode} policy decision...`, decision: null });
    try {
      const decision = await apiPost("/cp/contract/BND-CP-AP-01/policy-decision", {
        action: form.action,
        resource_id: form.resource_id || null,
      });
      setState({
        status: "success",
        message: `Policy ${mode} completed.`,
        decision,
      });
    } catch (error) {
      setState({ status: "error", message: String(error.message || error), decision: null });
    }
  }

  return (
    <section>
      <h2>Policy Admin</h2>
      <p>Preview and execute policy decisions through the CP/AP contract surface.</p>
      <form style={{ display: "grid", gap: "0.5rem", marginBottom: "1rem" }}>
        <label>
          Policy action
          <input value={form.action} onChange={(event) => setForm((current) => ({ ...current, action: event.target.value }))} required />
        </label>
        <label>
          Resource ID (optional)
          <input value={form.resource_id} onChange={(event) => setForm((current) => ({ ...current, resource_id: event.target.value }))} />
        </label>
        <div>
          <button type="button" onClick={(event) => runDecision(event, "preview")}>
            Preview decision
          </button>
          <button type="button" onClick={(event) => runDecision(event, "submit")} style={{ marginLeft: "0.5rem" }}>
            Submit decision
          </button>
        </div>
      </form>
      {state.status === "loading" && <p>{state.message}</p>}
      {state.status === "error" && <p role="alert">{state.message}</p>}
      {state.status === "success" && state.decision && (
        <article>
          <p>{state.message}</p>
          <p>
            <strong>Allowed:</strong> {String(Boolean(state.decision.allowed))}
          </p>
          <p>
            <strong>Reason:</strong> {state.decision.reason}
          </p>
          <p>
            <strong>Tenant:</strong> {state.decision.tenant_id}
          </p>
          <p>
            <strong>Principal:</strong> {state.decision.principal_id}
          </p>
          <p>
            <strong>Policy version:</strong> {state.decision.policy_version}
          </p>
        </article>
      )}
      {state.status === "idle" && <p>Choose an action to preview or submit policy evaluation.</p>}
    </section>
  );
}
