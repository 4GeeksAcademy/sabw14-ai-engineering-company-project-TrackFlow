# Tech context — TrackFlow monorepo

> **Fuentes:** `README.md` de la plantilla y de cada carpeta, `.devcontainer/devcontainer.json` y las decisiones registradas abajo.
> **Actualizar cuando:** entre o cambie una tecnología, se cree una app o servicio, o se tome una decisión de arquitectura (añadir una fila en *Decisiones*).

## Entorno de desarrollo

| Pieza | Versión / valor | Fuente |
|---|---|---|
| Codespaces / devcontainer | `mcr.microsoft.com/devcontainers/base:ubuntu-24.04` | `.devcontainer/devcontainer.json` |
| Node.js | 22 | devcontainer |
| Gestor JS | **pnpm** (corepack) | devcontainer `postCreateCommand` (instala `pnpm@latest`) |
| pnpm de `uis/website` | `pnpm@12.18.0` (`packageManager`) y `minimumReleaseAge: 4320` (3 días) | `uis/website/package.json`, `uis/website/pnpm-workspace.yaml` |
| Python | 3.12 | devcontainer |
| Gestor Python | **uv** | devcontainer `postCreateCommand` |
| Puertos reenviados | `3000` (frontends), `8000` (APIs), `5678` (n8n) | devcontainer `forwardPorts` |
| Saltos de línea | LF en el repo (`.gitattributes`) | decisión D-04 |

Se desarrolla en local (Windows) y se verifica en Codespaces (Linux). Todo comando documentado debe funcionar en Codespaces.

## Mapa de carpetas (dónde va el código)

| Ruta | Qué va aquí | Estado |
|---|---|---|
| `uis/website` | Web pública corporativa (ruta `/`): marca y textos según `BRIEFING.md` | ✅ Hito 1 |
| `uis/talent-pipeline-tracker` | App interna de selección (ruta exigida por el enunciado del Hito 3), puerto 3001 | ✅ Hito 3 |
| `uis/backoffice` | App interna, con su propio layout separado del sitio público y vista de entrada en `/` | Por crear |
| `services/<nombre>` | APIs y workers backend: un servicio por subcarpeta, con su README | Por crear (#18 auth y Hito 5) |
| `packages/domain` | `@trackflow/domain`: lógica de dominio en TypeScript (Hito 2) | ✅ Hito 2 |
| `packages/` · `shared/` | Tipos, esquemas y utilidades compartidas (`packages/shared` = `@repo/shared-types`) | Plantilla |
| `data/` | Datos crudos, pipelines y datasets de evaluación | Plantilla |
| `agents/` · `skills/` · `mcps/` | **Producto**: agentes, capacidades y servidores MCP para TrackFlow | Plantilla |
| `workflows/` | Flujos n8n | Plantilla |
| `infra/` · `scripts/` · `internal/` | Docker y despliegue · scripts auxiliares · CLIs internas | `scripts/` en uso |
| `docs/` | Arquitectura, decisiones, `soluciones/<slug>.md` por hito, `evidencias/` | En uso |
| `.agents/` | **Configuración del agente de código** (reglas y skills de desarrollo). No es producto | Hito 4 |
| `memory-bank/` | Contexto persistente del agente | Hito 4 |

**Prohibido** crear árboles paralelos: `frontend/`, `backend/`, `app/`, `web/`, `api/` o `src/` en la raíz, ni un segundo frontend o API anidado dentro de otra app (p. ej. `uis/website/backend/`). Lo que tiene UI va en `uis/`, lo que expone una API o corre en segundo plano va en `services/`.

## Stack por app

### `uis/website` (Hito 1)

- HTML5 semántico y JavaScript vanilla (`validation.js`, `assets/js/main.js`), sin framework.
- **Tailwind CSS 4.3.4** con `@tailwindcss/cli`. Se compila a `assets/css/styles.css`, que va **versionado**. Los tokens de marca están en `src/input.css` (`@theme`: `brand-*`, `accent-*`).
- Servido como estático: `npx --yes http-server@14.1.1 uis/website -p 3000 -a 0.0.0.0 -c-1`.
- Calidad comprobada: PageSpeed/Lighthouse móvil ≥ 80 sobre la URL pública de Codespaces (captura en el [PR #1](https://github.com/4GeeksAcademy/sabw14-ai-engineering-company-project-TrackFlow/pull/1)).

### `packages/domain` (Hito 2)

- TypeScript **7.0.2** (`tsc --noEmit`, modo estricto con `noUncheckedIndexedAccess` y `exactOptionalPropertyTypes`), **tsx 4.23.15** y `@types/node` 22.20.5. Tests con el runner nativo `node:test`, sin framework extra.
- Gestor: pnpm 12.18.0 (corepack), con `minimumReleaseAge: 4320` en `packages/domain/pnpm-workspace.yaml`.
- Estructura del enunciado (`src/types`, `src/utils`) dentro de `packages/domain/`, porque un `src/` en la raíz está prohibido.

### `uis/talent-pipeline-tracker` (Hito 3)

- **Next.js 16.4.5** (App Router, `cacheComponents`), **React 19.3.0**, TypeScript 5.9.3, Tailwind 4.3.5 y ESLint 9.39.5 con `eslint-config-next` 16.4.5.
- Tests: **Vitest 4.1.12**, Testing Library (react 16.3.3, dom 10.4.2, user-event 14.6.8) y **jsdom 29.1.1**, versiones compatibles con Node 20 (local) y Node 22 (Codespaces).
- API externa: `NEXT_PUBLIC_API_URL` (playground de 4Geeks, compartida por el curso). `GET /records/:id/notes` devuelve `{ data, meta }` (no está en el OpenAPI).
- Next 16 incluye su propio `AGENTS.md` (documentación en `node_modules/next/dist/docs/`).

### Previsto por el programa (no adoptado todavía)

Estas tecnologías se registran aquí, con versión exacta y fuente, **cuando se adopten**; hasta entonces no se instalan.

- Backend en Python con FastAPI: autenticación con JWT y usuarios en TinyDB (#18) e inventario con SQLModel sobre Supabase/Postgres (Hito 5). Fuente: briefings del #18 y del Hito 5, que se copian sin modificar a `services/BRIEFING.md` al empezar.

## Decisiones de arquitectura

| ID | Decisión | Motivo | Fecha |
|---|---|---|---|
| D-01 | `BRIEFING.md` literal en la raíz; `CONTEXT.md` como resumen e índice | Una fuente literal y una vista operativa para los agentes | 2026-11-07 |
| D-02 | El briefing de cada hito se guarda **sin modificar** junto a su app | Trazabilidad: el revisor compara contra ese archivo | 2026-11-07 |
| D-03 | Tailwind compilado y versionado; prohibido el CDN | El CDN mete JS de runtime y un warning en consola, y baja Lighthouse | 2026-11-07 |
| D-04 | LF obligatorio vía `.gitattributes` | Desarrollo en Windows y ejecución en Linux (Codespaces) | 2026-11-07 |
| D-05 | pnpm y uv como únicos gestores; versiones exactas | Coinciden con el devcontainer; builds reproducibles | 2026-11-07 |
| D-06 | Las dependencias nuevas deben tener **≥ 3 días** publicadas (o fijar la anterior); se aplica con `minimumReleaseAge: 4320` en `pnpm-workspace.yaml` | Mitiga paquetes comprometidos recién publicados | 2026-11-07 |
| D-08 | Las herramientas de un solo uso se ejecutan con `npx`/`pnpm dlx` y versión exacta | Reproducibilidad sin añadirlas como dependencia | 2026-11-07 |
| D-07 | Cada hito se documenta en `docs/soluciones/<slug>.md` | Evidencia de arquitectura, decisiones y prompts para la revisión | 2026-11-07 |

## Restricciones técnicas

- Ningún secreto en el código, en los commits ni en los logs. Las variables van en `.env` (ignorado) y sus nombres, documentados en `.env.example`.
- La accesibilidad (WCAG AA) y el rendimiento (Lighthouse ≥ 80, objetivo ≥ 90) son requisitos de las UIs públicas.
- Idioma base del producto: español (`lang="es"`). El código, los nombres de archivo y los commits siguen las convenciones de `.agents/rules/`.
- Tests: `packages/domain` con `node:test` (`corepack pnpm test`), `uis/talent-pipeline-tracker` con Vitest (`corepack pnpm run check`). `uis/website` se verifica a mano y con Lighthouse.
- En Codespaces, `uis/website/node_modules` no se instala solo (el devcontainer solo ejecuta `pnpm install` si hay un `package.json` en la raíz): hay que ejecutar `pnpm --dir uis/website install` una vez.

## Comandos

| Qué | Comando (desde la raíz) |
|---|---|
| Servir la web | `npx --yes http-server@14.1.1 uis/website -p 3000 -a 0.0.0.0 -c-1` |
| Recompilar estilos de la web | `pnpm --dir uis/website install && pnpm --dir uis/website run build` |
| Verificar la entrega antes de commit/PR | `bash scripts/verificar-entrega.sh` (no modifica archivos) |
| Dominio TS (Hito 2) | `cd packages/domain && corepack pnpm install && corepack pnpm run check` (demo: `corepack pnpm run demo`) |
| Talent Pipeline (Hito 3) | `cd uis/talent-pipeline-tracker && corepack pnpm install && corepack pnpm dev` (3001) · `corepack pnpm run check` |
| Lighthouse móvil | `npx --yes lighthouse@12.8.2 http://localhost:3000/ --form-factor=mobile --view` |
