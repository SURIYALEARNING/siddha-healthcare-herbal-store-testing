import client from "./client";

const BASE = "/api/admin/dashboard";

export async function fetchOverview(startDate?: string, endDate?: string) {
  const { data } = await client.get(`${BASE}/overview`, { params: { startDate, endDate } });
  return data;
}

export async function fetchRevenueAnalytics(startDate?: string, endDate?: string) {
  const { data } = await client.get(`${BASE}/revenue`, { params: { startDate, endDate } });
  return data;
}

export async function fetchOrderAnalytics(startDate?: string, endDate?: string) {
  const { data } = await client.get(`${BASE}/orders`, { params: { startDate, endDate } });
  return data;
}

export async function fetchCustomerAnalytics(startDate?: string, endDate?: string) {
  const { data } = await client.get(`${BASE}/customers`, { params: { startDate, endDate } });
  return data;
}

export async function fetchProductAnalytics(startDate?: string, endDate?: string) {
  const { data } = await client.get(`${BASE}/products`, { params: { startDate, endDate } });
  return data;
}

export async function fetchCategoryAnalytics(startDate?: string, endDate?: string) {
  const { data } = await client.get(`${BASE}/categories`, { params: { startDate, endDate } });
  return data;
}

export async function fetchInventoryAnalytics() {
  const { data } = await client.get(`${BASE}/inventory`);
  return data;
}

export async function fetchBatchAnalytics() {
  const { data } = await client.get(`${BASE}/batches`);
  return data;
}

export async function fetchReminderAnalytics(startDate?: string, endDate?: string) {
  const { data } = await client.get(`${BASE}/reminders`, { params: { startDate, endDate } });
  return data;
}

export async function fetchReviewAnalytics(startDate?: string, endDate?: string) {
  const { data } = await client.get(`${BASE}/reviews`, { params: { startDate, endDate } });
  return data;
}

export async function fetchPaymentAnalytics(startDate?: string, endDate?: string) {
  const { data } = await client.get(`${BASE}/payments`, { params: { startDate, endDate } });
  return data;
}

export async function fetchShippingAnalytics(startDate?: string, endDate?: string) {
  const { data } = await client.get(`${BASE}/shipping`, { params: { startDate, endDate } });
  return data;
}

export async function fetchStaffAnalytics() {
  const { data } = await client.get(`${BASE}/staff`);
  return data;
}

export async function fetchRecentActivities(limit = 20) {
  const { data } = await client.get(`${BASE}/activities`, { params: { limit } });
  return data;
}

export async function fetchNotifications() {
  const { data } = await client.get(`${BASE}/notifications`);
  return data;
}
