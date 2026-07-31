import client from "./client";
import { Blog } from "../types";
import { handleApiError } from "./errors";

export const fetchBlogByIdApi = async (id: string): Promise<Blog> => {
  const res = await client.get(`/api/blogs/${id}`);
  return res.data;
};

export const fetchBlogsApi = async (): Promise<Blog[]> => {
  try {
    const res = await client.get("/api/blogs");
    return res.data;
  } catch (error) {
    handleApiError("fetchBlogsApi", error);
  }
};

export const adminAddBlogApi = async (blogData: Partial<Blog>): Promise<void> => {
  try {
    await client.post("/api/blogs/manage", blogData);
  } catch (error) {
    handleApiError("adminAddBlogApi", error);
  }
};

export const adminEditBlogApi = async (blogId: string, blogData: Partial<Blog>): Promise<void> => {
  try {
    await client.put(`/api/blogs/manage/${blogId}`, blogData);
  } catch (error) {
    handleApiError("adminEditBlogApi", error);
  }
};

export const adminDeleteBlogApi = async (blogId: string): Promise<void> => {
  try {
    await client.delete(`/api/blogs/manage/${blogId}`);
  } catch (error) {
    handleApiError("adminDeleteBlogApi", error);
  }
};

export const fetchBlogCategoriesApi = async (): Promise<{ _id: string; name: string }[]> => {
  const res = await client.get("/api/blogs/categories");
  return res.data;
};

export const addBlogCategoryApi = async (name: string): Promise<{ _id: string; name: string }> => {
  const res = await client.post("/api/blogs/categories", { name });
  return res.data;
};

export const deleteBlogCategoryApi = async (id: string): Promise<void> => {
  await client.delete(`/api/blogs/categories/${id}`);
};
