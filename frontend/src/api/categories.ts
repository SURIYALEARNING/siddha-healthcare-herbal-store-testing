import client from './client';
import type { Category, ApiResponse } from '../types';

const BASE = '/api/categories';

export async function fetchCategoriesApi(active?: boolean): Promise<Category[]> {
  const params = active !== undefined ? { active: String(active) } : {};
  const { data } = await client.get<{ success: boolean; data: Category[] }>(BASE, { params });
  return data.data;
}

export async function fetchCategoryBySlugApi(slug: string): Promise<Category> {
  const { data } = await client.get<ApiResponse<Category>>(`${BASE}/${slug}`);
  return data.data;
}

export async function createCategoryApi(categoryData: Partial<Category>): Promise<Category> {
  const { data } = await client.post<ApiResponse<Category>>(BASE, categoryData);
  return data.data;
}

export async function updateCategoryApi(id: string, categoryData: Partial<Category>): Promise<Category> {
  const { data } = await client.put<ApiResponse<Category>>(`${BASE}/${id}`, categoryData);
  return data.data;
}

export async function deleteCategoryApi(id: string): Promise<void> {
  await client.delete(`${BASE}/${id}`);
}
