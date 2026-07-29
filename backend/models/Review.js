import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    index: true,
  },
  userName: { type: String, required: true },
  userAvatar: { type: String, default: "" },

  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, default: "" },
  comment: { type: String, required: true },

  images: [{ type: String }],

  isVerifiedPurchase: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: false },

  adminReply: {
    message: { type: String, default: "" },
    repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    repliedAt: { type: Date },
  },

  helpfulCount: { type: Number, default: 0 },
  helpfulBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });

reviewSchema.index({ productId: 1, createdAt: -1 });
reviewSchema.index({ productId: 1, isApproved: 1, createdAt: -1 });
reviewSchema.index({ productId: 1, rating: -1, createdAt: -1 });
reviewSchema.index({ userId: 1, createdAt: -1 });
reviewSchema.index({ isApproved: 1, createdAt: -1 });

const Review = mongoose.model("Review", reviewSchema);
export default Review;
