// Demo para la revisión: ejecuta cada función con los datos de ejemplo del briefing.
// Uso: pnpm run demo
import { sampleCarriers, sampleProducts, sampleShipment, reportShipments } from "../tests/fixtures.ts";
import {
  binarySearchProductByWeight,
  calculateAverageShipmentDistance,
  calculateShippingCost,
  calculateTotalInventoryValue,
  countProductsByCategory,
  filterLowStockProducts,
  filterProductsByWarehouse,
  findProductBySKU,
  findTopCarriers,
  groupShipmentsByStatus,
  scoreCarrierForShipment,
  selectBestCarrier,
  sortCarriersByReliability,
  sortProductsByStock,
  validateCarrier,
  validateProduct,
  validateShipment,
} from "./index.ts";

const section = (title: string): void => console.log(`\n=== ${title} ===`);
const product = findProductBySKU(sampleProducts, sampleShipment.sku);
if (!product) throw new Error("El producto del envío de ejemplo no existe");

section("Colecciones");
console.log("En Los Angeles:", filterProductsByWarehouse(sampleProducts, "Los Angeles").map((p) => p.sku));
console.log("Stock bajo:", filterLowStockProducts(sampleProducts).map((p) => `${p.sku} (${p.stockQuantity}/${p.minStockThreshold})`));
console.log("Por stock asc:", sortProductsByStock(sampleProducts, "asc").map((p) => `${p.sku}:${p.stockQuantity}`));
console.log("Transportistas por fiabilidad desc:", sortCarriersByReliability(sampleCarriers, "desc").map((c) => `${c.name}:${c.onTimeRate}%`));

section("Búsquedas");
console.log('findProductBySKU("shoe-blk-42"):', findProductBySKU(sampleProducts, "shoe-blk-42")?.name ?? null);
const byWeight = [...sampleProducts].sort((a, b) => a.weightKg - b.weightKg);
console.log("Pesos ordenados:", byWeight.map((p) => p.weightKg), "→ índice de 0.8 kg:", binarySearchProductByWeight(byWeight, 0.8),
  "| de 5 kg:", binarySearchProductByWeight(byWeight, 5));

section(`Envío ${sampleShipment.id}: ${product.name} → ${sampleShipment.destination.city} (${sampleShipment.priority})`);
for (const carrier of sampleCarriers) {
  console.log(`${carrier.name.padEnd(12)} coste $${calculateShippingCost(sampleShipment, product, carrier).toFixed(2).padStart(6)}`
    + `  puntaje ${scoreCarrierForShipment(carrier, sampleShipment, product).toFixed(2)}`);
}
const best = selectBestCarrier(sampleCarriers, sampleShipment, product);
console.log("Mejor (regla del briefing):", best ? `${best.carrier.name} — $${best.cost} — ${best.score} pts` : "ninguno");

section("Reportes");
console.log("Productos por categoría:", countProductsByCategory(sampleProducts));
console.log("Valor total del inventario: $", calculateTotalInventoryValue(sampleProducts));
console.log("Distancia media de envíos (km):", calculateAverageShipmentDistance(reportShipments));
console.log("Envíos por estado:", Object.fromEntries(Object.entries(groupShipmentsByStatus(reportShipments)).map(([k, v]) => [k, v.length])));
console.log("Top 2 transportistas:", findTopCarriers(reportShipments, 2));

section("Validaciones");
console.log("Producto de ejemplo:", validateProduct(sampleProducts[0]));
console.log("Producto inválido:", validateProduct({ ...sampleProducts[0]!, sku: "", weightKg: 150, unitCostUSD: 0 }));
console.log("Envío inválido:", validateShipment({ ...sampleShipment, quantity: 0 }));
console.log("Transportista inválido:", validateCarrier({ ...sampleCarriers[0]!, onTimeRate: 120, operatesIn: [] }));
