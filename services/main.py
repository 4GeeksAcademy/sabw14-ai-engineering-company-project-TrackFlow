"""TrackFlow API: composición de la app (CORS + routers por dominio). Sin endpoints ni lógica aquí."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import get_settings
from cors import effective_cors_origins
from routers import auth, health, profiles, users

settings = get_settings()

app = FastAPI(
    title="TrackFlow API",
    description="Autenticación (TinyDB) e inventario de los almacenes LA y ZGZ. "
    "Arquitectura: docs/ARCHITECTURE_PROPOSAL.md",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=effective_cors_origins(settings),
    allow_credentials=False,  # auth por cabecera Bearer, sin cookies (D-17)
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(profiles.router)
