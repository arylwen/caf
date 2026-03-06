# How to run (step-by-step)

This file mirrors the **How to run** section in the root `README.md`.

If this repo has `.agent/workflows/`, run workflows in numeric order starting with:

1) `.agent/workflows/00_bootstrap.md`

If `docker/compose.yaml` exists, you can start the local stack via:

- `{{COMPOSE_RUNNER}} -f docker/compose.yaml up --build`

If Python dependencies are present, run tests via:

- `pytest -q`
