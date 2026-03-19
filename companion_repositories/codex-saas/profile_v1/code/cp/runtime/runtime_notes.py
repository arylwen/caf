# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-00-CP-runtime-scaffold
# CAF_TRACE: capability=plane_runtime_scaffolding
# CAF_TRACE: instance=codex-saas
# CAF_TRACE: trace_anchor=pinned_input:planes.cp.runtime_shape


def runtime_bootstrap_contract() -> str:
    return (
        "CP runtime scaffold uses api_service_http shape and keeps policy, "
        "ingress, persistence, and AP integration seams explicit."
    )
