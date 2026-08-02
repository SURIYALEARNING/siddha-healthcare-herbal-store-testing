import client from "./client";

export async function fetchReminders(params: {
  status?: string;
  period?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
}) {
  const { data } = await client.get("/api/admin/reminders", { params });
  return data;
}

export async function fetchReminderById(id: string) {
  const { data } = await client.get(`/api/admin/reminders/${id}`);
  return data;
}

export async function fetchReminderStats() {
  const { data } = await client.get("/api/admin/reminders/stats");
  return data;
}

export async function updateWhatsappStatus(id: string, payload: { status: string; whatsappStatus: string }) {
  const { data } = await client.patch(`/api/admin/reminders/${id}/whatsapp`, payload);
  return data;
}

export async function completeCall(id: string, payload: { callResult: string; callNotes?: string }) {
  const { data } = await client.patch(`/api/admin/reminders/${id}/call`, payload);
  return data;
}

export async function createRemindersForOrder(orderId: string) {
  const { data } = await client.post(`/api/admin/reminders/order/${orderId}/create`);
  return data;
}
