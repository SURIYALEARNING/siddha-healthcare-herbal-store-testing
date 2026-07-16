import express from 'express';
import { getBlogs, addBlog, updateBlog, deleteBlog, incrementBlogReads } from '../controllers/blogController.js';
import { verifyAdmin } from '../Auth/authMiddleware.js';

const router = express.Router();

router.get("/", getBlogs);
router.post("/manage", verifyAdmin, addBlog);
router.put("/manage/:id", verifyAdmin, updateBlog);
router.delete("/manage/:id", verifyAdmin, deleteBlog);
router.post("/:id/increment-reads", incrementBlogReads);

export default router;
