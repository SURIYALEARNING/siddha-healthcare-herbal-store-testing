import client from "./client";
import { Coupon } from "../types";
import { handleApiError } from "./errors";

export const fetchCouponsApi = async (): Promise<Coupon[]> => {
  try {
    const res = await client.get("/api/coupons");
    return res.data;
  } catch (error) {
    handleApiError("fetchCouponsApi", error);
  }
};

export const applyCouponApi = async (code: string): Promise<{ discountPercent: number }> => {
  try {
    const res = await client.post("/api/coupons/apply", { code });
    return res.data;
  } catch (error) {
    handleApiError("applyCouponApi", error);
  }
};

export const adminAddCouponApi = async (couponData: Partial<Coupon>): Promise<void> => {
  try {
    await client.post("/api/coupons/manage", couponData);
  } catch (error) {
    handleApiError("adminAddCouponApi", error);
  }
};
