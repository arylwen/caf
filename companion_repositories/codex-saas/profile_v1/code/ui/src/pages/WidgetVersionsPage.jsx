// CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
// CAF_TRACE: task_id=TG-25-ui-page-widget_versions
// CAF_TRACE: capability=ui_frontend_scaffolding
// CAF_TRACE: instance=codex-saas

import React from "react";
import { apiGet } from "../api.js";

export function WidgetVersionsPage() {
  const [filterWidgetId, setFilterWidgetId] = React.useState("");
  const [items, setItems] = React.useState([]);
  const [state, setState] = React.useState({ status: "idle", error: "" });

  const load = React.useCallback(async () => {
    setState({ status: "loading", error: "" });
    try {
      const response = await apiGet("/api/widget_versions", undefined, {
        widget_id: filterWidgetId,
      });
      setItems(Array.isArray(response.items) ? response.items : []);
      setState({ status: "success", error: "" });
    } catch (error) {
      setState({ status: "error", error: String(error.message || error) });
    }
  }, [filterWidgetId]);

  React.useEffect(() => {
    load();
  }, [load]);

  return (
    <section>
      <h2>Widget Versions</h2>
      <p>Inspect version history for a selected widget.</p>
      <label>
        Widget ID filter (optional)
        <input value={filterWidgetId} onChange={(event) => setFilterWidgetId(event.target.value)} />
      </label>
      <button type="button" onClick={load} style={{ marginLeft: "0.5rem" }}>
        Refresh
      </button>
      {state.status === "loading" && <p>Loading widget versions...</p>}
      {state.status === "error" && <p role="alert">Widget version request failed: {state.error}</p>}
      {state.status === "success" && items.length === 0 && <p>No versions found.</p>}
      {state.status === "success" && items.length > 0 && (
        <ul>
          {items.map((item) => (
            <li key={item.version_id}>
              <strong>{item.widget_id}</strong> version {item.version_id} by {item.created_by_user_id}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
