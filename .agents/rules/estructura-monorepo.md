---
name: estructura-monorepo
description: Dónde vive cada tipo de código en el monorepo de TrackFlow y qué carpetas no se pueden inventar.
scope: always
activation: Siempre activa. Se aplica al crear, mover o renombrar cualquier archivo o carpeta.
reason: El tech lead pidió no crear árboles paralelos; el Hito 4 evalúa que uis/website, uis/backoffice y services sean las únicas raíces de app.
---

# Regla: estructura del monorepo

## Normas

1. El código de producto **DEBE** ir en la carpeta que le corresponde según su naturaleza:

   | Tipo de pieza | Ruta obligatoria |
   |---|---|
   | Web pública corporativa (ruta `/`, marca y textos del `BRIEFING.md`) | `uis/website/` |
   | App interna (backoffice): layout propio separado del sitio público, vista de entrada en `/` | `uis/backoffice/` |
   | Otra interfaz (portal de seguimiento B2C, dashboards) | `uis/<nombre-kebab>/` |
   | API REST o worker | `services/<nombre-kebab>/` (p. ej. `services/inventory-api/`) |
   | Tipos, esquemas y SDK compartidos | `packages/<nombre>/` o `shared/` |
   | Datos crudos, pipelines y datasets | `data/` |
   | Agente de IA de producto | `agents/<nombre>/` (desde `agents/_template`) |
   | Skill o servidor MCP de producto | `skills/<nombre>/` · `mcps/<nombre>/` |
   | Flujo n8n | `workflows/` |
   | Docker y despliegue | `infra/`; `docker-compose.yml` en la raíz |
   | Script auxiliar del repo | `scripts/` |
   | Documentación de hito o de arquitectura | `docs/soluciones/<slug>.md` · `docs/` |

2. El agente **NO DEBE** crear carpetas de app paralelas: `frontend/`, `backend/`, `web/`, `app/`, `api/`, `src/` en la raíz, ni un segundo sitio público fuera de `uis/website/`.
3. Toda app, servicio o agente nuevo **DEBE** tener su `README.md` (objetivo, stack, cómo ejecutarlo) y **DEBE** añadirse a la tabla del `README` de su carpeta padre (p. ej. `uis/README.md`).
4. Antes de crear algo en una carpeta, el agente **DEBE** leer el `README.md` de esa carpeta.
5. El agente **NO DEBE** confundir `.agents/` (configuración del agente de código) con `agents/` y `skills/` (producto de TrackFlow).
6. El briefing del hito **DEBE** guardarse sin modificar como `BRIEFING.md` dentro de la carpeta de la app que lo implementa.

## Cómo se comprueba

- `bash scripts/verificar-entrega.sh` falla si existen `frontend/`, `backend/`, `web/`, `app/` o `api/` en la raíz, o si una carpeta de `uis/*` o `services/*` no tiene `README.md`.
