"""Dependencias compartidas entre routers (inyección con Depends)."""

from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from domain import auth as auth_domain
from domain import users as users_domain

# tokenUrl apunta al endpoint de formulario que usa el botón "Authorize" de /docs.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

_UNAUTHORIZED = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="No autenticado: token ausente, inválido o expirado",
    headers={"WWW-Authenticate": "Bearer"},
)


def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]) -> dict:
    """Extrae el Bearer token, valida firma y expiración y devuelve el usuario de TinyDB (401 si algo falla)."""
    try:
        user_id = auth_domain.decode_access_token(token)
    except auth_domain.InvalidToken:
        raise _UNAUTHORIZED from None
    user = users_domain.get_user_by_id(user_id)
    if user is None or not user["is_active"]:
        raise _UNAUTHORIZED
    return user


CurrentUser = Annotated[dict, Depends(get_current_user)]


def require_roles(*roles: str):
    """Dependencia de control: 403 si el usuario autenticado no tiene uno de los roles indicados."""

    def checker(user: CurrentUser) -> dict:
        if user["role"] not in roles:
            raise HTTPException(status.HTTP_403_FORBIDDEN, detail="No tienes permiso para esta acción")
        return user

    return checker


def ensure_self_or_admin(current: dict, target_user_id: str) -> None:
    """403 si el usuario intenta acceder o modificar a otro usuario sin ser admin."""
    if current["id"] != target_user_id and current["role"] != "admin":
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="No puedes acceder a los datos de otro usuario")
