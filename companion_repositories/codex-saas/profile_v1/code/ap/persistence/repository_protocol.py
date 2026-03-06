# CAF_TRACE: generated_by=Contura Architecture Framework (CAF) | task_id=TG-40-persistence-widget | capability=persistence_implementation | instance=codex-saas | trace_anchor=pattern_obligation_id:OBL-AP-RESOURCE-WIDGET-PERSISTENCE
from typing import Protocol


class WidgetRepository(Protocol):
    def list_widgets(self, tenant_id: str) -> list[dict]:
        raise NotImplementedError

    def get_widget(self, tenant_id: str, widget_id: str) -> dict | None:
        raise NotImplementedError

    def create_widget(self, tenant_id: str, widget: dict) -> None:
        raise NotImplementedError

    def update_widget(self, tenant_id: str, widget_id: str, widget: dict) -> dict | None:
        raise NotImplementedError

    def delete_widget(self, tenant_id: str, widget_id: str) -> bool:
        raise NotImplementedError

