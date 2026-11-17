---
name: frontend-website
description: Convenciones de la web pública de TrackFlow (HTML semántico, Tailwind compilado, accesibilidad y rendimiento).
scope: glob
globs: ["uis/website/**"]
activation: Por patrón de archivo. Se activa al editar cualquier archivo de uis/website.
reason: El Hito 1 se aprobó con Lighthouse 100; estas normas evitan regresiones al tocar la web.
---

# Regla: web pública (`uis/website`)

## Normas

1. **Estilos**
   - Solo utilidades de Tailwind en el HTML.
   - Los tokens de marca se definen en `src/input.css` (`@theme`: `brand-*`, `accent-*`).
   - El agente **NO DEBE** añadir CSS escrito a mano, `style=""` ni el CDN `cdn.tailwindcss.com`.
2. **Build**: tras cambiar cualquier `.html`, `.js` o `src/input.css`, el agente **DEBE** ejecutar `pnpm --dir uis/website run build` y commitear `assets/css/styles.css`. Ese archivo es generado: **NO DEBE** editarse a mano.
3. **Semántica**
   - Un solo `<h1>` por página.
   - Secciones con `aria-labelledby`.
   - `header`, `nav`, `main`, `footer`, `address`, `fieldset` y `legend` donde correspondan.
   - Nada de `div` para lo que tiene etiqueta semántica.
4. **Accesibilidad**
   - Toda imagen lleva `alt` descriptivo; los iconos decorativos, `aria-hidden="true"`.
   - Todo elemento interactivo tiene `focus-visible`.
   - Todo campo tiene `<label for>` y su error enlazado con `aria-describedby`.
   - Hay que mantener el contraste AA.
5. **Formulario**: los `name` y `id` de los campos y los mensajes están definidos por el briefing (`nombre_empresa`, `persona_contacto`, …). La lógica va en `validation.js`, sin dependencias, en una IIFE y sin `console.log`.
6. **Rendimiento**
   - Nada de JS de terceros.
   - Las imágenes van en SVG o en un formato moderno, con `width` y `height`.
   - Los scripts se cargan con `defer`.
   - Lighthouse móvil **DEBE** seguir en 90 o más en todas las categorías.
7. **SEO**: hay que mantener el JSON-LD `Organization` literal del briefing, la meta description, el canonical, `robots.txt` y `sitemap.xml` (cada página nueva se añade al sitemap).
8. **Rutas**: los enlaces internos son relativos (`index.html#servicios`), para que el sitio funcione servido desde `uis/website` en Codespaces.

## Cómo se comprueba

- Lighthouse (manual, con la web servida): `npx --yes lighthouse@12.8.2 http://localhost:3000/ --form-factor=mobile --only-categories=performance,accessibility,best-practices,seo --view`.
