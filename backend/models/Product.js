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
  rating: { type: Number, default: 0 },
  reviews: [
    {
      id: { type: String },
      user: { type: String },
      rating: { type: Number },
      comment: { type: String },
      date: { type: String }
    }
  ]
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);
export default Product;