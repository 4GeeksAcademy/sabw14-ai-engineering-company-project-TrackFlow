"""Orígenes CORS efectivos: los de Settings más, en Codespaces, los del propio codespace (D-17)."""

import os

from config import Settings

FRONTEND_PORTS = (3000, 3001)


def effective_cors_origins(settings: Settings) -> list[str]:
    origins = list(settings.cors_origin_list)
    codespace = os.environ.get("CODESPACE_NAME")
    domain = os.environ.get("GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN")
    if codespace and domain:
        # En Codespaces la web y la API difieren por subdominio: <codespace>-3000.<dominio> vs -8000.
        origins += [f"https://{codespace}-{port}.{domain}" for port in FRONTEND_PORTS]
    return list(dict.fromkeys(origins))
