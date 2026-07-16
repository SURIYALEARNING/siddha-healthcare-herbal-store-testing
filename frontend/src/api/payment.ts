import client from "./client";
import { handleApiError } from "./errors";

interface CreateOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
}

interface VerifyResponse {
  success: boolean;
  razorpayPaymentId: string;
}

interface ConfigResponse {
  key: string;
}

export const fetchRazorpayConfigApi = async (): Promise<ConfigResponse> => {
  try {
    const res = await client.get("/api/payment/config");
    return res.data;
  } catch (error) {
    handleApiError("fetchRazorpayConfigApi", error);
  }
};

export const createRazorpayOrderApi = async (amount: number): Promise<CreateOrderResponse> => {
  try {
    const res = await client.post("/api/payment/create-order", { amount });
    return res.data;
  } catch (error) {
    handleApiError("createRazorpayOrderApi", error);
  }
};

export const verifyRazorpayPaymentApi = async (
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string
): Promise<VerifyResponse> => {
  try {
    const res = await client.post("/api/payment/verify", {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });
    return res.data;
  } catch (error) {
    handleApiError("verifyRazorpayPaymentApi", error);
  }
};
