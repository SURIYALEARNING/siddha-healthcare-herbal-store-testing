import client from './client';
import type { ProductV2, PaginatedResponse, ApiResponse } from '../types/v2';

const BASE = '/api/products-v2';

export interface ProductsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  featured?: boolean;
  active?: boolean;
}

export async function fetchProductsV2Api(params: ProductsQueryParams = {}): Promise<PaginatedResponse<ProductV2>> {
  const query: Record<string, string> = {};
  if (params.page) query.page = String(params.page);
  if (params.limit) query.limit = String(params.limit);
  if (params.search) query.search = params.search;
  if (params.category) query.category = params.category;
  if (params.minPrice !== undefined) query.minPrice = String(params.minPrice);
  if (params.maxPrice !== undefined) query.maxPrice = String(params.maxPrice);
  if (params.sort) query.sort = params.sort;
  if (params.featured !== undefined) query.featured = String(params.featured);
  if (params.active !== undefined) query.active = String(params.active);

  const { data } = await client.get<PaginatedResponse<ProductV2>>(BASE, { params: query });
  return data;
}

export async function fetchProductBySlugV2Api(slug: string): Promise<ProductV2> {
  const { data } = await client.get<ApiResponse<ProductV2>>(`${BASE}/${slug}`);
  return data.data;
}

export async function fetchProductByIdV2Api(id: string): Promise<ProductV2> {
  const { data } = await client.get<ApiResponse<ProductV2>>(`${BASE}/by-id/${id}`);
  return data.data;
}

export async function createProductV2Api(productData: Partial<ProductV2>): Promise<ProductV2> {
  const { data } = await client.post<ApiResponse<ProductV2>>(BASE, productData);
  return data.data;
}

export async function updateProductV2Api(id: string, productData: Partial<ProductV2>): Promise<ProductV2> {
  const { data } = await client.put<ApiResponse<ProductV2>>(`${BASE}/${id}`, productData);
  return data.data;
}

export async function deleteProductV2Api(id: string): Promise<void> {
  await client.delete(`${BASE}/${id}`);
}
