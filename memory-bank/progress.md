# Progress — estado del proyecto

> **Actualizar en cada PR** que cambie comportamiento, añada una app o servicio, o cierre o abra un hito: mover las filas, fechar y enlazar el PR.
> Última actualización: **2026-11-17** · rama `feature/auth-api`

## Hecho

| Hito | Qué quedó funcionando | PR | Documentación |
|---|---|---|---|
| Elige tu empresa | TrackFlow elegida; `company-choice.md` en la raíz (aprobado) | commit `54403e1` en `main` | `company-choice.md` |
| Hito 1 · Web pública | `uis/website`: landing y formulario de leads cualificados (12 campos, validación, aviso para volúmenes de 0-100). PageSpeed/Lighthouse ≥ 80 sobre la URL pública de Codespaces | [#1](https://github.com/4GeeksAcademy/sabw14-ai-engineering-company-project-TrackFlow/pull/1) | `uis/website/README.md` |
| Hito 2 · Scripts TypeScript | `packages/domain` (`@trackflow/domain`): modelos del briefing, colecciones, búsqueda lineal y binaria, coste y scoring de transportistas, reportes y validaciones; 43 tests. Uso de IA declarado. Pregunta abierta: `selectBestCarrier` elige UPS para Madrid | [#2](https://github.com/4GeeksAcademy/sabw14-ai-engineering-company-project-TrackFlow/pull/2) | `packages/domain/README.md` |
| Hito 3 · Talent Pipeline Tracker | `uis/talent-pipeline-tracker`: Next.js 16 + React 19 + TS contra la API de 4Geeks; filtros y búsqueda en la URL, `PATCH` de estado y etapa, notas, alta (`POST`) y edición (`PUT`); 23 tests | [#3](https://github.com/4GeeksAcademy/sabw14-ai-engineering-company-project-TrackFlow/pull/3) | `uis/talent-pipeline-tracker/README.md` |
| Hito 4 · Ingeniería impulsada por IA | `memory-bank/`, `AGENTS.md`, `.agents/rules` (5 reglas) y skill `actualizar-memory-bank` | [#4](https://github.com/4GeeksAcademy/sabw14-ai-engineering-company-project-TrackFlow/pull/4) | `AGENTS.md` |
| Propuesta de arquitectura de backend (#16) | `docs/ARCHITECTURE_PROPOSAL.md` (capas por dominio, routers, CORS, variables de entorno, riesgos); `CONTEXT.md` y `BRIEFING.md` de TrackFlow; D-09 aplicada en `feature/auth-api` | [#5](https://github.com/4GeeksAcademy/sabw14-ai-engineering-company-project-TrackFlow/pull/5) | `docs/soluciones/ai-eng-architectural-proposal.md` |

## En curso

| Hito | Alcance | Rama |
|---|---|---|
| #18 · Asegurando la API | `services/` (D-09): FastAPI + TinyDB; `/users`, `/profiles/me`, `/auth/*`; JWT y bcrypt; `get_current_user`; `401`/`403`; 22 tests. Añade `.devcontainer/` (Python 3.12, uv, Node 22) y `.gitattributes` (LF) | `feature/auth-api` |

## Próximos pasos

1. Mergear el PR de este hito. Entregarlo en el campus cuando el Hito 5 esté en `main`: el #18 pide 5 o más rutas protegidas fuera de `/users` y `/auth`, y las completan las 6 de `/inventory`.
2. **Hito 5 · API de inventario** (TRK-0341, Andrés Kim): SQLModel sobre Supabase/Postgres e inventario protegido; el stock se calcula por SKU y almacén y nunca se almacena.

## Problemas conocidos / aprendizajes

- El evento `close` de `<dialog>` puede no dispararse si la página no se está renderizando; las acciones del diálogo se resuelven en el `click` de sus botones.
- pnpm 12 bloqueó Tailwind 4.3.5 (publicada el día anterior); se fijó la 4.3.4 y la política de 3 días quedó configurada en `uis/website/pnpm-workspace.yaml` (D-06).
- pnpm 12 bloquea los scripts de instalación de las dependencias (`ERR_PNPM_IGNORED_BUILDS`): se permiten de forma explícita con `pnpm approve-builds <paquete>`, que lo registra en `allowBuilds` del `pnpm-workspace.yaml`.
- El `BRIEFING.md` general nombra al CEO como "Thomas Harry" y como "Thomas Espinoza": en el código y la documentación se usa solo "Thomas" hasta que se aclare.
- `uis/website/BRIEFING.md` enlaza a una versión en inglés que no está en el repo; se deja así porque es una copia literal.
- Las reglas y skills de `.agents/` no las carga automáticamente ninguna herramienta: dependen de que el agente siga `AGENTS.md` §1 y §5.
