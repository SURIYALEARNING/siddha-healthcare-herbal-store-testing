import client from "./client";
import { handleApiError } from "./errors";

export const adminFetchUsersApi = async (): Promise<any[]> => {
  try {
    const res = await client.get("/api/admin/users");
    return res.data;
  } catch (error) {
    handleApiError("adminFetchUsersApi", error);
  }
};

export const adminFetchAnalyticsApi = async (): Promise<any> => {
  try {
    const res = await client.get("/api/admin/analytics");
    return res.data;
  } catch (error) {
    handleApiError("adminFetchAnalyticsApi", error);
  }
};
