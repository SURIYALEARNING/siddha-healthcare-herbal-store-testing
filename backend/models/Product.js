import mongoose from "mongoose";
import translationSchema from "./translationSchema.js";

const productSchema = new mongoose.Schema({
  name: { type: translationSchema, required: true },
  productMotto: { type: translationSchema, default: { en: "", ta: "" } },
  shortDescription: { type: translationSchema, default: { en: "", ta: "" } },
  description: { type: translationSchema, default: { en: "", ta: "" } },
  expiryDuration: { type: translationSchema, default: { en: "", ta: "" } },
  category: {
    type: mongoose.Schema.Types.Mixed,
    ref: "Category",
    required: true,
  },
  price: { type: Number, required: true },
  discountPrice: { type: Number },
  size: {
    value: { type: Number, default: 0 },
    unit: {
      type: String,
      enum: ["mg", "g", "kg", "ml", "L", "capsule", "tablet", "pcs"],
      default: "ml",
    },
  },
  ingredients: [{ type: translationSchema, default: { en: "", ta: "" } }],
  benefits: [{ type: translationSchema, default: { en: "", ta: "" } }],
  usageInstructions: [{ type: translationSchema, default: { en: "", ta: "" } }],
  safetyInstructions: [{ type: translationSchema, default: { en: "", ta: "" } }],
  storageInstructions: [{ type: translationSchema, default: { en: "", ta: "" } }],
  tags: [{ type: translationSchema, default: { en: "", ta: "" } }],
  images: [{ type: String }],
  media: [{
    type: { type: String, enum: ["image", "video"], required: true },
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    format: { type: String },
    bytes: { type: Number },
    duration: { type: Number },
    createdAt: { type: Date, default: Date.now },
  }],
  reviewStats: {
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    rating1: { type: Number, default: 0 },
    rating2: { type: Number, default: 0 },
    rating3: { type: Number, default: 0 },
    rating4: { type: Number, default: 0 },
    rating5: { type: Number, default: 0 },
  },
  averageRating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  visibility: {
    type: String,
    enum: ["PUBLIC", "UNLISTED"],
    default: "PUBLIC",
  },
  enableReminder: { type: Boolean, default: true },
  reminderDays: { type: Number, default: 0, min: 0 },
}, { timestamps: true });

productSchema.index({ "name.en": 1 });
productSchema.index({ "name.ta": 1 });
productSchema.index({ category: 1 });
productSchema.index({ isActive: 1, isFeatured: 1 });
productSchema.index({ price: 1 });
productSchema.index({ discountPrice: 1 });

const Product = mongoose.model("Product", productSchema);
export default Product;
