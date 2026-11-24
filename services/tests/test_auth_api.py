"""Contrato HTTP del proyecto de autenticación (#18): un test por criterio de evaluación."""

import json
from datetime import UTC, datetime, timedelta

from jose import jwt

import config
from tests.conftest import TEST_SECRET, login, make_admin, register


# --- Registro, perfil vinculado y rol por defecto ------------------------------------------

def test_registro_crea_usuario_rol_user_y_perfil_vinculado(client):
    body = register(client, name="Ana Whitfield", phone="+1 213 555 0147", address="Los Ángeles")
    assert body["role"] == "user"
    assert body["is_active"] is True
    assert "hashed_password" not in body and "password" not in body
    assert body["profile"]["user_id"] == body["id"]
    assert body["profile"]["name"] == "Ana Whitfield"


def test_user_no_guarda_datos_de_contacto(client):
    register(client, name="Ana Whitfield", phone="+1 213 555 0147")
    data = json.loads(config.get_settings().tinydb_path.read_text(encoding="utf-8"))
    user = next(iter(data["users"].values()))
    assert set(user) == {"id", "email", "hashed_password", "is_active", "role", "created_at"}


def test_registro_no_permite_elegir_rol(client):
    r = client.post("/users", json={"email": "x@trackflow.example", "password": "Almacen2026!", "role": "admin"})
    assert r.status_code == 422


def test_email_duplicado_409(client):
    register(client)
    r = client.post("/users", json={"email": "ANA.WHITFIELD@trackflow.example", "password": "Otra2026!!"})
    assert r.status_code == 409


# --- Contraseñas ---------------------------------------------------------------------------

def test_password_se_guarda_hasheada_con_bcrypt(client):
    register(client, password="Almacen2026!")
    raw = config.get_settings().tinydb_path.read_text(encoding="utf-8")
    assert "Almacen2026!" not in raw
    user = next(iter(json.loads(raw)["users"].values()))
    assert user["hashed_password"].startswith("$2")  # formato bcrypt


def test_login_password_incorrecta_401(client):
    register(client)
    r = client.post("/auth/login", json={"email": "ana.whitfield@trackflow.example", "password": "incorrecta"})
    assert r.status_code == 401


# --- JWT y get_current_user ----------------------------------------------------------------

def test_login_devuelve_jwt_firmado_con_id_y_expiracion(client):
    user = register(client)
    r = client.post("/auth/login", json={"email": user["email"], "password": "Almacen2026!"})
    token = r.json()["access_token"]
    claims = jwt.decode(token, TEST_SECRET, algorithms=["HS256"])
    assert claims["sub"] == user["id"]
    assert claims["exp"] - claims["iat"] == 30 * 60  # ACCESS_TOKEN_EXPIRE_MINUTES del entorno


def test_auth_me_devuelve_email_rol_y_perfil(client):
    user = register(client, name="Ana Whitfield")
    r = client.get("/auth/me", headers=login(client, user["email"]))
    assert r.status_code == 200
    assert r.json()["email"] == user["email"]
    assert r.json()["role"] == "user"
    assert r.json()["profile"]["name"] == "Ana Whitfield"


def test_login_formulario_para_docs(client):
    user = register(client)
    r = client.post("/auth/token", data={"username": user["email"], "password": "Almacen2026!"})
    assert r.status_code == 200 and r.json()["token_type"] == "bearer"


# --- 401 -----------------------------------------------------------------------------------

PROTEGIDAS = [("GET", "/auth/me"), ("GET", "/users"), ("GET", "/users/x"), ("PUT", "/users/x"),
              ("DELETE", "/users/x"), ("GET", "/profiles/me"), ("PUT", "/profiles/me")]


def test_rutas_protegidas_sin_token_401(client):
    for method, path in PROTEGIDAS:
        r = client.request(method, path, json={})
        assert r.status_code == 401, (method, path, r.status_code)


def test_token_mal_formado_401(client):
    r = client.get("/auth/me", headers={"Authorization": "Bearer esto-no-es-un-jwt"})
    assert r.status_code == 401


def test_token_firmado_con_otra_clave_401(client):
    user = register(client)
    falso = jwt.encode({"sub": user["id"], "exp": datetime.now(UTC) + timedelta(minutes=5)},
                       "otra-clave-que-no-es-la-del-servidor-0000", algorithm="HS256")
    assert client.get("/auth/me", headers={"Authorization": f"Bearer {falso}"}).status_code == 401


def test_token_expirado_401(client):
    user = register(client)
    expirado = jwt.encode({"sub": user["id"], "exp": datetime.now(UTC) - timedelta(seconds=1)},
                          TEST_SECRET, algorithm="HS256")
    assert client.get("/auth/me", headers={"Authorization": f"Bearer {expirado}"}).status_code == 401


def test_usuario_eliminado_invalida_su_token(client):
    user = register(client)
    headers = login(client, user["email"])
    assert client.delete(f"/users/{user['id']}", headers=headers).status_code == 204
    assert client.get("/auth/me", headers=headers).status_code == 401


# --- 403 y CRUD ----------------------------------------------------------------------------

def test_no_puede_ver_ni_modificar_ni_borrar_a_otro_usuario_403(client):
    ana = register(client, email="ana@trackflow.example")
    carlos = register(client, email="carlos@trackflow.example")
    h = login(client, ana["email"])
    assert client.get(f"/users/{carlos['id']}", headers=h).status_code == 403
    assert client.put(f"/users/{carlos['id']}", headers=h, json={"email": "z@trackflow.example"}).status_code == 403
    assert client.delete(f"/users/{carlos['id']}", headers=h).status_code == 403


def test_usuario_no_puede_subirse_el_rol_403(client):
    ana = register(client)
    r = client.put(f"/users/{ana['id']}", headers=login(client, ana["email"]), json={"role": "admin"})
    assert r.status_code == 403


def test_listar_usuarios_solo_admin_o_manager(client):
    ana = register(client)
    assert client.get("/users", headers=login(client, ana["email"])).status_code == 403
    admin = make_admin()
    r = client.get("/users", headers=login(client, admin["email"], "Admin2026!"))
    assert r.status_code == 200 and len(r.json()) == 2


def test_crud_completo_propio_usuario(client):
    ana = register(client)
    h = login(client, ana["email"])
    assert client.get(f"/users/{ana['id']}", headers=h).json()["email"] == ana["email"]
    r = client.put(f"/users/{ana['id']}", headers=h, json={"email": "ana.w@trackflow.example", "password": "Nueva2026!!"})
    assert r.status_code == 200 and r.json()["email"] == "ana.w@trackflow.example"
    h2 = login(client, "ana.w@trackflow.example", "Nueva2026!!")
    assert client.delete(f"/users/{ana['id']}", headers=h2).status_code == 204


def test_admin_cambia_rol_y_valida_valores(client):
    ana = register(client)
    admin = make_admin()
    h = login(client, admin["email"], "Admin2026!")
    assert client.put(f"/users/{ana['id']}", headers=h, json={"role": "manager"}).json()["role"] == "manager"
    assert client.put(f"/users/{ana['id']}", headers=h, json={"role": "superuser"}).status_code == 422


def test_borrar_usuario_borra_su_perfil(client):
    ana = register(client, name="Ana")
    client.delete(f"/users/{ana['id']}", headers=login(client, ana["email"]))
    data = json.loads(config.get_settings().tinydb_path.read_text(encoding="utf-8"))
    assert data.get("profiles", {}) == {}


def test_perfil_me_leer_y_actualizar(client):
    ana = register(client, name="Ana")
    h = login(client, ana["email"])
    r = client.put("/profiles/me", headers=h, json={"name": "Ana Whitfield", "phone": "+34 976 123 456"})
    assert r.status_code == 200 and r.json()["phone"] == "+34 976 123 456"
    assert client.get("/profiles/me", headers=h).json()["name"] == "Ana Whitfield"


# --- Plataforma ----------------------------------------------------------------------------

def test_health_publico(client):
    r = client.get("/health")
    assert r.status_code == 200 and r.json()["tinydb"] == "ok"
