# Interface binding contract v1

Purpose: preserve a minimal, auditable required/provided interface expectation across waves without introducing a second planning subsystem or leaking architecture-style-specific vocabulary into CAF core.

Boundary note:

- This contract captures **logical binding closure obligations** for a concrete instance.
- It is intentionally **not** a DI-container / IoC-framework configuration surface.
- The selected architecture style may require inversion/composition structure at a logical level, but framework-specific realization (container registration, manual composition root code, bootstrap syntax, service lifetimes) belongs elsewhere.

Derived worker/execution artifact (mechanically generated from planner-owned task graph intent):

- `reference_architectures/<name>/design/playbook/interface_binding_contracts_v1.yaml`

Each binding declares only:

- `binding_id`
- `binding_kind`
- `plane_scope`
- `resource_key`
- `required_interface.{name,description}`
- `required_interface.consumer.{task_id,role_id}`
- `provider.{task_id,role_id,binding_kind}`
- `assembler.{task_id,role_id,binding_action}`

Build-owned evidence artifact:

- `companion_repositories/<name>/profile_v1/caf/binding_reports/<binding_id>.yaml`

Assembler tasks write the binding report when the interface is explicitly bound.
Artifact paths recorded under `evidence.*_artifact_paths[]` are companion-repo-root relative by default (for example `code/AP/main.py`). Repo-root-relative paths are also valid when an artifact truly lives outside the companion repo.

Validation model:

1. The consumer task declares the required interface explicitly.
2. The provider task materializes the implementation or adapter that satisfies it.
3. The assembler task binds the consumer to the provider in the composition boundary.
4. Task-graph sequencing must place provider after consumer, and assembler after both; direct `depends_on` edges are acceptable but not required when the closure is already guaranteed transitively by the task graph.
5. The runnable post-gate fails closed if assembler work completed but the binding report is missing or not `status: closed`.

Naming rule:

- Use the style-neutral framework term **interface binding contract**.
- Clean Architecture may realize this as a port binding.
- Layered Architecture may realize this as a service-to-data-access binding.
- An IoC/container mechanism may later realize the declared bindings, but the contract itself remains framework-neutral.
- CAF gates must validate the contract artifact itself; they must not infer interface bindings from capability-name patterns.

Planner task-graph support:

- Prefer per-task `interface_binding_hints[]` in `task_graph_v1.yaml` so planner emission stays mechanical and ABP-aware.
- Each hint declares only participant intent (`consumer`, `provider`, or `assembler`) plus a style-neutral semantic role.
- The generator resolves concrete role ids from `abp_pbp_resolution_v1.yaml`; planner-authored contract YAML is not the source of truth.
- The scripted post-plan generation step may also attach `interface_binding_contracts_v1.yaml` as a required task input on the participating consumer/provider/assembler tasks so downstream build workers receive the same derived contract deterministically without re-deriving it from the full task graph.
- Downstream runtime-wiring logic may satisfy the contract through either a container/registry mechanism or explicit manual composition-root code; that realization choice does not change the contract shape.

Runtime realization selection:

- Runtime workers must read `platform.dependency_wiring_mode` from `profile_parameters_resolved.yaml` before deciding where a declared binding is closed.
- `manual_composition_root` means the binding is closed explicitly in composition/bootstrap code (prefer the TBP-declared composition-root path when one exists).
- `framework_managed` means the binding is closed in an existing framework-managed assembly boundary already supported by the instance stack/TBP/runtime artifacts (for example an application bootstrap module, provider registry module, framework-owned dependency module, or equivalent).
- Preferred generic model for `framework_managed`: if the resolved TBP manifests expose a role binding such as `dependency_provider_boundary`, use that TBP-declared boundary as the first-class framework-managed closure surface instead of inventing a new one.
- The selected realization mode changes only the assembly surface where closure happens; it does not change the logical binding participants or the interface binding contract shape.
- `framework_managed` must not be used as permission to invent a new DI container, provider registry product, service lifetime model, or framework-specific registration topology that is not already supported by the selected runtime/tooling surface.
- When a `dependency_provider_boundary` is used, `evidence.assembler_artifact_paths[]` may point to that boundary (and any directly involved bootstrap file) because it is the real closure surface for the binding.

Production fallback rule:

- When an interface binding contract applies, consumer, provider, and assembler/runtime-wiring artifacts must not silently instantiate or select local demo/in-memory/default providers in production paths.
- Repository factories and equivalent composition roots must fail closed when the resolved provider cannot be wired (for example missing `DATABASE_URL` for a resolved DB engine); they must not delegate to local in-memory/demo implementations.
- True test-only scaffolding must be marked explicitly with `CAF_TEST_ONLY` and belong in test paths, not production runtime modules.
