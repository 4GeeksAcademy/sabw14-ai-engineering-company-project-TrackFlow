"""Rutas de autenticación: /auth."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from dependencies import CurrentUser
from domain import auth as auth_domain
from domain import users as users_domain
from schemas import LoginRequest, MeResponse, ProfileRead, Token

router = APIRouter(prefix="/auth", tags=["auth"])

_BAD_CREDENTIALS = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Email o contraseña incorrectos",
    headers={"WWW-Authenticate": "Bearer"},
)


def _issue_token(email: str, password: str) -> Token:
    try:
        user = auth_domain.authenticate(email, password)
    except auth_domain.InvalidCredentials:
        raise _BAD_CREDENTIALS from None
    token, expires_in = auth_domain.create_access_token(user["id"])
    return Token(access_token=token, expires_in=expires_in)


@router.post("/login", response_model=Token, summary="Login con email y contraseña (JSON)")
def login(body: LoginRequest) -> Token:
    return _issue_token(body.email, body.password)


@router.post(
    "/token",
    response_model=Token,
    summary="Login con formulario OAuth2 (usado por el botón Authorize de /docs; username = email)",
)
def login_form(form: Annotated[OAuth2PasswordRequestForm, Depends()]) -> Token:
    return _issue_token(form.username, form.password)


@router.get("/me", response_model=MeResponse, summary="Usuario autenticado y su perfil")
def me(user: CurrentUser) -> MeResponse:
    profile = users_domain.get_profile(user["id"])
    return MeResponse(
        email=user["email"],
        role=user["role"],
        profile=ProfileRead(**profile) if profile else None,
    )
