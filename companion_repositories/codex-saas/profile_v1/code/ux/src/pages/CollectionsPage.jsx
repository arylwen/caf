// CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
// CAF_TRACE: task_id=UX-TG-40-collections-and-sharing-surface
// CAF_TRACE: capability=ux_frontend_realization
// CAF_TRACE: instance=codex-saas

import React, { useState } from "react";

import {
  createCollection,
  createCollectionMembership,
  listCollectionMemberships,
  listCollectionPermissions,
  listCollections,
  updateCollection,
  updateCollectionPermission,
} from "../api";
import { StatusBlock } from "../components/StatusBlock";

function makeState() {
  return { status: "idle", message: "" };
}

export function CollectionsPage({ personaKey, activeCollectionId, onCollectionFocus }) {
  const [status, setStatus] = useState(makeState);
  const [collections, setCollections] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newWidgetId, setNewWidgetId] = useState("");
  const [roleId, setRoleId] = useState("catalog_editor");

  async function refreshCollections() {
    setStatus({ status: "loading", message: "" });
    try {
      const [collectionPayload, membershipPayload, permissionPayload] = await Promise.all([
        listCollections(personaKey),
        listCollectionMemberships(personaKey),
        listCollectionPermissions(personaKey),
      ]);
      setCollections(collectionPayload.items || []);
      setMemberships(membershipPayload.items || []);
      setPermissions(permissionPayload.items || []);
      setStatus({ status: collectionPayload.items?.length ? "success" : "empty", message: "" });
    } catch (error) {
      setStatus({ status: "error", message: `Collection workspace load failed: ${error.message}` });
    }
  }

  async function handleCreateCollection() {
    if (!newCollectionName.trim()) {
      setStatus({ status: "error", message: "Collection name is required." });
      return;
    }
    setStatus({ status: "loading", message: "" });
    try {
      const payload = await createCollection(personaKey, {
        name: newCollectionName.trim(),
        description: "Created in collections workspace",
        published: false,
      });
      if (payload.item?.id) {
        onCollectionFocus(payload.item.id);
      }
      setNewCollectionName("");
      await refreshCollections();
    } catch (error) {
      setStatus({ status: "error", message: `Create collection failed: ${error.message}` });
    }
  }

  async function handlePublishCollection() {
    if (!activeCollectionId) {
      setStatus({ status: "error", message: "Select a collection before publishing." });
      return;
    }
    setStatus({ status: "loading", message: "" });
    try {
      await updateCollection(personaKey, activeCollectionId, { published: true });
      await refreshCollections();
      setStatus({ status: "success", message: "" });
    } catch (error) {
      setStatus({ status: "error", message: `Publish denied or failed: ${error.message}` });
    }
  }

  async function handleAddMembership() {
    if (!activeCollectionId || !newWidgetId.trim()) {
      setStatus({ status: "error", message: "Select a collection and provide widget id." });
      return;
    }
    setStatus({ status: "loading", message: "" });
    try {
      await createCollectionMembership(personaKey, {
        collection_id: activeCollectionId,
        widget_id: newWidgetId.trim(),
      });
      setNewWidgetId("");
      await refreshCollections();
    } catch (error) {
      setStatus({ status: "error", message: `Membership update failed: ${error.message}` });
    }
  }

  async function handlePermissionUpdate(permissionId) {
    setStatus({ status: "loading", message: "" });
    try {
      await updateCollectionPermission(personaKey, permissionId, { role_id: roleId });
      await refreshCollections();
    } catch (error) {
      setStatus({ status: "error", message: `Permission update denied: ${error.message}` });
    }
  }

  return (
    <section className="ux-stack">
      <article className="ux-panel">
        <h3>Collections workspace</h3>
        <div className="ux-toolbar">
          <button type="button" onClick={refreshCollections}>
            Refresh Workspace
          </button>
          <button type="button" className="ux-action-button" onClick={handlePublishCollection}>
            Publish Collection
          </button>
        </div>
        <StatusBlock
          state={status}
          labels={{
            loading: "Loading collections, memberships, and sharing permissions...",
            empty: "No collections available for this tenant.",
            success: "Collections workspace is ready.",
          }}
        />
      </article>

      <article className="ux-panel">
        <h3>Create collection</h3>
        <div className="ux-toolbar">
          <input
            type="text"
            value={newCollectionName}
            placeholder="Collection name"
            onChange={(event) => setNewCollectionName(event.target.value)}
          />
          <button type="button" onClick={handleCreateCollection}>
            Create
          </button>
        </div>
      </article>

      <article className="ux-panel">
        <h3>Collections</h3>
        {!collections.length ? <p className="ux-muted">No collection rows yet.</p> : null}
        <ul className="ux-list">
          {collections.map((item) => (
            <li key={item.id}>
              <button type="button" onClick={() => onCollectionFocus(item.id)}>
                {item.name || item.id}
              </button>
              <span className="ux-chip">{item.published ? "published" : "draft"}</span>
            </li>
          ))}
        </ul>
      </article>

      <article className="ux-panel">
        <h3>Membership and sharing</h3>
        <p>Focused collection: {activeCollectionId || "none"}</p>
        <div className="ux-toolbar">
          <input
            type="text"
            value={newWidgetId}
            placeholder="Widget id for membership"
            onChange={(event) => setNewWidgetId(event.target.value)}
          />
          <button type="button" onClick={handleAddMembership}>
            Add Membership
          </button>
        </div>
        <div className="ux-toolbar">
          <label htmlFor="role-select">Role target</label>
          <select id="role-select" value={roleId} onChange={(event) => setRoleId(event.target.value)}>
            <option value="catalog_editor">catalog_editor</option>
            <option value="tenant_admin">tenant_admin</option>
          </select>
        </div>
        <h4>Membership rows</h4>
        {!memberships.length ? <p className="ux-muted">No membership rows.</p> : null}
        <ul className="ux-list">
          {memberships.map((item) => (
            <li key={item.id}>
              {item.collection_id} - {item.widget_id}
            </li>
          ))}
        </ul>
        <h4>Permission rows</h4>
        {!permissions.length ? <p className="ux-muted">No permissions rows.</p> : null}
        <ul className="ux-list">
          {permissions.map((item) => (
            <li key={item.id}>
              <span>
                {item.collection_id} - {item.role_id}
              </span>
              <button type="button" onClick={() => handlePermissionUpdate(item.id)}>
                Update Role
              </button>
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
}
