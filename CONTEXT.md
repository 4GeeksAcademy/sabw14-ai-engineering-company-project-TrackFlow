# Contexto de empresa — TrackFlow

> Fuente única de verdad del dominio para todas las apps, servicios y agentes de este monorepo.
> Briefing completo y sin modificar: [`BRIEFING.md`](./BRIEFING.md). Cada hito tiene además su briefing específico dentro de la carpeta de la app.

## Qué es TrackFlow

- Operador logístico (3PL) para **marcas de e-commerce** medianas de **moda, electrónica y cosmética**.
- Fundada en **2009** en Los Ángeles. ~**130 empleados**, ~**9 M€** de facturación anual.
- Dos mercados con almacén propio: **Estados Unidos (Los Ángeles)** y **España (Zaragoza)**. Oficina tecnológica en Zaragoza.
- Tres servicios:
  1. **Gestión de almacenes**: almacenaje, picking y packing, inventario.
  2. **Entregas de última milla**: red de transportistas en los dos países.
  3. **Logística inversa**: devoluciones, inspección y reacondicionamiento (18–25 % del volumen).

## Personas clave

| Área | Responsable | Base |
|---|---|---|
| Dirección ejecutiva (CEO) | Thomas (el briefing da dos apellidos: Harry y Espinoza) | Los Ángeles |
| Tecnología (CTO) — unidad *TrackFlow Tech* | Andrés Kim | Zaragoza |
| Operaciones de almacén | Ana Whitfield | LA + Zaragoza |
| Última milla y transportistas | Carlos Vega | — |
| Logística inversa | Sofía Ramos | — |
| Experiencia del cliente | Valentina Cruz | LA + Zaragoza |
| Comercial y relación con clientes | Miguel Torres | — |
| Personas (RR. HH.) | Rafael Sanz | Zaragoza |

## Datos de dominio que se reutilizan

- **Almacenes:** `LA` (Los Ángeles, California, US) y `ZGZ` (Zaragoza, Aragón, ES).
- **Transportistas:** UPS, FedEx, DHL (US); MRW, SEUR, DHL (ES); más dos locales — 8 en total.
- **Sectores de cliente:** Moda, Electrónica, Cosmética (el formulario comercial añade Alimentación y Otro).
- **Contacto comercial:** comercial@trackflow.com · LA +1 213 555 0147 · Zaragoza +34 976 123 456.
- **Idiomas:** idioma base **español**; inglés como mejora opcional.
- **Público:** B2B (marcas) y B2C (destinatarios finales). Las herramientas comerciales se dirigen a **empresas**, no a consumidores.

## Problemas que guían el roadmap

| Departamento | Problema actual | Lo que se construirá |
|---|---|---|
| Almacén | Dos sistemas distintos, sin visión global del inventario | API de inventario unificada, alertas de stock |
| Última milla | Asignación manual, seguimiento portal por portal | Motor de selección de transportista, tracking unificado |
| Logística inversa | Cada devolución se revisa a mano | Motor de aprobación, inspección asistida por IA |
| Experiencia del cliente | 80 % de consultas repetitivas, sin base de conocimiento | Agente de primera línea + RAG, tickets unificados |
| Comercial | Sin CRM, informes manuales, leads vagos | Web con captación de leads cualificados, health score |
| Tecnología | Sin telemetría, integraciones sin documentar | Telemetría centralizada, pipelines de datos |
| Dirección | Informe semanal hecho a mano | Dashboard ejecutivo y reporte automático |

## Índice para agentes

| Documento | Cuándo leerlo |
|---|---|
| [`AGENTS.md`](./AGENTS.md) | Siempre, al empezar: flujo de trabajo, reglas y skills |
| [`memory-bank/projectbrief.md`](./memory-bank/projectbrief.md) | Siempre: negocio, problema, usuarios y KPIs |
| [`memory-bank/techContext.md`](./memory-bank/techContext.md) | Siempre: stack, mapa de carpetas, decisiones y comandos |
| [`memory-bank/progress.md`](./memory-bank/progress.md) | Siempre: qué está hecho y qué sigue |
| [`BRIEFING.md`](./BRIEFING.md) | Cuando haga falta el detalle literal de la empresa |
| `uis/website/BRIEFING.md` | Antes de tocar la web pública |
| [`docs/ARCHITECTURE_PROPOSAL.md`](./docs/ARCHITECTURE_PROPOSAL.md) | Antes de crear o tocar cualquier cosa en `services/` (backend) |

Cuando entre una tecnología, se tome una decisión de arquitectura, se añada documentación o cambie el estado del proyecto, actualiza este índice y el `memory-bank/` (skill `actualizar-memory-bank`).

## Reglas para quien trabaje en este repo

- Todo nombre de campo, valor de enumeración y mensaje visible debe salir del briefing del hito correspondiente.
- El código va en la carpeta que corresponde (`uis/`, `services/`, `data/`, `agents/`…); ver `README.md`.
