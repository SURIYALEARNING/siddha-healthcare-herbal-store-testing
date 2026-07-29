import client from "./client";
import { Batch, StockAdjustment } from "../types";

export const fetchBatchesApi = async (): Promise<Batch[]> => {
  const res = await client.get("/api/admin/batches");
  return res.data;
};

export const fetchBatchByIdApi = async (id: string): Promise<Batch> => {
  const res = await client.get(`/api/admin/batches/${id}`);
  return res.data;
};

export const createBatchApi = async (data: Partial<Batch>): Promise<Batch> => {
  const res = await client.post("/api/admin/batches", data);
  return res.data;
};

export const updateBatchApi = async (id: string, data: Partial<Batch>): Promise<Batch> => {
  const res = await client.put(`/api/admin/batches/${id}`, data);
  return res.data;
};

export const adjustBatchStockApi = async (
  id: string,
  data: { newStock: number; reason: string; reasonDetails?: string; updatedBy?: string }
): Promise<void> => {
  await client.patch(`/api/admin/batches/${id}/stock-adjustment`, data);
};

export const fetchBatchHistoryApi = async (id: string): Promise<StockAdjustment[]> => {
  const res = await client.get(`/api/admin/batches/${id}/history`);
  return res.data;
};
