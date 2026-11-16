# Carpeta `uis`

Esta carpeta contiene **todos los proyectos con interfaz de usuario** para el proyecto transversal de AI Engineering de la compañía — por ejemplo: un sitio web público, un frontend de panel de administración, una interfaz de ecommerce, portales para clientes, aplicaciones Streamlit/Gradio u otras herramientas sólo-frontend.

Los dos proyectos principales que se almacenan aquí son:

- **`website`** — la presencia web pública de la compañía.
- **`backoffice`** — la aplicación interna de administración. Es el lugar ideal para desarrollar múltiples soluciones dentro de un mismo proyecto: autenticación, gestión de personas, gestión de operaciones, comunicación interna y otras capacidades de back-office.

Organiza `uis/` por **distintas áreas de la compañía** — cada subcarpeta agrupa un ámbito diferente (por ejemplo, web pública frente a operaciones internas) e incluye su propia documentación técnica y funcional.

- **Propósito principal**: centralizar en un único lugar todas las aplicaciones frontend que dan soporte a los casos de uso de la compañía.
- **Recomendación**: documenta en este archivo (o en sub-READMEs) las aplicaciones que vayas añadiendo, su objetivo, tecnología usada y cómo ejecutarlas.

> _These instructions are also available in [English](./README.md)._

## Aplicaciones

| App | Objetivo | Tecnología | Cómo ejecutar (desde la raíz) |
|---|---|---|---|
| [`website/`](./website) | Sitio público de TrackFlow: landing + formulario de solicitud de información (Hito 1) | HTML5 semántico, Tailwind CSS v4 (CLI), JavaScript vanilla | `npx --yes http-server@14.1.1 uis/website -p 3000 -a 0.0.0.0 -c-1` |
| [`talent-pipeline-tracker/`](./talent-pipeline-tracker) | Herramienta interna de selección (Asistente de Dirección, Zaragoza): candidaturas, estado y etapa, notas, alta y edición (Hito 3) | Next.js 16 (App Router), React 19, TypeScript | `corepack pnpm --dir uis/talent-pipeline-tracker dev` (puerto 3001) |
