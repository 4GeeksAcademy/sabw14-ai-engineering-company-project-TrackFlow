"""Perfil del usuario autenticado: /profiles."""

from fastapi import APIRouter, HTTPException, status

from dependencies import CurrentUser
from domain import users as users_domain
from schemas import ProfileRead, ProfileUpdate

router = APIRouter(prefix="/profiles", tags=["profiles"])


@router.get("/me", response_model=ProfileRead, summary="Mi perfil")
def my_profile(user: CurrentUser) -> ProfileRead:
    profile = users_domain.get_profile(user["id"])
    if profile is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Perfil no encontrado")
    return ProfileRead(**profile)


@router.put("/me", response_model=ProfileRead, summary="Actualiza mi nombre, teléfono y dirección")
def update_my_profile(body: ProfileUpdate, user: CurrentUser) -> ProfileRead:
    # Solo el dueño: la ruta opera siempre sobre el usuario del token, no hay id de otro usuario.
    return ProfileRead(**users_domain.update_profile(user["id"], body.model_dump(exclude_unset=True)))
