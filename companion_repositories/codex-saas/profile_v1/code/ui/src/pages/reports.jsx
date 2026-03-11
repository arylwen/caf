// CAF_TRACE: generated_by=Contura Architecture Framework (CAF); task_id=TG-25-ui-page-reports; capability=ui_frontend_scaffolding; instance=codex-saas; trace_anchor=pattern_obligation_id:OBL-UI-PAGE-reports
import { useMemo, useState } from "react";

import { getReport, listReports } from "../api.js";

export default function ReportsPage({ tenantId, principalId }) {
  const [reportId, setReportId] = useState("rep-0001");
  const [result, setResult] = useState(null);
  const context = useMemo(() => ({ tenantId, principalId }), [tenantId, principalId]);
  const listCall = listReports(context);

  return (
    <section>
      <h3>Reports</h3>
      <p>Tenant-scoped list/get scaffold aligned to AP reports API operations.</p>
      <pre>{JSON.stringify(listCall, null, 2)}</pre>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setResult(getReport(context, reportId));
        }}
      >
        <label>
          Report id
          <input value={reportId} onChange={(event) => setReportId(event.target.value)} />
        </label>
        <button type="submit">Get Report</button>
      </form>
      {result ? <pre>{JSON.stringify(result, null, 2)}</pre> : null}
    </section>
  );
}
