// CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
// CAF_TRACE: task_id=UX-TG-50-admin-and-activity-surfaces
// CAF_TRACE: capability=ux_frontend_realization
// CAF_TRACE: instance=codex-saas
// CAF_TRACE: trace_anchor=pattern_id:product_action:manage_roles

import React from "react";

import {
  createTenantUserRole,
  deleteTenantUserRole,
  getTenantSettings,
  listTenantUsersRoles,
  updateTenantSettings,
} from "../api.js";

export function AdminPage({ authState }) {
  const [roles, setRoles] = React.useState([]);
  const [settings, setSettings] = React.useState({});
  const [roleDraft, setRoleDraft] = React.useState({ user_id: "", role_name: "member" });
  const [status, setStatus] = React.useState({ state: "loading", message: "Loading tenant admin surfaces..." });

  const refresh = React.useCallback(async () => {
    setStatus({ state: "loading", message: "Refreshing admin state..." });
    try {
      const [roleItems, settingsPayload] = await Promise.all([listTenantUsersRoles(authState), getTenantSettings(authState)]);
      setRoles(roleItems);
      setSettings(settingsPayload.settings || {});
      setStatus({ state: "ready", message: "Admin state loaded." });
    } catch (error) {
      setStatus({ state: "error", message: error.message || String(error) });
    }
  }, [authState]);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const submitRole = async (event) => {
    event.preventDefault();
    setStatus({ state: "loading", message: "Saving role assignment..." });
    try {
      await createTenantUserRole(roleDraft, authState);
      setRoleDraft({ user_id: "", role_name: "member" });
      await refresh();
      setStatus({ state: "success", message: "Role assignment saved." });
    } catch (error) {
      setStatus({ state: "error", message: error.message || String(error) });
    }
  };

  const removeRole = async (assignment) => {
    const confirmed = window.confirm("Revoke selected role assignment?");
    if (!confirmed) {
      return;
    }

    setStatus({ state: "loading", message: "Removing role assignment..." });
    try {
      await deleteTenantUserRole(assignment.tenant_user_role_id, authState);
      await refresh();
      setStatus({ state: "success", message: "Role assignment revoked." });
    } catch (error) {
      setStatus({ state: "error", message: error.message || String(error) });
    }
  };

  const saveSettings = async () => {
    setStatus({ state: "loading", message: "Updating tenant settings..." });
    try {
      await updateTenantSettings({ settings }, authState);
      setStatus({ state: "success", message: "Tenant settings updated." });
    } catch (error) {
      setStatus({ state: "error", message: error.message || String(error) });
    }
  };

  return (
    <section className="page-frame">
      <header className="page-header">
        <div>
          <h2>Tenant admin</h2>
          <p>Manage roles and tenant settings with explicit, controlled actions.</p>
        </div>
        <div className="inline-actions">
          <button className="button-primary" type="button" onClick={() => document.getElementById("manage-roles")?.scrollIntoView({ behavior: "smooth" })}>
            Manage roles
          </button>
          <button className="button-quiet" type="button" onClick={refresh}>
            Refresh
          </button>
        </div>
      </header>

      <section className="status-rail">
        <div className={`status-pill status-${status.state}`}>{status.state}</div>
        <p>{status.message}</p>
      </section>

      <section className="surface-grid" id="manage-roles">
        <article className="form-card">
          <h3>Manage roles</h3>
          <form className="form-grid" onSubmit={submitRole}>
            <label className="field-row">
              User ID
              <input
                required
                value={roleDraft.user_id}
                onChange={(event) => setRoleDraft((current) => ({ ...current, user_id: event.target.value }))}
              />
            </label>
            <label className="field-row">
              Role
              <select
                value={roleDraft.role_name}
                onChange={(event) => setRoleDraft((current) => ({ ...current, role_name: event.target.value }))}
              >
                <option value="member">Member</option>
                <option value="lead">Lead</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            <button className="button-primary" type="submit">
              Save role assignment
            </button>
          </form>
        </article>

        <article className="list-card table-wrap">
          <h3>Role assignments</h3>
          {roles.length === 0 ? (
            <p className="recovery-note">No role assignments found.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Updated</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((assignment) => (
                  <tr key={assignment.tenant_user_role_id}>
                    <td>{assignment.user_id || assignment.principal_id || "unknown"}</td>
                    <td>{assignment.role_name || "member"}</td>
                    <td>{assignment.updated_at || assignment.created_at || "n/a"}</td>
                    <td>
                      <button className="button-danger" type="button" onClick={() => removeRole(assignment)}>
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </article>
      </section>

      <section className="form-card">
        <h3>Tenant settings</h3>
        <div className="form-grid">
          <label className="field-row">
            Support contact
            <input
              value={settings.support_contact || ""}
              onChange={(event) => setSettings((current) => ({ ...current, support_contact: event.target.value }))}
            />
          </label>
          <label className="field-row">
            Default publish posture
            <select
              value={settings.default_publish_posture || "review_required"}
              onChange={(event) => setSettings((current) => ({ ...current, default_publish_posture: event.target.value }))}
            >
              <option value="review_required">Review required</option>
              <option value="auto_publish_lead">Auto-publish by lead</option>
            </select>
          </label>
          <button className="button-primary" type="button" onClick={saveSettings}>
            Update settings
          </button>
        </div>
      </section>
    </section>
  );
}
