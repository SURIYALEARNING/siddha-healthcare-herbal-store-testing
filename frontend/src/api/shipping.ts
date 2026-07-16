import client from "./client";
import { Order, ShippingStats, Shipment } from "../types";

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

export const createShiprocketOrderApi = async (orderId: string): Promise<{ shiprocketOrderId: string; shipmentId: string }> => {
  const res = await client.post("/api/admin/shipping/create-shiprocket-order", { orderId });
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
