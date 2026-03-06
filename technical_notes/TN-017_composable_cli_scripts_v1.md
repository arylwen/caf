# TN-017 Composable CLI Scripts (internal_main + CLI main guard) v1

CAF relies on a growing set of **deterministic helper scripts** (gates, merges, indexers, evaluators).
These scripts are often chained together by skills and runners.

This note documents a CAF meta-pattern for keeping those scripts **composable**:

- callable from the CLI (normal `node ...` execution)
- importable and callable from other scripts **without executing on import**
- safe for reuse inside a larger workflow **without spawning multiple Node processes**

## Problem: execution-on-import foot-guns

When a script ends with a top-level call like:

```js
await main();
```

any other script that imports it will accidentally execute it.

This creates hard-to-debug failures:

- ordering quirks (a gate runs before a required mechanical merge/hydration)
- duplicated work (N helpers run multiple times in the same workflow)
- retry loops and token burn (agents “fix” the wrong thing because the mechanical step never ran)

## Convention: `internal_main(argv, deps?)` + entrypoint guard

### Rules

1. **Export an explicit, import-safe entrypoint**:
   - `export async function internal_main(argv, deps?)`
2. **No work at module top-level**:
   - no filesystem writes
   - no `await main()`
   - no mutation of global process state
3. **Preserve CLI behavior** with an entrypoint guard:
   - execute only when the file is the entry module

### Minimal skeleton (Node `.mjs`)

```js
#!/usr/bin/env node

import path from 'node:path';
import { pathToFileURL } from 'node:url';

class CafFailClosed extends Error {
  constructor(message, exitCode = 1) {
    super(message);
    this.exitCode = exitCode;
  }
}

export async function internal_main(argv = process.argv.slice(2), deps = {}) {
  // 1) parse argv
  // 2) perform deterministic work (read/write)
  // 3) throw CafFailClosed on fail-closed conditions
  return 0;
}

function isEntrypoint() {
  try {
    const argv1 = process.argv[1] ? path.resolve(process.argv[1]) : '';
    if (!argv1) return true;
    return import.meta.url === pathToFileURL(argv1).href;
  } catch {
    return true;
  }
}

if (isEntrypoint()) {
  internal_main(process.argv.slice(2)).catch((e) => {
    if (e && typeof e === 'object' && 'exitCode' in e) {
      process.stderr.write(String(e.message || e) + "\n");
      process.exit(Number(e.exitCode || 1));
    }
    process.stderr.write(String(e?.stack ?? e) + "\n");
    process.exit(99);
  });
}
```

### Notes

- `deps?` is optional, but recommended when you want testability or in-process composition (e.g., injecting a logger, filesystem adapter, or an already-parsed config object).
- Keep parsing/IO inside `internal_main()` so the module can be imported safely.

## Bundling rule: adjacent deterministic stages → `*_postprocess_v1.mjs`

If multiple deterministic stages must always run together and **no semantic step intervenes**, bundle them into a single wrapper tool.

Why:

- forces a deterministic order
- eliminates agent “skip step X” quirks
- avoids spawning multiple Node processes (import and call the stage `internal_main` functions)

### Example: retrieval postprocess bundling

`tools/caf/retrieval_postprocess_v1.mjs` is a wrapper that imports and calls:

1. `apply_grounded_candidates_v1` (union refresh into CAF-managed blocks)
2. `pattern_retrieval_scaffold_merge_v1` (merge-safe scaffold refresh + option hydration)
3. `retrieval_gate_v1` (postcondition enforcement)

This eliminates the prior foot-gun where `retrieval_gate_v1` could run before the scaffold merge.

## Where this is enforced

- Maintainer-facing: `architecture_library/patterns/caf_meta_v1/caf_meta_patterns_playbook_v1.md` (MP-19)
- Checklist: `architecture_library/patterns/caf_meta_v1/caf_meta_patterns_checklist_v1.md` (Section F)
