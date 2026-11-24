"""Reglas de autenticación: hash de contraseñas y tokens JWT. Sin imports de FastAPI (capa de dominio)."""

from datetime import UTC, datetime, timedelta

from jose import JWTError, jwt
from passlib.hash import bcrypt  # libpass[bcrypt]: fork mantenido de passlib, mismo import

from config import get_settings
from domain import users as users_domain


class InvalidCredentials(Exception):
    """Email o contraseña incorrectos (no se distingue cuál, para no filtrar qué emails existen)."""


class InvalidToken(Exception):
    """Token ausente, mal formado, con firma inválida o expirado."""


def hash_password(plain: str) -> str:
    return bcrypt.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.verify(plain, hashed)
    except ValueError:
        return False


def create_access_token(user_id: str) -> tuple[str, int]:
    """Devuelve (token, segundos de validez). El claim `sub` lleva el id del usuario en TinyDB."""
    settings = get_settings()
    expires_in = settings.access_token_expire_minutes * 60
    now = datetime.now(UTC)
    claims = {"sub": user_id, "iat": now, "exp": now + timedelta(seconds=expires_in)}
    return jwt.encode(claims, settings.secret_key, algorithm=settings.jwt_algorithm), expires_in


def decode_access_token(token: str) -> str:
    """Valida firma y expiración; devuelve el id del usuario."""
    settings = get_settings()
    try:
        claims = jwt.decode(token, settings.secret_key, algorithms=[settings.jwt_algorithm])
    except JWTError as exc:
        raise InvalidToken from exc
    user_id = claims.get("sub")
    if not isinstance(user_id, str) or not user_id:
        raise InvalidToken
    return user_id


def authenticate(email: str, password: str) -> dict:
    user = users_domain.get_user_by_email(email)
    # Se verifica siempre un hash para que el tiempo de respuesta no revele si el email existe.
    hashed = user["hashed_password"] if user else _DUMMY_HASH
    if not verify_password(password, hashed) or user is None or not user["is_active"]:
        raise InvalidCredentials
    return user


_DUMMY_HASH = bcrypt.hash("trackflow-dummy-password")
