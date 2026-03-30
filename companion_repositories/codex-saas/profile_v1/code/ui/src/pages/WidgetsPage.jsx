// CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
// CAF_TRACE: task_id=TG-25-ui-page-widgets
// CAF_TRACE: capability=ui_frontend_scaffolding
// CAF_TRACE: instance=codex-saas

import React from "react";
import { apiDelete, apiGet, apiPost } from "../api.js";

export function WidgetsPage() {
  const [items, setItems] = React.useState([]);
  const [state, setState] = React.useState({ status: "idle", error: "" });
  const [form, setForm] = React.useState({ title: "", description: "" });
  const [saveState, setSaveState] = React.useState({ status: "idle", message: "" });

  const load = React.useCallback(async () => {
    setState({ status: "loading", error: "" });
    try {
      const response = await apiGet("/api/widgets");
      setItems(Array.isArray(response.items) ? response.items : []);
      setState({ status: "success", error: "" });
    } catch (error) {
      setState({ status: "error", error: String(error.message || error) });
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function createWidget(event) {
    event.preventDefault();
    setSaveState({ status: "loading", message: "Creating widget..." });
    try {
      await apiPost("/api/widgets", {
        title: form.title,
        description: form.description,
        status: "draft",
      });
      setForm({ title: "", description: "" });
      setSaveState({ status: "success", message: "Widget created." });
      await load();
    } catch (error) {
      setSaveState({ status: "error", message: String(error.message || error) });
    }
  }

  async function removeWidget(widgetId) {
    try {
      await apiDelete(`/api/widgets/${encodeURIComponent(widgetId)}`);
      await load();
    } catch (error) {
      setSaveState({ status: "error", message: String(error.message || error) });
    }
  }

  return (
    <section>
      <h2>Widgets</h2>
      <p>Manage tenant-scoped widgets and create new drafts.</p>
      <form onSubmit={createWidget} style={{ display: "grid", gap: "0.5rem", marginBottom: "1rem" }}>
        <label>
          Title
          <input
            type="text"
            required
            value={form.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
          />
        </label>
        <label>
          Description
          <textarea
            required
            value={form.description}
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
          />
        </label>
        <button type="submit">Create widget</button>
      </form>
      {saveState.status === "loading" && <p>{saveState.message}</p>}
      {saveState.status === "success" && <p>{saveState.message}</p>}
      {saveState.status === "error" && <p role="alert">{saveState.message}</p>}
      {state.status === "loading" && <p>Loading widgets...</p>}
      {state.status === "error" && <p role="alert">Widget request failed: {state.error}</p>}
      {state.status === "success" && items.length === 0 && <p>No widgets found.</p>}
      {state.status === "success" && items.length > 0 && (
        <ul>
          {items.map((item) => (
            <li key={item.widget_id} style={{ marginBottom: "0.5rem" }}>
              <strong>{item.title}</strong> ({item.status})
              <div>{item.description}</div>
              <button type="button" onClick={() => removeWidget(item.widget_id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
