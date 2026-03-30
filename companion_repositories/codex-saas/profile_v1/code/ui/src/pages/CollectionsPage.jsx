// CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
// CAF_TRACE: task_id=TG-25-ui-page-collections
// CAF_TRACE: capability=ui_frontend_scaffolding
// CAF_TRACE: instance=codex-saas

import React from "react";
import { apiGet, apiPost } from "../api.js";

export function CollectionsPage() {
  const [items, setItems] = React.useState([]);
  const [state, setState] = React.useState({ status: "idle", error: "" });
  const [form, setForm] = React.useState({ name: "", description: "" });
  const [saveMessage, setSaveMessage] = React.useState("");

  const load = React.useCallback(async () => {
    setState({ status: "loading", error: "" });
    try {
      const response = await apiGet("/api/collections");
      setItems(Array.isArray(response.items) ? response.items : []);
      setState({ status: "success", error: "" });
    } catch (error) {
      setState({ status: "error", error: String(error.message || error) });
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function createCollection(event) {
    event.preventDefault();
    setSaveMessage("Saving collection...");
    try {
      await apiPost("/api/collections", {
        name: form.name,
        description: form.description,
        published: false,
      });
      setForm({ name: "", description: "" });
      setSaveMessage("Collection created.");
      await load();
    } catch (error) {
      setSaveMessage(String(error.message || error));
    }
  }

  return (
    <section>
      <h2>Collections</h2>
      <p>Create and inspect collections for widget publishing workflows.</p>
      <form onSubmit={createCollection} style={{ display: "grid", gap: "0.5rem", marginBottom: "1rem" }}>
        <label>
          Name
          <input required value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
        </label>
        <label>
          Description
          <textarea
            required
            value={form.description}
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
          />
        </label>
        <button type="submit">New collection</button>
      </form>
      {saveMessage && <p>{saveMessage}</p>}
      {state.status === "loading" && <p>Loading collections...</p>}
      {state.status === "error" && <p role="alert">Collection request failed: {state.error}</p>}
      {state.status === "success" && items.length === 0 && <p>No collections found.</p>}
      {state.status === "success" && items.length > 0 && (
        <ul>
          {items.map((item) => (
            <li key={item.collection_id}>
              <strong>{item.name}</strong> ({item.published ? "published" : "draft"})
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
