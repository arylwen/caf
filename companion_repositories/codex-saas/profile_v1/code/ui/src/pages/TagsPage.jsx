// CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
// CAF_TRACE: task_id=TG-25-ui-page-tags
// CAF_TRACE: capability=ui_frontend_scaffolding
// CAF_TRACE: instance=codex-saas

import React from "react";
import { apiGet, apiPost } from "../api.js";

export function TagsPage() {
  const [items, setItems] = React.useState([]);
  const [state, setState] = React.useState({ status: "idle", error: "" });
  const [label, setLabel] = React.useState("");
  const [saveMessage, setSaveMessage] = React.useState("");

  const load = React.useCallback(async () => {
    setState({ status: "loading", error: "" });
    try {
      const response = await apiGet("/api/tags");
      setItems(Array.isArray(response.items) ? response.items : []);
      setState({ status: "success", error: "" });
    } catch (error) {
      setState({ status: "error", error: String(error.message || error) });
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function createTag(event) {
    event.preventDefault();
    setSaveMessage("Creating tag...");
    try {
      await apiPost("/api/tags", { label });
      setLabel("");
      setSaveMessage("Tag created.");
      await load();
    } catch (error) {
      setSaveMessage(String(error.message || error));
    }
  }

  return (
    <section>
      <h2>Tags</h2>
      <p>Create and list tags used to organize widgets.</p>
      <form onSubmit={createTag} style={{ marginBottom: "1rem" }}>
        <label>
          Label
          <input required value={label} onChange={(event) => setLabel(event.target.value)} />
        </label>
        <button type="submit" style={{ marginLeft: "0.5rem" }}>
          Create tag
        </button>
      </form>
      {saveMessage && <p>{saveMessage}</p>}
      {state.status === "loading" && <p>Loading tags...</p>}
      {state.status === "error" && <p role="alert">Tag request failed: {state.error}</p>}
      {state.status === "success" && items.length === 0 && <p>No tags found.</p>}
      {state.status === "success" && items.length > 0 && (
        <ul>
          {items.map((item) => (
            <li key={item.tag_id}>{item.label}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
