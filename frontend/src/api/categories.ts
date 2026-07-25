import client from './client';
import type { CategoryV2, ApiResponse } from '../types/v2';

const BASE = '/api/categories';

export async function fetchCategoriesApi(active?: boolean): Promise<CategoryV2[]> {
  const params = active !== undefined ? { active: String(active) } : {};
  const { data } = await client.get<{ success: boolean; data: CategoryV2[] }>(BASE, { params });
  return data.data;
}

export async function fetchCategoryBySlugApi(slug: string): Promise<CategoryV2> {
  const { data } = await client.get<ApiResponse<CategoryV2>>(`${BASE}/${slug}`);
  return data.data;
}

export async function createCategoryApi(categoryData: Partial<CategoryV2>): Promise<CategoryV2> {
  const { data } = await client.post<ApiResponse<CategoryV2>>(BASE, categoryData);
  return data.data;
}

export async function updateCategoryApi(id: string, categoryData: Partial<CategoryV2>): Promise<CategoryV2> {
  const { data } = await client.put<ApiResponse<CategoryV2>>(`${BASE}/${id}`, categoryData);
  return data.data;
}

export async function deleteCategoryApi(id: string): Promise<void> {
  await client.delete(`${BASE}/${id}`);
}
