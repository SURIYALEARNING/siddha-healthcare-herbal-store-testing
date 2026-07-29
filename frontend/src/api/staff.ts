import client from "./client";
import { User } from "../types";

export async function fetchStaffList(): Promise<User[]> {
  const { data } = await client.get("/api/admin/staff");
  return data;
}

export async function fetchStaffById(id: string): Promise<User> {
  const { data } = await client.get(`/api/admin/staff/${id}`);
  return data;
}

export async function createStaff(payload: {
  fullName: string;
  email: string;
  mobileNumber?: string;
  password: string;
  permissions: Record<string, boolean>;
}): Promise<{ staff: User }> {
  const { data } = await client.post("/api/admin/staff", payload);
  return data;
}

export async function updateStaff(id: string, payload: {
  fullName?: string;
  mobileNumber?: string;
  permissions?: Record<string, boolean>;
  isActive?: boolean;
}): Promise<{ staff: User }> {
  const { data } = await client.put(`/api/admin/staff/${id}`, payload);
  return data;
}

export async function updateStaffStatus(id: string, isActive: boolean): Promise<{ staff: User }> {
  const { data } = await client.patch(`/api/admin/staff/${id}/status`, { isActive });
  return data;
}

export async function resetStaffPassword(id: string, password: string): Promise<void> {
  await client.patch(`/api/admin/staff/${id}/password`, { password });
}

export async function deleteStaff(id: string): Promise<void> {
  await client.delete(`/api/admin/staff/${id}`);
}
