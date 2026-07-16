import client from "./client";
import { Address } from "../types";
import { handleApiError } from "./errors";

interface LoginResponse {
  user: { id: string; fullName: string; email: string; mobileNumber: string; isAdmin?: boolean };
  accessToken: string;
}

interface UpdateProfileResponse {
  user: { id: string; fullName: string; email: string; mobileNumber: string; address?: Address; isAdmin?: boolean };
}

export const loginApi = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const res = await client.post("/auth/login", { email, password });
    return res.data;
  } catch (error) {
    handleApiError("loginApi", error);
  }
};

export const registerApi = async (
  fullName: string,
  email: string,
  mobileNumber: string,
  password: string
): Promise<void> => {
  try {
    await client.post("/api/auth/register", { fullName, email, mobileNumber, password });
  } catch (error) {
    handleApiError("registerApi", error);
  }
};

export const sendOtpApi = async (
  fullName: string,
  email: string,
  mobileNumber: string,
  password: string
): Promise<void> => {
  try {
    await client.post("/auth/register", { fullName, email, mobileNumber, password });
  } catch (error) {
    handleApiError("sendOtpApi", error);
  }
};

export const verifyOtpApi = async (email: string, otp: string): Promise<void> => {
  try {
    await client.post("/auth/verify-otp", { email, otp });
  } catch (error) {
    handleApiError("verifyOtpApi", error);
  }
};

export const updateProfileApi = async (
  userId: string,
  data: {
    fullName: string;
    mobileNumber: string;
    address: string;
    state: string;
    district: string;
    pincode: string;
  }
): Promise<UpdateProfileResponse> => {
  try {
    console.log(data);
    
    const res = await client.put(`/auth/update-profile/${userId}`, data, {
      headers: { Authorization: `Bearer ${userId}` },
    });
    return res.data;
  } catch (error) {
    handleApiError("updateProfileApi", error);
  }
};
