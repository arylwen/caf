# CAF_TRACE: generated_by=Contura Architecture Framework (CAF) | task_id=TG-90-unit-tests | capability=unit_test_scaffolding | instance=codex-saas | trace_anchor=pattern_obligation_id:OBL-UNIT-TESTS
from code.ap.services.widget_service import WidgetService


def test_create_widget_assigns_server_id() -> None:
    service = WidgetService()
    created = service.create_widget(
        tenant_id="tenant-a",
        payload={"name": "n", "description": "d", "content": "c"},
    )
    assert created["id"]
    assert created["name"] == "n"


def test_tenant_scoped_listing() -> None:
    service = WidgetService()
    service.create_widget(
        tenant_id="tenant-a",
        payload={"name": "first", "description": "a", "content": "a"},
    )
    service.create_widget(
        tenant_id="tenant-b",
        payload={"name": "second", "description": "b", "content": "b"},
    )
    assert len(service.list_widgets("tenant-a")) == 1
    assert len(service.list_widgets("tenant-b")) == 1

