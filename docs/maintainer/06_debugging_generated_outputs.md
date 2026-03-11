# Debugging generated outputs

This note is for CAF maintainers debugging a generated **companion repo** that “almost works” but is **not directly runnable**.

Principle: **debug from artifacts back to producers**. Avoid “fixing outputs by hand” except as a temporary unblock. Prefer tightening **gates**, **schemas**, **TBP role bindings**, and **worker instructions**.

---

## 0) Start from the failure signal

Pick one concrete, failing symptom:

- `docker compose up` fails
- an entrypoint can’t import (`ModuleNotFoundError`, wrong module path)
- duplicate files (e.g., two `main.py` entrypoints)
- a config file contains invalid YAML / JSON

Capture:

- the exact file path
- the exact error output
- the command used (compose, uvicorn, tests)

---

## 1) Find the last writer with `CAF_TRACE`

Many generated artifacts include a header like:

```
# CAF_TRACE: task_id=TG-... capability=... obligation=...
```

Use it to identify the **producer task**.

Commands (run at companion repo root):

```bash
rg -n "CAF_TRACE" -S .
rg -n "CAF_TRACE" -S docker/compose.candidate.yaml
```

If the file has no `CAF_TRACE`, treat it as either:

- a human-created file (rare in companion repos), or
- a worker produced it without trace (a bug: add trace output discipline)

---

## 2) Open the task report and check output ownership

Task reports live here:

```
companion_repositories/<instance>/profile_v1/caf/task_reports/<TASK_ID>.md
```

From the failing file’s `task_id`, open the report and confirm:

- what inputs were used
- what outputs were produced
- whether the task “owns” that output path

Then search for **multiple writers**:

```bash
rg -n "docker/compose\.candidate\.yaml" companion_repositories/<instance>/profile_v1/caf/task_reports -S
```

If multiple tasks list the same output path, you have an **ownership conflict**.

Fix pattern:

- Choose a single capability/task to *own* the path.
- Remove the path from other tasks’ expected outputs.
- Update TBP role bindings / worker instructions so non-owners **never overwrite**.

---

## 3) Compare obligations → tasks → outputs

When generated outputs conflict, the underlying cause is often conflicting or duplicated **obligations**.

Work backwards:

1. **Task graph** (what ran)
2. **Obligations** (why it ran)
3. **Adopted decisions/patterns** (why the obligation exists)

Key files:

- `design/playbook/task_graph_v1.yaml`
- `design/playbook/pattern_obligations_v1.yaml`
- `spec/playbook/system_spec_v1.md` (decisions)
- `spec/playbook/application_spec_v1.md` (decisions)

Commands:

```bash
rg -n "TG-" reference_architectures/<instance>/design/playbook/task_graph_v1.yaml -S
rg -n "OBL-" reference_architectures/<instance>/design/playbook/pattern_obligations_v1.yaml -S
```

If you see two obligations that both reasonably produce the same artifact (e.g., two different “compose emitters”), that’s a design issue:

- tighten the obligation surface (one obligation owns the artifact)
- or make one obligation depend on another and produce *different* outputs

---

## 4) Validate TBP role bindings (path + ownership)

Most path bugs come from TBP role binding drift (wrong path templates, stale conventions).

Inspect role bindings for a capability:

```bash
node tools/caf/resolve_tbp_role_bindings_v1.mjs <instance> --capability runtime_wiring --format yaml
node tools/caf/resolve_tbp_role_bindings_v1.mjs <instance> --capability postgres_persistence_wiring --format yaml
```

Look for:

- two capabilities producing the same `path_template`
- entrypoint roles pointing at the wrong location (e.g., `main.py` at repo root vs `code/ap/main.py`)
- roles with too-broad glob/path templates

If a capability should contribute only a fragment (env vars, service snippet), ensure its binding outputs a **fragment** path, not the final artifact.

---

## 5) Watch for YAML type gotchas (strings vs maps)

Classic foot-gun: YAML that looks like a string but isn’t.

Example:

```yaml
evidence_contains:
  - ui:
```

That is a **mapping** (`{ui: null}`), not the string `"ui:"`.
This can cause downstream logic to treat it as structured data and accidentally materialize `ui: null` into output YAML.

Rule:

- If you mean a literal line match, quote it: `"ui:"`.

---

## 6) Debug “not runnable” systematically (common failure modes)

### A) Docker compose failures

Checklist:

- under `services:`, every service is a **mapping** (not `null`)
- no duplicate keys / accidental `ui: null`
- entrypoints match repo layout (`uvicorn code.ap.main:app` etc.)
- env vars referenced in compose exist in `.env` or `env_file`

Fast checks:

```bash
python -c "import yaml; yaml.safe_load(open('docker/compose.candidate.yaml'))"
docker compose -f docker/compose.candidate.yaml config
```

### B) Stray/duplicate entrypoints

If you see both:

- `profile_v1/main.py`
- `profile_v1/code/ap/main.py`

…then role bindings are wrong or two tasks are emitting competing composition roots.

Fix:

- choose the canonical entrypoint path and enforce it in TBP bindings
- add a post-gate check that fails if multiple composition roots exist

### C) Wrong imports / module paths

Trace:

- search for how the entrypoint is invoked (compose command, README)
- verify the module path exists under `profile_v1/`
- check the worker that created the file and its role binding expectations

---

## 7) Use gates as your “debugger” (MP-20 posture)

Prefer:

- **post-gates** that detect invalid produced shapes early
- **schemas** that constrain semantic producers
- **single-ownership** rules for artifacts

Avoid:

- scripts that “patch outputs into correctness” as the primary fix

If you need a belt-and-suspenders check, make it:

- deterministic
- fail-closed
- purely diagnostic (no rewriting)

---

## 8) Minimal “debug packet” template (copy/paste into an issue)

When opening a CAF maintainer ticket, include:

1. Instance + phase (`/caf build`, `/caf plan`, etc.)
2. Failing command + error output
3. Failing file path + `CAF_TRACE` header
4. Task report path(s) for the last writer
5. Evidence of multiple writers (if applicable)
6. Suspected producer surface (TBP role binding path, obligation id, schema mismatch)
7. Recommended fix category:
   - ownership rule
   - TBP role binding
   - worker instruction
   - schema + post-gate
