"""Salud de la API: /health (pública, para monitorización)."""

from fastapi import APIRouter

from config import get_settings
from database import get_tinydb
from cors import effective_cors_origins
from schemas import HealthResponse

router = APIRouter(tags=["platform"])


@router.get("/health", response_model=HealthResponse, summary="Estado de la API y de sus bases de datos")
def health() -> HealthResponse:
    settings = get_settings()
    try:
        get_tinydb().tables()
        tinydb_status = "ok"
    except Exception:  # noqa: BLE001 — el health check informa, no falla
        tinydb_status = "error"
    return HealthResponse(
        status="ok" if tinydb_status == "ok" else "degraded",
        environment=settings.environment,
        tinydb=tinydb_status,
        cors_origins=effective_cors_origins(settings),
    )
