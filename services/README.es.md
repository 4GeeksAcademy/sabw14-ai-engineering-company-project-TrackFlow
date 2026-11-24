# `services/` — TrackFlow API

API principal de TrackFlow (FastAPI). Según la decisión **D-09** de [`docs/ARCHITECTURE_PROPOSAL.md`](../docs/ARCHITECTURE_PROPOSAL.md), la raíz de `services/` **es** la API, organizada en capas: `routers/` → `domain/` → datos. Los procesos que se despliegan aparte irán en `services/workers/<nombre>/`, cada uno con su README.

| Dominio | Rutas | Datos | Proyecto |
|---|---|---|---|
| Autenticación | `/auth/login`, `/auth/token`, `/auth/me` | TinyDB | #18 |
| Usuarios (solo credenciales) | `/users`, `/users/{id}` | TinyDB (`users`) | #18 |
| Perfiles | `/profiles/me` | TinyDB (`profiles`) | #18 |
| Plataforma | `/health` | — | — |
| Inventario | `/inventory/...` | Supabase/Postgres (SQLModel) | Hito 5 |

## Estructura

```text
services/
├── main.py            # app FastAPI: CORS y routers (sin lógica)
├── config.py          # Settings (pydantic-settings) desde services/.env
├── cors.py            # orígenes CORS efectivos (añade los del codespace)
├── database.py        # cliente TinyDB con lock de escritura (R7)
├── dependencies.py    # get_current_user, require_roles, ensure_self_or_admin
├── schemas.py         # contratos Pydantic (Role: admin | manager | user)
├── routers/           # auth.py, users.py, profiles.py, health.py
├── domain/            # auth.py (bcrypt + JWT), users.py (usuarios y perfiles en TinyDB)
├── seed_admin.py      # crea el primer admin desde variables de entorno
├── tests/             # pytest: contrato HTTP de auth
└── pyproject.toml · uv.lock · .python-version · .env.example
```

## Puesta en marcha (Codespaces o local)

```bash
cd services
cp .env.example .env
uv run python -c "import secrets; print(secrets.token_urlsafe(48))"   # pégalo en SECRET_KEY
uv sync
```

En Codespaces, define `SECRET_KEY` como **Codespaces secret** (Settings → Codespaces → Secrets) en lugar de escribirla en `.env`.

```bash
# Primer admin (el registro público crea siempre rol "user")
# Pon ADMIN_EMAIL y ADMIN_PASSWORD en services/.env (o en el entorno) y ejecuta:
set -a && . ./.env && set +a && uv run python seed_admin.py

# Levantar la API en el puerto 8000
uv run fastapi dev main.py --host 0.0.0.0 --port 8000
```

- Documentación interactiva: `http://localhost:8000/docs`. En Codespaces: pestaña **Ports** → `8000`.
- Para que un frontend (puerto 3000) llame a la API en Codespaces, el puerto `8000` debe ser **Public**: `gh codespace ports visibility 8000:public -c $CODESPACE_NAME`. Los orígenes CORS del codespace se añaden solos.

## Probar el flujo en `/docs`

1. `POST /users`: registro con `email`, `password` y, opcionalmente, `name`, `phone` y `address`. El usuario recibe el rol `user` y se crea su perfil.
2. Botón **Authorize**: en `username` va el email y en `password` la contraseña (usa `POST /auth/token`). También se puede usar `POST /auth/login` con un JSON.
3. `GET /auth/me` → `200` con el email, el rol y el perfil. Sin token → `401`.
4. `GET /users/{id}` de otro usuario → `403`.

## Tests

```bash
uv run pytest -q
```

Usan una TinyDB temporal y una clave de pruebas ficticia; no tocan `services/.data/`.

## Seguridad

- Las contraseñas se guardan con bcrypt (`libpass[bcrypt]`, importado como `passlib.hash.bcrypt`); nunca en texto plano.
- El JWT se firma con HS256. Lleva el `id` del usuario en TinyDB (`sub`) y expira según `ACCESS_TOKEN_EXPIRE_MINUTES`. Sin cookies ni sesiones.
- `User` y `Profile` viven **solo en TinyDB**: el inventario guardará `user_uuid` = `id` de TinyDB, sin tabla de usuarios en Postgres.
- `services/.env` y `services/.data/` están en `.gitignore`.
