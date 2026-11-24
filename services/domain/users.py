"""Servicios de usuarios y perfiles sobre TinyDB (capa de dominio, sin FastAPI).

`User` guarda solo credenciales; nombre y datos de contacto viven en `Profile` (relación 1 a 1 por user_id).
"""

import uuid
from datetime import UTC, datetime

from tinydb import Query

from database import profiles_table, tinydb_write_lock, users_table

ROLES = ("admin", "manager", "user")
PROFILE_FIELDS = ("name", "phone", "address")


class EmailAlreadyRegistered(Exception):
    pass


class UserNotFound(Exception):
    pass


def _normalize_email(email: str) -> str:
    return email.strip().lower()


# --- Usuarios -----------------------------------------------------------------------------

def get_user_by_id(user_id: str) -> dict | None:
    return users_table().get(Query().id == user_id)


def get_user_by_email(email: str) -> dict | None:
    return users_table().get(Query().email == _normalize_email(email))


def list_users() -> list[dict]:
    return sorted(users_table().all(), key=lambda u: u["created_at"])


def create_user(email: str, hashed_password: str, role: str = "user", profile: dict | None = None) -> dict:
    """Crea el usuario y su perfil vinculado en la misma operación."""
    if role not in ROLES:
        raise ValueError(f"Rol no válido: {role}")
    email = _normalize_email(email)
    with tinydb_write_lock:
        if users_table().contains(Query().email == email):
            raise EmailAlreadyRegistered(email)
        user = {
            "id": str(uuid.uuid4()),
            "email": email,
            "hashed_password": hashed_password,
            "is_active": True,
            "role": role,
            "created_at": datetime.now(UTC).isoformat(),
        }
        users_table().insert(user)
        profiles_table().insert(_new_profile(user["id"], profile or {}))
    return user


def update_user(user_id: str, changes: dict) -> dict:
    allowed = {"email", "hashed_password", "role", "is_active"}
    changes = {k: v for k, v in changes.items() if k in allowed and v is not None}
    if "email" in changes:
        changes["email"] = _normalize_email(changes["email"])
    if "role" in changes and changes["role"] not in ROLES:
        raise ValueError(f"Rol no válido: {changes['role']}")
    with tinydb_write_lock:
        if get_user_by_id(user_id) is None:
            raise UserNotFound(user_id)
        if "email" in changes:
            other = users_table().get(Query().email == changes["email"])
            if other and other["id"] != user_id:
                raise EmailAlreadyRegistered(changes["email"])
        if changes:
            users_table().update(changes, Query().id == user_id)
    return get_user_by_id(user_id)


def delete_user(user_id: str) -> None:
    """Elimina el usuario y su perfil vinculado."""
    with tinydb_write_lock:
        removed = users_table().remove(Query().id == user_id)
        if not removed:
            raise UserNotFound(user_id)
        profiles_table().remove(Query().user_id == user_id)


# --- Perfiles -----------------------------------------------------------------------------

def _new_profile(user_id: str, data: dict) -> dict:
    return {"id": str(uuid.uuid4()), "user_id": user_id, **{f: data.get(f) for f in PROFILE_FIELDS}}


def get_profile(user_id: str) -> dict | None:
    return profiles_table().get(Query().user_id == user_id)


def update_profile(user_id: str, changes: dict) -> dict:
    changes = {k: v for k, v in changes.items() if k in PROFILE_FIELDS}
    with tinydb_write_lock:
        if get_profile(user_id) is None:
            profiles_table().insert(_new_profile(user_id, {}))
        if changes:
            profiles_table().update(changes, Query().user_id == user_id)
    return get_profile(user_id)
