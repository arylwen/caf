// CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
// CAF_TRACE: task_id=TG-15-ui-shell
// CAF_TRACE: capability=ui_frontend_scaffolding
// CAF_TRACE: instance=codex-saas
// CAF_TRACE: trace_anchor=pattern_obligation_id:O-TBP-AUTH-MOCK-01-ui-api-helper

import React from "react";
import { apiGet } from "../api.js";

export function DashboardPage() {
  const [state, setState] = React.useState({ status: "idle", ap: null, cp: null, error: "" });

  const loadHealth = React.useCallback(async () => {
    setState({ status: "loading", ap: null, cp: null, error: "" });
    try {
      const [ap, cp] = await Promise.all([apiGet("/api/health"), apiGet("/cp/health")]);
      setState({ status: "success", ap, cp, error: "" });
    } catch (error) {
      setState({ status: "error", ap: null, cp: null, error: String(error.message || error) });
    }
  }, []);

  React.useEffect(() => {
    loadHealth();
  }, [loadHealth]);

  return (
    <section>
      <h2>Dashboard</h2>
      <p>Latest AP and CP runtime health through the same-origin gateway contracts.</p>
      <button type="button" onClick={loadHealth} style={{ marginBottom: "0.75rem" }}>
        Refresh health
      </button>
      {state.status === "loading" && <p>Loading runtime health...</p>}
      {state.status === "error" && <p role="alert">Health request failed: {state.error}</p>}
      {state.status === "success" && (
        <ul>
          <li>AP health: {JSON.stringify(state.ap)}</li>
          <li>CP health: {JSON.stringify(state.cp)}</li>
        </ul>
      )}
      {state.status === "idle" && <p>Preparing initial health request.</p>}
    </section>
  );
}