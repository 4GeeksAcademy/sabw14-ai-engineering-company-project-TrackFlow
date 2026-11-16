// Entidades de negocio de TrackFlow — nombres, campos y tipos literales de BRIEFING.md (Hito 2).

export type ProductCategory = "Fashion" | "Electronics" | "Cosmetics" | "Home" | "Other";
export type WarehouseLocation = "Los Angeles" | "Zaragoza";
export type ProductStatus = "Active" | "Low stock" | "Out of stock" | "Discontinued";

export interface Dimensions {
  lengthCm: number;
  widthCm: number;
  heightCm: number;
}

export interface Product {
  sku: string;
  name: string;
  category: ProductCategory;
  weightKg: number;
  dimensions: Dimensions;
  warehouse: WarehouseLocation;
  stockQuantity: number;
  minStockThreshold: number;
  unitCostUSD: number;
  isFragile: boolean;
  status: ProductStatus;
}

export type Country = "United States" | "Spain";
export type ShipmentPriority = "Standard" | "Express" | "Same-day";
export type ShipmentStatus = "Pending" | "Assigned" | "In transit" | "Delivered" | "Failed";

export interface Destination {
  city: string;
  country: Country;
  postalCode: string;
  distanceKm: number;
}

export interface Shipment {
  id: string;
  sku: string;
  quantity: number;
  origin: WarehouseLocation;
  destination: Destination;
  priority: ShipmentPriority;
  declaredValueUSD: number;
  carrier: string | null;
  status: ShipmentStatus;
  createdAt: Date;
}

export interface Carrier {
  id: string;
  name: string;
  operatesIn: Country[];
  baseRateUSD: number;
  ratePerKgUSD: number;
  ratePerKmUSD: number;
  avgDeliveryDays: number;
  onTimeRate: number;
  maxWeightKg: number;
  handlesFragile: boolean;
  acceptsPriority: ShipmentPriority[];
}

export type MovementType = "Inbound" | "Outbound" | "Transfer" | "Adjustment";

export interface InventoryMovement {
  id: string;
  sku: string;
  warehouse: WarehouseLocation;
  type: MovementType;
  quantity: number;
  reason: string;
  timestamp: Date;
}

// Tipos auxiliares de las funciones (no son entidades del briefing).

export type SortOrder = "asc" | "desc";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface CarrierSelection {
  carrier: Carrier;
  score: number;
  cost: number;
}

export interface CarrierUsage {
  carrier: string;
  count: number;
}

/** Colección de entrada tolerante: un null/undefined se trata como colección vacía (ver utils/collections.ts). */
export type Collection<T> = readonly T[] | null | undefined;

export const PRODUCT_CATEGORIES: readonly ProductCategory[] = ["Fashion", "Electronics", "Cosmetics", "Home", "Other"];
export const SHIPMENT_STATUSES: readonly ShipmentStatus[] = ["Pending", "Assigned", "In transit", "Delivered", "Failed"];
