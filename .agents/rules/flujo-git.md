---
name: flujo-git
description: Ramas, commits y pull requests en el monorepo de TrackFlow.
scope: always
activation: Siempre activa. Se aplica en cada commit, push y PR.
reason: Cada hito se revisa como un PR contra main; un PR que se mergea en otra rama no llega a desplegarse (pasó con el #2).
---

# Regla: flujo de Git

## Ramas

- Se **DEBE** crear una rama por hito o feature a partir de `main` actualizado (`git switch main && git pull`).
- El nombre **DEBE** ser `feature/<descripcion-kebab>`, `fix/<descripcion>` o `chore/<descripcion>`, salvo que el enunciado del hito exija otro (p. ej. `feature/agent-memory-bank`).
- El agente **NO DEBE** hacer commit ni push directamente a `main`.

## Commits

- Formato **Conventional Commits**: `<tipo>(<ámbito>): <resumen en español, imperativo, ≤ 72 caracteres>`.
  - Tipos: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `style`.
  - Ámbitos habituales: `website`, `backoffice`, `<servicio>`, `memory-bank`, `agents`, `scripts`.
- Un commit **DEBE** contener una sola preocupación. Los cambios de documentación, de dependencias y de código van en commits separados cuando sea posible.
- El autor **DEBE** ser `Samuel Bolivar <sabw14@gmail.com>`; está configurado en el repo con `git config user.email`.
- Los commits hechos con ayuda de un agente **DEBEN** llevar el trailer `Co-Authored-By:` del agente.

## Pull requests

- La base del PR **DEBE** ser `main`. Si un PR depende de otro todavía abierto, se **DEBE** cambiar su base a `main` antes de mergearlo.
- La descripción **DEBE** incluir:
  - qué se implementó;
  - cómo probarlo (el comando para Codespaces);
  - las evidencias que pida el hito (URL pública, Lighthouse…);
  - el enlace a `docs/soluciones/<slug>.md`.
- Un PR aprobado **DEBE** mergearse a `main` antes de empezar el siguiente hito.

## Cómo se comprueba

- `bash scripts/verificar-entrega.sh` falla si la rama actual es `main`, si el autor configurado no es `sabw14@gmail.com` o si hay archivos con CRLF.
- La skill `entrega-hito` comprueba la base del PR con `gh pr view --json baseRefName`.
