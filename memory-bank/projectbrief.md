# Project brief — TrackFlow

> **Fuente:** [`BRIEFING.md`](../BRIEFING.md) (briefing general de TrackFlow). Los briefings por hito viven junto a cada app (p. ej. [`uis/website/BRIEFING.md`](../uis/website/BRIEFING.md)) y **mandan** sobre este resumen en caso de conflicto.
> **Actualizar cuando:** cambie el alcance del proyecto, entre un nuevo departamento o stakeholder, o un briefing de hito introduzca datos de dominio nuevos.

## El negocio

**TrackFlow** es un operador logístico (3PL) para **marcas de e-commerce medianas de moda, electrónica y cosmética**.

- Fundada en **2009** en Los Ángeles. Tiene ~**130 empleados** y factura ~**9 M€** al año.
- Opera **dos mercados con almacén propio**: Estados Unidos (`LA`, Los Ángeles, California) y España (`ZGZ`, Zaragoza, Aragón).
- Ofrece tres servicios:
  1. **Gestión de almacenes**: almacenaje, picking, packing e inventario.
  2. **Última milla**: 8 transportistas. En US, UPS, FedEx y DHL; en ES, MRW, SEUR y DHL; además, dos locales.
  3. **Logística inversa**: devoluciones, inspección y reacondicionamiento. Supone entre el 18 y el 25 % del volumen, según cliente y país.
- Atiende dos públicos: **marcas (B2B)**, que contratan el servicio, y **destinatarios finales (B2C)**, que reciben o devuelven paquetes.

## El problema

TrackFlow tiene buenos clientes y una propuesta clara, pero **no tiene infraestructura para operar a escala en dos países**:

- Los dos almacenes usan sistemas distintos (un WMS comercial y una hoja de cálculo) y **no ven el inventario del otro**.
- Los datos de rendimiento de los transportistas **no existen** de forma estructurada.
- Cada devolución se aprueba o se rechaza **a mano**.
- El 80 % de las consultas de clientes son repetitivas y se responden consultando un Word.
- El CEO decide con un **informe semanal montado a mano**: entre 3 y 4 horas por director, y con datos de hace dos días.

## Objetivo del proyecto

La unidad interna **TrackFlow Tech**, liderada por el CTO **Andrés Kim** desde Zaragoza, construye en este monorepo los sistemas, integraciones y automatizaciones con IA que modernizan la operación. Cada hito del programa entrega una pieza:

| Departamento (responsable) | Problema | Pieza del roadmap | Ubicación en el monorepo |
|---|---|---|---|
| Comercial (Miguel Torres) | Leads vagos por email, sin cualificar | Web pública con formulario de leads cualificados | `uis/website` ✅ |
| Operaciones de almacén (Ana Whitfield) | Sin visión global del inventario por SKU | Funciones TS de inventario/transportistas → API de inventario unificada | `packages/` · `services/` |
| Operaciones de almacén (Ana Whitfield), con apoyo de Personas (Rafael Sanz) | Selección del Asistente de Dirección de Zaragoza en un Excel compartido | Talent Pipeline Tracker (frontend interno) | `uis/backoffice` |
| Última milla (Carlos Vega) | Asignación manual y seguimiento portal por portal | Motor de selección de transportista, tracking unificado | `services/` · `agents/` |
| Logística inversa (Sofía Ramos) | Revisión manual de cada devolución | Reglas de aprobación automática, inspección asistida por IA | `services/` · `agents/` |
| Experiencia del cliente (Valentina Cruz) | Sin tickets ni base de conocimiento | Agente de primera línea con RAG bilingüe | `agents/` · `data/` |
| Tecnología (Andrés Kim) | Sin telemetría; se enteran de las caídas por WhatsApp | Telemetría centralizada y pipelines de datos | `data/` · `infra/` |
| Dirección (CEO Thomas) | Informe semanal manual | Dashboard ejecutivo y reporte automático | `uis/backoffice` · `workflows/` |

## Usuarios

| Usuario | Qué necesita del sistema |
|---|---|
| Marca cliente / prospecto (B2B) | Entender los servicios y solicitar información; más adelante, ver su inventario y sus envíos |
| Destinatario final (B2C) | Saber dónde está su paquete y gestionar devoluciones. **No** es el público del formulario comercial |
| Operarios y coordinadores | Herramientas internas (backoffice) en lugar de hojas de cálculo |
| Dirección | KPIs consolidados de los dos países |

## KPIs de negocio que el sistema debe poder medir

- Stock en tiempo real por SKU y almacén (`LA`, `ZGZ`).
- Entregas a tiempo por transportista y ruta; coste por envío.
- Tasa de devoluciones por cliente y país; tiempo de resolución de cada devolución.
- Porcentaje de consultas resueltas automáticamente; CSAT.
- Leads comerciales cualificados (con volumen mensual y servicios de interés).

## Restricciones de negocio que afectan al código

- **Dos países, dos idiomas y dos monedas**: español es el idioma base y el inglés, una mejora opcional. Hay que indicar la moneda (EUR o USD) y el país en todo importe o dato operativo; no se mezclan sin conversión explícita.
- **Datos personales de dos jurisdicciones** (EE. UU. y UE/RGPD): no se exponen datos de contacto ni de destinatarios fuera de lo que pide cada hito.
- **Sistemas heredados**: el WMS comercial, la hoja de cálculo de Zaragoza y el ERP de 2010 no se tocan. Se integran mediante APIs o pipelines nuevos.
- **Los nombres de campos, valores de enumeración y mensajes visibles salen del briefing del hito**; no se inventan.

## Fuera de alcance

- Sustituir el ERP o los WMS existentes.
- Funcionalidades para consumidores finales en el formulario comercial.
- Pagos y facturación.
