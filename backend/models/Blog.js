import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, required: true },
  author: { type: String, default: "Dr. S. Thirugnanasambandar, B.S.M.S" },
  image: { type: String },
  reads: { type: Number, default: 0 },
}, { timestamps: true });

const Blog = mongoose.model("Blog", blogSchema);
export default Blog;
