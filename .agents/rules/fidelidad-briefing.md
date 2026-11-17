---
name: fidelidad-briefing
description: Los datos de dominio, nombres de campo y textos de producto salen literalmente del BRIEFING del hito de TrackFlow.
scope: glob
globs: ["uis/**", "services/**", "data/**", "agents/**", "packages/**"]
activation: Por patrón de archivo. Se activa al crear o editar código o textos de producto en esas rutas.
reason: "Una implementación genérica que ignore el contexto no será aceptada" es el motivo de rechazo más repetido en los enunciados.
---

# Regla: fidelidad al briefing

## Normas

1. Antes de implementar, el agente **DEBE** leer el `BRIEFING.md` de la app o hito. Si no existe junto a la app, **DEBE** pedirlo antes de seguir.
2. Los nombres de campos, IDs, valores de enumeración, mensajes de error y textos visibles **DEBEN** copiarse literalmente del briefing, incluidos acentos y mayúsculas. El agente **NO DEBE** traducirlos, abreviarlos ni "mejorarlos".
3. Si el briefing no define un dato que hace falta, el agente **DEBE** preguntar o dejar un `TODO(briefing): <qué falta>` visible en el PR. **NO DEBE** inventarlo.
4. Los datos de TrackFlow **DEBEN** mantenerse coherentes entre apps:
   - almacenes `LA` (Los Ángeles, US) y `ZGZ` (Zaragoza, ES);
   - transportistas UPS, FedEx y DHL (US) y MRW, SEUR y DHL (ES);
   - sectores Moda, Electrónica y Cosmética;
   - contacto `comercial@trackflow.com`, `+1 213 555 0147` y `+34 976 123 456`.

## Líneas rojas propias de TrackFlow

| Línea roja | De dónde sale |
|---|---|
| Todo dato operativo o importe **DEBE** indicar el país o almacén y la moneda (USD o EUR). No se suman importes de los dos países sin conversión explícita. | `BRIEFING.md` → "Opera en dos mercados — Estados Unidos y España"; facturación en euros con operación en EE. UU. |
| Las herramientas comerciales se dirigen a **empresas** (B2B); los flujos B2C (seguimiento, devoluciones) van separados y no se mezclan en el mismo formulario. | `uis/website/BRIEFING.md` → "Restricción específica" |
| El stock **NO DEBE** poder fijarse directamente: se calcula como entradas menos salidas. | Briefing del Hito 5, ticket TRK-0341 (`contexts/05-backend-development/trackflow-BRIEFING.es.md` del syllabus; se copiará junto al servicio) |
| Los sistemas heredados (WMS comercial, hoja de cálculo de Zaragoza y ERP) **NO DEBEN** modificarse; se integran con APIs o pipelines nuevos. | `BRIEFING.md` → departamento de Tecnología |
| El idioma base es el español (`lang="es"`); el inglés es una mejora y **NO DEBE** dejar el español incompleto. | Briefings → "Alcance de idioma" |
