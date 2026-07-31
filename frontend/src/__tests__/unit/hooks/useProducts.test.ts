import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useProducts } from "../../../hooks/useProducts";
import * as api from "../../../api";

vi.mock("../../../api", () => ({
  fetchProductsApi: vi.fn(),
  adminAddProductApi: vi.fn(),
  adminEditProductApi: vi.fn(),
  adminDeleteProductApi: vi.fn(),
}));

const mockProducts = [
  { _id: "prod-1", name: "Product 1", price: 100, discountPrice: 90, stock: 5 },
  { _id: "prod-2", name: "Product 2", price: 200, discountPrice: 180, stock: 10 },
];

describe("useProducts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes with empty products array", () => {
    const { result } = renderHook(() => useProducts());
    expect(result.current.products).toEqual([]);
  });

  it("fetchProducts loads products from API", async () => {
    (api.fetchProductsApi as vi.Mock).mockResolvedValue({ products: mockProducts, total: 2, page: 1, totalPages: 1 });

    const { result } = renderHook(() => useProducts());
    await act(async () => {
      await result.current.fetchProducts();
    });

    expect(result.current.products).toEqual(mockProducts);
    expect(api.fetchProductsApi).toHaveBeenCalledWith({ limit: 100 });
  });

  it("fetchProducts handles API error gracefully", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    (api.fetchProductsApi as vi.Mock).mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useProducts());
    await act(async () => {
      await result.current.fetchProducts();
    });

    expect(result.current.products).toEqual([]);
    consoleSpy.mockRestore();
  });

  it("adminAddProduct creates product and refreshes list", async () => {
    (api.adminAddProductApi as vi.Mock).mockResolvedValue(undefined);
    (api.fetchProductsApi as vi.Mock).mockResolvedValue({ products: mockProducts });

    const { result } = renderHook(() => useProducts());
    const productData = { name: "New Product", price: 150 };

    await act(async () => {
      const success = await result.current.adminAddProduct(productData);
      expect(success).toBe(true);
    });

    expect(api.adminAddProductApi).toHaveBeenCalledWith(productData);
    expect(api.fetchProductsApi).toHaveBeenCalled();
  });

  it("adminAddProduct returns false on failure", async () => {
    (api.adminAddProductApi as vi.Mock).mockRejectedValue(new Error("Failed"));

    const { result } = renderHook(() => useProducts());
    await act(async () => {
      const success = await result.current.adminAddProduct({ name: "Fail" });
      expect(success).toBe(false);
    });
  });

  it("adminEditProduct updates product and refreshes list", async () => {
    (api.adminEditProductApi as vi.Mock).mockResolvedValue(undefined);
    (api.fetchProductsApi as vi.Mock).mockResolvedValue({ products: mockProducts });

    const { result } = renderHook(() => useProducts());
    await act(async () => {
      const success = await result.current.adminEditProduct("prod-1", { price: 250 });
      expect(success).toBe(true);
    });

    expect(api.adminEditProductApi).toHaveBeenCalledWith("prod-1", { price: 250 });
    expect(api.fetchProductsApi).toHaveBeenCalled();
  });

  it("adminEditProduct returns false on failure", async () => {
    (api.adminEditProductApi as vi.Mock).mockRejectedValue(new Error("Failed"));

    const { result } = renderHook(() => useProducts());
    await act(async () => {
      const success = await result.current.adminEditProduct("prod-1", { price: 250 });
      expect(success).toBe(false);
    });
  });

  it("adminDeleteProduct removes product and refreshes list", async () => {
    (api.adminDeleteProductApi as vi.Mock).mockResolvedValue(undefined);
    (api.fetchProductsApi as vi.Mock).mockResolvedValue({ products: mockProducts });

    const { result } = renderHook(() => useProducts());
    await act(async () => {
      const success = await result.current.adminDeleteProduct("prod-1");
      expect(success).toBe(true);
    });

    expect(api.adminDeleteProductApi).toHaveBeenCalledWith("prod-1");
    expect(api.fetchProductsApi).toHaveBeenCalled();
  });

  it("adminDeleteProduct returns false on failure", async () => {
    (api.adminDeleteProductApi as vi.Mock).mockRejectedValue(new Error("Failed"));

    const { result } = renderHook(() => useProducts());
    await act(async () => {
      const success = await result.current.adminDeleteProduct("prod-1");
      expect(success).toBe(false);
    });
  });

  it("setProducts directly updates state", () => {
    const { result } = renderHook(() => useProducts());
    act(() => {
      result.current.setProducts(mockProducts);
    });
    expect(result.current.products).toEqual(mockProducts);
  });
});