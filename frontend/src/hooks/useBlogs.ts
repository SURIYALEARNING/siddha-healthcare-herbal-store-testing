import { useState, useCallback } from "react";
import { Blog } from "../types";
import {
  fetchBlogsApi, adminAddBlogApi, adminEditBlogApi, adminDeleteBlogApi,
  fetchBlogCategoriesApi, addBlogCategoryApi, deleteBlogCategoryApi,
} from "../api";

export function useBlogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [blogCategories, setBlogCategories] = useState<{ _id: string; name: string }[]>([]);

  const fetchBlogs = useCallback(async () => {
    try {
      const data = await fetchBlogsApi();
      setBlogs(data);
    } catch (e) {
      console.error("Failed to load blogs:", e);
    }
  }, []);

  const fetchBlogCategories = useCallback(async () => {
    try {
      const data = await fetchBlogCategoriesApi();
      setBlogCategories(data);
    } catch (e) {
      console.error("Failed to load blog categories:", e);
    }
  }, []);

  const adminAddBlog = useCallback(async (blogData: Partial<Blog>) => {
    try {
      await adminAddBlogApi(blogData);
      await fetchBlogs();
      return true;
    } catch {
      return false;
    }
  }, [fetchBlogs]);

  const adminEditBlog = useCallback(async (blogId: string, blogData: Partial<Blog>) => {
    try {
      await adminEditBlogApi(blogId, blogData);
      await fetchBlogs();
      return true;
    } catch {
      return false;
    }
  }, [fetchBlogs]);

  const adminDeleteBlog = useCallback(async (blogId: string) => {
    try {
      await adminDeleteBlogApi(blogId);
      await fetchBlogs();
      return true;
    } catch {
      return false;
    }
  }, [fetchBlogs]);

  const adminAddBlogCategory = useCallback(async (name: string) => {
    try {
      const cat = await addBlogCategoryApi(name);
      await fetchBlogCategories();
      return cat;
    } catch {
      return null;
    }
  }, [fetchBlogCategories]);

  const adminDeleteBlogCategory = useCallback(async (id: string) => {
    try {
      await deleteBlogCategoryApi(id);
      await fetchBlogCategories();
      return true;
    } catch {
      return false;
    }
  }, [fetchBlogCategories]);

  return {
    blogs, setBlogs, fetchBlogs,
    adminAddBlog, adminEditBlog, adminDeleteBlog,
    blogCategories, fetchBlogCategories,
    adminAddBlogCategory, adminDeleteBlogCategory,
  };
}
