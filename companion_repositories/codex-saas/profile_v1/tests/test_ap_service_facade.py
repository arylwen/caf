# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-90-unit-tests
# CAF_TRACE: capability=unit_test_scaffolding
# CAF_TRACE: instance=codex-saas
# CAF_TRACE: trace_anchor=pattern_obligation_id:OBL-UNIT-TESTS

from __future__ import annotations

import unittest

from code.ap.application.services import ResourceServiceFacade, allowed_operations


class _FakeAccessPort:
    def __init__(self) -> None:
        self.deleted: list[str] = []

    def list(self, context):
        return [{"id": "wid-1", "resource": context["resource"]}]

    def get(self, context, resource_id):
        return {"id": resource_id, "resource": context["resource"]}

    def create(self, context, payload):
        return {"id": "wid-2", "attributes": payload}

    def update(self, context, resource_id, payload):
        return {"id": resource_id, "attributes": payload}

    def delete(self, context, resource_id):
        self.deleted.append(resource_id)
        return True


class ResourceServiceFacadeTests(unittest.TestCase):
    def test_allowed_operations_match_declared_contract_for_widget_versions(self) -> None:
        self.assertEqual(allowed_operations("widget_versions"), {"list", "get"})

    def test_facade_rejects_operation_not_declared_for_resource(self) -> None:
        facade = ResourceServiceFacade(resource="widget_versions", access_port=_FakeAccessPort())
        with self.assertRaises(PermissionError):
            facade.create({"resource": "widget_versions"}, {"version_number": "2"})

    def test_facade_delegates_delete_to_access_port(self) -> None:
        access_port = _FakeAccessPort()
        facade = ResourceServiceFacade(resource="widgets", access_port=access_port)
        deleted = facade.delete({"resource": "widgets"}, "wid-12")
        self.assertTrue(deleted)
        self.assertEqual(access_port.deleted, ["wid-12"])


if __name__ == "__main__":
    unittest.main()
