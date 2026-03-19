#!/usr/bin/env python3
from __future__ import annotations

import importlib
import importlib.abc
import importlib.machinery
import json
import os
import sys
import traceback
import types
from pathlib import Path


class _DummyObject:
    def __call__(self, *args, **kwargs):
        if len(args) == 1 and callable(args[0]) and not kwargs:
            return args[0]
        return self

    def __getattr__(self, _name):
        return self

    def __iter__(self):
        return iter(())

    def __bool__(self):
        return False

    def __getitem__(self, _key):
        return self

    def __str__(self):
        return "<CAF_DUMMY>"


DUMMY = _DummyObject()


class _AnyMeta(type):
    def __getattr__(cls, _name):
        return DUMMY

    def __call__(cls, *args, **kwargs):
        return DUMMY

    def __getitem__(cls, _key):
        return cls


class AnySymbol(metaclass=_AnyMeta):
    pass


class EngineStub:
    def __init__(self, url: str):
        self.url = url


class MetaDataStub:
    def __init__(self, *args, **kwargs):
        self.args = args
        self.kwargs = kwargs

    def create_all(self, *args, **kwargs):
        return None


class GenericSymbolLoader(importlib.abc.Loader):
    def create_module(self, spec):
        module = types.ModuleType(spec.name)
        module.__file__ = f"<caf_stub:{spec.name}>"
        module.__package__ = spec.name.rpartition('.')[0]
        if spec.submodule_search_locations is not None:
            module.__path__ = []
        return module

    def exec_module(self, module):
        module.AnySymbol = AnySymbol
        module.__getattr__ = lambda _name: AnySymbol


class SqlalchemyMinimalLoader(importlib.abc.Loader):
    def create_module(self, spec):
        module = types.ModuleType(spec.name)
        module.__file__ = f"<caf_stub:{spec.name}>"
        module.__package__ = spec.name.rpartition('.')[0]
        if spec.submodule_search_locations is not None:
            module.__path__ = []
        return module

    def exec_module(self, module):
        if module.__name__ == "sqlalchemy":
            module.Engine = EngineStub
            module.MetaData = MetaDataStub
            module.create_engine = lambda url, *args, **kwargs: EngineStub(url)
            module.__getattr__ = lambda _name: AnySymbol
        elif module.__name__ == "sqlalchemy.orm":
            module.Session = AnySymbol
            module.Mapped = AnySymbol
            module.DeclarativeBase = AnySymbol
            module.mapped_column = lambda *args, **kwargs: DUMMY
            module.sessionmaker = lambda *args, **kwargs: (lambda *a, **kw: DUMMY)
            module.__getattr__ = lambda _name: AnySymbol
        else:
            module.__getattr__ = lambda _name: AnySymbol


class StubFinder(importlib.abc.MetaPathFinder):
    def __init__(self, rules: dict[str, str]):
        self.rules = dict(rules or {})

    def _match_kind(self, fullname: str) -> str | None:
        best_match = None
        for root, kind in self.rules.items():
            if fullname == root or fullname.startswith(root + "."):
                if best_match is None or len(root) > len(best_match[0]):
                    best_match = (root, kind)
        return None if best_match is None else best_match[1]

    def find_spec(self, fullname: str, path=None, target=None):
        kind = self._match_kind(fullname)
        if kind is None:
            return None
        if fullname in sys.modules:
            return None
        if kind == "sqlalchemy_minimal":
            loader = SqlalchemyMinimalLoader()
        else:
            loader = GenericSymbolLoader()
        is_pkg = fullname.count(".") == 0
        return importlib.machinery.ModuleSpec(fullname, loader, is_package=is_pkg)


def main() -> int:
    try:
        payload = json.loads(sys.stdin.read() or "{}")
        companion_root = str(payload.get("companion_root") or "").strip()
        module_import = str(payload.get("module_import") or "").strip()
        env = payload.get("env") or {}
        stub_modules = payload.get("stub_modules") or {}

        if not companion_root or not module_import:
            raise RuntimeError("companion_root and module_import are required")

        sys.path.insert(0, str(Path(companion_root).resolve()))
        for key, value in env.items():
            os.environ[str(key)] = str(value)

        if stub_modules:
            sys.meta_path.insert(0, StubFinder(stub_modules))

        importlib.import_module(module_import)
        sys.stdout.write(json.dumps({"ok": True}))
        return 0
    except Exception as exc:  # pragma: no cover - deterministic helper error surface
        detail = "".join(traceback.format_exception_only(type(exc), exc)).strip()
        sys.stdout.write(json.dumps({"ok": False, "error": detail}))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
