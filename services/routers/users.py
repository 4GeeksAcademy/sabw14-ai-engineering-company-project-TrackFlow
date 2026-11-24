"""Gestión de usuarios (solo credenciales): /users."""

from fastapi import APIRouter, Depends, HTTPException, Response, status

from dependencies import CurrentUser, ensure_self_or_admin, require_roles
from domain import auth as auth_domain
from domain import users as users_domain
from schemas import ProfileRead, UserCreate, UserRead, UserUpdate, UserWithProfile

router = APIRouter(prefix="/users", tags=["users"])


def _with_profile(user: dict) -> UserWithProfile:
    profile = users_domain.get_profile(user["id"])
    return UserWithProfile(**user, profile=ProfileRead(**profile) if profile else None)


@router.post("", response_model=UserWithProfile, status_code=status.HTTP_201_CREATED,
             summary="Registro público: crea el usuario (rol user) y su perfil")
def register(body: UserCreate) -> UserWithProfile:
    try:
        user = users_domain.create_user(
            email=body.email,
            hashed_password=auth_domain.hash_password(body.password),
            role="user",
            profile=body.model_dump(include={"name", "phone", "address"}),
        )
    except users_domain.EmailAlreadyRegistered:
        raise HTTPException(status.HTTP_409_CONFLICT, detail="Ya existe un usuario con ese email") from None
    return _with_profile(user)


@router.get("", response_model=list[UserRead], summary="Lista usuarios (admin o manager)",
            dependencies=[Depends(require_roles("admin", "manager"))])
def list_users() -> list[UserRead]:
    return [UserRead(**u) for u in users_domain.list_users()]


@router.get("/{user_id}", response_model=UserWithProfile, summary="Un usuario (el propio o, si eres admin, cualquiera)")
def get_user(user_id: str, current: CurrentUser) -> UserWithProfile:
    ensure_self_or_admin(current, user_id)
    user = users_domain.get_user_by_id(user_id)
    if user is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
    return _with_profile(user)


@router.put("/{user_id}", response_model=UserWithProfile,
            summary="Actualiza credenciales (el propio usuario o un admin; role e is_active solo admin)")
def update_user(user_id: str, body: UserUpdate, current: CurrentUser) -> UserWithProfile:
    ensure_self_or_admin(current, user_id)
    if (body.role is not None or body.is_active is not None) and current["role"] != "admin":
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="Solo un admin puede cambiar el rol o el estado")
    changes = body.model_dump(exclude_unset=True, exclude={"password"})
    if body.password is not None:
        changes["hashed_password"] = auth_domain.hash_password(body.password)
    try:
        user = users_domain.update_user(user_id, changes)
    except users_domain.UserNotFound:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado") from None
    except users_domain.EmailAlreadyRegistered:
        raise HTTPException(status.HTTP_409_CONFLICT, detail="Ya existe un usuario con ese email") from None
    return _with_profile(user)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT,
               summary="Elimina el usuario y su perfil (el propio usuario o un admin)")
def delete_user(user_id: str, current: CurrentUser) -> Response:
    ensure_self_or_admin(current, user_id)
    try:
        users_domain.delete_user(user_id)
    except users_domain.UserNotFound:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado") from None
    return Response(status_code=status.HTTP_204_NO_CONTENT)
