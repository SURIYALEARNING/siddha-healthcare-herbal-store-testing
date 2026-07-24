import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  discountPrice: { type: Number },
  stock: { type: Number, default: 0 },
  category: { type: String, required: true },
  description: { type: String },
  ingredients: [{ type: String }],
  benefits: [{ type: String }],
  usageInstructions: [{ type: String }],
  images: [{ type: String }],
  reviewStats: {
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    rating1: { type: Number, default: 0 },
    rating2: { type: Number, default: 0 },
    rating3: { type: Number, default: 0 },
    rating4: { type: Number, default: 0 },
    rating5: { type: Number, default: 0 },
  },
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);
export default Product;
