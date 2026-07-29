import client from "./client";
import { Product } from "../types";
import { handleApiError } from "./errors";

export const fetchCarouselProductsApi = async (): Promise<Product[]> => {
  try {
    const res = await client.get("/api/carousel");
    return res.data?.products || [];
  } catch (error) {
    console.error("[API] fetchCarouselProductsApi:", error);
    return [];
  }
};

export const adminUpdateCarouselProductsApi = async (productIds: string[]): Promise<void> => {
  try {
    await client.put("/api/carousel/manage", { productIds });
  } catch (error) {
    console.error("[API] adminUpdateCarouselProductsApi:", error);
    throw error;
  }
};
