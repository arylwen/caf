// CAF_TRACE: task_id=TG-25-ui-page-reports capability=ui_frontend_scaffolding trace_anchor=pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source
import { useEffect, useState } from "react";
import { createReport, getReport, listReports } from "../api.js";

const EMPTY_CREATE_FORM = {
  submission_id: "",
  format: "html"
};

export default function ReportsPage({ persona }) {
  const [listFilterSubmissionId, setListFilterSubmissionId] = useState("");
  const [reports, setReports] = useState([]);
  const [listStatus, setListStatus] = useState("loading");
  const [listError, setListError] = useState("");

  const [lookupReportId, setLookupReportId] = useState("");
  const [lookupStatus, setLookupStatus] = useState("idle");
  const [lookupError, setLookupError] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);

  const [createForm, setCreateForm] = useState(EMPTY_CREATE_FORM);
  const [createStatus, setCreateStatus] = useState("idle");
  const [createMessage, setCreateMessage] = useState("");

  const loadReports = async (submissionId = listFilterSubmissionId) => {
    setListStatus("loading");
    setListError("");
    try {
      const payload = await listReports(persona, submissionId.trim());
      const rows = Array.isArray(payload) ? payload : (Array.isArray(payload?.items) ? payload.items : []);
      setReports(rows);
      setListStatus(rows.length === 0 ? "empty" : "success");
    } catch (requestError) {
      setReports([]);
      setListStatus("failure");
      setListError(requestError.message || "Failed to load reports");
    }
  };

  useEffect(() => {
    void loadReports("");
    setListFilterSubmissionId("");
  }, [persona]);

  const handleFilterSubmit = async (event) => {
    event.preventDefault();
    await loadReports(listFilterSubmissionId);
  };

  const handleLookupSubmit = async (event) => {
    event.preventDefault();
    if (!lookupReportId) {
      setLookupStatus("failure");
      setLookupError("Enter a report_id to load.");
      setSelectedReport(null);
      return;
    }
    setLookupStatus("loading");
    setLookupError("");
    try {
      const report = await getReport(lookupReportId, persona);
      setSelectedReport(report);
      setLookupStatus("success");
    } catch (requestError) {
      setSelectedReport(null);
      setLookupStatus("failure");
      setLookupError(requestError.message || "Report lookup failed");
    }
  };

  const handleCreateSubmit = async (event) => {
    event.preventDefault();
    if (!createForm.submission_id) {
      setCreateStatus("failure");
      setCreateMessage("submission_id is required.");
      return;
    }
    setCreateStatus("loading");
    setCreateMessage("");
    try {
      const created = await createReport(
        {
          submission_id: createForm.submission_id,
          format: createForm.format
        },
        persona
      );
      setCreateStatus("success");
      setCreateMessage(`Report generated: ${created.report_id}`);
      setLookupReportId(created.report_id || "");
      setSelectedReport(created);
      setLookupStatus("success");
      setListFilterSubmissionId(createForm.submission_id);
      await loadReports(createForm.submission_id);
      setCreateForm((current) => ({ ...current, format: "html" }));
    } catch (requestError) {
      setCreateStatus("failure");
      setCreateMessage(requestError.message || "Report generation failed");
    }
  };

  return (
    <section>
      <h2>Reports</h2>
      <p>Generate and inspect tenant-scoped reports from submission IDs surfaced by prior submission and review workflows.</p>

      <section>
        <h3>List reports</h3>
        <form onSubmit={handleFilterSubmit}>
          <label htmlFor="reports-list-submission-id">Submission ID filter</label>
          <input
            id="reports-list-submission-id"
            value={listFilterSubmissionId}
            onChange={(event) => setListFilterSubmissionId(event.target.value)}
            placeholder="sub-... (optional)"
          />
          <button type="submit">Load reports</button>
        </form>
        {listStatus === "loading" && <p>Loading report list...</p>}
        {listStatus === "empty" && <p>No reports found for the current tenant/filter.</p>}
        {listStatus === "failure" && <p role="alert">Report list failed: {listError}</p>}
        {listStatus === "success" && (
          <ul>
            {reports.map((report) => (
              <li key={report.report_id}>
                <button
                  type="button"
                  onClick={() => {
                    setLookupReportId(report.report_id);
                    setLookupStatus("idle");
                    setSelectedReport(null);
                    setCreateForm((current) => ({
                      ...current,
                      submission_id: report.submission_id || current.submission_id
                    }));
                  }}
                >
                  Use report_id {report.report_id}
                </button>
                {" "}
                <span>submission_id {report.submission_id}</span>
                {" "}
                <span>(format: {report.format})</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3>Get report</h3>
        <form onSubmit={handleLookupSubmit}>
          <label htmlFor="reports-get-report-id">Report ID</label>
          <input
            id="reports-get-report-id"
            value={lookupReportId}
            onChange={(event) => setLookupReportId(event.target.value)}
            placeholder="rpt-..."
            required
          />
          <button type="submit">Load report</button>
        </form>
        {lookupStatus === "loading" && <p>Loading report...</p>}
        {lookupStatus === "failure" && <p role="alert">Report lookup failed: {lookupError}</p>}
        {lookupStatus === "success" && selectedReport && (
          <div>
            <p><strong>report_id:</strong> {selectedReport.report_id}</p>
            <p><strong>submission_id:</strong> {selectedReport.submission_id}</p>
            <p><strong>format:</strong> {selectedReport.format}</p>
            <p><strong>generated_at:</strong> {selectedReport.generated_at}</p>
            <p><strong>published_by:</strong> {selectedReport.published_by}</p>
          </div>
        )}
      </section>

      <section>
        <h3>Create report</h3>
        <p>submission_id is required to preserve upstream identifier handoff from submission/review flows.</p>
        <form onSubmit={handleCreateSubmit}>
          <label htmlFor="reports-create-submission-id">Submission ID</label>
          <input
            id="reports-create-submission-id"
            value={createForm.submission_id}
            onChange={(event) => setCreateForm((current) => ({ ...current, submission_id: event.target.value }))}
            placeholder="sub-..."
            required
          />
          <label htmlFor="reports-create-format">Format</label>
          <select
            id="reports-create-format"
            value={createForm.format}
            onChange={(event) => setCreateForm((current) => ({ ...current, format: event.target.value }))}
          >
            <option value="html">html</option>
            <option value="pdf">pdf</option>
            <option value="json">json</option>
          </select>
          <button type="submit">Generate report</button>
        </form>
        {createStatus === "loading" && <p>Generating report...</p>}
        {createStatus === "success" && <p>{createMessage}</p>}
        {createStatus === "failure" && <p role="alert">Create failed: {createMessage}</p>}
      </section>
    </section>
  );
}
