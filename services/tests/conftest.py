"""Fixtures: cada test usa una TinyDB temporal y una clave de firma de pruebas (valores ficticios)."""

import pytest
from fastapi.testclient import TestClient

import config
import database
from domain import auth as auth_domain
from domain import users as users_domain

TEST_SECRET = "clave-ficticia-solo-para-tests-0123456789abcdef"


@pytest.fixture(autouse=True)
def _isolated_settings(tmp_path, monkeypatch):
    monkeypatch.setenv("SECRET_KEY", TEST_SECRET)
    monkeypatch.setenv("TINYDB_PATH", str(tmp_path / "users.json"))
    monkeypatch.setenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30")
    monkeypatch.delenv("CODESPACE_NAME", raising=False)
    config.get_settings.cache_clear()
    database.get_tinydb.cache_clear()
    yield
    database.get_tinydb().close()
    config.get_settings.cache_clear()
    database.get_tinydb.cache_clear()


@pytest.fixture
def client():
    from main import app

    with TestClient(app) as c:
        yield c


def register(client, email="ana.whitfield@trackflow.example", password="Almacen2026!", **profile):
    r = client.post("/users", json={"email": email, "password": password, **profile})
    assert r.status_code == 201, r.text
    return r.json()


def login(client, email, password="Almacen2026!") -> dict:
    r = client.post("/auth/login", json={"email": email, "password": password})
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


def make_admin(email="andres.kim@trackflow.example", password="Admin2026!") -> dict:
    return users_domain.create_user(email, auth_domain.hash_password(password), role="admin")
