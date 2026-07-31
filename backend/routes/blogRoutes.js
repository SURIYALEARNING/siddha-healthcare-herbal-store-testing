import express from 'express';
import { getBlogs, getBlogById, addBlog, updateBlog, deleteBlog, incrementBlogReads, getBlogCategories, addBlogCategory, deleteBlogCategory } from '../controllers/blogController.js';
import { verifyAdmin } from '../Auth/authMiddleware.js';

const router = express.Router();

router.get("/categories", getBlogCategories);
router.post("/categories", verifyAdmin, addBlogCategory);
router.delete("/categories/:id", verifyAdmin, deleteBlogCategory);

router.post("/manage", verifyAdmin, addBlog);
router.put("/manage/:id", verifyAdmin, updateBlog);
router.delete("/manage/:id", verifyAdmin, deleteBlog);
router.post("/:id/increment-reads", incrementBlogReads);

router.get("/", getBlogs);
router.get("/:id", getBlogById);

export default router;
