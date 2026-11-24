"""Conexiones de datos.

- TinyDB: usuarios y perfiles (autenticación). Un único cliente por proceso con un lock para las
  escrituras, porque TinyDB no es seguro ante escrituras concurrentes (riesgo R7).
- Supabase/Postgres (SQLModel) para inventario: se añade en el Hito 5.
"""

import threading
from functools import lru_cache

from tinydb import TinyDB

from config import get_settings

tinydb_write_lock = threading.Lock()


@lru_cache
def get_tinydb() -> TinyDB:
    path = get_settings().tinydb_path
    path.parent.mkdir(parents=True, exist_ok=True)
    return TinyDB(path, encoding="utf-8", ensure_ascii=False, indent=2)


def users_table():
    return get_tinydb().table("users")


def profiles_table():
    return get_tinydb().table("profiles")
