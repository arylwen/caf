from unittest.mock import patch

from code.common.persistence import sqlalchemy_runtime


def test_normalize_database_url_accepts_psycopg_sqlalchemy_prefix():
    raw = "postgresql+psycopg://user:pass@postgres:5432/codex_saas"
    assert sqlalchemy_runtime.normalize_database_url(raw) == raw


def test_normalize_database_url_converts_postgres_prefix_for_compose_dns():
    raw = "postgres://user:pass@postgres:5432/codex_saas"
    assert (
        sqlalchemy_runtime.normalize_database_url(raw)
        == "postgresql+psycopg://user:pass@postgres:5432/codex_saas"
    )


def test_get_database_url_requires_database_url_env_var():
    with patch("os.getenv", return_value=""):
        try:
            sqlalchemy_runtime.get_database_url()
        except RuntimeError as exc:
            assert "DATABASE_URL is required" in str(exc)
        else:
            raise AssertionError("expected missing DATABASE_URL to raise RuntimeError")


def test_get_database_url_normalizes_postgresql_scheme():
    with patch(
        "os.getenv",
        return_value="postgresql://codex_saas:pw@postgres:5432/codex_saas",
    ):
        assert (
            sqlalchemy_runtime.get_database_url()
            == "postgresql+psycopg://codex_saas:pw@postgres:5432/codex_saas"
        )
