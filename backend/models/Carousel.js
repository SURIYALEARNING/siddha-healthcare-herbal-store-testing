import mongoose from "mongoose";

const carouselSchema = new mongoose.Schema({
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Carousel = mongoose.model("Carousel", carouselSchema);
export default Carousel;
