import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCart } from "../../../hooks/useCart";
import * as api from "../../../api";
import { storage } from "../../../utils";

vi.mock("../../../api", () => ({
  addToCartApi: vi.fn(),
  updateCartQuantityApi: vi.fn(),
  removeFromCartApi: vi.fn(),
  clearCartApi: vi.fn(),
  syncCartApi: vi.fn(),
  fetchCartApi: vi.fn(),
}));

vi.mock("../../../utils", () => ({
  storage: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
    cartKey: vi.fn((id: string | undefined) => `siddha_cart_${id || "guest"}`),
    wishlistKey: vi.fn(),
  },
}));

const mockProduct = {
  _id: "prod-1",
  name: "Test Product",
  price: 500,
  discountPrice: 450,
  stock: 10,
  images: ["test.jpg"],
  description: "A test product",
} as any;

const mockCartItem = {
  productId: "prod-1",
  name: "Test Product",
  price: 500,
  discountPrice: 450,
  quantity: 2,
  image: "test.jpg",
};

describe("useCart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    (storage.get as vi.Mock).mockReturnValue(null);
  });

  it("initializes with empty cart when no saved data", () => {
    const { result } = renderHook(() => useCart("user-1"));
    expect(result.current.cart).toEqual([]);
  });

  it("restores cart from localStorage on init", () => {
    const savedCart = [mockCartItem];
    (storage.get as vi.Mock).mockReturnValue(savedCart);

    const { result } = renderHook(() => useCart("user-1"));
    expect(result.current.cart).toEqual(savedCart);
  });

  it("addToCart adds a new item", async () => {
    const { result } = renderHook(() => useCart("user-1"));
    await act(async () => {
      await result.current.addToCart(mockProduct, 1, false);
    });

    expect(result.current.cart).toHaveLength(1);
    expect(result.current.cart[0].productId).toBe("prod-1");
    expect(result.current.cart[0].quantity).toBe(1);
  });

  it("addToCart upserts quantity for existing item", async () => {
    const { result } = renderHook(() => useCart("user-1"));
    await act(async () => {
      await result.current.addToCart(mockProduct, 1, false);
    });
    await act(async () => {
      await result.current.addToCart(mockProduct, 2, false);
    });

    expect(result.current.cart).toHaveLength(1);
    expect(result.current.cart[0].quantity).toBe(3);
  });

  it("addToCart clamps quantity to stock", async () => {
    const lowStockProduct = { ...mockProduct, stock: 2 };
    const { result } = renderHook(() => useCart("user-1"));
    await act(async () => {
      await result.current.addToCart(lowStockProduct, 5, false);
    });

    expect(result.current.cart[0].quantity).toBe(2);
  });

  it("addToCart calls API when logged in", async () => {
    (api.addToCartApi as vi.Mock).mockResolvedValue({ items: [] });
    const { result } = renderHook(() => useCart("user-1"));
    await act(async () => {
      await result.current.addToCart(mockProduct, 1, true);
    });

    expect(api.addToCartApi).toHaveBeenCalledWith(
      expect.objectContaining({ productId: "prod-1", quantity: 1 })
    );
  });

  it("addToCart does not call API when not logged in", async () => {
    const { result } = renderHook(() => useCart("user-1"));
    await act(async () => {
      await result.current.addToCart(mockProduct, 1, false);
    });

    expect(api.addToCartApi).not.toHaveBeenCalled();
  });

  it("updateQuantity changes quantity", async () => {
    const { result } = renderHook(() => useCart("user-1"));
    await act(async () => {
      await result.current.addToCart(mockProduct, 2, false);
    });
    await act(async () => {
      await result.current.updateQuantity("prod-1", 5, 10, false);
    });

    expect(result.current.cart[0].quantity).toBe(5);
  });

  it("updateQuantity clamps to stock", async () => {
    const { result } = renderHook(() => useCart("user-1"));
    await act(async () => {
      await result.current.addToCart(mockProduct, 1, false);
    });
    await act(async () => {
      await result.current.updateQuantity("prod-1", 100, 10, false);
    });

    expect(result.current.cart[0].quantity).toBe(10);
  });

  it("updateQuantity clamps to minimum of 1", async () => {
    const { result } = renderHook(() => useCart("user-1"));
    await act(async () => {
      await result.current.addToCart(mockProduct, 2, false);
    });
    await act(async () => {
      await result.current.updateQuantity("prod-1", 0, 10, false);
    });

    expect(result.current.cart[0].quantity).toBe(1);
  });

  it("removeFromCart removes the item", async () => {
    const { result } = renderHook(() => useCart("user-1"));
    await act(async () => {
      await result.current.addToCart(mockProduct, 1, false);
    });
    expect(result.current.cart).toHaveLength(1);

    await act(async () => {
      await result.current.removeFromCart("prod-1", false);
    });
    expect(result.current.cart).toHaveLength(0);
  });

  it("clearCart empties the cart", async () => {
    const { result } = renderHook(() => useCart("user-1"));
    await act(async () => {
      await result.current.addToCart(mockProduct, 1, false);
    });
    await act(async () => {
      await result.current.clearCart(false);
    });

    expect(result.current.cart).toEqual([]);
  });

  it("persists cart to localStorage on change", async () => {
    const { result } = renderHook(() => useCart("user-1"));
    await act(async () => {
      await result.current.addToCart(mockProduct, 1, false);
    });

    expect(storage.set).toHaveBeenCalled();
  });

  it("syncGuestCart merges guest cart and clears it", async () => {
    const guestCart = [mockCartItem];
    (storage.get as vi.Mock).mockImplementation((key: string) => {
      if (key === "siddha_cart_guest") return guestCart;
      return null;
    });
    (api.syncCartApi as vi.Mock).mockResolvedValue({ items: [{ ...mockCartItem, quantity: 3 }] });

    const { result } = renderHook(() => useCart("user-1"));
    await act(async () => {
      await result.current.syncGuestCart();
    });

    expect(api.syncCartApi).toHaveBeenCalledWith(guestCart);
    expect(storage.set).toHaveBeenCalledWith("siddha_cart_guest", []);
  });

  it("syncGuestCart falls back to guest cart on API failure", async () => {
    const guestCart = [mockCartItem];
    (storage.get as vi.Mock).mockImplementation((key: string) => {
      if (key === "siddha_cart_guest") return guestCart;
      return null;
    });
    (api.syncCartApi as vi.Mock).mockRejectedValue(new Error("sync failed"));

    const { result } = renderHook(() => useCart("user-1"));
    await act(async () => {
      await result.current.syncGuestCart();
    });

    expect(result.current.cart).toEqual(guestCart);
  });

  it("loadServerCart loads cart from server for logged-in user", async () => {
    localStorage.setItem("accessToken", "token");
    (api.fetchCartApi as vi.Mock).mockResolvedValue({ items: [mockCartItem] });

    const { result } = renderHook(() => useCart("user-1"));
    await act(async () => {
      await result.current.loadServerCart();
    });

    expect(result.current.cart).toEqual([mockCartItem]);
  });

  it("loadServerCart falls back to localStorage on error", async () => {
    localStorage.setItem("accessToken", "token");
    const savedCart = [mockCartItem];
    (storage.get as vi.Mock).mockReturnValue(savedCart);
    (api.fetchCartApi as vi.Mock).mockRejectedValue(new Error("server error"));

    const { result } = renderHook(() => useCart("user-1"));
    await act(async () => {
      await result.current.loadServerCart();
    });

    expect(result.current.cart).toEqual(savedCart);
  });
});