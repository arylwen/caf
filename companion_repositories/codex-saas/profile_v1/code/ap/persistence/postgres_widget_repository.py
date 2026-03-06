# CAF_TRACE: generated_by=Contura Architecture Framework (CAF) | task_id=TG-40-persistence-widget | capability=persistence_implementation | instance=codex-saas | trace_anchor=pattern_obligation_id:OBL-AP-RESOURCE-WIDGET-PERSISTENCE
from .postgres_adapter import execute, query
from .repository_protocol import WidgetRepository


class PostgresWidgetRepository(WidgetRepository):
    def __init__(self) -> None:
        execute(
            """
            CREATE TABLE IF NOT EXISTS widgets (
                tenant_id TEXT NOT NULL,
                id TEXT NOT NULL,
                name TEXT NOT NULL,
                description TEXT NOT NULL,
                content TEXT NOT NULL,
                PRIMARY KEY (tenant_id, id)
            )
            """
        )

    def list_widgets(self, tenant_id: str) -> list[dict]:
        return query(
            "SELECT id, name, description, content FROM widgets WHERE tenant_id = %s ORDER BY id ASC",
            (tenant_id,),
        )

    def get_widget(self, tenant_id: str, widget_id: str) -> dict | None:
        rows = query(
            "SELECT id, name, description, content FROM widgets WHERE tenant_id = %s AND id = %s",
            (tenant_id, widget_id),
        )
        return rows[0] if rows else None

    def create_widget(self, tenant_id: str, widget: dict) -> None:
        execute(
            "INSERT INTO widgets (tenant_id, id, name, description, content) VALUES (%s, %s, %s, %s, %s)",
            (tenant_id, widget["id"], widget["name"], widget["description"], widget["content"]),
        )

    def update_widget(self, tenant_id: str, widget_id: str, widget: dict) -> dict | None:
        execute(
            """
            UPDATE widgets
            SET name = %s, description = %s, content = %s
            WHERE tenant_id = %s AND id = %s
            """,
            (widget["name"], widget["description"], widget["content"], tenant_id, widget_id),
        )
        return self.get_widget(tenant_id=tenant_id, widget_id=widget_id)

    def delete_widget(self, tenant_id: str, widget_id: str) -> bool:
        before = self.get_widget(tenant_id=tenant_id, widget_id=widget_id)
        if not before:
            return False
        execute("DELETE FROM widgets WHERE tenant_id = %s AND id = %s", (tenant_id, widget_id))
        return True

