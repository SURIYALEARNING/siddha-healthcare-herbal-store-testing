import Product from "../models/Product.js";
import * as reviewService from "../services/reviewService.js";

export async function addReview(req, res) {
  try {
    const { rating, title, comment, images } = req.body;
    const { id: productId } = req.params;

    if (!rating || !comment) {
      return res.status(400).json({ error: "Rating and comment are required." });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5." });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }

    const userName = req.user?.fullName || req.user?.name || "Guest Buyer";
    const userId = req.user?.id || req.user?._id;
    const userAvatar = req.user?.avatar || "";

    const isVerifiedPurchase = false;

    const review = await reviewService.createReview({
      productId,
      userId,
      userName,
      userAvatar,
      rating: Number(rating),
      title: title || "",
      comment,
      images: images || [],
      isVerifiedPurchase,
    });

    const stats = await reviewService.getProductReviewStats(productId);

    res.status(201).json({
      message: "Review submitted successfully! Awaiting approval.",
      review,
      reviewStats: stats,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to add review.", details: error.message });
  }
}

export async function updateReview(req, res) {
  try {
    const { reviewId } = req.params;
    const userId = req.user?.id || req.user?._id;

    const review = await reviewService.updateReview(reviewId, userId, req.body);
    if (!review) {
      return res.status(404).json({ error: "Review not found or unauthorized." });
    }

    const stats = await reviewService.getProductReviewStats(review.productId);

    res.status(200).json({ message: "Review updated successfully.", review, reviewStats: stats });
  } catch (error) {
    res.status(500).json({ error: "Failed to update review.", details: error.message });
  }
}

export async function deleteReview(req, res) {
  try {
    const { reviewId } = req.params;
    const userId = req.user?.id || req.user?._id;

    const result = await reviewService.deleteReview(reviewId, userId);
    if (!result) {
      return res.status(404).json({ error: "Review not found or unauthorized." });
    }

    res.status(200).json({ message: "Review deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete review.", details: error.message });
  }
}

export async function getProductReviews(req, res) {
  try {
    const { id: productId } = req.params;
    const { page = 1, limit = 10, rating, sort = "newest" } = req.query;

    const result = await reviewService.getProductReviews(productId, {
      page: Number(page),
      limit: Number(limit),
      rating: rating || undefined,
      sort,
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch reviews.", details: error.message });
  }
}

export async function getReviewStats(req, res) {
  try {
    const { id: productId } = req.params;
    const stats = await reviewService.getProductReviewStats(productId);

    if (!stats) {
      return res.status(404).json({ error: "Product not found." });
    }

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch review stats.", details: error.message });
  }
}

export async function approveReview(req, res) {
  try {
    const { reviewId } = req.params;

    const review = await reviewService.approveReview(reviewId);
    if (!review) {
      return res.status(404).json({ error: "Review not found." });
    }

    res.status(200).json({ message: "Review approved successfully.", review });
  } catch (error) {
    res.status(500).json({ error: "Failed to approve review.", details: error.message });
  }
}

export async function markHelpful(req, res) {
  try {
    const { reviewId } = req.params;
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required." });
    }

    const result = await reviewService.markHelpful(reviewId, userId);
    if (!result) {
      return res.status(404).json({ error: "Review not found." });
    }

    if (result.alreadyVoted) {
      return res.status(200).json({ message: "Already marked as helpful.", helpfulCount: result.helpfulCount });
    }

    res.status(200).json({ message: "Marked as helpful.", helpfulCount: result.helpfulCount });
  } catch (error) {
    res.status(500).json({ error: "Failed to mark helpful.", details: error.message });
  }
}

export async function getAdminReviews(req, res) {
  try {
    const { status, productId, userId, sort, page, limit } = req.query;
    const result = await reviewService.getAllReviews({ status, productId, userId, sort, page, limit });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch reviews.", details: error.message });
  }
}

export async function getReviewUsers(req, res) {
  try {
    const users = await reviewService.getReviewUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch review users.", details: error.message });
  }
}

export async function getReviewsByUser(req, res) {
  try {
    const { userId } = req.params;
    const reviews = await reviewService.getReviewsByUser(userId);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user reviews.", details: error.message });
  }
}

export async function rejectReview(req, res) {
  try {
    const { reviewId } = req.params;
    const review = await reviewService.rejectReview(reviewId);
    if (!review) return res.status(404).json({ error: "Review not found." });

    res.status(200).json({ message: "Review rejected.", review });
  } catch (error) {
    res.status(500).json({ error: "Failed to reject review.", details: error.message });
  }
}

export async function replyToReview(req, res) {
  try {
    const { reviewId } = req.params;
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Reply message is required." });
    }

    const adminId = req.user?.id || req.user?._id;
    const review = await reviewService.replyToReview(reviewId, adminId, message.trim());
    if (!review) return res.status(404).json({ error: "Review not found." });

    res.status(200).json({ message: "Reply added successfully.", review });
  } catch (error) {
    res.status(500).json({ error: "Failed to reply to review.", details: error.message });
  }
}

export async function getLatestReviewsAll(req, res) {
  try {
    const { limit = 10 } = req.query;
    const reviews = await reviewService.getLatestReviewsAll(Number(limit));
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch latest reviews.", details: error.message });
  }
}
