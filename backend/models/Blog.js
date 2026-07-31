import mongoose from "mongoose";
import translationSchema from "./translationSchema.js";

const blogSchema = new mongoose.Schema({
  title: { type: translationSchema, required: true },
  content: { type: translationSchema, required: true },
  category: { type: String, required: true },
  author: { type: String, default: "Dr. S. Thirugnanasambandar, B.S.M.S" },
  image: { type: String },
  images: [{ type: String }],
  reads: { type: Number, default: 0 },
}, { timestamps: true });

const Blog = mongoose.model("Blog", blogSchema);

const blogCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
}, { timestamps: true });

export const BlogCategory = mongoose.model("BlogCategory", blogCategorySchema);
export default Blog;
