import client from "./client";
import { Product, SocialProductEntry, SocialPlatform } from "../types";
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

export const fetchSocialProductsApi = async (): Promise<SocialProductEntry[]> => {
  try {
    const res = await client.get("/api/carousel");
    return res.data?.socialProducts || [];
  } catch (error) {
    console.error("[API] fetchSocialProductsApi:", error);
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

export const adminUpdateSocialProductsApi = async (
  items: { productId: string; social: SocialPlatform; url: string }[]
): Promise<void> => {
  try {
    await client.put("/api/carousel/manage/social", { items });
  } catch (error) {
    console.error("[API] adminUpdateSocialProductsApi:", error);
    throw error;
  }
};

export { handleApiError };
