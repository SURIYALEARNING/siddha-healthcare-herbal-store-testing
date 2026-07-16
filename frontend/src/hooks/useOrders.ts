import { useState, useCallback } from "react";
import { Order, Address } from "../types";
import {
  fetchUserOrdersApi,
  submitOrderApi,
  trackOrderApi,
  adminFetchOrdersApi,
  adminUpdateOrderStatusApi,
  CheckoutPayload,
} from "../api";

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);

  const fetchUserOrders = useCallback(async () => {
    try {
      const data = await fetchUserOrdersApi();
      setOrders(data);
    } catch (e) {
      console.error("Failed to load orders:", e);
    }
  }, []);

  const submitOrder = useCallback(async (payload: CheckoutPayload) => {
    const data = await submitOrderApi(payload);
    setOrders(prev => [data.order, ...prev]);
    return data.order;
  }, []);

  const trackOrder = useCallback(async (orderId: string) => {
    try {
      return await trackOrderApi(orderId);
    } catch {
      return null;
    }
  }, []);

  const adminFetchOrders = useCallback(async () => {
    try {
      return await adminFetchOrdersApi();
    } catch {
      return [];
    }
  }, []);

  const adminUpdateOrderStatus = useCallback(async (orderId: string, status: string, paymentStatus?: string) => {
    try {
      await adminUpdateOrderStatusApi(orderId, status, paymentStatus);
      return true;
    } catch {
      return false;
    }
  }, []);

  return { orders, setOrders, fetchUserOrders, submitOrder, trackOrder, adminFetchOrders, adminUpdateOrderStatus };
}
