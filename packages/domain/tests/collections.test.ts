import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  filterLowStockProducts,
  filterProductsByCategory,
  filterProductsByWarehouse,
  sortCarriersByReliability,
  sortProductsByStock,
} from "../src/utils/collections.ts";
import { sampleCarriers, sampleProducts } from "./fixtures.ts";

const skus = (items: { sku: string }[]) => items.map((p) => p.sku);

describe("filtros", () => {
  it("filterProductsByWarehouse devuelve solo los del almacén", () => {
    assert.deepEqual(skus(filterProductsByWarehouse(sampleProducts, "Los Angeles")), ["SHOE-BLK-42", "PERFUME-COCO-50"]);
    assert.deepEqual(skus(filterProductsByWarehouse(sampleProducts, "Zaragoza")), ["LAPTOP-DELL-15"]);
  });

  it("filterProductsByCategory devuelve solo los de la categoría", () => {
    assert.deepEqual(skus(filterProductsByCategory(sampleProducts, "Electronics")), ["LAPTOP-DELL-15"]);
    assert.deepEqual(filterProductsByCategory(sampleProducts, "Home"), []);
  });

  it("filterLowStockProducts usa stockQuantity <= minStockThreshold", () => {
    assert.deepEqual(skus(filterLowStockProducts(sampleProducts)), ["LAPTOP-DELL-15"]); // 8 <= 10
    const exacto = { ...sampleProducts[0]!, stockQuantity: 20, minStockThreshold: 20 };
    assert.deepEqual(skus(filterLowStockProducts([exacto])), ["SHOE-BLK-42"]); // el límite cuenta
  });

  it("los filtros no fallan con arrays vacíos ni con null", () => {
    assert.deepEqual(filterProductsByWarehouse([], "Zaragoza"), []);
    assert.deepEqual(filterProductsByCategory(null, "Fashion"), []);
    assert.deepEqual(filterLowStockProducts(undefined), []);
  });
});

describe("ordenamiento", () => {
  it("sortProductsByStock asc y desc", () => {
    assert.deepEqual(skus(sortProductsByStock(sampleProducts, "asc")), ["LAPTOP-DELL-15", "SHOE-BLK-42", "PERFUME-COCO-50"]);
    assert.deepEqual(skus(sortProductsByStock(sampleProducts, "desc")), ["PERFUME-COCO-50", "SHOE-BLK-42", "LAPTOP-DELL-15"]);
  });

  it("sortCarriersByReliability asc y desc por onTimeRate", () => {
    assert.deepEqual(sortCarriersByReliability(sampleCarriers, "desc").map((c) => c.name), ["DHL Express", "SEUR", "UPS"]);
    assert.deepEqual(sortCarriersByReliability(sampleCarriers, "asc").map((c) => c.onTimeRate), [88, 92, 95]);
  });

  it("no mutan el array original y devuelven una copia", () => {
    const productos = [...sampleProducts];
    const antes = skus(productos);
    const ordenado = sortProductsByStock(productos, "asc");
    assert.deepEqual(skus(productos), antes);
    assert.notEqual(ordenado, productos);
    const transportistas = [...sampleCarriers];
    sortCarriersByReliability(transportistas, "desc");
    assert.deepEqual(transportistas.map((c) => c.id), sampleCarriers.map((c) => c.id));
  });

  it("ordenar vacío o null devuelve []", () => {
    assert.deepEqual(sortProductsByStock([], "asc"), []);
    assert.deepEqual(sortCarriersByReliability(null, "desc"), []);
  });
});
