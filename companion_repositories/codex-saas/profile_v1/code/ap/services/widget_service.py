# CAF_TRACE: generated_by=Contura Architecture Framework (CAF) | task_id=TG-30-service-facade-widget | capability=service_facade_implementation | instance=codex-saas | trace_anchor=pattern_obligation_id:OBL-AP-RESOURCE-WIDGET-SERVICE
import uuid

from ..persistence.repository_factory import get_widget_repository


class WidgetService:
    def __init__(self) -> None:
        self._repository = get_widget_repository()

    def list_widgets(self, tenant_id: str) -> list[dict]:
        return self._repository.list_widgets(tenant_id=tenant_id)

    def get_widget(self, tenant_id: str, widget_id: str) -> dict | None:
        return self._repository.get_widget(tenant_id=tenant_id, widget_id=widget_id)

    def create_widget(self, tenant_id: str, payload: dict) -> dict:
        widget_id = str(uuid.uuid4())
        widget = {
            "id": widget_id,
            "name": payload["name"],
            "description": payload["description"],
            "content": payload["content"],
        }
        self._repository.create_widget(tenant_id=tenant_id, widget=widget)
        return widget

    def update_widget(self, tenant_id: str, widget_id: str, payload: dict) -> dict | None:
        widget = {
            "id": widget_id,
            "name": payload["name"],
            "description": payload["description"],
            "content": payload["content"],
        }
        return self._repository.update_widget(
            tenant_id=tenant_id,
            widget_id=widget_id,
            widget=widget,
        )

    def delete_widget(self, tenant_id: str, widget_id: str) -> bool:
        return self._repository.delete_widget(tenant_id=tenant_id, widget_id=widget_id)

