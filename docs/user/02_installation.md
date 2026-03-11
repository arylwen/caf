# Installation

## Prerequisites

- Node.js (CAF helper scripts are Node-based; no `npm install` required)
- A coding assistant that supports the `/caf ...` command surface
  - Runner shims are included in this repo for Claude/Codex/Copilot/Antigravity-style runners

## Repo layout you should keep

- `architecture_library/`
- `skills/`
- `tools/caf/`
- runner shims: `.claude/`, `.codex/`, `.copilot/`, `.agent/`

## Basic verification

From the repo root:

```text
node --version
ls docs/user
```

If you are using a runner that supports custom commands, verify `/caf` is discovered (runner-specific).

## Security notes

Before running an agent workflow, review the local runner permission files:

- `.claude/settings.local.json`
- `.vscode/settings.json`

Adjust them to meet your security requirements.

Also note:

- CAF workflows are designed to avoid `git` commands. Treat your working tree as the source of truth.
- Generated outputs typically live under `reference_architectures/<instance>/` and `companion_repositories/<instance>/` and are usually gitignored.
