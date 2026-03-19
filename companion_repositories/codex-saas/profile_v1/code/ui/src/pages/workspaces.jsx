// CAF_TRACE: task_id=TG-25-ui-page-workspaces capability=ui_frontend_scaffolding trace_anchor=pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source
import { useEffect, useMemo, useState } from "react";
import { createWorkspace, listWorkspaces, updateWorkspace } from "../api.js";

const EMPTY_CREATE_FORM = {
  name: "",
  description: "",
  status: "active"
};

export default function WorkspacesPage({ persona, selectedWorkspaceId, onWorkspaceSelected }) {
  const [workspaces, setWorkspaces] = useState([]);
  const [listStatus, setListStatus] = useState("loading");
  const [listError, setListError] = useState("");
  const [createForm, setCreateForm] = useState(EMPTY_CREATE_FORM);
  const [createStatus, setCreateStatus] = useState("idle");
  const [createMessage, setCreateMessage] = useState("");
  const [updateForm, setUpdateForm] = useState({
    workspace_id: "",
    name: "",
    description: "",
    status: "active"
  });
  const [updateStatus, setUpdateStatus] = useState("idle");
  const [updateMessage, setUpdateMessage] = useState("");

  const selectedWorkspace = useMemo(
    () => workspaces.find((workspace) => workspace.workspace_id === selectedWorkspaceId) || null,
    [selectedWorkspaceId, workspaces]
  );

  const loadWorkspaces = async () => {
    setListStatus("loading");
    setListError("");
    try {
      const payload = await listWorkspaces(persona);
      const rows = Array.isArray(payload) ? payload : (Array.isArray(payload?.items) ? payload.items : []);
      setWorkspaces(rows);
      if (rows.length === 0) {
        setListStatus("empty");
        onWorkspaceSelected("");
        return;
      }
      setListStatus("success");
      if (!selectedWorkspaceId) {
        onWorkspaceSelected(rows[0].workspace_id);
      }
    } catch (requestError) {
      setWorkspaces([]);
      setListStatus("failure");
      setListError(requestError.message || "Failed to load workspaces");
    }
  };

  useEffect(() => {
    void loadWorkspaces();
  }, [persona]);

  useEffect(() => {
    if (!selectedWorkspace) {
      setUpdateForm({
        workspace_id: "",
        name: "",
        description: "",
        status: "active"
      });
      return;
    }
    setUpdateForm({
      workspace_id: selectedWorkspace.workspace_id || "",
      name: selectedWorkspace.name || "",
      description: selectedWorkspace.description || "",
      status: selectedWorkspace.status || "active"
    });
  }, [selectedWorkspace]);

  const handleCreateSubmit = async (event) => {
    event.preventDefault();
    setCreateStatus("loading");
    setCreateMessage("");
    try {
      const created = await createWorkspace({
        name: createForm.name,
        description: createForm.description,
        status: createForm.status
      }, persona);
      setCreateStatus("success");
      setCreateMessage(`Workspace created${created?.workspace_id ? `: ${created.workspace_id}` : ""}.`);
      setCreateForm(EMPTY_CREATE_FORM);
      await loadWorkspaces();
      if (created?.workspace_id) {
        onWorkspaceSelected(created.workspace_id);
      }
    } catch (requestError) {
      setCreateStatus("failure");
      setCreateMessage(requestError.message || "Workspace create failed");
    }
  };

  const handleUpdateSubmit = async (event) => {
    event.preventDefault();
    if (!updateForm.workspace_id) {
      setUpdateStatus("failure");
      setUpdateMessage("Select a workspace before updating.");
      return;
    }
    setUpdateStatus("loading");
    setUpdateMessage("");
    try {
      const updated = await updateWorkspace(updateForm.workspace_id, {
        name: updateForm.name,
        description: updateForm.description,
        status: updateForm.status
      }, persona);
      setUpdateStatus("success");
      setUpdateMessage(`Workspace updated${updated?.workspace_id ? `: ${updated.workspace_id}` : ""}.`);
      await loadWorkspaces();
      onWorkspaceSelected(updateForm.workspace_id);
    } catch (requestError) {
      setUpdateStatus("failure");
      setUpdateMessage(requestError.message || "Workspace update failed");
    }
  };

  return (
    <section>
      <h2>Workspaces</h2>
      <p>Tenant-scoped workspace list/create/update interactions are wired through the shared API helper.</p>
      <button type="button" onClick={loadWorkspaces}>Refresh workspaces</button>

      {listStatus === "loading" && <p>Loading workspace list...</p>}
      {listStatus === "empty" && <p>No workspaces found for this tenant.</p>}
      {listStatus === "failure" && <p role="alert">Workspace list failed: {listError}</p>}
      {listStatus === "success" && (
        <div>
          <h3>Workspace list</h3>
          <ul>
            {workspaces.map((workspace) => (
              <li key={workspace.workspace_id}>
                <button type="button" onClick={() => onWorkspaceSelected(workspace.workspace_id)}>
                  Use workspace_id {workspace.workspace_id}
                </button>
                {" "}
                <strong>{workspace.name || "Untitled workspace"}</strong>
                {" "}
                <span>(status: {workspace.status || "unknown"})</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <section>
        <h3>Create workspace</h3>
        <form onSubmit={handleCreateSubmit}>
          <label htmlFor="workspace-create-name">Name</label>
          <input
            id="workspace-create-name"
            value={createForm.name}
            onChange={(event) => setCreateForm((current) => ({ ...current, name: event.target.value }))}
            required
          />
          <label htmlFor="workspace-create-description">Description</label>
          <textarea
            id="workspace-create-description"
            value={createForm.description}
            onChange={(event) => setCreateForm((current) => ({ ...current, description: event.target.value }))}
          />
          <label htmlFor="workspace-create-status">Status</label>
          <select
            id="workspace-create-status"
            value={createForm.status}
            onChange={(event) => setCreateForm((current) => ({ ...current, status: event.target.value }))}
          >
            <option value="active">active</option>
            <option value="archived">archived</option>
          </select>
          <button type="submit">Create workspace</button>
        </form>
        {createStatus === "loading" && <p>Submitting workspace create...</p>}
        {createStatus === "success" && <p>{createMessage}</p>}
        {createStatus === "failure" && <p role="alert">Create failed: {createMessage}</p>}
      </section>

      <section>
        <h3>Update workspace</h3>
        <p>Selected workspace_id: {selectedWorkspaceId || "none selected"}</p>
        <form onSubmit={handleUpdateSubmit}>
          <label htmlFor="workspace-update-name">Name</label>
          <input
            id="workspace-update-name"
            value={updateForm.name}
            onChange={(event) => setUpdateForm((current) => ({ ...current, name: event.target.value }))}
            required
          />
          <label htmlFor="workspace-update-description">Description</label>
          <textarea
            id="workspace-update-description"
            value={updateForm.description}
            onChange={(event) => setUpdateForm((current) => ({ ...current, description: event.target.value }))}
          />
          <label htmlFor="workspace-update-status">Status</label>
          <select
            id="workspace-update-status"
            value={updateForm.status}
            onChange={(event) => setUpdateForm((current) => ({ ...current, status: event.target.value }))}
          >
            <option value="active">active</option>
            <option value="archived">archived</option>
          </select>
          <button type="submit">Update workspace</button>
        </form>
        {updateStatus === "loading" && <p>Submitting workspace update...</p>}
        {updateStatus === "success" && <p>{updateMessage}</p>}
        {updateStatus === "failure" && <p role="alert">Update failed: {updateMessage}</p>}
      </section>
    </section>
  );
}
