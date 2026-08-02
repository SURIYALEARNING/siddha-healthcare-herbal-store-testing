import client from "./client";
import { Order, Address, PaginatedOrders, OrderStats, TimelineEvent } from "../types";
import { handleApiError } from "./errors";

export interface CheckoutPayload {
  items: { productId: string; quantity: number }[];
  shippingAddress: Address;
  mobileNumber: string;
  email: string;
  fullName: string;
  paymentMethod: string;
  couponCode?: string;
  razorpayPaymentId?: string;
  courierId?: string;
}

interface SubmitOrderResponse {
  order: Order;
}

export const fetchUserOrdersApi = async (): Promise<Order[]> => {
  try {
    const res = await client.get("/api/orders");
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
    return res.data?.orders || res.data;
  } catch (error) {
    handleApiError("adminFetchOrdersApi", error);
  }
};

export const getAdminOrdersApi = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  paymentStatus?: string;
  shippingMethod?: string;
  search?: string;
  period?: string;
  dateFrom?: string;
  dateTo?: string;
  userId?: string;
}): Promise<PaginatedOrders> => {
  try {
    const res = await client.get("/api/admin/orders", { params });
    return res.data;
  } catch (error) {
    handleApiError("getAdminOrdersApi", error);
  }
};

export const getAdminOrderByIdApi = async (id: string): Promise<Order> => {
  try {
    const res = await client.get(`/api/admin/orders/${id}`);
    return res.data;
  } catch (error) {
    handleApiError("getAdminOrderByIdApi", error);
  }
};

export const getOrderTimelineApi = async (id: string): Promise<{ timeline: TimelineEvent[]; currentStatus: string }> => {
  try {
    const res = await client.get(`/api/admin/orders/${id}/timeline`);
    return res.data;
  } catch (error) {
    handleApiError("getOrderTimelineApi", error);
  }
};

export const getOrderStatsApi = async (): Promise<OrderStats> => {
  try {
    const res = await client.get("/api/admin/orders/stats");
    return res.data;
  } catch (error) {
    handleApiError("getOrderStatsApi", error);
  }
};

export const adminUpdateOrderStatusApi = async (
  orderId: string,
  status: string,
  paymentStatus?: string,
  description?: string
): Promise<void> => {
  try {
    await client.put(`/api/admin/orders/${orderId}/status`, { status, paymentStatus, description });
  } catch (error) {
    handleApiError("adminUpdateOrderStatusApi", error);
  }
};

export const updateManualShippingStatusApi = async (
  orderId: string,
  status: string,
  description?: string
): Promise<void> => {
  try {
    await client.put(`/api/admin/orders/${orderId}/shipping-status`, { status, description });
  } catch (error) {
    handleApiError("updateManualShippingStatusApi", error);
  }
};

export const updateOrderTrackingApi = async (
  orderId: string,
  data: {
    courierId?: string;
    courierName?: string;
    awbNumber?: string;
    trackingUrl?: string;
    courierReceiptImage?: string;
    shippingNotes?: string;
    shipmentStatus?: string;
  }
): Promise<Order> => {
  const res = await client.put(`/api/admin/orders/${orderId}/tracking`, data);
  return res.data.order;
};

export const getCustomersListApi = async (): Promise<any[]> => {
  try {
    const res = await client.get("/api/admin/customers");
    return res.data;
  } catch (error) {
    handleApiError("getCustomersListApi", error);
  }
};

export const getCustomerOrdersApi = async (userId: string, status?: string): Promise<{ customer: any; orders: Order[] }> => {
  try {
    const res = await client.get(`/api/admin/customers/${userId}/orders`, { params: { status } });
    return res.data;
  } catch (error) {
    handleApiError("getCustomerOrdersApi", error);
  }
};
