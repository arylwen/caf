// CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
// CAF_TRACE: task_id=TG-25-ui-page-activity_events
// CAF_TRACE: capability=ui_frontend_scaffolding
// CAF_TRACE: instance=codex-saas

import React from "react";
import { apiGet } from "../api.js";

export function ActivityEventsPage() {
  const [targetId, setTargetId] = React.useState("");
  const [items, setItems] = React.useState([]);
  const [state, setState] = React.useState({ status: "idle", error: "" });

  const load = React.useCallback(async () => {
    setState({ status: "loading", error: "" });
    try {
      const response = await apiGet("/api/activity_events", undefined, { target_id: targetId });
      setItems(Array.isArray(response.items) ? response.items : []);
      setState({ status: "success", error: "" });
    } catch (error) {
      setState({ status: "error", error: String(error.message || error) });
    }
  }, [targetId]);

  React.useEffect(() => {
    load();
  }, [load]);

  return (
    <section>
      <h2>Activity Events</h2>
      <p>Audit timeline for tenant widget and administration activity.</p>
      <label>
        Target ID filter (optional)
        <input value={targetId} onChange={(event) => setTargetId(event.target.value)} />
      </label>
      <button type="button" onClick={load} style={{ marginLeft: "0.5rem" }}>
        Refresh
      </button>
      {state.status === "loading" && <p>Loading activity events...</p>}
      {state.status === "error" && <p role="alert">Activity request failed: {state.error}</p>}
      {state.status === "success" && items.length === 0 && <p>No activity events found.</p>}
      {state.status === "success" && items.length > 0 && (
        <ul>
          {items.map((item) => (
            <li key={item.event_id}>
              {item.occurred_at}: {item.actor_user_id} {item.event_type} {item.target_type} {item.target_id}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
