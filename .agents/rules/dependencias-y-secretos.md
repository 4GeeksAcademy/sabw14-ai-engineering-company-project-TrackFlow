---
name: dependencias-y-secretos
description: Gestión de dependencias, secretos, datos sensibles y acciones que requieren aprobación humana.
scope: always
activation: Siempre activa. Se aplica al instalar paquetes, tocar archivos .env o configuración, manejar datos de personas o ejecutar acciones destructivas.
reason: TrackFlow opera en EE. UU. y la UE (RGPD) con datos de destinatarios y clientes; además, un paquete recién publicado puede venir comprometido.
---

# Regla: dependencias, secretos y aprobaciones

## Dependencias

- Gestores permitidos: **pnpm** para JS/TS (`pnpm add -D <pkg>@<versión-exacta>`, `pnpm remove <pkg>`, `pnpm install`) y **uv** para Python (`uv add <pkg>==<versión>`, `uv remove <pkg>`, `uv sync`). El agente **NO DEBE** usar `npm install`, `yarn` ni `pip install` para añadir dependencias.
- Toda dependencia nueva **DEBE**:
  - tener una versión **exacta**, sin `^` ni `~`;
  - venir del registro oficial;
  - llevar **al menos 3 días** publicada (si no, se fija la versión estable anterior);
  - registrarse en `memory-bank/techContext.md` con su versión, fuente y motivo.
- El agente **NO DEBE** añadir una librería para algo que resuelven unas pocas líneas de código propio o la plataforma (p. ej. validación de formularios en `uis/website`).
- El agente **NO DEBE** desactivar protecciones del gestor de paquetes (`minimumReleaseAge`, `approve-builds`) para forzar una instalación.

## Secretos y datos sensibles

- Los secretos (API keys, tokens, contraseñas, cadenas de conexión) **DEBEN** vivir solo en `.env` (ignorado por git) o en los *Codespaces secrets*. Sus **nombres**, con valores ficticios, se documentan en `.env.example`.
- **NUNCA** pueden aparecer secretos en: código, commits, logs, mensajes de error, prompts, datos de prueba ni documentación.
- Los datos de prueba **DEBEN** ser ficticios: dominios `example.com` o de empresas inventadas y teléfonos de los formatos del briefing (`+1 213 555 01xx`, `+34 976 …`).
- Los datos personales de destinatarios y contactos (EE. UU. y UE) **NO DEBEN** registrarse en consola ni en logs, ni enviarse a servicios externos no aprobados.

## Disparadores de aprobación humana (formato EARS)

- **Cuando** el agente vaya a borrar archivos o carpetas, **el agente debe** listar lo que borraría y esperar confirmación explícita.
- **Cuando** el agente vaya a reescribir el historial de Git (`rebase`, `reset --hard`, `commit --amend` sobre commits publicados, `push --force`), **el agente debe** detenerse y pedir aprobación.
- **Cuando** el agente vaya a añadir, quitar o actualizar una dependencia, **el agente debe** proponer el paquete, la versión exacta y la fuente, y esperar aprobación.
- **Cuando** el agente vaya a modificar `.env*`, `.devcontainer/**`, `infra/**`, `.gitattributes` o `.gitignore`, **el agente debe** mostrar el cambio y esperar aprobación.
- **Cuando** el agente vaya a modificar `AGENTS.md`, `CLAUDE.md` o `.agents/**`, **el agente debe** pedir aprobación, salvo que la tarea sea precisamente esa.
- **Cuando** el agente vaya a modificar un `BRIEFING.md`, **el agente debe** negarse y avisar: son copias literales de 4Geeks.
- **Cuando** el agente vaya a modificar cualquier otra ruta protegida de `AGENTS.md` §7 (lockfiles sin cambio de dependencias, `docs/evidencias/**`, `company-choice.md`), **el agente debe** explicar el cambio y esperar aprobación.
