# CAF_TRACE: generated_by=Contura Architecture Framework (CAF); task_id=TG-00-AP-runtime-scaffold; capability=plane_runtime_scaffolding; instance=codex-saas; trace_anchor=pattern_obligation_id:OBL-PLANE-AP-RUNTIME-SCAFFOLD
class APServiceFacade:
    def require_tenant_context(self, tenant_id: str) -> str:
        if not tenant_id:
            raise ValueError("tenant context is required")
        return tenant_id

