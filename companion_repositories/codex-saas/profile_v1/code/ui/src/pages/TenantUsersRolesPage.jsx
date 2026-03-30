// CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
// CAF_TRACE: task_id=TG-25-ui-page-tenant_users_roles
// CAF_TRACE: capability=ui_frontend_scaffolding
// CAF_TRACE: instance=codex-saas

import React from "react";
import { apiDelete, apiGet, apiPost } from "../api.js";

export function TenantUsersRolesPage() {
  const [items, setItems] = React.useState([]);
  const [state, setState] = React.useState({ status: "idle", error: "" });
  const [form, setForm] = React.useState({ user_id: "", role_id: "" });
  const [saveMessage, setSaveMessage] = React.useState("");

  const load = React.useCallback(async () => {
    setState({ status: "loading", error: "" });
    try {
      const response = await apiGet("/api/tenant_users_roles");
      setItems(Array.isArray(response.items) ? response.items : []);
      setState({ status: "success", error: "" });
    } catch (error) {
      setState({ status: "error", error: String(error.message || error) });
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function createAssignment(event) {
    event.preventDefault();
    setSaveMessage("Saving assignment...");
    try {
      await apiPost("/api/tenant_users_roles", {
        user_id: form.user_id,
        role_id: form.role_id,
      });
      setForm({ user_id: "", role_id: "" });
      setSaveMessage("Assignment created.");
      await load();
    } catch (error) {
      setSaveMessage(String(error.message || error));
    }
  }

  async function deleteAssignment(assignmentId) {
    try {
      await apiDelete(`/api/tenant_users_roles/${encodeURIComponent(assignmentId)}`);
      await load();
    } catch (error) {
      setSaveMessage(String(error.message || error));
    }
  }

  return (
    <section>
      <h2>Tenant Users and Roles</h2>
      <p>Assign and remove tenant role grants for users.</p>
      <form onSubmit={createAssignment} style={{ display: "grid", gap: "0.5rem", marginBottom: "1rem" }}>
        <label>
          User ID
          <input required value={form.user_id} onChange={(event) => setForm((current) => ({ ...current, user_id: event.target.value }))} />
        </label>
        <label>
          Role ID
          <input required value={form.role_id} onChange={(event) => setForm((current) => ({ ...current, role_id: event.target.value }))} />
        </label>
        <button type="submit">Assign role</button>
      </form>
      {saveMessage && <p>{saveMessage}</p>}
      {state.status === "loading" && <p>Loading tenant role assignments...</p>}
      {state.status === "error" && <p role="alert">Tenant role request failed: {state.error}</p>}
      {state.status === "success" && items.length === 0 && <p>No assignments found.</p>}
      {state.status === "success" && items.length > 0 && (
        <ul>
          {items.map((item) => (
            <li key={item.tenant_user_role_id}>
              {item.user_id} - {item.role_id}
              <button type="button" onClick={() => deleteAssignment(item.tenant_user_role_id)} style={{ marginLeft: "0.5rem" }}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
