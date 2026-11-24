"""Contratos Pydantic de la API (separados de los datos almacenados)."""

from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class Role(StrEnum):
    """Roles admitidos (proyecto de autenticación): cualquier otro valor se rechaza con 422."""

    admin = "admin"
    manager = "manager"
    user = "user"


# --- Perfil -------------------------------------------------------------------------------

class ProfileFields(BaseModel):
    name: str | None = Field(default=None, max_length=120)
    phone: str | None = Field(default=None, max_length=40)
    address: str | None = Field(default=None, max_length=250)


class ProfileUpdate(ProfileFields):
    model_config = ConfigDict(extra="forbid")


class ProfileRead(ProfileFields):
    id: str
    user_id: str


# --- Usuario (solo credenciales) ----------------------------------------------------------

class UserCreate(ProfileFields):
    """Registro público. El rol NO se elige aquí: siempre es `user`."""

    model_config = ConfigDict(extra="forbid")

    email: EmailStr
    password: str = Field(min_length=8, max_length=72)  # bcrypt solo usa 72 bytes


class UserUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    email: EmailStr | None = None
    password: str | None = Field(default=None, min_length=8, max_length=72)
    role: Role | None = None          # solo admin
    is_active: bool | None = None     # solo admin


class UserRead(BaseModel):
    id: str
    email: EmailStr
    role: Role
    is_active: bool
    created_at: datetime


class UserWithProfile(UserRead):
    profile: ProfileRead | None = None


# --- Autenticación ------------------------------------------------------------------------

class LoginRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int = Field(description="Segundos hasta la expiración")


class MeResponse(BaseModel):
    email: EmailStr
    role: Role
    profile: ProfileRead | None = None


class HealthResponse(BaseModel):
    status: str
    environment: str
    tinydb: str
    cors_origins: list[str]
