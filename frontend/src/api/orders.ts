import client from "./client";
import { Order, Address } from "../types";
import { handleApiError } from "./errors";

export interface CheckoutPayload {
  items: { productId: string; name: string; price: number; quantity: number; image: string }[];
  subtotal: number;
  couponDiscount: number;
  total: number;
  shippingAddress: Address;
  mobileNumber: string;
  email: string;
  fullName: string;
  paymentMethod: string;
}

interface SubmitOrderResponse {
  order: Order;
}

export const fetchUserOrdersApi = async (userId: string): Promise<Order[]> => {
  try {
    const res = await client.get("/api/orders", {
      headers: { Authorization: `Bearer ${userId}` },
    });
    return res.data;
  } catch (error) {
    handleApiError("fetchUserOrdersApi", error);
  }
};

export const submitOrderApi = async (payload: CheckoutPayload): Promise<SubmitOrderResponse> => {
  try {
    const res = await client.post("/api/orders", payload);
    return res.data;
  } catch (error) {
    handleApiError("submitOrderApi", error);
  }
};

export const trackOrderApi = async (orderId: string): Promise<Order> => {
  try {
    const res = await client.get(`/api/orders/track/${orderId}`);
    return res.data;
  } catch (error) {
    handleApiError("trackOrderApi", error);
  }
};

export const adminFetchOrdersApi = async (): Promise<Order[]> => {
  try {
    const res = await client.get("/api/admin/orders");
    return res.data;
  } catch (error) {
    handleApiError("adminFetchOrdersApi", error);
  }
};

export const adminUpdateOrderStatusApi = async (
  orderId: string,
  status: string,
  paymentStatus?: string
): Promise<void> => {
  try {
    await client.put(`/api/admin/orders/${orderId}/status`, { status, paymentStatus });
  } catch (error) {
    handleApiError("adminUpdateOrderStatusApi", error);
  }
};
