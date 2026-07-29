import client from "./client";
import { Order, ShippingStats, Shipment, PincodeResponse } from "../types";

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

export const fetchPickupLocationsApi = async (): Promise<{ name: string; address: string; email: string; phone: string }[]> => {
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
