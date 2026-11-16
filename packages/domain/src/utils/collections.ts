import type {
  Carrier,
  Collection,
  Product,
  ProductCategory,
  SortOrder,
  WarehouseLocation,
} from "../types/models.ts";

/** Normaliza una colección de entrada: null/undefined → []. Nunca devuelve la referencia original. */
export function toArray<T>(items: Collection<T>): T[] {
  return items ? [...items] : [];
}

export function filterProductsByWarehouse(products: Collection<Product>, warehouse: WarehouseLocation): Product[] {
  return toArray(products).filter((product) => product.warehouse === warehouse);
}

export function filterProductsByCategory(products: Collection<Product>, category: ProductCategory): Product[] {
  return toArray(products).filter((product) => product.category === category);
}

export function filterLowStockProducts(products: Collection<Product>): Product[] {
  return toArray(products).filter((product) => product.stockQuantity <= product.minStockThreshold);
}

function compareNumbers(a: number, b: number, order: SortOrder): number {
  return order === "asc" ? a - b : b - a;
}

export function sortProductsByStock(products: Collection<Product>, order: SortOrder): Product[] {
  return toArray(products).sort((a, b) => compareNumbers(a.stockQuantity, b.stockQuantity, order));
}

export function sortCarriersByReliability(carriers: Collection<Carrier>, order: SortOrder): Carrier[] {
  return toArray(carriers).sort((a, b) => compareNumbers(a.onTimeRate, b.onTimeRate, order));
}
