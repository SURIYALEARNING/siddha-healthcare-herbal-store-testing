import mongoose from "mongoose";

const carouselSchema = new mongoose.Schema({
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  }],
  socialProducts: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    social: { type: String, enum: ["instagram", "youtube", "facebook", "tiktok"], default: "instagram" },
    url: { type: String, default: "" },
  }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Carousel = mongoose.model("Carousel", carouselSchema);
export default Carousel;
