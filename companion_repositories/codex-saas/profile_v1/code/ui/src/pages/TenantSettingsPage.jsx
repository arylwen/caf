// CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
// CAF_TRACE: task_id=TG-25-ui-page-tenant_settings
// CAF_TRACE: capability=ui_frontend_scaffolding
// CAF_TRACE: instance=codex-saas

import React from "react";
import { apiGet, apiPut } from "../api.js";

export function TenantSettingsPage() {
  const [state, setState] = React.useState({ status: "idle", error: "" });
  const [settings, setSettings] = React.useState(null);
  const [form, setForm] = React.useState({ setting_key: "", setting_value: "" });
  const [saveMessage, setSaveMessage] = React.useState("");

  const load = React.useCallback(async () => {
    setState({ status: "loading", error: "" });
    try {
      const response = await apiGet("/api/tenant_settings");
      setSettings(response);
      setForm({
        setting_key: response.setting_key || "",
        setting_value: response.setting_value || "",
      });
      setState({ status: "success", error: "" });
    } catch (error) {
      setState({ status: "error", error: String(error.message || error) });
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function updateSettings(event) {
    event.preventDefault();
    setSaveMessage("Saving tenant settings...");
    try {
      const response = await apiPut("/api/tenant_settings", {
        setting_key: form.setting_key,
        setting_value: form.setting_value,
      });
      setSettings(response);
      setSaveMessage("Settings updated.");
    } catch (error) {
      setSaveMessage(String(error.message || error));
    }
  }

  return (
    <section>
      <h2>Tenant Settings</h2>
      <p>View and update tenant-level configuration.</p>
      {state.status === "loading" && <p>Loading tenant settings...</p>}
      {state.status === "error" && <p role="alert">Tenant settings request failed: {state.error}</p>}
      {state.status === "success" && settings && (
        <form onSubmit={updateSettings} style={{ display: "grid", gap: "0.5rem" }}>
          <label>
            Setting key
            <input required value={form.setting_key} onChange={(event) => setForm((current) => ({ ...current, setting_key: event.target.value }))} />
          </label>
          <label>
            Setting value
            <textarea
              required
              value={form.setting_value}
              onChange={(event) => setForm((current) => ({ ...current, setting_value: event.target.value }))}
            />
          </label>
          <button type="submit">Update settings</button>
        </form>
      )}
      {saveMessage && <p>{saveMessage}</p>}
    </section>
  );
}
