// CAF_TRACE: generated_by=Contura Architecture Framework (CAF) | task_id=TG-15-ui-shell | capability=ui_frontend_scaffolding | instance=codex-saas | trace_anchor=architect_edit:ui_requirements_v1
const DEFAULT_HEADERS = {
  "content-type": "application/json",
  "x-tenant-id": "tenant-local",
  "x-principal-id": "principal-local",
  "x-correlation-id": "corr-local-ui"
};

export async function listWidgets() {
  const response = await fetch("/api/widgets", {
    method: "GET",
    headers: DEFAULT_HEADERS
  });
  if (!response.ok) {
    return [];
  }
  return response.json();
}

export async function createWidget(payload) {
  const response = await fetch("/api/widgets", {
    method: "POST",
    headers: DEFAULT_HEADERS,
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    throw new Error("create_widget_failed");
  }
  return response.json();
}

