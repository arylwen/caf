// CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
// CAF_TRACE: task_id=UX-TG-50-admin-and-activity-surface
// CAF_TRACE: capability=ux_frontend_realization
// CAF_TRACE: instance=codex-saas

import React, { useState } from "react";

import {
  createTenantRoleAssignment,
  deleteTenantRoleAssignment,
  listTenantRoleAssignments,
} from "../api";
import { StatusBlock } from "../components/StatusBlock";

function makeState() {
  return { status: "idle", message: "" };
}

export function AdminPage({ personaKey }) {
  const [status, setStatus] = useState(makeState);
  const [assignments, setAssignments] = useState([]);
  const [userId, setUserId] = useState("");
  const [roleId, setRoleId] = useState("catalog_editor");
  const [selectedAssignmentId, setSelectedAssignmentId] = useState("");

  async function refreshAssignments() {
    setStatus({ status: "loading", message: "" });
    try {
      const payload = await listTenantRoleAssignments(personaKey);
      const rows = payload.items || [];
      setAssignments(rows);
      setStatus({ status: rows.length ? "success" : "empty", message: "" });
    } catch (error) {
      setStatus({ status: "error", message: `Manage roles failed to load: ${error.message}` });
    }
  }

  async function assignRole() {
    if (!userId.trim()) {
      setStatus({ status: "error", message: "User id is required to assign a role." });
      return;
    }
    setStatus({ status: "loading", message: "" });
    try {
      const payload = await createTenantRoleAssignment(personaKey, {
        user_id: userId.trim(),
        role_id: roleId,
      });
      setUserId("");
      if (payload.item?.id) {
        setSelectedAssignmentId(payload.item.id);
      }
      await refreshAssignments();
    } catch (error) {
      setStatus({ status: "error", message: `Role assignment failed: ${error.message}` });
    }
  }

  async function removeRole() {
    if (!selectedAssignmentId) {
      setStatus({ status: "error", message: "Select an assignment before removal." });
      return;
    }
    setStatus({ status: "loading", message: "" });
    try {
      await deleteTenantRoleAssignment(personaKey, selectedAssignmentId);
      setSelectedAssignmentId("");
      await refreshAssignments();
    } catch (error) {
      setStatus({ status: "error", message: `Role removal denied or failed: ${error.message}` });
    }
  }

  return (
    <section className="ux-stack">
      <article className="ux-panel">
        <h3>Tenant admin</h3>
        <div className="ux-toolbar">
          <button type="button" onClick={refreshAssignments}>
            Refresh Admin Surface
          </button>
          <button type="button" className="ux-action-button" onClick={assignRole}>
            Manage Roles
          </button>
          <button type="button" onClick={removeRole}>
            Remove Role Assignment
          </button>
        </div>
        <StatusBlock
          state={status}
          labels={{
            loading: "Applying tenant role changes...",
            empty: "No role assignments currently returned.",
            success: "Tenant role assignments loaded.",
          }}
        />
      </article>

      <article className="ux-panel">
        <h3>Assign role</h3>
        <div className="ux-toolbar">
          <input
            type="text"
            value={userId}
            placeholder="user_id"
            onChange={(event) => setUserId(event.target.value)}
          />
          <select value={roleId} onChange={(event) => setRoleId(event.target.value)}>
            <option value="catalog_editor">catalog_editor</option>
            <option value="tenant_admin">tenant_admin</option>
          </select>
        </div>
      </article>

      <article className="ux-panel">
        <h3>Role assignments</h3>
        {!assignments.length ? <p className="ux-muted">No role assignments found.</p> : null}
        <ul className="ux-list">
          {assignments.map((item) => (
            <li key={item.id}>
              <button type="button" onClick={() => setSelectedAssignmentId(item.id)}>
                {item.user_id} - {item.role_id}
              </button>
              <span className="ux-chip">{item.id}</span>
            </li>
          ))}
        </ul>
        <p>Selected assignment id: {selectedAssignmentId || "none"}</p>
      </article>
    </section>
  );
}
