import client from "./client";
import { Review, ReviewStats, PaginatedReviews, ReviewFormData } from "../types";
import { handleApiError } from "./errors";

export const fetchProductReviewsApi = async (
  productId: string,
  params?: { page?: number; limit?: number; rating?: number; sort?: string }
): Promise<PaginatedReviews> => {
  try {
    const res = await client.get(`/api/products/${productId}/reviews`, { params });
    return res.data;
  } catch (error) {
    handleApiError("fetchProductReviewsApi", error);
  }
};

export const fetchReviewStatsApi = async (productId: string): Promise<ReviewStats> => {
  try {
    const res = await client.get(`/api/products/${productId}/reviews/stats`);
    return res.data;
  } catch (error) {
    handleApiError("fetchReviewStatsApi", error);
  }
};

export const createReviewApi = async (
  productId: string,
  data: ReviewFormData
): Promise<{ review: Review; reviewStats: ReviewStats }> => {
  try {
    const res = await client.post(`/api/products/${productId}/reviews`, data);
    return res.data;
  } catch (error) {
    handleApiError("createReviewApi", error);
  }
};

export const updateReviewApi = async (
  productId: string,
  reviewId: string,
  data: Partial<ReviewFormData>
): Promise<{ review: Review; reviewStats: ReviewStats }> => {
  try {
    const res = await client.put(`/api/products/${productId}/reviews/${reviewId}`, data);
    return res.data;
  } catch (error) {
    handleApiError("updateReviewApi", error);
  }
};

export const deleteReviewApi = async (
  productId: string,
  reviewId: string
): Promise<void> => {
  try {
    await client.delete(`/api/products/${productId}/reviews/${reviewId}`);
  } catch (error) {
    handleApiError("deleteReviewApi", error);
  }
};

export const markHelpfulApi = async (
  productId: string,
  reviewId: string
): Promise<{ helpfulCount: number }> => {
  try {
    const res = await client.patch(`/api/products/${productId}/reviews/${reviewId}/helpful`);
    return res.data;
  } catch (error) {
    handleApiError("markHelpfulApi", error);
  }
};

export const approveReviewApi = async (
  productId: string,
  reviewId: string
): Promise<Review> => {
  try {
    const res = await client.patch(`/api/products/${productId}/reviews/${reviewId}/approve`);
    return res.data;
  } catch (error) {
    handleApiError("approveReviewApi", error);
  }
};

export const approveReviewAdminApi = async (reviewId: string): Promise<Review> => {
  try {
    const res = await client.patch(`/api/admin/reviews/${reviewId}/approve`);
    return res.data;
  } catch (error) {
    handleApiError("approveReviewAdminApi", error);
  }
};

export const fetchAdminReviewsApi = async (params: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{ reviews: Review[]; total: number; page: number; totalPages: number }> => {
  try {
    const res = await client.get("/api/admin/reviews", { params });
    return res.data;
  } catch (error) {
    handleApiError("fetchAdminReviewsApi", error);
  }
};

export const fetchReviewUsersApi = async (): Promise<any[]> => {
  try {
    const res = await client.get("/api/admin/reviews/users");
    return res.data;
  } catch (error) {
    handleApiError("fetchReviewUsersApi", error);
  }
};

export const fetchReviewsByUserApi = async (userId: string): Promise<Review[]> => {
  try {
    const res = await client.get(`/api/admin/reviews/user/${userId}`);
    return res.data;
  } catch (error) {
    handleApiError("fetchReviewsByUserApi", error);
  }
};

export const rejectReviewApi = async (reviewId: string): Promise<Review> => {
  try {
    const res = await client.patch(`/api/admin/reviews/${reviewId}/reject`);
    return res.data;
  } catch (error) {
    handleApiError("rejectReviewApi", error);
  }
};

export const replyToReviewApi = async (reviewId: string, message: string): Promise<Review> => {
  try {
    const res = await client.patch(`/api/admin/reviews/${reviewId}/reply`, { message });
    return res.data;
  } catch (error) {
    handleApiError("replyToReviewApi", error);
  }
};

export const fetchLatestReviewsApi = async (limit = 10): Promise<Review[]> => {
  try {
    const res = await client.get("/api/reviews/latest", { params: { limit } });
    return res.data;
  } catch (error) {
    handleApiError("fetchLatestReviewsApi", error);
  }
};
