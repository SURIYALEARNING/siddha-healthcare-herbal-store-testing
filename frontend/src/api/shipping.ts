import client from "./client";
import { Order, ShippingStats, Shipment, PincodeResponse, Courier, CourierZone, CourierRate, ShippingCalculateResult, ShippingRatesResult, RateInput } from "../types";

export const fetchShippingOrdersApi = async (): Promise<Order[]> => {
  const res = await client.get("/api/admin/shipping/orders");
  return res.data;
};

export const fetchShippingStatsApi = async (): Promise<ShippingStats> => {
  const res = await client.get("/api/admin/shipping/stats");
  return res.data;
};

export const confirmOrderApi = async (orderId: string): Promise<void> => {
  await client.post("/api/admin/shipping/confirm", { orderId });
};

export const markPackedApi = async (orderId: string, dimensions: { length: number; breadth: number; height: number; weight: number }): Promise<void> => {
  await client.post("/api/admin/shipping/mark-packed", { orderId, ...dimensions });
};

export const syncPickupLocationsApi = async (): Promise<any> => {
  const res = await client.post("/api/admin/shipping/sync-pickup-locations");
  return res.data;
};

export const fetchPickupLocationsApi = async (): Promise<{ pickup_location: string; address: string; email: string; phone: string; name: string }[]> => {
  try {
    const res = await client.get("/api/admin/shipping/pickup-locations");
    return res.data;
  } catch {
    return [];
  }
};

export const createShiprocketOrderApi = async (orderId: string, formData?: Record<string, any>): Promise<{ shiprocketOrderId: string; shipmentId: string }> => {
  const res = await client.post("/api/admin/shipping/create-shiprocket-order", { orderId, ...formData });
  return res.data;
};

export const generateAwbApi = async (orderId: string, shipmentId: string): Promise<{ awbCode: string; courierName: string }> => {
  const res = await client.post("/api/admin/shipping/generate-awb", { orderId, shipmentId });
  return res.data;
};

export const requestPickupApi = async (orderId: string, shipmentIds: string[]): Promise<void> => {
  await client.post("/api/admin/shipping/request-pickup", { orderId, shipmentIds });
};

export const trackShipmentApi = async (shipmentId: string): Promise<any> => {
  const res = await client.get(`/api/admin/shipping/track/${shipmentId}`);
  return res.data;
};

export const getShipmentByOrderApi = async (orderId: string): Promise<Shipment | null> => {
  try {
    const res = await client.get(`/api/admin/shipping/track/${orderId}`);
    return res.data;
  } catch {
    return null;
  }
};

export const checkPincodeApi = async (pincode: string, weight?: number, cod?: boolean): Promise<PincodeResponse> => {
  const res = await client.post("/api/shipping/check-pincode", { pincode, weight, cod });
  return res.data;
};

export const checkMyAddressApi = async (): Promise<PincodeResponse> => {
  const res = await client.get("/api/shipping/check-my-address");
  return res.data;
};

/* ------------------------- Courier Companies CRUD ------------------------- */

export const fetchCouriersApi = async (): Promise<Courier[]> => {
  const res = await client.get("/api/admin/shipping/couriers");
  return res.data;
};

export const fetchActiveCouriersApi = async (): Promise<Courier[]> => {
  const res = await client.get("/api/shipping/couriers");
  return res.data;
};

export const createCourierApi = async (data: Partial<Courier>): Promise<Courier> => {
  const res = await client.post("/api/admin/shipping/couriers", data);
  return res.data.courier;
};

export const updateCourierApi = async (id: string, data: Partial<Courier>): Promise<Courier> => {
  const res = await client.put(`/api/admin/shipping/couriers/${id}`, data);
  return res.data.courier;
};

export const deleteCourierApi = async (id: string): Promise<void> => {
  await client.delete(`/api/admin/shipping/couriers/${id}`);
};

/* ------------------------------ Zones CRUD -------------------------------- */

export const fetchZonesApi = async (courierId?: string): Promise<CourierZone[]> => {
  const res = await client.get("/api/admin/shipping/zones", { params: { courierId } });
  return res.data;
};

export const createZoneApi = async (data: Partial<CourierZone> & { rate?: RateInput }): Promise<CourierZone> => {
  const res = await client.post("/api/admin/shipping/zones", data);
  return res.data.zone;
};

export const updateZoneApi = async (id: string, data: Partial<CourierZone> & { rate?: RateInput }): Promise<CourierZone> => {
  const res = await client.put(`/api/admin/shipping/zones/${id}`, data);
  return res.data.zone;
};

export const deleteZoneApi = async (id: string): Promise<void> => {
  await client.delete(`/api/admin/shipping/zones/${id}`);
};

/* ------------------------------ Rates CRUD -------------------------------- */

export const fetchRatesApi = async (zoneId?: string): Promise<CourierRate[]> => {
  const res = await client.get("/api/admin/shipping/rates", { params: { zoneId } });
  return res.data;
};

export const saveRateApi = async (data: { zoneId: string } & RateInput): Promise<CourierRate> => {
  const res = await client.post("/api/admin/shipping/rates", data);
  return res.data.rate;
};

/* --------------------------- Public rate/calc ----------------------------- */

export const calculateShippingApi = async (payload: {
  items: { productId: string; quantity: number }[];
  pincode: string;
  state: string;
  district: string;
  courierId?: string;
}): Promise<ShippingCalculateResult> => {
  const res = await client.post("/api/shipping/calculate", payload);
  return res.data;
};

export const fetchShippingRatesApi = async (params: {
  pincode: string;
  state: string;
  district: string;
}): Promise<ShippingRatesResult> => {
  const res = await client.get("/api/shipping/rates", { params });
  return res.data;
};

export const resolveShippingApi = async (payload: {
  pincode: string;
  state: string;
  district: string;
  weightGrams: number;
}): Promise<any> => {
  const res = await client.post("/api/shipping/resolve", payload);
  return res.data;
};
