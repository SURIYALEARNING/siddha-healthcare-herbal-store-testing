import mongoose from "mongoose";
import translationSchema from "./translationSchema.js";

const categorySchema = new mongoose.Schema(
  {
    name: { type: translationSchema, required: true },
    slug: { type: translationSchema, required: true },
    description: { type: translationSchema, default: { en: "", ta: "" } },
    image: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

categorySchema.index({ "slug.en": 1 }, { unique: true });
categorySchema.index({ isActive: 1 });

const Category = mongoose.model("Category", categorySchema);

export default Category;
