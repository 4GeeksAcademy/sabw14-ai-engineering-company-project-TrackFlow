import type { Collection, Product, Shipment } from "../types/models.ts";

/** Búsqueda lineal O(n) por SKU, sin distinguir mayúsculas. Sirve para arrays desordenados. */
export function findProductBySKU(products: Collection<Product>, sku: string): Product | null {
  const target = sku?.trim().toLowerCase();
  if (!products || !target) return null;
  for (const product of products) {
    if (product.sku.toLowerCase() === target) return product;
  }
  return null;
}

/** Búsqueda lineal O(n) por ID de envío. */
export function findShipmentById(shipments: Collection<Shipment>, id: string): Shipment | null {
  if (!shipments || !id) return null;
  for (const shipment of shipments) {
    if (shipment.id === id) return shipment;
  }
  return null;
}

/**
 * Búsqueda binaria O(log n). Precondición: `sortedProducts` está ordenado por `weightKg` ascendente.
 * Devuelve el índice de un producto con exactamente `targetWeight`, o -1 si no existe.
 */
export function binarySearchProductByWeight(sortedProducts: Collection<Product>, targetWeight: number): number {
  if (!sortedProducts || !Number.isFinite(targetWeight)) return -1;
  let low = 0;
  let high = sortedProducts.length - 1;
  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    const weight = sortedProducts[middle]!.weightKg;
    if (weight === targetWeight) return middle;
    if (weight < targetWeight) {
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }
  return -1;
}
