# TrackFlow — Sitio web público

Primer punto de contacto digital de TrackFlow (Hito 1): una landing page que presenta los servicios y un formulario que capta leads cualificados de empresas de e-commerce.

- Requisitos del negocio y datos: [`BRIEFING.md`](./BRIEFING.md) (sin modificar).
- Documentación completa de la solución: [`docs/soluciones/ai-eng-milestone-web-fundamentals.md`](../../docs/soluciones/ai-eng-milestone-web-fundamentals.md).

## Cómo ejecutar

Desde la **raíz del monorepo** (local o Codespaces):

```bash
npx http-server uis/website -p 3000 -a 0.0.0.0 -c-1
```

En Codespaces: pestaña **Ports** → puerto `3000` → clic derecho → **Port Visibility → Public**, y abre la URL `https://<codespace>-3000.app.github.dev`.

El CSS compilado (`assets/css/styles.css`) está versionado, así que no hace falta instalar nada para servir el sitio.

### Modificar estilos

```bash
cd uis/website
npm install
npm run watch    # recompila assets/css/styles.css al guardar
npm run build    # build minificado antes de hacer commit
```

## Estructura

```text
uis/website/
├── BRIEFING.md            # briefing del Hito 1 (sin modificar)
├── index.html             # landing page
├── application.html       # formulario de solicitud de información
├── privacidad.html        # política de privacidad enlazada desde el formulario
├── validation.js          # validación del formulario
├── assets/
│   ├── css/styles.css     # Tailwind compilado (generado: no editar a mano)
│   ├── js/main.js         # menú móvil
│   └── img/               # logo, favicon e ilustración (SVG)
├── src/input.css          # entrada de Tailwind y tokens de marca (@theme)
├── robots.txt · sitemap.xml
└── package.json           # scripts build / watch / start
```

## Páginas

| Página | Contenido |
|---|---|
| `index.html` | Header (Inicio · Servicios · Cobertura · Contacto) → Hero → Servicios (3) → Cobertura (2) → Por qué TrackFlow (4) → Contacto → Footer. Incluye el JSON-LD `Organization` de Schema.org. |
| `application.html` | Los 12 campos del briefing en 4 `fieldset`: validación en tiempo real, mensajes literales del briefing, aviso de volumen bajo y mensaje de éxito simulado. |
