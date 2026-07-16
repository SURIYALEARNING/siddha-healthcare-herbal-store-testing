import express from 'express';
import { getBlogs, addBlog, updateBlog, deleteBlog, incrementBlogReads } from '../controllers/blogController.js';

const router = express.Router();

router.get("/", getBlogs);
router.post("/manage", addBlog);
router.put("/manage/:id", updateBlog);
router.delete("/manage/:id", deleteBlog);
router.post("/:id/increment-reads", incrementBlogReads);

export default router;
