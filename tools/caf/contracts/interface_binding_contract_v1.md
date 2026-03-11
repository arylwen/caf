# Interface binding contract v1

Purpose: preserve a minimal, auditable required/provided interface expectation across waves without introducing a second planning subsystem or leaking architecture-style-specific vocabulary into CAF core.

Planner-owned source artifact (mechanically generated):

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
- CAF gates must validate the contract artifact itself; they must not infer interface bindings from capability-name patterns.

Planner task-graph support:

- Prefer per-task `interface_binding_hints[]` in `task_graph_v1.yaml` so planner emission stays mechanical and ABP-aware.
- Each hint declares only participant intent (`consumer`, `provider`, or `assembler`) plus a style-neutral semantic role.
- The generator resolves concrete role ids from `abp_pbp_resolution_v1.yaml`; planner-authored contract YAML is not the source of truth.
- The scripted post-plan generation step may also attach `interface_binding_contracts_v1.yaml` as a required task input on the participating consumer/provider/assembler tasks so downstream build workers receive the same binding contract deterministically.

Production fallback rule:

- When an interface binding contract applies, consumer, provider, and assembler/runtime-wiring artifacts must not silently instantiate or select local demo/in-memory/default providers in production paths.
- Repository factories and equivalent composition roots must fail closed when the resolved provider cannot be wired (for example missing `DATABASE_URL` for a resolved DB engine); they must not delegate to local in-memory/demo implementations.
- True test-only scaffolding must be marked explicitly with `CAF_TEST_ONLY` and belong in test paths, not production runtime modules.
