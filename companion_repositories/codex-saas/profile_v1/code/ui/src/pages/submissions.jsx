// CAF_TRACE: generated_by=Contura Architecture Framework (CAF); task_id=TG-25-ui-page-submissions; capability=ui_frontend_scaffolding; instance=codex-saas; trace_anchor=pattern_obligation_id:OBL-UI-PAGE-submissions
import { useMemo, useState } from "react";

import { createSubmission, listSubmissions, updateSubmission } from "../api.js";

export default function SubmissionsPage({ tenantId, principalId }) {
  const [workspaceId, setWorkspaceId] = useState("ws-0001");
  const [title, setTitle] = useState("Submission A");
  const [submissionId, setSubmissionId] = useState("sub-0001");
  const [status, setStatus] = useState("submitted");
  const [result, setResult] = useState(null);
  const context = useMemo(() => ({ tenantId, principalId }), [tenantId, principalId]);
  const listCall = listSubmissions(context);

  return (
    <section>
      <h3>Submissions</h3>
      <p>Tenant-scoped list/create/update scaffold aligned to AP submissions workflow contracts.</p>
      <pre>{JSON.stringify(listCall, null, 2)}</pre>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setResult(createSubmission(context, { workspaceId, title }));
        }}
      >
        <label>
          Workspace id
          <input value={workspaceId} onChange={(event) => setWorkspaceId(event.target.value)} />
        </label>
        <label>
          Submission title
          <input value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>
        <button type="submit">Create Submission</button>
      </form>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setResult(updateSubmission(context, submissionId, { status }));
        }}
      >
        <label>
          Submission id
          <input value={submissionId} onChange={(event) => setSubmissionId(event.target.value)} />
        </label>
        <label>
          New status
          <input value={status} onChange={(event) => setStatus(event.target.value)} />
        </label>
        <button type="submit">Update Submission</button>
      </form>
      {result ? <pre>{JSON.stringify(result, null, 2)}</pre> : null}
    </section>
  );
}
