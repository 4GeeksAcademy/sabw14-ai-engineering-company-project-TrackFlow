---
name: actualizar-memory-bank
description: Refleja en memory-bank/ (y en el índice de CONTEXT.md) lo que cambió tras una feature, una decisión o un cambio de stack en el monorepo de TrackFlow. Úsala antes de cada commit que cambie comportamiento y al cerrar cada hito.
---

# Skill: actualizar el memory bank

## Objetivo (único)

Que `memory-bank/` describa **el estado real del repositorio** después de un cambio, para que la siguiente sesión del agente empiece sin perder contexto.

## Inputs

| Input | Obligatorio | Ejemplo |
|---|---|---|
| Rama y PR del cambio | Sí | `feature/hito-4-ingenieria-impulsada-por-ia` |
| Qué cambió | Sí | "Nueva API `services/inventory-api` con rutas `/inventory`" |
| Tipo de cambio | Sí | `feature` · `decisión` · `stack` · `problema` · `cierre de hito` |
| Datos de dominio nuevos del briefing | Si el hito los trae | Entidades del Hito 5 (SKU, entrada, salida) |

## Pasos

1. Leer `git diff --stat origin/main...HEAD` para confirmar qué cambió de verdad (no lo que se planeó).
2. **`progress.md`**:
   - mover el trabajo entre *Hecho*, *En curso* y *Próximos pasos*;
   - enlazar el PR;
   - actualizar la fecha de "Última actualización";
   - añadir los problemas o aprendizajes nuevos.
3. **`techContext.md`**, solo si el cambio es de stack o de decisión:
   - registrar la tecnología con su versión exacta y su fuente;
   - añadir una fila `D-xx` en *Decisiones*, con su motivo y su fecha;
   - actualizar el estado en el *Mapa de carpetas* y los *Comandos*.
4. **`projectbrief.md`**, solo si cambia el alcance o el briefing del hito trae datos de dominio nuevos: añadirlos con su fuente.
5. **`CONTEXT.md`**: si se creó documentación, una app o un briefing nuevo, añadir la fila en el *Índice para agentes* con cuándo leerlo.
6. Verificar los criterios de aceptación y hacer commit como `docs(memory-bank): …`.

## Criterios de aceptación (todos verificables)

- [ ] `git diff --name-only origin/main...HEAD` incluye `memory-bank/progress.md`.
- [ ] La línea `Última actualización:` de `progress.md` tiene la fecha de hoy (`grep "Última actualización: \*\*$(date +%F)\*\*" memory-bank/progress.md`).
- [ ] El PR o la rama del cambio aparece en `progress.md` (`grep -F "<rama-o-#PR>" memory-bank/progress.md`).
- [ ] Toda carpeta nueva bajo `uis/` o `services/` aparece en el *Mapa de carpetas* de `techContext.md` (`grep -F "<ruta>" memory-bank/techContext.md`).
- [ ] Toda dependencia nueva de un `package.json` o `pyproject.toml` en el diff aparece en `techContext.md` con su versión exacta (`grep -F "<paquete>" memory-bank/techContext.md`).
- [ ] Ningún archivo de `memory-bank/` copia literalmente líneas largas del `BRIEFING.md`: los resume y cita la fuente.

## Salida esperada

- Un commit `docs(memory-bank): <resumen>` con solo archivos de `memory-bank/` y, si aplica, `CONTEXT.md`.
