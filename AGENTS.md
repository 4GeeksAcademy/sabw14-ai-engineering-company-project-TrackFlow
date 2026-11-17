# AGENTS.md — cómo trabaja cualquier agente en este repo

Punto de entrada único para agentes de código (Claude Code, Cursor, Copilot, Windsurf…).
El negocio está en [`CONTEXT.md`](./CONTEXT.md); aquí solo se define **cómo** se trabaja.

## 1. Al empezar cada sesión (obligatorio, en este orden)

1. [`CONTEXT.md`](./CONTEXT.md): índice del proyecto.
2. [`memory-bank/projectbrief.md`](./memory-bank/projectbrief.md): negocio, problema y usuarios.
3. [`memory-bank/techContext.md`](./memory-bank/techContext.md): stack, mapa de carpetas y decisiones.
4. [`memory-bank/progress.md`](./memory-bank/progress.md): qué está hecho, qué está en curso y qué sigue.
5. El `BRIEFING.md` del hito o app que se va a tocar (p. ej. `uis/website/BRIEFING.md`).
6. Las reglas de `.agents/rules/` que apliquen (ver §5).

Si falta un archivo de esta lista, o hay una contradicción que afecta a la tarea en curso, **detente y pregunta** antes de escribir código. Las contradicciones ajenas a la tarea se anotan en `memory-bank/progress.md` (*Problemas conocidos*) y se sigue.

## 2. Dónde va el código

| Si es… | Va en |
|---|---|
| Web pública | `uis/website` |
| App interna (backoffice) | `uis/backoffice` |
| API o worker | `services/<nombre>` |
| Tipos o esquemas compartidos | `packages/` · `shared/` |

Detalle y prohibiciones: [`.agents/rules/estructura-monorepo.md`](./.agents/rules/estructura-monorepo.md).

## 3. Comandos clave

| Qué | Comando (desde la raíz) |
|---|---|
| Servir la web | `npx --yes http-server@14.1.1 uis/website -p 3000 -a 0.0.0.0 -c-1` |
| Instalar y recompilar estilos de la web | `pnpm --dir uis/website install` (una vez) y `pnpm --dir uis/website run build` |
| Verificar antes de commit/PR | `bash scripts/verificar-entrega.sh` |

Gestores permitidos para dependencias: **pnpm** (JS) y **uv** (Python); nada de npm, yarn ni pip para añadirlas. `npx` o `pnpm dlx` solo sirven para ejecutar una herramienta puntual **con versión exacta** (`http-server@14.1.1`, `lighthouse@12.8.2`).

## 4. Flujo obligatorio antes de cada commit

1. **Revisar el alcance**: `git status` y `git diff --stat`. Solo se tocan archivos del ticket o hito en curso; lo demás se revierte o se pregunta.
2. **Compilar los artefactos generados**: si cambió un `.html`, un `.js` o `src/input.css` de `uis/website`, ejecutar `pnpm --dir uis/website run build` y commitear el `styles.css` resultante.
3. **Ejecutar las comprobaciones**: `bash scripts/verificar-entrega.sh` debe terminar con `0 errores`.
4. **Verificar el comportamiento**: levantar la app afectada y probar el caso del cambio, sin errores en la consola del navegador. Si hay tests del paquete, ejecutarlos.
5. **Actualizar el contexto**: si cambió el comportamiento, una decisión o el estado, actualizar `memory-bank/progress.md` (y `techContext.md` si cambió el stack). Skill: `actualizar-memory-bank`.
6. **Documentar el hito**: mantener al día `docs/soluciones/<slug>.md` (arquitectura, decisiones, prompts y evidencias).
7. **Hacer commit** con el formato de [`.agents/rules/flujo-git.md`](./.agents/rules/flujo-git.md) y el autor `sabw14@gmail.com`.

Para cerrar un hito (push y PR), usar la skill [`entrega-hito`](./.agents/skills/entrega-hito/SKILL.md).

## 5. Índice de reglas (`.agents/rules/`)

| Regla | Alcance | Cuándo aplica |
|---|---|---|
| [`estructura-monorepo.md`](./.agents/rules/estructura-monorepo.md) | always | Siempre: al crear archivos o carpetas |
| [`flujo-git.md`](./.agents/rules/flujo-git.md) | always | Siempre: ramas, commits y PRs |
| [`dependencias-y-secretos.md`](./.agents/rules/dependencias-y-secretos.md) | always | Siempre: dependencias, `.env`, datos sensibles, aprobaciones |
| [`fidelidad-briefing.md`](./.agents/rules/fidelidad-briefing.md) | glob `uis/**`, `services/**`, `data/**`, `agents/**`, `packages/**` | Al escribir código o textos de producto |
| [`frontend-website.md`](./.agents/rules/frontend-website.md) | glob `uis/website/**` | Al tocar la web pública |

## 6. Skills (`.agents/skills/`)

| Skill | Objetivo |
|---|---|
| [`entrega-hito`](./.agents/skills/entrega-hito/SKILL.md) | Dejar un hito listo para revisión: comprobaciones, documento de solución, push y PR contra `main` |
| [`actualizar-memory-bank`](./.agents/skills/actualizar-memory-bank/SKILL.md) | Reflejar en `memory-bank/` lo que cambió tras una feature o decisión |

## 7. No modificar sin confirmación explícita del desarrollador

- `BRIEFING.md` (raíz) y cualquier `**/BRIEFING.md`: son copias literales de 4Geeks (no se modifican nunca).
- `.env*`: secretos y configuración local.
- `AGENTS.md`, `.agents/**` y `CLAUDE.md`: las reglas no se cambian a sí mismas.
- `.devcontainer/**`, `.gitattributes`, `.gitignore` e `infra/**`: entorno e infraestructura.
- Lockfiles (`**/pnpm-lock.yaml`, `**/uv.lock`): solo cambian al añadir o quitar dependencias aprobadas.
- `docs/evidencias/**`: evidencias ya entregadas.
- `company-choice.md`: la decisión registrada de la empresa.
- Borrar archivos o carpetas, reescribir el historial (`rebase`, `reset --hard`, `push --force`) o hacer push a `main`.

## 8. Líneas rojas

- Ningún secreto (claves, tokens, contraseñas) en el código, los commits, los logs ni los prompts.
- No inventar nombres de campos, valores ni mensajes: salen del `BRIEFING.md` del hito.
- No usar CDN de Tailwind ni CSS escrito a mano en `uis/website`.
- No crear carpetas de app fuera del mapa de §2.
