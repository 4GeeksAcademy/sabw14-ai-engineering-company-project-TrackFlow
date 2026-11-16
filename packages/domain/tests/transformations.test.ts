import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  calculateAverageShipmentDistance,
  calculateShippingCost,
  calculateTotalInventoryValue,
  countProductsByCategory,
  findTopCarriers,
  groupShipmentsByStatus,
  roundToTwoDecimals,
  scoreCarrierForShipment,
  selectBestCarrier,
} from "../src/utils/transformations.ts";
import type { Carrier } from "../src/types/models.ts";
import { byName, laptop, reportShipments, sampleCarriers, sampleProducts, sampleShipment } from "./fixtures.ts";

// Valores esperados calculados a mano con las fórmulas del briefing (envío SH-2024-8821, 1 portátil
// de 2.3 kg a Madrid, 320 km, Express +30 %).

describe("calculateShippingCost", () => {
  it("UPS: (5 + 2.3×1.2 + 320×0.05) × 1.3 = 30.89", () => {
    assert.equal(calculateShippingCost(sampleShipment, laptop, byName("UPS")), 30.89);
  });
  it("SEUR: (6.5 + 3.45 + 25.6) × 1.3 = 46.215 → 46.22 (redondeo sin error de coma flotante)", () => {
    assert.equal(calculateShippingCost(sampleShipment, laptop, byName("SEUR")), 46.22);
  });
  it("DHL Express: (12 + 4.6 + 32) × 1.3 = 63.18", () => {
    assert.equal(calculateShippingCost(sampleShipment, laptop, byName("DHL Express")), 63.18);
  });
  it("recargos: Standard 0 %, Same-day +60 %; el peso se multiplica por la cantidad", () => {
    const standard = { ...sampleShipment, priority: "Standard" as const };
    assert.equal(calculateShippingCost(standard, laptop, byName("UPS")), 23.76);
    const sameDay = { ...sampleShipment, priority: "Same-day" as const };
    assert.equal(calculateShippingCost(sameDay, laptop, byName("SEUR")), 56.88);
    const tres = { ...standard, quantity: 3 }; // 5 + 2.3×1.2×3 + 16 = 29.28
    assert.equal(calculateShippingCost(tres, laptop, byName("UPS")), 29.28);
  });
});

describe("scoreCarrierForShipment", () => {
  it("UPS: país 0 + peso 20 + prioridad 15 + frágil 15 + 88×0.3 = 76.4", () => {
    assert.equal(scoreCarrierForShipment(byName("UPS"), sampleShipment, laptop), 76.4);
  });
  it("SEUR = 97.6 y DHL Express = 98.5", () => {
    assert.equal(scoreCarrierForShipment(byName("SEUR"), sampleShipment, laptop), 97.6);
    assert.equal(scoreCarrierForShipment(byName("DHL Express"), sampleShipment, laptop), 98.5);
  });
  it("peso total por encima de maxWeightKg da 0 en ese criterio", () => {
    const veinte = { ...sampleShipment, quantity: 20 }; // 46 kg > 25 (SEUR)
    assert.equal(scoreCarrierForShipment(byName("SEUR"), veinte, laptop), 77.6);
  });
  it("frágil con transportista que no maneja frágiles da 0; no frágil da 15", () => {
    const sinFragiles: Carrier = { ...byName("SEUR"), handlesFragile: false };
    assert.equal(scoreCarrierForShipment(sinFragiles, sampleShipment, laptop), 82.6);
    const zapatillas = sampleProducts[0]!;
    assert.equal(scoreCarrierForShipment(sinFragiles, sampleShipment, zapatillas), 97.6);
  });
  it("prioridad no aceptada da 0 (UPS no acepta Same-day)", () => {
    const sameDay = { ...sampleShipment, priority: "Same-day" as const };
    assert.equal(scoreCarrierForShipment(byName("UPS"), sameDay, laptop), 61.4);
  });
});

describe("selectBestCarrier", () => {
  it("regla literal del briefing: entre los de puntaje >= 50 elige el de menor coste", () => {
    // UPS no opera en España, pero suma 76.4 (>= 50) y es el más barato → la regla literal lo elige.
    // Documentado como pregunta abierta para Ana Whitfield en docs/soluciones (no se cambia la regla).
    assert.deepEqual(selectBestCarrier(sampleCarriers, sampleShipment, laptop), {
      carrier: byName("UPS"),
      score: 76.4,
      cost: 30.89,
    });
  });
  it("si se excluye UPS, gana SEUR por coste aunque DHL tenga más puntaje", () => {
    const result = selectBestCarrier([byName("SEUR"), byName("DHL Express")], sampleShipment, laptop);
    assert.equal(result?.carrier.name, "SEUR");
    assert.equal(result?.cost, 46.22);
  });
  it("null si ninguno llega a 50, si la lista está vacía o es null", () => {
    const malo: Carrier = { ...byName("UPS"), onTimeRate: 10, acceptsPriority: [], maxWeightKg: 1 };
    assert.equal(selectBestCarrier([malo], sampleShipment, laptop), null); // 0+0+0+15+3 = 18
    assert.equal(selectBestCarrier([], sampleShipment, laptop), null);
    assert.equal(selectBestCarrier(null, sampleShipment, laptop), null);
  });
});

describe("agregaciones", () => {
  it("countProductsByCategory incluye todas las categorías (también en 0)", () => {
    assert.deepEqual(countProductsByCategory(sampleProducts), {
      Fashion: 1, Electronics: 1, Cosmetics: 1, Home: 0, Other: 0,
    });
    assert.deepEqual(countProductsByCategory([]), { Fashion: 0, Electronics: 0, Cosmetics: 0, Home: 0, Other: 0 });
  });

  it("calculateTotalInventoryValue: 45×35 + 8×650 + 120×85 = 16975", () => {
    assert.equal(calculateTotalInventoryValue(sampleProducts), 16975);
    assert.equal(calculateTotalInventoryValue(null), 0);
  });

  it("calculateAverageShipmentDistance: 512.5 / 6 = 85.42; vacío = 0 (no NaN)", () => {
    assert.equal(calculateAverageShipmentDistance(reportShipments), 85.42);
    assert.equal(calculateAverageShipmentDistance([]), 0);
  });

  it("groupShipmentsByStatus agrupa y deja [] en los estados sin envíos", () => {
    const groups = groupShipmentsByStatus(reportShipments);
    assert.deepEqual(Object.fromEntries(Object.entries(groups).map(([k, v]) => [k, v.length])), {
      Pending: 1, Assigned: 1, "In transit": 1, Delivered: 2, Failed: 1,
    });
    assert.deepEqual(groupShipmentsByStatus([]).Delivered, []);
  });

  it("findTopCarriers ignora null, ordena por uso y desempata alfabéticamente", () => {
    assert.deepEqual(findTopCarriers(reportShipments, 2), [
      { carrier: "SEUR", count: 2 },
      { carrier: "UPS", count: 2 },
    ]);
    assert.equal(findTopCarriers(reportShipments, 10).length, 3);
    assert.deepEqual(findTopCarriers(reportShipments, 0), []);
    assert.deepEqual(findTopCarriers(null, 3), []);
  });

  it("las agregaciones no mutan la entrada", () => {
    const copia = structuredClone(reportShipments);
    groupShipmentsByStatus(reportShipments);
    findTopCarriers(reportShipments, 3);
    assert.deepEqual(reportShipments, copia);
  });

  it("roundToTwoDecimals evita el error de coma flotante", () => {
    assert.equal(roundToTwoDecimals(46.215), 46.22);
    assert.equal(roundToTwoDecimals(1.005), 1.01);
    assert.equal(roundToTwoDecimals(30.888), 30.89);
  });
});
