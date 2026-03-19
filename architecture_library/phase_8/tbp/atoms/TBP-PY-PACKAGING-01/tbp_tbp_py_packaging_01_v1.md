ID: TBP-PY-PACKAGING-01
TITLE: Python Packaging Dependency Manifest Binding
INTENT: Bind Python runnable candidates to one canonical dependency manifest at repo root so runtime wiring and stack-specific TBPs can converge on the same package surface.

ROLE BINDINGS:
- python_requirements_manifest: repo-root `requirements.txt` used as the canonical dependency manifest for runnable candidates.

EVIDENCE EXPECTATIONS:
- E-TBP-PY-PACKAGING-01-01: `requirements.txt` exists at companion repo root and includes CAF trace provenance comments.
- E-TBP-PY-PACKAGING-01-02: Python Dockerfiles or equivalent runtime-wiring surfaces install from `requirements.txt` rather than repeating inline package lists.

VALIDATION QUESTIONS:
- V-TBP-PY-PACKAGING-01-01: Does the companion repo expose exactly one canonical dependency manifest for the runnable candidate path?
- V-TBP-PY-PACKAGING-01-02: Do stack-specific TBPs contribute dependency lines to that manifest instead of inventing separate packaging surfaces?

NOTES:
- v1 intentionally standardizes on `requirements.txt` for Python runnable candidates.
- If CAF later needs pyproject/Poetry/Hatch selection, add that as an explicit profile-level choice instead of letting workers improvise packaging style.
