/**
 * shippingApi.ts
 *
 * Typed wrappers over apiRequest() for all /api/shipping endpoints.
 * Mirrors the pattern used throughout lib/catalogApi.ts and lib/api.ts.
 */

import { apiRequest } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PincodeCheckResult = {
  success: boolean;
  data: {
    status?: string;
    message?: string;
    [key: string]: unknown;
  };
};

export type ShippingRateResult = {
  success: boolean;
  data: {
    rate?: number | string;
    etaDays?: number | string;
    courier?: string;
    [key: string]: unknown;
  };
};

export type ShipmentCreateResult = {
  success: boolean;
  message?: string;
  awbNumber?: string;
  trackingUrl?: string;
  order?: {
    _id: string;
    status?: string;
    shipping?: ShippingInfo;
  };
};

export type ShippingInfo = {
  awbNumber?: string | null;
  logisticName?: string | null;
  trackingUrl?: string | null;
  currentStatus?: string | null;
  currentStatusCode?: string | null;
  expectedDeliveryDate?: string | null;
  pickupAddressId?: string | null;
  lastSyncedAt?: string | null;
  cancelStatus?: string | null;
};

export type TrackResult = {
  success: boolean;
  shipping?: ShippingInfo;
  status?: string;
  raw?: unknown;
};

export type LabelResult = {
  success: boolean;
  labelUrl?: string;
  data?: unknown;
};

export type Warehouse = {
  id?: string | number;
  warehouse_id?: string | number;
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  [key: string]: unknown;
};

export type WarehouseListResult = {
  success: boolean;
  data?: Warehouse[] | { warehouse_list?: Warehouse[]; [key: string]: unknown };
};

// ─── API calls ────────────────────────────────────────────────────────────────

/**
 * Checks whether a pincode is serviceable.
 */
export async function checkPincode(pincode: string): Promise<PincodeCheckResult> {
  return apiRequest<PincodeCheckResult>("/api/shipping/check-pincode", {
    method: "POST",
    body: JSON.stringify({ pincode }),
  });
}

/**
 * Gets an estimated shipping rate between two pincodes.
 */
export async function getShippingRate(params: {
  fromPincode: string;
  toPincode: string;
  weightKg?: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  paymentMethod?: string;
  productMrp?: number;
  orderType?: string;
}): Promise<ShippingRateResult> {
  return apiRequest<ShippingRateResult>("/api/shipping/rate", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

/**
 * Creates a shipment for an existing order (admin only).
 */
export async function createShipment(
  orderId: string,
  options?: {
    pickupAddressId?: string | number;
    weightKg?: number;
    lengthCm?: number;
    widthCm?: number;
    heightCm?: number;
  }
): Promise<ShipmentCreateResult> {
  return apiRequest<ShipmentCreateResult>(`/api/shipping/create/${orderId}`, {
    method: "POST",
    body: JSON.stringify(options ?? {}),
  });
}

/**
 * Fetches live tracking status for an order.
 */
export async function trackShipment(orderId: string): Promise<TrackResult> {
  return apiRequest<TrackResult>(`/api/shipping/track/${orderId}`);
}

/**
 * Cancels a shipment (admin only).
 */
export async function cancelShipment(orderId: string): Promise<{ success: boolean; message?: string }> {
  return apiRequest(`/api/shipping/cancel/${orderId}`, { method: "POST" });
}

/**
 * Gets the PDF label URL for a shipment (admin only).
 */
export async function printLabel(orderId: string, pageSize = "A4"): Promise<LabelResult> {
  return apiRequest<LabelResult>(`/api/shipping/label/${orderId}?pageSize=${pageSize}`);
}

/**
 * Lists all registered pickup warehouses (admin only).
 */
export async function listWarehouses(): Promise<WarehouseListResult> {
  return apiRequest<WarehouseListResult>("/api/shipping/warehouse");
}

/**
 * Registers a new pickup warehouse (admin only).
 */
export async function addWarehouse(payload: Record<string, unknown>): Promise<{ success: boolean; data?: unknown }> {
  return apiRequest("/api/shipping/warehouse", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
