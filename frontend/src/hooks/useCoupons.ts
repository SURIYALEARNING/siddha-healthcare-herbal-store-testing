import { useState, useCallback } from "react";
import { Coupon } from "../types";
import { fetchCouponsApi, applyCouponApi, adminAddCouponApi } from "../api";

export function useCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  const fetchCoupons = useCallback(async () => {
    try {
      const data = await fetchCouponsApi();
      setCoupons(data);
    } catch (e) {
      console.error("Failed to load coupons:", e);
    }
  }, []);

  const applyCoupon = useCallback(async (code: string) => {
    try {
      const data = await applyCouponApi(code);
      return { code: code.toUpperCase(), percent: data.discountPercent };
    } catch {
      return null;
    }
  }, []);

  const adminAddCoupon = useCallback(async (couponData: Partial<Coupon>) => {
    try {
      await adminAddCouponApi(couponData);
      await fetchCoupons();
      return true;
    } catch {
      return false;
    }
  }, [fetchCoupons]);

  return { coupons, setCoupons, fetchCoupons, applyCoupon, adminAddCoupon };
}
