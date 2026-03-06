# CAF_TRACE: generated_by=Contura Architecture Framework (CAF) | task_id=TG-00-CP-runtime-scaffold | capability=plane_runtime_scaffolding | instance=codex-saas | trace_anchor=pattern_obligation_id:OBL-PLANE-CP-RUNTIME-SCAFFOLD
def evaluate_policy(
    tenant_id: str,
    principal_id: str,
    action: str,
    correlation_id: str,
) -> tuple[bool, str]:
    if not tenant_id or not principal_id or not correlation_id:
        return False, "missing_required_context"

    if action.startswith("widget:"):
        return True, "allowed_for_widget_scope"

    return False, "unsupported_action"

