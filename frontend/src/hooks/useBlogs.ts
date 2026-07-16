import { useState, useCallback } from "react";
import { Blog } from "../types";
import { fetchBlogsApi, adminAddBlogApi, adminEditBlogApi, adminDeleteBlogApi } from "../api";

export function useBlogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);

  const fetchBlogs = useCallback(async () => {
    try {
      const data = await fetchBlogsApi();
      setBlogs(data);
    } catch (e) {
      console.error("Failed to load blogs:", e);
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

  return { blogs, setBlogs, fetchBlogs, adminAddBlog, adminEditBlog, adminDeleteBlog };
}
