# CP runtime repository health contract v1

Purpose:
- Keep CP service-level readiness probes and concrete persistence repositories aligned.
- Prevent generated CP runtime consumer seams from calling `repository.health()` against concrete repositories that do not implement that method.
- Keep the CP repository-health owner surface explicit without hardcoding a universal file path.

Contract:
- When the resolved CP runtime repository-health owner surface uses `repository.health()` as a runtime readiness probe, every concrete repository returned by `code/cp/persistence/repository_factory.py` must implement a compatible `health()` method.
- The concrete `health()` method belongs to runtime realization, not to worker-local patches.
- The repository `health()` method may validate runtime connectivity and then return the shared scaffold status shape used by the CP persistence contract.
- For stacks that participate in this postgate, the producing runtime surfaces must expose a TBP role binding keyed as `cp_runtime_repository_health_owner`; the postgate resolves the concrete path from the adopted TBPs instead of assuming a language-specific file name.

Producer ownership:
- The adopted runtime TBPs own the concrete path bound to `cp_runtime_repository_health_owner`.
- `TG-00-CP-runtime-scaffold` owns creation of the resolved owner seam file when the control plane is scaffolded as an HTTP API runtime.
- `TG-90-runtime-wiring` may extend that owner seam, but must not assume the seam can be inferred later from package markers or persistence outputs alone.
- Build/postgate feedback must point back to these framework-owned producer seams rather than suggesting hand edits inside a companion repo.

Postgate expectation:
- CAF build postgates should fail closed when the resolved CP runtime repository-health owner seam calls `repository.health()` but companion CP persistence factory outputs concrete repositories without `health()`.
- CAF build postgates should also fail closed when the owner seam role binding is missing, unresolved, or the resolved artifact is absent, because repository-health validation depends on that consumer-side runtime surface existing.
- Feedback packets should point back to the producing CP persistence/runtime seam rather than suggesting manual companion-only edits.
