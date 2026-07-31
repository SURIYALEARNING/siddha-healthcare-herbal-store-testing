import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useOrders } from "../../../hooks/useOrders";
import * as api from "../../../api";

vi.mock("../../../api", () => ({
  fetchUserOrdersApi: vi.fn(),
  submitOrderApi: vi.fn(),
  trackOrderApi: vi.fn(),
  adminFetchOrdersApi: vi.fn(),
  adminUpdateOrderStatusApi: vi.fn(),
}));

const mockOrders = [
  { id: "order-1", total: 500, status: "Ordered", date: "2024-01-15" },
  { id: "order-2", total: 300, status: "Delivered", date: "2024-01-10" },
];

const mockCheckoutPayload = {
  items: [{ productId: "prod-1", quantity: 2 }],
  shippingAddress: { address: "123 St", state: "TN", district: "Chennai", pincode: "600001" },
  mobileNumber: "9876543210",
  email: "test@example.com",
  fullName: "Test User",
  paymentMethod: "Cash on Delivery",
};

describe("useOrders", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes with empty orders", () => {
    const { result } = renderHook(() => useOrders());
    expect(result.current.orders).toEqual([]);
  });

  it("fetchUserOrders loads orders", async () => {
    (api.fetchUserOrdersApi as vi.Mock).mockResolvedValue(mockOrders);

    const { result } = renderHook(() => useOrders());
    await act(async () => {
      await result.current.fetchUserOrders();
    });

    expect(result.current.orders).toEqual(mockOrders);
    expect(api.fetchUserOrdersApi).toHaveBeenCalled();
  });

  it("fetchUserOrders retries on failure", async () => {
    (api.fetchUserOrdersApi as vi.Mock)
      .mockRejectedValueOnce(new Error("fail"))
      .mockResolvedValueOnce(mockOrders);

    const { result } = renderHook(() => useOrders());
    await act(async () => {
      await result.current.fetchUserOrders(1);
    });

    expect(result.current.orders).toEqual(mockOrders);
    expect(api.fetchUserOrdersApi).toHaveBeenCalledTimes(2);
  });

  it("fetchUserOrders gives up after all retries fail", async () => {
    (api.fetchUserOrdersApi as vi.Mock).mockRejectedValue(new Error("fail"));

    const { result } = renderHook(() => useOrders());
    await act(async () => {
      await result.current.fetchUserOrders(0);
    });

    expect(result.current.orders).toEqual([]);
  });

  it("submitOrder submits and prepends the order", async () => {
    const newOrder = { id: "order-3", total: 600, status: "Ordered" };
    (api.submitOrderApi as vi.Mock).mockResolvedValue({ order: newOrder });

    const { result } = renderHook(() => useOrders());

    await act(async () => {
      const order = await result.current.submitOrder(mockCheckoutPayload);
      expect(order).toEqual(newOrder);
    });

    expect(result.current.orders).toEqual([newOrder]);
    expect(api.submitOrderApi).toHaveBeenCalledWith(mockCheckoutPayload);
  });

  it("submitOrder prepends to existing orders", async () => {
    (api.fetchUserOrdersApi as vi.Mock).mockResolvedValue(mockOrders);
    const newOrder = { id: "order-3", total: 600, status: "Ordered" };
    (api.submitOrderApi as vi.Mock).mockResolvedValue({ order: newOrder });

    const { result } = renderHook(() => useOrders());
    await act(async () => {
      await result.current.fetchUserOrders();
    });

    await act(async () => {
      await result.current.submitOrder(mockCheckoutPayload);
    });

    expect(result.current.orders).toHaveLength(3);
    expect(result.current.orders[0].id).toBe("order-3");
  });

  it("trackOrder returns tracking data", async () => {
    const trackingData = { id: "order-1", status: "Shipped", tracking: { courierName: "FedEx" } };
    (api.trackOrderApi as vi.Mock).mockResolvedValue(trackingData);

    const { result } = renderHook(() => useOrders());
    let data;
    await act(async () => {
      data = await result.current.trackOrder("order-1");
    });

    expect(data).toEqual(trackingData);
    expect(api.trackOrderApi).toHaveBeenCalledWith("order-1");
  });

  it("trackOrder returns null on failure", async () => {
    (api.trackOrderApi as vi.Mock).mockRejectedValue(new Error("Not found"));

    const { result } = renderHook(() => useOrders());
    let data;
    await act(async () => {
      data = await result.current.trackOrder("order-1");
    });

    expect(data).toBeNull();
  });

  it("adminFetchOrders fetches all orders", async () => {
    (api.adminFetchOrdersApi as vi.Mock).mockResolvedValue(mockOrders);

    const { result } = renderHook(() => useOrders());
    let data;
    await act(async () => {
      data = await result.current.adminFetchOrders();
    });

    expect(data).toEqual(mockOrders);
  });

  it("adminFetchOrders returns empty array on failure", async () => {
    (api.adminFetchOrdersApi as vi.Mock).mockRejectedValue(new Error("fail"));

    const { result } = renderHook(() => useOrders());
    let data;
    await act(async () => {
      data = await result.current.adminFetchOrders();
    });

    expect(data).toEqual([]);
  });

  it("adminUpdateOrderStatus updates status", async () => {
    (api.adminUpdateOrderStatusApi as vi.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useOrders());
    let success;
    await act(async () => {
      success = await result.current.adminUpdateOrderStatus("order-1", "Shipped", "Paid");
    });

    expect(success).toBe(true);
    expect(api.adminUpdateOrderStatusApi).toHaveBeenCalledWith("order-1", "Shipped", "Paid");
  });

  it("adminUpdateOrderStatus returns false on failure", async () => {
    (api.adminUpdateOrderStatusApi as vi.Mock).mockRejectedValue(new Error("fail"));

    const { result } = renderHook(() => useOrders());
    let success;
    await act(async () => {
      success = await result.current.adminUpdateOrderStatus("order-1", "Shipped");
    });

    expect(success).toBe(false);
  });

  it("setOrders directly updates state", () => {
    const { result } = renderHook(() => useOrders());
    act(() => {
      result.current.setOrders(mockOrders);
    });
    expect(result.current.orders).toEqual(mockOrders);
  });
});