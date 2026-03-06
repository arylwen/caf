# CAF_TRACE: generated_by=Contura Architecture Framework (CAF) | task_id=TG-40-persistence-widget | capability=persistence_implementation | instance=codex-saas | trace_anchor=pattern_obligation_id:OBL-AP-RESOURCE-WIDGET-PERSISTENCE
from collections import defaultdict

from .repository_protocol import WidgetRepository


class InMemoryWidgetRepository(WidgetRepository):
    def __init__(self) -> None:
        self._tenant_store: dict[str, dict[str, dict]] = defaultdict(dict)

    def list_widgets(self, tenant_id: str) -> list[dict]:
        return list(self._tenant_store[tenant_id].values())

    def get_widget(self, tenant_id: str, widget_id: str) -> dict | None:
        return self._tenant_store[tenant_id].get(widget_id)

    def create_widget(self, tenant_id: str, widget: dict) -> None:
        self._tenant_store[tenant_id][widget["id"]] = widget

    def update_widget(self, tenant_id: str, widget_id: str, widget: dict) -> dict | None:
        if widget_id not in self._tenant_store[tenant_id]:
            return None
        self._tenant_store[tenant_id][widget_id] = widget
        return widget

    def delete_widget(self, tenant_id: str, widget_id: str) -> bool:
        if widget_id not in self._tenant_store[tenant_id]:
            return False
        del self._tenant_store[tenant_id][widget_id]
        return True

