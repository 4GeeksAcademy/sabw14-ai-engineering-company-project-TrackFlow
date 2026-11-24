"""Crea el primer usuario admin en TinyDB (el registro público siempre crea rol `user`).

Uso (desde services/):  ADMIN_EMAIL=... ADMIN_PASSWORD=... uv run python seed_admin.py
Las credenciales se leen del entorno; nunca se escriben en el código ni en el repo.
"""

import os
import sys

from domain import auth as auth_domain
from domain import users as users_domain


def main() -> int:
    email = os.environ.get("ADMIN_EMAIL")
    password = os.environ.get("ADMIN_PASSWORD")
    if not email or not password or len(password) < 8:
        print("Define ADMIN_EMAIL y ADMIN_PASSWORD (mínimo 8 caracteres) en el entorno.", file=sys.stderr)
        return 1
    try:
        user = users_domain.create_user(email, auth_domain.hash_password(password), role="admin",
                                        profile={"name": "Administrador TrackFlow"})
    except users_domain.EmailAlreadyRegistered:
        print(f"Ya existe un usuario con el email {email}; no se modifica.")
        return 0
    print(f"Admin creado: {user['email']} (id {user['id']})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
