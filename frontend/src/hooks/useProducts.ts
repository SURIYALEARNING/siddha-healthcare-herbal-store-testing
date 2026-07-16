import { useState, useCallback } from "react";
import { Product } from "../types";
import { fetchProductsApi, adminAddProductApi, adminEditProductApi, adminDeleteProductApi } from "../api";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);

  const fetchProducts = useCallback(async () => {
    try {
      const data = await fetchProductsApi();
      setProducts(data);
    } catch (e) {
      console.error("Failed to load products:", e);
    }
  }, []);

  const adminAddProduct = useCallback(async (productData: Partial<Product>) => {
    try {
      await adminAddProductApi(productData);
      await fetchProducts();
      return true;
    } catch {
      return false;
    }
  }, [fetchProducts]);

  const adminEditProduct = useCallback(async (productId: string, productData: Partial<Product>) => {
    try {
      await adminEditProductApi(productId, productData);
      await fetchProducts();
      return true;
    } catch {
      return false;
    }
  }, [fetchProducts]);

  const adminDeleteProduct = useCallback(async (productId: string) => {
    try {
      await adminDeleteProductApi(productId);
      await fetchProducts();
      return true;
    } catch {
      return false;
    }
  }, [fetchProducts]);

  return { products, setProducts, fetchProducts, adminAddProduct, adminEditProduct, adminDeleteProduct };
}
