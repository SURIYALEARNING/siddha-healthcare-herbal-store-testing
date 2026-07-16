import client from "./client";
import { Product } from "../types";
import { handleApiError } from "./errors";

export const fetchProductsApi = async (): Promise<Product[]> => {
  try {
    const res = await client.get("/api/products");
    return res.data;
  } catch (error) {
    handleApiError("fetchProductsApi", error);
  }
};

export const adminAddProductApi = async (productData: Partial<Product>): Promise<void> => {
  try {
    await client.post("/api/products/manage", productData);
  } catch (error) {
    handleApiError("adminAddProductApi", error);
  }
};

export const adminEditProductApi = async (productId: string, productData: Partial<Product>): Promise<void> => {
  try {
    await client.put(`/api/products/manage/${productId}`, productData);
  } catch (error) {
    handleApiError("adminEditProductApi", error);
  }
};

export const adminDeleteProductApi = async (productId: string): Promise<void> => {
  try {
    await client.delete(`/api/products/manage/${productId}`);
  } catch (error) {
    handleApiError("adminDeleteProductApi", error);
  }
};
