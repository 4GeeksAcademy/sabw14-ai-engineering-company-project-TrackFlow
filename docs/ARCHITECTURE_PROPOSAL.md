# Propuesta de arquitectura de backend — TrackFlow API

> **Para:** Andrés Kim (CTO) · **De:** Samuel Bolivar, TrackFlow Tech · **Estado:** borrador para revisión · **Fecha:** 2026-11-07
> **Alcance:** cómo estructurar el backend antes de configurar el entorno y los primeros endpoints. Aquí no hay código: son decisiones y su razonamiento.
> **Fuentes de negocio:**
> - [`BRIEFING.md`](../BRIEFING.md) y [`memory-bank/projectbrief.md`](../memory-bank/projectbrief.md);
> - el briefing del Hito 5 (API de inventario, ticket TRK-0341, en el syllabus: `contexts/05-backend-development/trackflow-BRIEFING.es.md`);
> - el briefing de roles y permisos (`contexts/roles-permissions/trackflow-BRIEFING.es.md`).

---

## Resumen

Propongo **un único servicio FastAPI con arquitectura en capas** (rutas → lógica de negocio → datos), con **un router por dominio de negocio**, dentro del monorepo, en `services/`.

- **Primer dominio:** inventario, tal como lo especifica el Hito 5.
- **Dominios siguientes** (autenticación y roles, transportistas, devoluciones…): entran como routers y módulos nuevos sin tocar los existentes.
- **Frontends:** la web pública (`uis/website`) y el futuro backoffice (`uis/backoffice`) siguen siendo aplicaciones separadas. Hablan con la API por HTTP/JSON con un contrato OpenAPI.
- **Configuración:** el CORS y la configuración se definen por entorno con variables de entorno.

---

## 1. Contexto de negocio y objetivos del backend

TrackFlow gestiona el inventario de marcas de e-commerce en **dos almacenes**, Los Ángeles (`LA`) y Zaragoza (`ZGZ`). Hoy cada uno usa un sistema distinto y ninguno ve el inventario del otro. El CTO lo ha escalado como prioridad (TRK-0341): *"Esta es la base de todo."*

| Característica del negocio | Exigencia para el backend |
|---|---|
| Una discrepancia de stock es **un problema contractual** con la marca, no solo interno | Las reglas de stock deben vivir en **un solo lugar**, ser testeables y ejecutarse **antes** de escribir |
| El stock **se calcula** (entradas − salidas) y es **por almacén**: el mismo producto en `LA` y en `ZGZ` son dos SKUs con su propio stock | Una única función de dominio que calcule el stock para cualquier consumidor (API, informes, agentes) |
| Una salida que dejaría el stock negativo se rechaza con `HTTP 400` | Validar y escribir el movimiento sin carreras entre peticiones simultáneas |
| Operación **24/7** en dos zonas horarias | Un único despliegue, simple de observar |
| El roadmap crece por departamentos: almacén → última milla → devoluciones → atención al cliente → dirección | Añadir dominios sin reescribir los existentes |
| Equipo de tecnología de **7 personas** (Zaragoza) | Pocas piezas que desplegar; convenciones que cualquiera reconozca |
| Usuarios internos en **TinyDB**; inventario en Postgres (Supabase) | Dos persistencias con una frontera clara entre usuarios y datos operativos |

**Objetivo de este sprint:** la API de inventario del Hito 5, construida de forma que sea la base de los dominios siguientes sin cambiar su estructura.

---

## 2. Patrón arquitectónico: arquitectura en capas por dominio (monolito modular)

### Decisión

**Arquitectura en capas** con tres responsabilidades separadas:

1. **Capa de API (routers):** recibe la petición HTTP, valida la *forma* de los datos con schemas Pydantic, llama al dominio y traduce el resultado o el error a HTTP. **No contiene reglas de negocio.**
2. **Capa de dominio:** reglas de TrackFlow, como el cálculo de stock, el rechazo de salidas sin stock o la coherencia del almacén de un movimiento. **No importa nada de FastAPI.**
3. **Capa de datos:** tablas SQLModel, sesión de base de datos y cliente TinyDB.

Las capas se organizan **por dominio de negocio**: cada dominio tiene su router y su módulo de dominio. Todo se despliega como **una sola aplicación**, un monolito modular.

> Relación con MVC: el router cumple el papel del *controller* y el schema de respuesta, el de la *view*. MVC no separa las reglas de negocio de la persistencia, porque ambas caen en el *model*; por eso elegimos capas.

### Por qué encaja con TrackFlow

- **Las reglas de stock son el núcleo del negocio y son contractuales.** Si viven en el router, se duplican en cuanto otro consumidor necesite el stock: un informe para Dirección, el agente de atención al cliente o una alerta de stock bajo. En la capa de dominio hay **una sola implementación**, testeable sin HTTP, y es lo que exige la regla del briefing *"Rechazar antes de escribir"*.
- **El roadmap es una suma de dominios que comparten datos.** Las devoluciones generan entradas de stock y los despachos necesitan transportistas. Un monolito modular comparte base de datos y transacciones sin coordinar servicios.
- **Equipo pequeño y operación 24/7.** Un solo despliegue, un solo log y una sola URL de salud son lo que un equipo de 7 personas puede operar. Hoy se enteran de las caídas por WhatsApp.
- **Coincide con la estructura estándar de FastAPI**, que separa los routers por archivo y comparte dependencias (§5).

### Alternativas descartadas

| Alternativa | Por qué no ahora |
|---|---|
| **Serverless** (una función por endpoint) | Comprobar el stock y escribir la salida necesita una transacción con bloqueo sobre la misma base de datos. TinyDB es un archivo local, incompatible con funciones efímeras. Los arranques en frío perjudican a operarios que registran movimientos en tiempo real. **Sí encaja más adelante** para tareas puntuales, como el informe del lunes a las 7:00 o procesar las fotos de devoluciones. |
| **Microservicios** (un servicio por dominio) | 7 personas no pueden operar varios despliegues y contratos internos, y los dominios comparten datos (stock ↔ devoluciones ↔ despachos). Se puede extraer un dominio más adelante **porque** las capas y los dominios ya estarán separados. |
| **Todo en `main.py`** | Funciona con una ruta y se vuelve inmantenible con el segundo dominio, que es justo lo que la guía oficial *Bigger Applications* busca evitar (§5). |

### Compensación aceptada

Más archivos y una indirección extra (router → dominio) para operaciones sencillas. Lo aceptamos porque **cada regla de stock difícil de encontrar o duplicada es una discrepancia contractual en potencia**.

---

## 3. Estructura de carpetas y módulos

### Dónde vive dentro del monorepo

El monorepo reserva `services/` para APIs y workers. El briefing del Hito 5 fija archivos **directamente en `services/`**: `main.py`, `database.py` (con la dependencia `get_db`), `models.py`, `schemas.py` y `routers/inventory.py`. Propongo respetarlo literalmente: **la API principal de TrackFlow es la raíz de `services/`**.

> ⚠️ **Conflicto que hay que resolver (decisión D-09, §7):** hoy el repo asume "un servicio por subcarpeta de `services/`". Lo dicen [`services/README.md`](../services/README.md), la regla [`estructura-monorepo`](../.agents/rules/estructura-monorepo.md) y `memory-bank/techContext.md`. Si se aprueba D-09, se actualizan **los cuatro** a la vez: la API va en la raíz de `services/` y los procesos que se despliegan aparte, en `services/workers/<nombre>/`. La alternativa, `services/trackflow-api/`, se aparta de las rutas que comprobará el evaluador del Hito 5.

### Estructura propuesta

```text
services/                          # TrackFlow API: un único servicio FastAPI
├── BRIEFING.md                    # briefing del Hito 5, sin modificar (D-02)
├── README.md                      # cómo ejecutar, variables, puertos, enlace a esta propuesta
├── pyproject.toml · uv.lock       # dependencias con uv (versiones exactas, D-05)
├── .env.example                   # nombres de variables con valores ficticios
├── main.py                        # crea FastAPI(), registra CORS y los routers; sin lógica
├── config.py                      # Settings (pydantic-settings) + get_settings() cacheado
├── database.py                    # engine SQLModel (Postgres/Supabase) + get_db; cliente TinyDB
├── dependencies.py                # dependencias compartidas: DbDep, usuario actual, require_role(...)
├── models.py                      # tablas SQLModel: SKU, StockEntry, StockExit (nombres del briefing)
├── schemas.py                     # contratos Pydantic: entrada (con validadores) y salida (SKURead + current_stock)
├── routers/                       # CAPA API: un APIRouter por dominio
│   ├── inventory.py               # APIRouter(prefix="/inventory")  — Hito 5
│   └── health.py                  # GET /health
├── domain/                        # CAPA DE DOMINIO: reglas de TrackFlow, sin imports de FastAPI
│   └── inventory.py               # stock de un SKU, validar y registrar entradas y salidas
├── tests/
│   ├── test_inventory_domain.py   # reglas sin HTTP
│   └── test_inventory_api.py      # contrato HTTP: 400, 422, stock por almacén
└── workers/                       # (futuro) procesos que se despliegan aparte; cada uno con su README
```

| Carpeta o archivo | Responsabilidad | Capa |
|---|---|---|
| `main.py` | Arranque: crea la app, registra el middleware CORS y los routers. No contiene endpoints ni lógica | Composición |
| `config.py` | Única fuente de configuración (URL de la BD, ruta de TinyDB, orígenes CORS, entorno) | Transversal |
| `database.py` | Conexiones: engine, sesión por petición (`get_db`, nombre del briefing) y cliente TinyDB | Datos |
| `dependencies.py` | Lo que comparten los routers: sesión, usuario autenticado, comprobación de rol | API |
| `models.py` | Tablas SQLModel con los nombres exactos del briefing; **sin** columna de stock | Datos |
| `schemas.py` | Contratos de la API, separados de las tablas. Las reglas de **forma** (p. ej. `tracking_number` según `exit_type`) se validan aquí | API |
| `routers/` | Un archivo por dominio con su `APIRouter(prefix=…, tags=[…])` | API |
| `domain/` | Reglas de **negocio** que dependen del estado (stock disponible, almacén del movimiento) | Dominio |
| `tests/` | Tests de dominio (rápidos) y de API (el contrato que comprobará el evaluador) | — |
| `workers/` | Fuera de la API: procesos programados que **reutilizan** `domain/` pero se ejecutan aparte | Composición |

### Criterio de separación

- **Por responsabilidad (capa)** en el primer nivel, porque es lo que pide el briefing del Hito 5 y lo que muestra la guía oficial de FastAPI para aplicaciones de varios archivos (§5).
- **Por dominio** dentro de cada capa (`routers/inventory.py` ↔ `domain/inventory.py`): el dominio "inventario" se localiza por su nombre en cualquier capa.
- **Regla de evolución:** cuando haya **3 dominios con tablas propias**, o `models.py` o `schemas.py` superen ~300 líneas, se migra a **paquetes por dominio** (`services/inventory/{router,domain,models,schemas}.py`). Es la estructura que recomiendan las guías de proyectos FastAPI grandes (§5). La migración es mecánica porque las capas ya estarán separadas.

---

## 4. Endpoints y routers de FastAPI

### Criterios

- **Un `APIRouter` por dominio** en `routers/`, con su `prefix` y sus `tags`, registrado en `main.py` con `app.include_router(...)`, como indica la guía *Bigger Applications* (§5).
- **Prefijos por dominio sin versión** (`/inventory`) porque el briefing del Hito 5 los fija literalmente. Es una **desviación consciente** de la plantilla oficial full-stack, que monta todo bajo `/api/v1`. Si hace falta versionar, se monta bajo `/api/v1` en `main.py` sin tocar los routers (riesgo R6).
- **Los routers solo traducen.** Ejemplo: `POST /inventory/orders/outbound` recibe el schema ya validado y llama a `domain.inventory.register_exit(...)`. Si el dominio lanza `InsufficientStock`, el router responde `HTTP 400` con el mensaje literal del briefing: `"Insufficient stock for SKU '{sku}'. Available: {available}, requested: {quantity}."`.
- **Qué código para qué error:**

  | Tipo de error | Ejemplo | Dónde se valida | Código |
  |---|---|---|---|
  | Forma del dato | `dispatch` sin `tracking_number`, o `loss` con él (regla 3 del briefing) | Validador del schema | `422` |
  | Regla de negocio que depende del estado | Stock insuficiente (regla 2) | `domain/` | `400` |
  | Autenticación o rol | Hitos de auth | Dependencia | `401` / `403` |

### Rutas del Hito 5 (literales del briefing)

`routers/inventory.py`, con `prefix="/inventory"`:

| Método | Ruta | Descripción | Respuesta |
|---|---|---|---|
| GET | `/inventory/products` | Lista los SKUs con `current_stock` | SKUs con `warehouse` y `current_stock: int` |
| POST | `/inventory/products` | Registra un SKU (`warehouse` = `LA` o `ZGZ`) | `201` |
| GET | `/inventory/products/{id}` | Un SKU con su stock actual | `404` si no existe |
| POST | `/inventory/orders/inbound` | Recepción de mercancía (`StockEntry`, con `user_uuid` en el cuerpo) | `201` |
| POST | `/inventory/orders/outbound` | Despacho o pérdida (`StockExit`, con `user_uuid` en el cuerpo) | `201`, `400` o `422` |
| GET | `/inventory/orders` | Movimientos con los datos del SKU | Entradas y salidas con `warehouse` |

**Sin autenticación en el Hito 5:** el briefing no la pide y su evaluador llamará a estas rutas directamente. `user_uuid` viaja en el cuerpo, como lo define el briefing.

### Rutas que llegan con hitos posteriores (solo el criterio de ubicación)

| Dominio | Router | Cuándo | Qué cambia |
|---|---|---|---|
| Autenticación | `routers/auth.py` → `/auth` | Proyecto "Asegurando la API: autenticación y restricción de rutas en FastAPI" | Se añade la dependencia de usuario y, en `/inventory`, se comprueba el rol **por endpoint** con `Depends(require_role(...))`. Roles del briefing de roles y permisos: **Empleado**, **Supervisor** y **Admin**. Desde entonces, `user_uuid` se toma del token y no del cuerpo (riesgo R4) |
| Plataforma | `routers/health.py` → `/health` | Hito 5 | Estado de la API y de las dos persistencias, para monitorización 24/7 |
| Leads comerciales | `routers/leads.py` → `/leads` | Sin fecha | Conectaría el formulario del Hito 1, que hoy simula el envío. Requiere su tabla y una decisión sobre datos personales (RGPD): `TODO(briefing)` |
| Transportistas, devoluciones, seguimiento | `routers/carriers.py`, `returns.py`, `tracking.py` | Sin briefing todavía | Router y módulo de dominio nuevos, **sin modificar los existentes** |

### Contrato

FastAPI genera el esquema **OpenAPI** (`/openapi.json`) y la documentación interactiva (`/docs`) a partir de los schemas. Ese esquema es **el contrato** con los frontends: un cambio incompatible en un schema se revisa en el PR como cambio de contrato.

---

## 5. Cómo influye la estructura estándar de FastAPI (investigación)

| Convención | Fuente | Cómo se aplica aquí |
|---|---|---|
| Rutas en módulos con `APIRouter` (`prefix`, `tags`, `dependencies`) registrados en `main.py` con `include_router`; estructura `app/main.py`, `app/dependencies.py`, `app/routers/*.py` | FastAPI, [*Bigger Applications — Multiple Files*](https://fastapi.tiangolo.com/tutorial/bigger-applications/) | `services/main.py`, `services/dependencies.py`, `services/routers/<dominio>.py` |
| Dependency injection con `Depends` para lo compartido | FastAPI, [*Dependencies*](https://fastapi.tiangolo.com/tutorial/dependencies/) | `dependencies.py`: sesión, usuario y `require_role(...)`. Las dependencias que **devuelven** algo (usuario, sesión) se declaran en el endpoint; las de solo control se pueden poner a nivel de router |
| Configuración con `BaseSettings` de `pydantic-settings`, `.env` con `SettingsConfigDict(env_file=".env")` y `get_settings()` con `@lru_cache`, sobreescribible en tests | FastAPI, [*Settings and Environment Variables*](https://fastapi.tiangolo.com/advanced/settings/) | `config.py`: nada de `os.getenv` disperso |
| SQLModel como ORM; una sesión por petición con una dependencia que hace `yield`; modelos separados para la **tabla** y para la **entrada y salida** (`HeroBase`/`Hero`/`HeroCreate`/`HeroPublic`); el `id` lo decide el backend | FastAPI, [*SQL (Relational) Databases*](https://fastapi.tiangolo.com/tutorial/sql-databases/) | `database.py` (`get_db` con `yield`), `models.py` (tablas) frente a `schemas.py` (contratos). `current_stock` solo existe en el schema de respuesta, como pide el briefing |
| Plantilla full-stack oficial: `backend/app/` con `api/routes/` (un archivo por recurso) y `core/` (`config.py`, `db.py`, `security.py`), con `frontend/` como app aparte en el mismo repo | [fastapi/full-stack-fastapi-template](https://github.com/fastapi/full-stack-fastapi-template) | Confirma el **monorepo con frontend y backend separados** (`uis/` + `services/`) y la separación de configuración, seguridad y rutas. Nos apartamos en el prefijo `/api/v1` (§4) |
| Organizar **por dominio** (`src/<dominio>/router.py, schemas.py, models.py, service.py…`) cuando hay muchos dominios; organizar por tipo de archivo *"works well for microservices or smaller projects"* | Comunidad, [zhanymkanov/fastapi-best-practices](https://github.com/zhanymkanov/fastapi-best-practices) (guía de opinión) | Justifica **empezar por capa** (un dominio) y la **regla de evolución** a paquetes por dominio (§3) |

> CORS: la referencia de FastAPI indica que `allow_origins`, `allow_methods` y `allow_headers` no pueden ser `["*"]` si `allow_credentials=True`, aunque su propio ejemplo los combina. Seguimos la referencia (§6).

---

## 6. Frontend y backend como sistemas separados

### Monorepo, despliegues separados

| Opción | Decisión |
|---|---|
| Repos separados para frontend y backend | ❌ El programa exige un solo monorepo por empresa; además, cada cambio de contrato obligaría a coordinar dos PRs |
| **Un monorepo con apps independientes** | ✅ `uis/website` (estático), `uis/backoffice` (app interna) y `services/` (API) viven juntos pero **se ejecutan y despliegan por separado**, como en la plantilla oficial (`backend/` + `frontend/`) |

Un cambio de API y del frontend que lo consume va **en el mismo PR**. Ningún frontend importa código de `services/`: solo lo llama por HTTP.

### Comunicación por API

```mermaid
flowchart LR
  W[uis/website<br/>:3000 estático] -->|JSON| API
  B[uis/backoffice<br/>:3001] -->|Authorization: Bearer · JSON| API
  API[services/ · FastAPI<br/>:8000] --> PG[(Postgres / Supabase<br/>SKU · StockEntry · StockExit)]
  API --> TDB[(TinyDB<br/>usuarios y roles)]
```

- **JSON sobre HTTP**, con los códigos de la tabla de §4.
- **Puertos:**
  - `3000` para `uis/website` y `8000` para la API; los dos ya están reenviados en el devcontainer;
  - `3001` para `uis/backoffice`, que se añadirá a `forwardPorts` cuando exista (cambio de entorno con aprobación).
- **URL base de la API, nunca escrita a mano en el código:**
  - **web estática**, que no tiene paso de build: un `assets/js/config.js` versionado calcula la URL en el navegador:
    - en `*.app.github.dev` cambia el sufijo `-3000` del host por `-8000`;
    - en `localhost` usa `http://localhost:8000`;
    - en producción usa el dominio de la API;
  - **backoffice**: una variable de entorno de su framework, que se decidirá en el Hito 3. Si es de build (como las `NEXT_PUBLIC_*` de Next.js), queda **incrustada al compilar**, así que hay que recompilar por entorno.

### CORS

En Codespaces la web y la API tienen **orígenes distintos**: `https://<codespace>-3000.app.github.dev` y `https://<codespace>-8000.app.github.dev`. Comparten protocolo y puerto (443), pero difieren en el **subdominio**. Un origen es la combinación de protocolo, dominio y puerto (documentación de CORS de FastAPI). Sin CORS, el navegador bloquea las llamadas del frontend a la API.

- `CORSMiddleware` en `main.py`, con `allow_origins` leído de `Settings.cors_origins`. Es una **lista explícita por entorno**:

  | Entorno | Orígenes permitidos |
  |---|---|
  | Local | `http://localhost:3000`, `http://localhost:3001` |
  | Codespaces | se construyen con `CODESPACE_NAME` y `GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN`, variables que el propio Codespace define; no se escriben a mano porque cambian con cada codespace |
  | Producción | `https://trackflow.com` y el dominio del backoffice |

- **`allow_credentials=False`:** el backoffice se autentica con la cabecera `Authorization: Bearer`, que no necesita credenciales CORS; esas solo hacen falta con cookies. Si algún día se usan cookies, se activa y los orígenes deben seguir siendo explícitos, nunca `"*"`.
- `allow_methods=["GET", "POST"]`, los únicos que usa la API, y `allow_headers=["Authorization", "Content-Type"]`. El *preflight* `OPTIONS` lo responde el propio middleware.
- **Codespaces:** el puerto `8000` debe ser **Public**, desde la pestaña *Ports* o con `gh codespace ports visibility 8000:public -c $CODESPACE_NAME`. Un puerto privado responde con una redirección a un login de GitHub y el navegador lo muestra como error de CORS (riesgo R5).

### Variables de entorno

| Variable | Quién la usa | Ejemplo en `.env.example` |
|---|---|---|
| `ENVIRONMENT` | API | `local` |
| `DATABASE_URL` | API → Postgres/Supabase | `postgresql://user:password@localhost:5432/trackflow` |
| `TINYDB_PATH` | API → usuarios | `services/.data/users.json` (ignorada por git) |
| `CORS_ORIGINS` | API | `http://localhost:3000,http://localhost:3001` |
| `SECRET_KEY` | API → tokens (hitos de auth) | `cambia-esto-en-local` |

- Los valores reales van en `services/.env` (ignorado por git) o en **Codespaces secrets**. `.env.example` solo lleva nombres con valores ficticios (regla [`dependencias-y-secretos`](../.agents/rules/dependencias-y-secretos.md)).
- La **clave de servicio de Supabase** y `DATABASE_URL` solo las conoce `services/`. Ningún frontend recibe credenciales de base de datos.

---

## 7. Decisiones técnicas iniciales

| ID | Decisión | Motivo |
|---|---|---|
| D-09 *(propuesta)* | La API principal vive en la raíz de `services/` y los procesos aparte en `services/workers/<nombre>/`. Al aprobarla se actualizan a la vez `services/README.md`, la regla `estructura-monorepo`, y `techContext.md` (README obligatorio solo en `services/` y en cada `services/workers/*/`) | Rutas literales del briefing del Hito 5 (§3) |
| D-10 | Capas `routers/` → `domain/` → `models.py`/`database.py`; prohibido poner reglas de negocio en los routers | Reglas de stock en un solo lugar y testeables (§2) |
| D-11 | FastAPI + SQLModel + Pydantic sobre Python 3.12 con uv (stack del curso y del briefing). **Propuestos**, a confirmar: `pydantic-settings`, `pytest` y Alembic. Versiones exactas registradas en `techContext.md` al instalarlas (D-05, D-06) | Entorno del devcontainer; no inventar versiones |
| D-12 | **Postgres (Supabase)** para el inventario; **TinyDB** solo para usuarios y roles; `user_uuid` como referencia lógica, sin FK | Briefing del Hito 5: *"Sin tabla de usuarios en Supabase"* |
| D-13 | `current_stock` es un `int` **calculado, nunca persistido**: `SUM(StockEntry.quantity) − SUM(StockExit.quantity)` del SKU **en su almacén** | Reglas 1 y 6 y tipo `int` del briefing. Cada fila `SKU` tiene su `warehouse`: el mismo producto en `LA` y en `ZGZ` son dos SKUs (`CLT-SNK-W-42` y `CLT-SNK-W-42-Z` en la semilla) |
| D-14 | Un movimiento cuyo `warehouse` no coincide con el del SKU se **rechaza con `400`** antes de escribir. *(Interpretación propia; el briefing no la define: a confirmar)* | Evita que una entrada de `ZGZ` sume stock a un SKU de `LA` |
| D-15 | Una salida se valida y se escribe **en la misma transacción**, bloqueando la fila del SKU (`SELECT … FOR UPDATE`, en SQLModel con `.with_for_update()`). Como el SKU es por almacén, el bloqueo es por SKU y almacén | Evita stock negativo con salidas simultáneas (R3) |
| D-16 | Regla 3 (`tracking_number` según `exit_type`) como validador del schema → `422`; regla 2 (stock) en el dominio → `400` | El briefing permite *"en el schema o en la lógica de la ruta"*; la forma se valida en el schema y el estado en el dominio (§4) |
| D-17 | CORS con orígenes explícitos por entorno, `allow_credentials=False`, métodos `GET`/`POST`; configuración solo vía `Settings` | §6 |

### Próximos pasos

1. Revisión del CTO. Si aprueba, aplicar D-09 en los cuatro sitios y registrar D-10 a D-17 en `techContext.md`.
2. Hito 5: crear `services/` con la estructura de §3, copiar `BRIEFING.md`, `pyproject.toml`, `.env.example`, `/health` y el dominio de inventario con sus tests (`400` por stock, `422` por `tracking_number`, stock independiente de `CLT-SNK-W-42` y `CLT-SNK-W-42-Z`).
3. Añadir una comprobación automática (CI o pre-commit) que detecte `DATABASE_URL` con credenciales y tokens JWT (`eyJ…`) fuera de `.env` (R8). Añadir `services/.data/` a `.gitignore` (R7).
4. Proyecto de autenticación: `routers/auth.py`, `require_role(...)` por endpoint y `user_uuid` desde el token.

---

## 8. Riesgos y puntos de atención

| # | Riesgo: qué sale mal si no se sigue la estructura | Impacto en TrackFlow | Mitigación |
|---|---|---|---|
| **R1** | **Reglas de negocio dentro de los routers** (el chequeo de stock en `routers/inventory.py`) | La misma regla se reimplementa en informes, agentes o devoluciones, con diferencias; aparecen discrepancias de stock contractuales con las marcas | Toda regla de estado en `domain/` y los routers solo traducen (D-10). En revisión de PR se rechaza un router que haga cálculos con `models`. Tests de dominio sin HTTP |
| **R2** | **Stock persistido o mezclado entre almacenes** (columna `current_stock`, sumar movimientos de otro almacén) | Se promete stock que no está en el almacén correcto; la cifra se desincroniza de los movimientos | D-13 y D-14: una sola función de stock, sin columna, y rechazo de movimientos de otro almacén. Test con la semilla: `CLT-SNK-W-42` (LA) y `CLT-SNK-W-42-Z` (ZGZ) con stock independiente |
| **R3** | **Carrera entre dos salidas simultáneas** que pasan el chequeo a la vez | Stock negativo pese a la regla del `400` | D-15: bloqueo de la fila y escritura en la misma transacción. Test de integración contra Postgres con dos sesiones en hilos (`TestClient` es síncrono y no lo reproduce) |
| **R4** | **`user_uuid` sin integridad** (TinyDB frente a Postgres; en el Hito 5 viene en el cuerpo de la petición) | Movimientos firmados por usuarios inexistentes; la auditoría se rompe | En el Hito 5, el dominio comprueba que el `user_uuid` existe en TinyDB antes de escribir. Con la autenticación, se toma del token y se ignora el del cuerpo |
| **R5** | **CORS y entornos distintos** (orígenes escritos a mano, `"*"`, puerto 8000 privado en Codespaces) | "Funciona en mi máquina": el formulario falla en Codespaces y en la revisión, o la API queda abierta a cualquier origen | `Settings.cors_origins` por entorno y construido desde las variables de Codespaces; pasos para hacer público el puerto en `services/README.md`. `/health` **muestra** el entorno y los orígenes cargados (no puede comprobar CORS: eso lo hace el navegador) |
| **R6** | **Contrato roto sin versionado** (prefijos sin `/api/v1`) | Un cambio incompatible rompe la web y el backoffice a la vez | Revisar el OpenAPI en cada PR que toque `schemas.py`; montar bajo `/api/v1` en `main.py` si hace falta |
| **R7** | **TinyDB: escrituras concurrentes y archivo en git.** FastAPI ejecuta los endpoints síncronos en un *threadpool*, y TinyDB no es seguro ante escrituras simultáneas. El archivo contiene hashes de contraseñas | JSON de usuarios corrupto, sin poder entrar a operar; hashes publicados en el repo | Un *lock* alrededor de las escrituras de TinyDB y un único proceso de la API. Archivo en `services/.data/`, añadido a `.gitignore`, con la ruta en `TINYDB_PATH` |
| **R8** | **Secretos de Supabase en el código o en un frontend** | Acceso completo al inventario de todas las marcas | Solo en `services/.env` o en Codespaces secrets. Próximo paso (§7): una comprobación automática que detecte una `DATABASE_URL` con contraseña o un JWT en el código |
| **R9** | **Carpetas fuera del mapa** mientras D-09 no esté aprobado (`backend/`, `api/` o una segunda API) | Dos lugares donde buscar código; el evaluador no encuentra `services/routers/inventory.py` | Aprobar D-09 antes del Hito 5 y actualizar a la vez el README, la regla, `techContext.md` y el script |
