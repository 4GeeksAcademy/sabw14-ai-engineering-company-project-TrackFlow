# Talent Pipeline Tracker — TrackFlow (Hito 3)

Herramienta interna para el proceso de selección del **Asistente de Dirección, sede Zaragoza**. Sustituye el Excel que pidió reemplazar Ana Whitfield ([`BRIEFING.md`](./BRIEFING.md), sin modificar).

- **Stack:** Next.js 16.4.5 (App Router), React 19.3 y TypeScript, sin librerías de estado (solo hooks).
- **API:** [`playground.4geeks.com/tracker/api/v1`](https://playground.4geeks.com/tracker/api/v1/docs). Es **compartida por todo el curso**: no hagas pruebas destructivas sobre candidatos que no hayas creado tú.

## Cómo ejecutar

Desde `uis/talent-pipeline-tracker/`:

```bash
cp .env.example .env.local     # NEXT_PUBLIC_API_URL (no se versiona)
corepack pnpm install
corepack pnpm dev              # http://localhost:3001
corepack pnpm run check        # typegen + tsc + eslint + tests (23)
corepack pnpm build            # build de producción
```

> Puerto **3001**, para no chocar con la web pública (`uis/website`, 3000). En Codespaces, añade el 3001 en la pestaña **Ports**.

## Qué hace

| Vista | Ruta | API |
|---|---|---|
| Listado: nombre, puesto, estado y etapa; filtros por estado y etapa y búsqueda por nombre o email, todo en la URL (`?status=&stage=&search=`) y sin recargar | `/` | `GET /records` |
| Detalle con todos los campos; cambio de estado y etapa con una interacción | `/candidates/[id]` | `GET` y `PATCH /records/:id` |
| Notas internas: listar, añadir y eliminar (solo en el detalle) | `/candidates/[id]` | `GET`, `POST` y `DELETE /records/:id/notes` |
| Alta de candidatura con validación | `/candidates/new` | `POST /records` |
| Edición de candidatura con validación | `/candidates/[id]/edit` | `PUT /records/:id` |

Cada llamada muestra **cargando, éxito o error**, con opción de reintentar. Tras cada `PATCH`, `PUT` o `POST`, la UI se actualiza sin recargar.

**Etiquetas del briefing:** los valores de la API (`in_progress`, `personal_interview`…) **nunca** se muestran; se ven "En proceso", "Entrevista personal", etc. (ver [`lib/labels.ts`](./lib/labels.ts)).

## Estructura

```text
app/                       # rutas (App Router); cada página envuelve en <Suspense> lo que lee la URL
├── page.tsx               # /
└── candidates/{new, [id], [id]/edit}/page.tsx
components/                # CandidateFilters, CandidateList, CandidateDetail, PipelineControls,
                           # NotesPanel, CandidateForm, EditCandidate, Badges, Feedback
hooks/useAsync.ts          # estados cargando / éxito / error, con reintento y setData
lib/api.ts                 # cliente tipado de la API (async/await, ApiError)
lib/labels.ts              # etiquetas del briefing (status y stage)
lib/validation.ts          # validación de formularios
types/candidate.ts         # tipos de la API (RecordOut, RecordCreate, RecordPatch, notas)
tests/                     # Vitest + Testing Library con la API simulada
```

## Notas técnicas

- **Next 16 con `cacheComponents`:** los componentes que usan `useSearchParams` o `useParams` van dentro de `<Suspense>`, como exige la documentación de esta versión (`node_modules/next/dist/docs/`).
- **API no documentada:** `GET /records/:id/notes` devuelve `{ data, meta }`, no un array (no aparece en el OpenAPI). Se detectó al probar contra la API real; `listNotes` lo desenvuelve y hay test.
- **Tests sin tocar la API compartida:** usan un `fetch` simulado. Vitest 4.1.12 y jsdom 29.1.1 funcionan en Node 20 y en Node 22.
- **`AGENTS.md`:** lo genera Next.js para los agentes de código y lo regenera `next dev`. Se versiona tal cual.
