import type {
  Carrier,
  CarrierSelection,
  CarrierUsage,
  Collection,
  Product,
  ProductCategory,
  Shipment,
  ShipmentPriority,
  ShipmentStatus,
} from "../types/models.ts";
import { PRODUCT_CATEGORIES, SHIPMENT_STATUSES } from "../types/models.ts";
import { toArray } from "./collections.ts";

const PRIORITY_SURCHARGE: Record<ShipmentPriority, number> = {
  Standard: 0,
  Express: 0.3,
  "Same-day": 0.6,
};

const MIN_SUITABLE_SCORE = 50;

/**
 * Redondea a 2 decimales evitando errores de coma flotante
 * (p. ej. 46.215 se representa como 46.21499… y Math.round daría 46.21).
 */
export function roundToTwoDecimals(value: number): number {
  return Math.round(Number((value * 100).toPrecision(12))) / 100;
}

// --- Costes y scoring de transportistas -----------------------------------------------------

export function calculateShippingCost(shipment: Shipment, product: Product, carrier: Carrier): number {
  const weightCost = product.weightKg * carrier.ratePerKgUSD * shipment.quantity;
  const distanceCost = shipment.destination.distanceKm * carrier.ratePerKmUSD;
  const subtotal = carrier.baseRateUSD + weightCost + distanceCost;
  return roundToTwoDecimals(subtotal * (1 + PRIORITY_SURCHARGE[shipment.priority]));
}

function countryPoints(carrier: Carrier, shipment: Shipment): number {
  return carrier.operatesIn.includes(shipment.destination.country) ? 20 : 0;
}

function weightPoints(carrier: Carrier, shipment: Shipment, product: Product): number {
  return product.weightKg * shipment.quantity <= carrier.maxWeightKg ? 20 : 0;
}

function priorityPoints(carrier: Carrier, shipment: Shipment): number {
  return carrier.acceptsPriority.includes(shipment.priority) ? 15 : 0;
}

function fragilePoints(carrier: Carrier, product: Product): number {
  return !product.isFragile || carrier.handlesFragile ? 15 : 0;
}

function reliabilityPoints(carrier: Carrier): number {
  return carrier.onTimeRate * 0.3;
}

export function scoreCarrierForShipment(carrier: Carrier, shipment: Shipment, product: Product): number {
  const score =
    countryPoints(carrier, shipment) +
    weightPoints(carrier, shipment, product) +
    priorityPoints(carrier, shipment) +
    fragilePoints(carrier, product) +
    reliabilityPoints(carrier);
  return roundToTwoDecimals(score);
}

/** Puntúa todos, descarta los de puntaje < 50 y elige el de menor coste (empate: mayor puntaje). */
export function selectBestCarrier(
  carriers: Collection<Carrier>,
  shipment: Shipment,
  product: Product,
): CarrierSelection | null {
  const suitable = toArray(carriers)
    .map((carrier) => ({
      carrier,
      score: scoreCarrierForShipment(carrier, shipment, product),
      cost: calculateShippingCost(shipment, product, carrier),
    }))
    .filter((option) => option.score >= MIN_SUITABLE_SCORE);

  return suitable.reduce<CarrierSelection | null>((best, option) => {
    if (best === null) return option;
    if (option.cost < best.cost) return option;
    if (option.cost === best.cost && option.score > best.score) return option;
    return best;
  }, null);
}

// --- Agregaciones y reportes ----------------------------------------------------------------

export function countProductsByCategory(products: Collection<Product>): Record<ProductCategory, number> {
  const initial = Object.fromEntries(PRODUCT_CATEGORIES.map((category) => [category, 0])) as Record<
    ProductCategory,
    number
  >;
  return toArray(products).reduce((counts, product) => {
    counts[product.category] += 1;
    return counts;
  }, initial);
}

export function calculateTotalInventoryValue(products: Collection<Product>): number {
  const total = toArray(products).reduce((sum, product) => sum + product.stockQuantity * product.unitCostUSD, 0);
  return roundToTwoDecimals(total);
}

export function calculateAverageShipmentDistance(shipments: Collection<Shipment>): number {
  const list = toArray(shipments);
  if (list.length === 0) return 0;
  const totalDistance = list.reduce((sum, shipment) => sum + shipment.destination.distanceKm, 0);
  return roundToTwoDecimals(totalDistance / list.length);
}

export function groupShipmentsByStatus(shipments: Collection<Shipment>): Record<ShipmentStatus, Shipment[]> {
  const initial = Object.fromEntries(SHIPMENT_STATUSES.map((status) => [status, [] as Shipment[]])) as Record<
    ShipmentStatus,
    Shipment[]
  >;
  return toArray(shipments).reduce((groups, shipment) => {
    groups[shipment.status].push(shipment);
    return groups;
  }, initial);
}

/** Los N transportistas con más envíos asignados (ignora carrier null). Empate: orden alfabético. */
export function findTopCarriers(shipments: Collection<Shipment>, topN: number): CarrierUsage[] {
  if (!Number.isInteger(topN) || topN <= 0) return [];
  const counts = toArray(shipments).reduce((usage, shipment) => {
    if (shipment.carrier !== null) {
      usage.set(shipment.carrier, (usage.get(shipment.carrier) ?? 0) + 1);
    }
    return usage;
  }, new Map<string, number>());

  return [...counts.entries()]
    .map(([carrier, count]) => ({ carrier, count }))
    .sort((a, b) => b.count - a.count || a.carrier.localeCompare(b.carrier))
    .slice(0, topN);
}
