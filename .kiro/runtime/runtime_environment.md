---
description: Runner environment configuration (Kiro IDE adapter)
---

# Runtime environment configuration (Kiro IDE adapter)

## Current posture

CAF generation commands are **instruction-only** at this stage:

- CAF does **not** execute developer tools (no Python, no container runtime, no compose, no tests).
- CAF does **not** perform environment readiness checks.

## Purpose of this file

This file records **runner-specific environment conventions** that a human developer may choose to
use when running the generated project locally.

Skills MUST NOT depend on this file.

## Optional environment variables (developer convenience)

If a developer wants consistent command names in their shell, they may set:

- `CAF_PYTHON_CMD` (example: `python3`)
- `CAF_CONTAINER_RUNTIME_CMD` (example: `podman` or `docker`)
- `CAF_COMPOSE_CMD` (example: `podman-compose` or `docker compose`)

CAF will not probe or validate these values.
