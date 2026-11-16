import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { validateCarrier, validateProduct, validateShipment } from "../src/utils/validations.ts";
import type { Carrier, Product, Shipment } from "../src/types/models.ts";
import { byName, sampleProducts, sampleShipment } from "./fixtures.ts";

const product = sampleProducts[0]!;

describe("validateProduct", () => {
  it("los productos de ejemplo del briefing son válidos", () => {
    for (const p of sampleProducts) assert.deepEqual(validateProduct(p), { valid: true, errors: [] });
  });

  it("rechaza cada regla del briefing con su mensaje", () => {
    const casos: [Partial<Product>, string][] = [
      [{ sku: "  " }, "sku no debe estar vacío"],
      [{ weightKg: 0 }, "weightKg debe ser > 0 y <= 100"],
      [{ weightKg: 100.5 }, "weightKg debe ser > 0 y <= 100"],
      [{ dimensions: { lengthCm: 201, widthCm: 10, heightCm: 10 } }, "todas las dimensiones deben ser > 0 y <= 200"],
      [{ dimensions: { lengthCm: 10, widthCm: 0, heightCm: 10 } }, "todas las dimensiones deben ser > 0 y <= 200"],
      [{ stockQuantity: -1 }, "stockQuantity debe ser >= 0"],
      [{ minStockThreshold: -5 }, "minStockThreshold debe ser >= 0"],
      [{ unitCostUSD: 0 }, "unitCostUSD debe ser > 0"],
    ];
    for (const [cambio, mensaje] of casos) {
      assert.deepEqual(validateProduct({ ...product, ...cambio }), { valid: false, errors: [mensaje] }, mensaje);
    }
  });

  it("acepta los límites exactos (100 kg, 200 cm, stock 0)", () => {
    const limite = { ...product, weightKg: 100, stockQuantity: 0, dimensions: { lengthCm: 200, widthCm: 200, heightCm: 200 } };
    assert.equal(validateProduct(limite).valid, true);
  });

  it("acumula varios errores y rechaza NaN y null", () => {
    const result = validateProduct({ ...product, sku: "", weightKg: Number.NaN, unitCostUSD: -1 });
    assert.equal(result.valid, false);
    assert.equal(result.errors.length, 3);
    assert.deepEqual(validateProduct(null), { valid: false, errors: ["product es obligatorio"] });
  });
});

describe("validateShipment", () => {
  it("el envío de ejemplo es válido", () => {
    assert.deepEqual(validateShipment(sampleShipment), { valid: true, errors: [] });
  });

  it("rechaza quantity <= 0, declaredValueUSD <= 0 y distanceKm < 0", () => {
    const malo: Shipment = {
      ...sampleShipment,
      quantity: 0,
      declaredValueUSD: 0,
      destination: { ...sampleShipment.destination, distanceKm: -1 },
    };
    assert.deepEqual(validateShipment(malo).errors, [
      "quantity debe ser > 0",
      "declaredValueUSD debe ser > 0",
      "distanceKm debe ser >= 0",
    ]);
  });

  it("distanceKm = 0 es válido; undefined no rompe", () => {
    assert.equal(validateShipment({ ...sampleShipment, destination: { ...sampleShipment.destination, distanceKm: 0 } }).valid, true);
    assert.equal(validateShipment(undefined).valid, false);
  });
});

describe("validateCarrier", () => {
  it("los transportistas de ejemplo son válidos", () => {
    for (const name of ["UPS", "SEUR", "DHL Express"]) assert.equal(validateCarrier(byName(name)).valid, true, name);
  });

  it("rechaza cada regla del briefing", () => {
    const ups = byName("UPS");
    const casos: [Partial<Carrier>, string][] = [
      [{ ratePerKmUSD: -0.01 }, "baseRateUSD, ratePerKgUSD y ratePerKmUSD deben ser >= 0"],
      [{ avgDeliveryDays: 0 }, "avgDeliveryDays debe ser > 0"],
      [{ onTimeRate: 101 }, "onTimeRate debe estar entre 0 y 100"],
      [{ onTimeRate: -1 }, "onTimeRate debe estar entre 0 y 100"],
      [{ maxWeightKg: 0 }, "maxWeightKg debe ser > 0"],
      [{ operatesIn: [] }, "operatesIn debe contener al menos 1 país"],
    ];
    for (const [cambio, mensaje] of casos) {
      assert.deepEqual(validateCarrier({ ...ups, ...cambio }), { valid: false, errors: [mensaje] }, mensaje);
    }
  });

  it("tarifas en 0 y onTimeRate en 0 o 100 son válidos", () => {
    const ups = byName("UPS");
    assert.equal(validateCarrier({ ...ups, baseRateUSD: 0, ratePerKgUSD: 0, ratePerKmUSD: 0, onTimeRate: 100 }).valid, true);
    assert.equal(validateCarrier({ ...ups, onTimeRate: 0 }).valid, true);
  });
});
