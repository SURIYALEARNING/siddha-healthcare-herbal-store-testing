import mongoose from "mongoose";
import translationSchema from "./translationSchema.js";

const sizeSchema = new mongoose.Schema(
  {
    value: { type: Number },
    unit: {
      type: String,
      enum: ["mg", "g", "kg", "ml", "L", "capsule", "tablet", "pcs"],
      default: "pcs",
    },
  },
  { _id: false }
);

const productV2Schema = new mongoose.Schema(
  {
    name: { type: translationSchema, required: true },
    slug: { type: translationSchema, required: true },
    productMotto: { type: translationSchema, default: { en: "", ta: "" } },
    shortDescription: { type: translationSchema, default: { en: "", ta: "" } },
    description: { type: translationSchema, default: { en: "", ta: "" } },
    expiryDuration: { type: translationSchema, default: { en: "", ta: "" } },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, default: 0, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    size: { type: sizeSchema, default: { value: 100, unit: "ml" } },
    ingredients: [{ type: translationSchema }],
    benefits: [{ type: translationSchema }],
    usageInstructions: [{ type: translationSchema }],
    safetyInstructions: [{ type: translationSchema }],
    storageInstructions: [{ type: translationSchema }],
    tags: [{ type: translationSchema }],
    images: [{ type: String }],
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productV2Schema.index({ "slug.en": 1 }, { unique: true });
productV2Schema.index({ category: 1 });
productV2Schema.index({ isActive: 1, isFeatured: 1 });
productV2Schema.index({ price: 1 });

const ProductV2 = mongoose.model("ProductV2", productV2Schema);

export default ProductV2;
