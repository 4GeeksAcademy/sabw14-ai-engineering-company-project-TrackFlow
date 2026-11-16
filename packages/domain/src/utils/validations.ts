import type { Carrier, Product, Shipment, ValidationResult } from "../types/models.ts";

type Rule<T> = (entity: T) => string | null;

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function runRules<T>(entity: T | null | undefined, rules: readonly Rule<T>[], name: string): ValidationResult {
  if (entity === null || entity === undefined) {
    return { valid: false, errors: [`${name} es obligatorio`] };
  }
  const errors = rules.map((rule) => rule(entity)).filter((error): error is string => error !== null);
  return { valid: errors.length === 0, errors };
}

const greaterThan = (value: unknown, min: number): boolean => isNumber(value) && value > min;
const atLeast = (value: unknown, min: number): boolean => isNumber(value) && value >= min;
const atMost = (value: unknown, max: number): boolean => isNumber(value) && value <= max;

// --- Product -------------------------------------------------------------------------------

const PRODUCT_RULES: readonly Rule<Product>[] = [
  (p) => (typeof p.sku === "string" && p.sku.trim() !== "" ? null : "sku no debe estar vacío"),
  (p) => (greaterThan(p.weightKg, 0) && atMost(p.weightKg, 100) ? null : "weightKg debe ser > 0 y <= 100"),
  (p) => {
    const d = p.dimensions;
    const dims = d ? [d.lengthCm, d.widthCm, d.heightCm] : [];
    const ok = dims.length === 3 && dims.every((value) => greaterThan(value, 0) && atMost(value, 200));
    return ok ? null : "todas las dimensiones deben ser > 0 y <= 200";
  },
  (p) => (atLeast(p.stockQuantity, 0) ? null : "stockQuantity debe ser >= 0"),
  (p) => (atLeast(p.minStockThreshold, 0) ? null : "minStockThreshold debe ser >= 0"),
  (p) => (greaterThan(p.unitCostUSD, 0) ? null : "unitCostUSD debe ser > 0"),
];

export function validateProduct(product: Product | null | undefined): ValidationResult {
  return runRules(product, PRODUCT_RULES, "product");
}

// --- Shipment ------------------------------------------------------------------------------

const SHIPMENT_RULES: readonly Rule<Shipment>[] = [
  (s) => (greaterThan(s.quantity, 0) ? null : "quantity debe ser > 0"),
  (s) => (greaterThan(s.declaredValueUSD, 0) ? null : "declaredValueUSD debe ser > 0"),
  (s) => (atLeast(s.destination?.distanceKm, 0) ? null : "distanceKm debe ser >= 0"),
];

export function validateShipment(shipment: Shipment | null | undefined): ValidationResult {
  return runRules(shipment, SHIPMENT_RULES, "shipment");
}

// --- Carrier -------------------------------------------------------------------------------

const CARRIER_RULES: readonly Rule<Carrier>[] = [
  (c) =>
    atLeast(c.baseRateUSD, 0) && atLeast(c.ratePerKgUSD, 0) && atLeast(c.ratePerKmUSD, 0)
      ? null
      : "baseRateUSD, ratePerKgUSD y ratePerKmUSD deben ser >= 0",
  (c) => (greaterThan(c.avgDeliveryDays, 0) ? null : "avgDeliveryDays debe ser > 0"),
  (c) => (atLeast(c.onTimeRate, 0) && atMost(c.onTimeRate, 100) ? null : "onTimeRate debe estar entre 0 y 100"),
  (c) => (greaterThan(c.maxWeightKg, 0) ? null : "maxWeightKg debe ser > 0"),
  (c) => (Array.isArray(c.operatesIn) && c.operatesIn.length >= 1 ? null : "operatesIn debe contener al menos 1 país"),
];

export function validateCarrier(carrier: Carrier | null | undefined): ValidationResult {
  return runRules(carrier, CARRIER_RULES, "carrier");
}
