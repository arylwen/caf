// CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
// CAF_TRACE: task_id=UX-TG-40-collections-workspace-and-publish-actions
// CAF_TRACE: capability=ux_frontend_realization
// CAF_TRACE: instance=codex-saas
// CAF_TRACE: trace_anchor=pattern_id:UX-REVIEW-01

import React from "react";

import { listCollectionPermissions, updateCollectionPermission } from "../api.js";

export function PublishedPage({ authState }) {
  const [permissions, setPermissions] = React.useState([]);
  const [status, setStatus] = React.useState({ state: "loading", message: "Loading publish evidence..." });

  const refresh = React.useCallback(async () => {
    setStatus({ state: "loading", message: "Refreshing publish records..." });
    try {
      const items = await listCollectionPermissions(authState);
      setPermissions(items);
      setStatus({ state: "ready", message: `${items.length} permission record(s).` });
    } catch (error) {
      setStatus({ state: "error", message: error.message || String(error) });
    }
  }, [authState]);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const toggleAccess = async (permission) => {
    const next = permission.access_level === "edit" ? "view" : "edit";
    const confirmed = window.confirm(`Change access to ${next}?`);
    if (!confirmed) {
      return;
    }

    setStatus({ state: "loading", message: "Applying permission update..." });
    try {
      await updateCollectionPermission(
        permission.collection_permission_id,
        {
          collection_id: permission.collection_id,
          role_name: permission.role_name,
          access_level: next,
        },
        authState,
      );
      await refresh();
      setStatus({ state: "success", message: "Permission update confirmed." });
    } catch (error) {
      setStatus({ state: "error", message: error.message || String(error) });
    }
  };

  return (
    <section className="page-frame">
      <header className="page-header">
        <div>
          <h2>Sharing and permissions</h2>
          <p>Review and confirm role-level publish posture with explicit consequences.</p>
        </div>
        <button className="button-quiet" type="button" onClick={refresh}>
          Refresh
        </button>
      </header>

      <section className="status-rail">
        <div className={`status-pill status-${status.state}`}>{status.state}</div>
        <p>{status.message}</p>
      </section>

      <section className="list-card table-wrap">
        <h3>Published role mappings</h3>
        {permissions.length === 0 ? (
          <p className="recovery-note">No publish mappings yet. Add one from Collections.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Collection</th>
                <th>Role</th>
                <th>Access</th>
                <th>Updated</th>
                <th>Confirmable change</th>
              </tr>
            </thead>
            <tbody>
              {permissions.map((permission) => (
                <tr key={permission.collection_permission_id}>
                  <td>{permission.collection_id}</td>
                  <td>{permission.role_name}</td>
                  <td>{permission.access_level}</td>
                  <td>{permission.updated_at || permission.created_at || "n/a"}</td>
                  <td>
                    <button className="button-quiet" type="button" onClick={() => toggleAccess(permission)}>
                      Toggle access
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </section>
  );
}
