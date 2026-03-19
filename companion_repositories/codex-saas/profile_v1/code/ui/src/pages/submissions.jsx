// CAF_TRACE: task_id=TG-25-ui-page-submissions capability=ui_frontend_scaffolding trace_anchor=pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source
import { useEffect, useState } from "react";
import { createSubmission, listSubmissions, updateSubmission } from "../api.js";

export default function SubmissionsPage({ persona, selectedWorkspaceId }) {
  const [submissions, setSubmissions] = useState([]);
  const [listStatus, setListStatus] = useState("loading");
  const [listError, setListError] = useState("");
  const [createForm, setCreateForm] = useState({
    title: "",
    source_uri: "",
    status: "submitted"
  });
  const [createStatus, setCreateStatus] = useState("idle");
  const [createMessage, setCreateMessage] = useState("");
  const [updateForm, setUpdateForm] = useState({
    submission_id: "",
    title: "",
    source_uri: "",
    status: "in_review"
  });
  const [updateStatus, setUpdateStatus] = useState("idle");
  const [updateMessage, setUpdateMessage] = useState("");

  const loadSubmissions = async () => {
    setListStatus("loading");
    setListError("");
    try {
      const payload = await listSubmissions(persona, selectedWorkspaceId);
      const rows = Array.isArray(payload) ? payload : (Array.isArray(payload?.items) ? payload.items : []);
      setSubmissions(rows);
      setListStatus(rows.length === 0 ? "empty" : "success");
      if (rows.length > 0 && !updateForm.submission_id) {
        const first = rows[0];
        setUpdateForm({
          submission_id: first.submission_id,
          title: first.title || "",
          source_uri: first.source_uri || "",
          status: first.status || "in_review"
        });
      }
    } catch (requestError) {
      setSubmissions([]);
      setListStatus("failure");
      setListError(requestError.message || "Failed to load submissions");
    }
  };

  useEffect(() => {
    void loadSubmissions();
  }, [persona, selectedWorkspaceId]);

  const handleCreateSubmit = async (event) => {
    event.preventDefault();
    if (!selectedWorkspaceId) {
      setCreateStatus("failure");
      setCreateMessage("Select a workspace before creating submissions.");
      return;
    }
    setCreateStatus("loading");
    setCreateMessage("");
    try {
      const created = await createSubmission(
        {
          workspace_id: selectedWorkspaceId,
          title: createForm.title,
          source_uri: createForm.source_uri,
          status: createForm.status
        },
        persona
      );
      setCreateStatus("success");
      setCreateMessage(`Submission created: ${created.submission_id}`);
      setCreateForm({
        title: "",
        source_uri: "",
        status: "submitted"
      });
      await loadSubmissions();
    } catch (requestError) {
      setCreateStatus("failure");
      setCreateMessage(requestError.message || "Submission create failed");
    }
  };

  const handleUpdateSubmit = async (event) => {
    event.preventDefault();
    if (!updateForm.submission_id) {
      setUpdateStatus("failure");
      setUpdateMessage("Choose a submission before updating.");
      return;
    }
    setUpdateStatus("loading");
    setUpdateMessage("");
    try {
      const updated = await updateSubmission(
        updateForm.submission_id,
        {
          title: updateForm.title,
          source_uri: updateForm.source_uri,
          status: updateForm.status
        },
        persona
      );
      setUpdateStatus("success");
      setUpdateMessage(`Submission updated: ${updated.submission_id}`);
      await loadSubmissions();
    } catch (requestError) {
      setUpdateStatus("failure");
      setUpdateMessage(requestError.message || "Submission update failed");
    }
  };

  return (
    <section>
      <h2>Submissions</h2>
      <p>Workspace-scoped submissions are listed and edited through the shared API helper.</p>
      <p><strong>Current workspace_id:</strong> {selectedWorkspaceId || "none selected"}</p>
      <button type="button" onClick={loadSubmissions}>Refresh submissions</button>
      {listStatus === "loading" && <p>Loading submission list...</p>}
      {listStatus === "empty" && <p>No submissions found for the selected workspace.</p>}
      {listStatus === "failure" && <p role="alert">Submissions list failed: {listError}</p>}
      {listStatus === "success" && (
        <ul>
          {submissions.map((submission) => (
            <li key={submission.submission_id}>
              <button
                type="button"
                onClick={() =>
                  setUpdateForm({
                    submission_id: submission.submission_id,
                    title: submission.title || "",
                    source_uri: submission.source_uri || "",
                    status: submission.status || "in_review"
                  })
                }
              >
                Edit submission_id {submission.submission_id}
              </button>
              {" "}
              <strong>{submission.title}</strong>
              {" "}
              <span>(status: {submission.status})</span>
            </li>
          ))}
        </ul>
      )}
      <section>
        <h3>Create submission</h3>
        <form onSubmit={handleCreateSubmit}>
          <label htmlFor="submission-create-title">Title</label>
          <input
            id="submission-create-title"
            value={createForm.title}
            onChange={(event) => setCreateForm((current) => ({ ...current, title: event.target.value }))}
            required
          />
          <label htmlFor="submission-create-source">Source URI</label>
          <input
            id="submission-create-source"
            value={createForm.source_uri}
            onChange={(event) => setCreateForm((current) => ({ ...current, source_uri: event.target.value }))}
          />
          <label htmlFor="submission-create-status">Status</label>
          <select
            id="submission-create-status"
            value={createForm.status}
            onChange={(event) => setCreateForm((current) => ({ ...current, status: event.target.value }))}
          >
            <option value="draft">draft</option>
            <option value="submitted">submitted</option>
            <option value="in_review">in_review</option>
          </select>
          <button type="submit">Create submission</button>
        </form>
        {createStatus === "loading" && <p>Submitting new submission...</p>}
        {createStatus === "success" && <p>{createMessage}</p>}
        {createStatus === "failure" && <p role="alert">Create failed: {createMessage}</p>}
      </section>
      <section>
        <h3>Update submission</h3>
        <p>Selected submission_id: {updateForm.submission_id || "none selected"}</p>
        <form onSubmit={handleUpdateSubmit}>
          <label htmlFor="submission-update-title">Title</label>
          <input
            id="submission-update-title"
            value={updateForm.title}
            onChange={(event) => setUpdateForm((current) => ({ ...current, title: event.target.value }))}
            required
          />
          <label htmlFor="submission-update-source">Source URI</label>
          <input
            id="submission-update-source"
            value={updateForm.source_uri}
            onChange={(event) => setUpdateForm((current) => ({ ...current, source_uri: event.target.value }))}
          />
          <label htmlFor="submission-update-status">Status</label>
          <select
            id="submission-update-status"
            value={updateForm.status}
            onChange={(event) => setUpdateForm((current) => ({ ...current, status: event.target.value }))}
          >
            <option value="draft">draft</option>
            <option value="submitted">submitted</option>
            <option value="in_review">in_review</option>
            <option value="approved">approved</option>
            <option value="rejected">rejected</option>
          </select>
          <button type="submit">Update submission</button>
        </form>
        {updateStatus === "loading" && <p>Submitting submission update...</p>}
        {updateStatus === "success" && <p>{updateMessage}</p>}
        {updateStatus === "failure" && <p role="alert">Update failed: {updateMessage}</p>}
      </section>
    </section>
  );
}
