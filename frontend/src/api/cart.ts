import client from "./client";
import { CartItem } from "../types";
import { handleApiError } from "./errors";

export const fetchCartApi = async (): Promise<{ userId: string; items: CartItem[] }> => {
  
  try {
    const res = await client.get("/api/cart");
    return res.data;
  } catch (error) {
    handleApiError("fetchCartApi", error);
  }
};

export const addToCartApi = async (item: {
  productId: string;
  name: string;
  price: number;
  discountPrice: number;
  quantity: number;
  image: string;
}): Promise<{ userId: string; items: CartItem[] }> => {
  
  try {
    const res = await client.post("/api/cart/add", item);
    return res.data;
  } catch (error) {
    handleApiError("addToCartApi", error);
  }
};

export const updateCartQuantityApi = async (
  productId: string,
  quantity: number
): Promise<{ userId: string; items: CartItem[] }> => {
  try {
    const res = await client.put(`/api/cart/update/${productId}`, { quantity });
    return res.data;
  } catch (error) {
    handleApiError("updateCartQuantityApi", error);
  }
};

export const removeFromCartApi = async (
  productId: string
): Promise<{ userId: string; items: CartItem[] }> => {
  try {
    const res = await client.delete(`/api/cart/remove/${productId}`);
    return res.data;
  } catch (error) {
    handleApiError("removeFromCartApi", error);
  }
};

export const clearCartApi = async (): Promise<void> => {
  try {
    await client.delete("/api/cart/clear");
  } catch (error) {
    handleApiError("clearCartApi", error);
  }
};

export const syncCartApi = async (
  items: CartItem[]
): Promise<{ userId: string; items: CartItem[] }> => {
  try {
    const res = await client.post("/api/cart/sync", { items });
    return res.data;
  } catch (error) {
    handleApiError("syncCartApi", error);
  }
};
