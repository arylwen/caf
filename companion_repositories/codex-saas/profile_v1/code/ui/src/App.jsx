// CAF_TRACE: generated_by=Contura Architecture Framework (CAF) | task_id=TG-15-ui-shell | capability=ui_frontend_scaffolding | instance=codex-saas | trace_anchor=pattern_obligation_id:O-TBP-UI-REACT-VITE-01-ui-source
import { useEffect, useState } from "react";

import { createWidget, listWidgets } from "./api.js";

const EMPTY_FORM = { name: "", description: "", content: "" };

export default function App() {
  const [widgets, setWidgets] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    listWidgets().then(setWidgets);
  }, []);

  async function onCreate(event) {
    event.preventDefault();
    const created = await createWidget(form);
    setWidgets((current) => [...current, created]);
    setForm(EMPTY_FORM);
  }

  return (
    <main style={{ margin: "2rem auto", maxWidth: "64rem", fontFamily: "system-ui" }}>
      <h1>Widget Console</h1>
      <p>React SPA shell for local candidate execution.</p>
      <section>
        <h2>Create Widget</h2>
        <form onSubmit={onCreate} style={{ display: "grid", gap: "0.75rem", maxWidth: "32rem" }}>
          <input
            required
            placeholder="Name"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
          <input
            required
            placeholder="Description"
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
          />
          <textarea
            required
            placeholder="Content"
            value={form.content}
            onChange={(event) => setForm({ ...form, content: event.target.value })}
          />
          <button type="submit">Create</button>
        </form>
      </section>
      <section>
        <h2>Widgets</h2>
        <ul>
          {widgets.map((widget) => (
            <li key={widget.id}>
              <strong>{widget.name}</strong> - {widget.description}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

