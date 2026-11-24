"""Configuración única de la API (pydantic-settings). Valores reales en services/.env — nunca en el código."""

from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

SERVICES_DIR = Path(__file__).resolve().parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=SERVICES_DIR / ".env", env_file_encoding="utf-8", extra="ignore")

    environment: str = "local"

    # Autenticación (JWT). SECRET_KEY no tiene valor por defecto: debe venir del entorno.
    secret_key: str = Field(min_length=32)
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = Field(default=60, gt=0)

    # TinyDB: usuarios y perfiles. Fuera de git (services/.data/ está en .gitignore).
    tinydb_path: Path = SERVICES_DIR / ".data" / "users.json"

    # CORS: lista separada por comas. En Codespaces se añaden los orígenes del codespace (ver main.py).
    cors_origins: str = "http://localhost:3000,http://localhost:3001"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
