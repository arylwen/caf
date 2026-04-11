# Installation

## Prerequisites

- Node.js 18+ (CAF helper scripts are Node-based; no `npm install` required)
- A coding assistant that supports the `/caf ...` command surface
  - Runner shims are included in this repo for Claude/Codex/Copilot/Kiro IDE/Antigravity-style runners

## Repo layout you should keep

- `architecture_library/`
- `skills/`
- `tools/caf/`
- runner shims: `.claude/`, `.codex/`, `.copilot/`, `.kiro/`, `.agent/`
- runner-local helper folders: `.claude/scripts/`, `.codex/scripts/`, `.copilot/scripts/`, `.kiro/scripts/`, `.agent/scripts/`

## Basic verification

From the repo root:

```text
node --version
ls docs/user
```

If you are using a runner that supports custom commands, verify `/caf` is discovered (runner-specific).

For Kiro IDE, keep the workspace shim under `.kiro/skills/` so the repo-local CAF skill appears in the slash-command surface without copying the canonical `skills/` tree.

## Security notes

Before running an agent workflow, review the local runner permission files:

- `.claude/settings.local.json`
- `.vscode/settings.json`

Adjust them to meet your security requirements.

If you use Kiro IDE, also keep the workspace discovery shim in place:

- `.kiro/skills/`

Also note:

- CAF workflows are designed to avoid `git` commands. Treat your working tree as the source of truth.
- `tools/caf/` is for maintainer-vetted canonical framework helpers, not temporary runner scratch scripts.
- Generated outputs typically live under `reference_architectures/<instance>/` and `companion_repositories/<instance>/` and are usually gitignored.
