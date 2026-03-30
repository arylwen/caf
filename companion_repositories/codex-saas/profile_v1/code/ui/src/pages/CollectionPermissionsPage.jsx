// CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
// CAF_TRACE: task_id=TG-25-ui-page-collection_permissions
// CAF_TRACE: capability=ui_frontend_scaffolding
// CAF_TRACE: instance=codex-saas

import React from "react";
import { apiGet, apiPost } from "../api.js";

export function CollectionPermissionsPage() {
  const [items, setItems] = React.useState([]);
  const [state, setState] = React.useState({ status: "idle", error: "" });
  const [form, setForm] = React.useState({ collection_id: "", role_id: "", permission: "view" });
  const [saveMessage, setSaveMessage] = React.useState("");

  const load = React.useCallback(async () => {
    setState({ status: "loading", error: "" });
    try {
      const response = await apiGet("/api/collection_permissions");
      setItems(Array.isArray(response.items) ? response.items : []);
      setState({ status: "success", error: "" });
    } catch (error) {
      setState({ status: "error", error: String(error.message || error) });
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function createPermission(event) {
    event.preventDefault();
    setSaveMessage("Saving permission...");
    try {
      await apiPost("/api/collection_permissions", {
        collection_id: form.collection_id,
        role_id: form.role_id,
        permission: form.permission,
      });
      setForm({ collection_id: "", role_id: "", permission: "view" });
      setSaveMessage("Permission saved.");
      await load();
    } catch (error) {
      setSaveMessage(String(error.message || error));
    }
  }

  return (
    <section>
      <h2>Collection Permissions</h2>
      <p>Assign role-based collection access rules.</p>
      <form onSubmit={createPermission} style={{ display: "grid", gap: "0.5rem", marginBottom: "1rem" }}>
        <label>
          Collection ID
          <input required value={form.collection_id} onChange={(event) => setForm((current) => ({ ...current, collection_id: event.target.value }))} />
        </label>
        <label>
          Role ID
          <input required value={form.role_id} onChange={(event) => setForm((current) => ({ ...current, role_id: event.target.value }))} />
        </label>
        <label>
          Permission
          <select value={form.permission} onChange={(event) => setForm((current) => ({ ...current, permission: event.target.value }))}>
            <option value="view">view</option>
            <option value="edit">edit</option>
          </select>
        </label>
        <button type="submit">Grant permission</button>
      </form>
      {saveMessage && <p>{saveMessage}</p>}
      {state.status === "loading" && <p>Loading permissions...</p>}
      {state.status === "error" && <p role="alert">Permission request failed: {state.error}</p>}
      {state.status === "success" && items.length === 0 && <p>No permissions found.</p>}
      {state.status === "success" && items.length > 0 && (
        <ul>
          {items.map((item) => (
            <li key={item.collection_permission_id}>
              {item.collection_id} - {item.role_id}: {item.permission}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
