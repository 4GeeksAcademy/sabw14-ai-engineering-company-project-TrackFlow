# `@trackflow/domain` — lógica de dominio (Hito 2)

Funciones TypeScript **puras y tipadas** para el control de inventario y la selección de transportistas de TrackFlow (pedidas por Ana Whitfield, Operaciones de Almacén). Entidades, campos y reglas: [`BRIEFING.md`](./BRIEFING.md), sin modificar.

## Estructura

```text
packages/domain/
├── BRIEFING.md                  # briefing del Hito 2 (sin modificar)
├── src/
│   ├── types/models.ts          # Product, Shipment, Carrier, InventoryMovement y sus tipos
│   ├── utils/collections.ts     # filtros y ordenamientos (sin mutar la entrada)
│   ├── utils/search.ts          # búsqueda lineal (SKU, ID) y binaria (peso)
│   ├── utils/transformations.ts # coste de envío, scoring y selección de transportista, reportes
│   ├── utils/validations.ts     # validateProduct / validateShipment / validateCarrier
│   ├── index.ts                 # API pública del paquete
│   └── demo.ts                  # demo con los datos de ejemplo del briefing
└── tests/                       # node:test + tsx; fixtures con los datos de ejemplo literales
```

> El enunciado propone `src/` en la raíz del repo. En el monorepo va dentro de `packages/domain/` (regla `estructura-monorepo`: código de dominio compartido → `packages/`) y conserva por dentro la estructura `src/types` + `src/utils` del enunciado.

## Comandos

Desde `packages/domain/` (pnpm vía corepack; versiones exactas y política de 3 días en `pnpm-workspace.yaml`):

```bash
corepack pnpm install
corepack pnpm run typecheck   # tsc --noEmit → 0 errores
corepack pnpm test            # 43 tests con los datos de ejemplo del briefing
corepack pnpm run check       # typecheck + tests
corepack pnpm run demo        # imprime el resultado de cada función
```

## Funciones

| Archivo | Funciones |
|---|---|
| `collections.ts` | `filterProductsByWarehouse`, `filterProductsByCategory`, `filterLowStockProducts`, `sortProductsByStock`, `sortCarriersByReliability` |
| `search.ts` | `findProductBySKU` (lineal, sin distinguir mayúsculas), `findShipmentById` (lineal), `binarySearchProductByWeight` (índice o `-1`) |
| `transformations.ts` | `calculateShippingCost`, `scoreCarrierForShipment`, `selectBestCarrier`, `countProductsByCategory`, `calculateTotalInventoryValue`, `calculateAverageShipmentDistance`, `groupShipmentsByStatus`, `findTopCarriers` |
| `validations.ts` | `validateProduct`, `validateShipment`, `validateCarrier` → `{ valid, errors[] }` |

**Casos límite:**
- **Colecciones vacías o nulas:** las colecciones aceptan además `null` o `undefined`, que se tratan como `[]`.
- **Sin `NaN`:** la distancia media de una lista vacía es `0`.
- **Todas las claves presentes:** los reportes incluyen todas las categorías y estados, aunque tengan 0 elementos.
- **Valores no numéricos:** las validaciones rechazan `NaN` y entidades `null`.
- **Redondeo exacto:** se redondea a 2 decimales sin el error de coma flotante, de modo que `46.215 → 46.22`.

## Pregunta abierta para Ana: `selectBestCarrier`

Con la regla literal del briefing (*descartar puntaje < 50 y elegir el de menor coste*), el envío de ejemplo `SH-2024-8821` (portátil a **Madrid**) elige **UPS**: suma 76.4 puntos y es el más barato (30.89 USD). Sin embargo, **UPS no opera en España**: el criterio de país vale 20 puntos, pero no es eliminatorio.

- Se implementó **la regla tal como está escrita**; el test lo documenta.
- Si Ana confirma que operar en el país de destino debe ser **obligatorio**, el cambio es una línea: filtrar por `operatesIn` antes de elegir. Con ese filtro ganaría **SEUR** (46.22 USD, 97.6 puntos).
