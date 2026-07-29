import express from "express";
import { verifyToken, verifyAdmin } from "../Auth/authMiddleware.js";
import {
  addReview,
  updateReview,
  deleteReview,
  getProductReviews,
  getReviewStats,
  approveReview,
  rejectReview,
  replyToReview,
  markHelpful,
  getLatestReviewsAll,
  getAdminReviews,
  getReviewUsers,
  getReviewsByUser,
} from "../controllers/reviewController.js";

const router = express.Router();

// Global
router.get("/reviews/latest", getLatestReviewsAll);

// Product reviews (public)
router.get("/products/:id/reviews/stats", getReviewStats);
router.get("/products/:id/reviews", getProductReviews);

// Product reviews (authenticated)
router.post("/products/:id/reviews", verifyToken, addReview);
router.put("/products/:id/reviews/:reviewId", verifyToken, updateReview);
router.delete("/products/:id/reviews/:reviewId", verifyToken, deleteReview);
router.patch("/products/:id/reviews/:reviewId/helpful", verifyToken, markHelpful);

// Product reviews (admin)
router.patch("/products/:id/reviews/:reviewId/approve", verifyAdmin, approveReview);

// Admin review management
router.get("/admin/reviews", verifyAdmin, getAdminReviews);
router.get("/admin/reviews/users", verifyAdmin, getReviewUsers);
router.get("/admin/reviews/user/:userId", verifyAdmin, getReviewsByUser);
router.patch("/admin/reviews/:reviewId/approve", verifyAdmin, approveReview);
router.patch("/admin/reviews/:reviewId/reject", verifyAdmin, rejectReview);
router.patch("/admin/reviews/:reviewId/reply", verifyAdmin, replyToReview);

export default router;
