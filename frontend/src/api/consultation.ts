import client from "./client";
import { User } from "../types";
import { handleApiError } from "./errors";

export const bookConsultationApi = async (
  data: {
    fullName: string;
    mobileNumber: string;
    email: string;
    preferredDate: string;
    preferredTime: string;
    healthIssues: string;
  },
  user?: User | null
): Promise<void> => {
  try {
    const config: Record<string, any> = {};
    if (user) config.headers = { Authorization: `Bearer ${user.id}` };
    await client.post("/api/consultation", data, config);
  } catch (error) {
    handleApiError("bookConsultationApi", error);
  }
};

export const adminFetchConsultationsApi = async (): Promise<any[]> => {
  try {
    const res = await client.get("/api/admin/consultations");
    return res.data;
  } catch (error) {
    handleApiError("adminFetchConsultationsApi", error);
  }
};
