import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { binarySearchProductByWeight, findProductBySKU, findShipmentById } from "../src/utils/search.ts";
import type { Product } from "../src/types/models.ts";
import { reportShipments, sampleProducts } from "./fixtures.ts";

describe("búsqueda lineal", () => {
  it("findProductBySKU encuentra sin distinguir mayúsculas", () => {
    assert.equal(findProductBySKU(sampleProducts, "shoe-blk-42")?.name, "Zapatillas Negras Running - Talla 42");
    assert.equal(findProductBySKU(sampleProducts, "LAPTOP-DELL-15")?.sku, "LAPTOP-DELL-15");
  });

  it("findProductBySKU devuelve null si no existe, con vacío o con null", () => {
    assert.equal(findProductBySKU(sampleProducts, "NO-EXISTE"), null);
    assert.equal(findProductBySKU(sampleProducts, ""), null);
    assert.equal(findProductBySKU([], "SHOE-BLK-42"), null);
    assert.equal(findProductBySKU(null, "SHOE-BLK-42"), null);
  });

  it("findShipmentById encuentra en un array desordenado", () => {
    const desordenados = [...reportShipments].reverse();
    assert.equal(findShipmentById(desordenados, "SH-2024-8823")?.carrier, "UPS");
    assert.equal(findShipmentById(desordenados, "SH-0000-0000"), null);
    assert.equal(findShipmentById(undefined, "SH-2024-8821"), null);
  });
});

describe("búsqueda binaria", () => {
  const byWeight: Product[] = [...sampleProducts].sort((a, b) => a.weightKg - b.weightKg); // 0.3, 0.8, 2.3

  it("devuelve el índice correcto en un array ordenado por peso", () => {
    assert.equal(binarySearchProductByWeight(byWeight, 0.3), 0);
    assert.equal(binarySearchProductByWeight(byWeight, 0.8), 1);
    assert.equal(binarySearchProductByWeight(byWeight, 2.3), 2);
  });

  it("devuelve -1 si no está, si el array está vacío o es null", () => {
    assert.equal(binarySearchProductByWeight(byWeight, 5), -1);
    assert.equal(binarySearchProductByWeight(byWeight, 0.1), -1);
    assert.equal(binarySearchProductByWeight([], 0.8), -1);
    assert.equal(binarySearchProductByWeight(null, 0.8), -1);
    assert.equal(binarySearchProductByWeight(byWeight, Number.NaN), -1);
  });

  it("funciona con muchos elementos (log n)", () => {
    const muchos = Array.from({ length: 1000 }, (_, i) => ({ ...sampleProducts[0]!, sku: `P-${i}`, weightKg: i / 10 }));
    assert.equal(binarySearchProductByWeight(muchos, 73.4), 734);
    assert.equal(muchos[binarySearchProductByWeight(muchos, 0)]!.sku, "P-0");
  });

});
