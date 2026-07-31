import { describe, it, expect, vi, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import * as reviewController from '../../../controllers/reviewController.js';
import {
  createTestProduct,
  createTestUser,
  createTestReview,
  createTestAdmin,
} from '../../helpers/factories';

function mockReq(overrides: any = {}) {
  return {
    params: {},
    body: {},
    query: {},
    user: null,
    ...overrides,
  };
}

function mockRes() {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('reviewController', () => {
  let product: any;
  let user: any;
  let admin: any;

  beforeEach(async () => {
    product = await createTestProduct();
    user = await createTestUser();
    admin = await createTestAdmin();
  });

  describe('addReview', () => {
    it('should return 400 if rating is missing', async () => {
      const req = mockReq({
        params: { id: product._id.toString() },
        body: { comment: 'Nice' },
        user: { id: user._id },
      });
      const res = mockRes();

      await reviewController.addReview(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Rating and comment are required.' });
    });

    it('should return 400 if comment is missing', async () => {
      const req = mockReq({
        params: { id: product._id.toString() },
        body: { rating: 5 },
        user: { id: user._id },
      });
      const res = mockRes();

      await reviewController.addReview(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Rating and comment are required.' });
    });

    it('should return 400 if rating is out of range', async () => {
      const req = mockReq({
        params: { id: product._id.toString() },
        body: { rating: 6, comment: 'Nice' },
        user: { id: user._id },
      });
      const res = mockRes();

      await reviewController.addReview(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Rating must be between 1 and 5.' });
    });

    it('should return 400 if rating is less than 1', async () => {
      const req = mockReq({
        params: { id: product._id.toString() },
        body: { rating: 0, comment: 'Nice' },
        user: { id: user._id },
      });
      const res = mockRes();

      await reviewController.addReview(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 404 if product not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const req = mockReq({
        params: { id: fakeId },
        body: { rating: 4, comment: 'Nice' },
        user: { id: user._id },
      });
      const res = mockRes();

      await reviewController.addReview(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Product not found.' });
    });

    it('should create a review and return 201', async () => {
      const req = mockReq({
        params: { id: product._id.toString() },
        body: { rating: 5, title: 'Great!', comment: 'Loved it', images: ['img.jpg'] },
        user: { id: user._id, fullName: 'Test User', avatar: 'avatar.jpg' },
      });
      const res = mockRes();

      await reviewController.addReview(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Review submitted successfully! Awaiting approval.',
          review: expect.objectContaining({
            rating: 5,
            comment: 'Loved it',
            userName: 'Test User',
          }),
          reviewStats: expect.any(Object),
        }),
      );
    });

    it('should use Guest Buyer when user name is not available', async () => {
      const req = mockReq({
        params: { id: product._id.toString() },
        body: { rating: 3, comment: 'Ok' },
        user: { id: user._id },
      });
      const res = mockRes();

      await reviewController.addReview(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          review: expect.objectContaining({ userName: 'Guest Buyer' }),
        }),
      );
    });

    it('should handle server error gracefully', async () => {
      const originalFindById = mongoose.Model.findById;
      vi.spyOn(mongoose.Model, 'findById').mockRejectedValueOnce(new Error('DB error'));

      const req = mockReq({
        params: { id: product._id.toString() },
        body: { rating: 4, comment: 'Nice' },
        user: { id: user._id },
      });
      const res = mockRes();

      await reviewController.addReview(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Failed to add review.' }),
      );
    });
  });

  describe('updateReview', () => {
    it('should update a review and return 200', async () => {
      const review = await createTestReview({ userId: user._id, productId: product._id });
      const req = mockReq({
        params: { reviewId: review._id.toString() },
        body: { rating: 3, comment: 'Updated comment' },
        user: { id: user._id },
      });
      const res = mockRes();

      await reviewController.updateReview(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Review updated successfully.',
          review: expect.objectContaining({ rating: 3, comment: 'Updated comment' }),
        }),
      );
    });

    it('should return 404 if review not found or unauthorized', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const req = mockReq({
        params: { reviewId: fakeId },
        body: { rating: 4 },
        user: { id: user._id },
      });
      const res = mockRes();

      await reviewController.updateReview(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Review not found or unauthorized.' });
    });

    it('should return 404 when updating another user review', async () => {
      const otherUser = await createTestUser({ email: 'other@test.com' });
      const review = await createTestReview({ userId: otherUser._id, productId: product._id });
      const req = mockReq({
        params: { reviewId: review._id.toString() },
        body: { rating: 2 },
        user: { id: user._id },
      });
      const res = mockRes();

      await reviewController.updateReview(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should handle server error', async () => {
      const req = mockReq({
        params: { reviewId: 'invalid' },
        body: { rating: 3 },
        user: { id: user._id },
      });
      const res = mockRes();

      await reviewController.updateReview(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('deleteReview', () => {
    it('should delete a review and return 200', async () => {
      const review = await createTestReview({ userId: user._id, productId: product._id });
      const req = mockReq({
        params: { reviewId: review._id.toString() },
        user: { id: user._id },
      });
      const res = mockRes();

      await reviewController.deleteReview(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Review deleted successfully.' });
    });

    it('should return 404 if review not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const req = mockReq({
        params: { reviewId: fakeId },
        user: { id: user._id },
      });
      const res = mockRes();

      await reviewController.deleteReview(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should handle server error', async () => {
      const req = mockReq({
        params: { reviewId: 'invalid' },
        user: { id: user._id },
      });
      const res = mockRes();

      await reviewController.deleteReview(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getProductReviews', () => {
    it('should return paginated reviews', async () => {
      await createTestReview({ productId: product._id, userId: user._id, isApproved: true });
      await createTestReview({ productId: product._id, userId: user._id, isApproved: true, rating: 3 });

      const req = mockReq({
        params: { id: product._id.toString() },
        query: { page: '1', limit: '10', sort: 'newest' },
      });
      const res = mockRes();

      await reviewController.getProductReviews(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          reviews: expect.any(Array),
          total: expect.any(Number),
          page: expect.any(Number),
          totalPages: expect.any(Number),
        }),
      );
    });

    it('should filter by rating', async () => {
      await createTestReview({ productId: product._id, userId: user._id, isApproved: true, rating: 5 });
      await createTestReview({ productId: product._id, userId: user._id, isApproved: true, rating: 3 });

      const req = mockReq({
        params: { id: product._id.toString() },
        query: { rating: '5' },
      });
      const res = mockRes();

      await reviewController.getProductReviews(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const data = res.json.mock.calls[0][0];
      expect(data.reviews.every((r: any) => r.rating === 5)).toBe(true);
    });

    it('should return empty reviews when none exist', async () => {
      const req = mockReq({
        params: { id: product._id.toString() },
        query: {},
      });
      const res = mockRes();

      await reviewController.getProductReviews(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ reviews: [], total: 0, totalPages: 0 }),
      );
    });

    it('should handle server error', async () => {
      const req = mockReq({
        params: { id: 'invalid' },
        query: {},
      });
      const res = mockRes();

      await reviewController.getProductReviews(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getReviewStats', () => {
    it('should return review stats for a product', async () => {
      await createTestReview({ productId: product._id, userId: user._id, isApproved: true, rating: 5 });

      const req = mockReq({ params: { id: product._id.toString() } });
      const res = mockRes();

      await reviewController.getReviewStats(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          averageRating: expect.any(Number),
          totalReviews: expect.any(Number),
        }),
      );
    });

    it('should return 404 if product not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const req = mockReq({ params: { id: fakeId } });
      const res = mockRes();

      await reviewController.getReviewStats(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Product not found.' });
    });

    it('should handle server error', async () => {
      const req = mockReq({ params: { id: 'invalid' } });
      const res = mockRes();

      await reviewController.getReviewStats(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('approveReview', () => {
    it('should approve a review and return 200', async () => {
      const review = await createTestReview({ productId: product._id, userId: user._id, isApproved: false });

      const req = mockReq({ params: { reviewId: review._id.toString() } });
      const res = mockRes();

      await reviewController.approveReview(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Review approved successfully.',
          review: expect.objectContaining({ isApproved: true }),
        }),
      );
    });

    it('should return 404 if review not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const req = mockReq({ params: { reviewId: fakeId } });
      const res = mockRes();

      await reviewController.approveReview(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should handle server error', async () => {
      const req = mockReq({ params: { reviewId: 'invalid' } });
      const res = mockRes();

      await reviewController.approveReview(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('rejectReview', () => {
    it('should reject a review and return 200', async () => {
      const review = await createTestReview({ productId: product._id, userId: user._id, isApproved: true });

      const req = mockReq({ params: { reviewId: review._id.toString() } });
      const res = mockRes();

      await reviewController.rejectReview(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Review rejected.',
          review: expect.objectContaining({ isApproved: false }),
        }),
      );
    });

    it('should return 404 if review not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const req = mockReq({ params: { reviewId: fakeId } });
      const res = mockRes();

      await reviewController.rejectReview(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should handle server error', async () => {
      const req = mockReq({ params: { reviewId: 'invalid' } });
      const res = mockRes();

      await reviewController.rejectReview(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('markHelpful', () => {
    it('should return 401 if user is not authenticated', async () => {
      const review = await createTestReview({ productId: product._id, userId: user._id });

      const req = mockReq({ params: { reviewId: review._id.toString() }, user: null });
      const res = mockRes();

      await reviewController.markHelpful(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Authentication required.' });
    });

    it('should mark a review as helpful and return count', async () => {
      const review = await createTestReview({ productId: product._id, userId: user._id });

      const req = mockReq({
        params: { reviewId: review._id.toString() },
        user: { id: new mongoose.Types.ObjectId().toString() },
      });
      const res = mockRes();

      await reviewController.markHelpful(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Marked as helpful.',
          helpfulCount: 1,
        }),
      );
    });

    it('should be idempotent when already voted', async () => {
      const voterId = new mongoose.Types.ObjectId();
      const review = await createTestReview({
        productId: product._id,
        userId: user._id,
        helpfulBy: [voterId],
        helpfulCount: 1,
      });

      const req = mockReq({
        params: { reviewId: review._id.toString() },
        user: { id: voterId.toString() },
      });
      const res = mockRes();

      await reviewController.markHelpful(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Already marked as helpful.',
        }),
      );
    });

    it('should return 404 if review not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const req = mockReq({
        params: { reviewId: fakeId },
        user: { id: user._id.toString() },
      });
      const res = mockRes();

      await reviewController.markHelpful(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('replyToReview', () => {
    it('should return 400 if message is missing', async () => {
      const review = await createTestReview({ productId: product._id, userId: user._id });

      const req = mockReq({
        params: { reviewId: review._id.toString() },
        body: {},
        user: { id: admin._id },
      });
      const res = mockRes();

      await reviewController.replyToReview(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Reply message is required.' });
    });

    it('should return 400 for empty message', async () => {
      const review = await createTestReview({ productId: product._id, userId: user._id });

      const req = mockReq({
        params: { reviewId: review._id.toString() },
        body: { message: '   ' },
        user: { id: admin._id },
      });
      const res = mockRes();

      await reviewController.replyToReview(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should add a reply to a review and return 200', async () => {
      const review = await createTestReview({ productId: product._id, userId: user._id });

      const req = mockReq({
        params: { reviewId: review._id.toString() },
        body: { message: 'Thank you for your feedback!' },
        user: { id: admin._id },
      });
      const res = mockRes();

      await reviewController.replyToReview(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Reply added successfully.',
          review: expect.objectContaining({
            adminReply: expect.objectContaining({
              message: 'Thank you for your feedback!',
            }),
          }),
        }),
      );
    });

    it('should return 404 if review not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const req = mockReq({
        params: { reviewId: fakeId },
        body: { message: 'Reply' },
        user: { id: admin._id },
      });
      const res = mockRes();

      await reviewController.replyToReview(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should handle server error', async () => {
      const req = mockReq({
        params: { reviewId: 'invalid' },
        body: { message: 'Reply' },
        user: { id: admin._id },
      });
      const res = mockRes();

      await reviewController.replyToReview(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getAdminReviews', () => {
    it('should return all reviews with pagination for admin', async () => {
      await createTestReview({ productId: product._id, userId: user._id, isApproved: true });
      await createTestReview({ productId: product._id, userId: user._id, isApproved: false });

      const req = mockReq({ query: {} });
      const res = mockRes();

      await reviewController.getAdminReviews(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          reviews: expect.any(Array),
          total: expect.any(Number),
        }),
      );
    });

    it('should handle server error', async () => {
      vi.spyOn(mongoose.Model, 'find').mockImplementationOnce(() => {
        throw new Error('DB error');
      });

      const req = mockReq({ query: {} });
      const res = mockRes();

      await reviewController.getAdminReviews(req, res);

      expect(res.status).toHaveBeenCalledWith(500);

      vi.restoreAllMocks();
    });
  });

  describe('getReviewUsers', () => {
    it('should return aggregated review users', async () => {
      await createTestReview({ productId: product._id, userId: user._id });

      const req = mockReq();
      const res = mockRes();

      await reviewController.getReviewUsers(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            userId: expect.any(mongoose.Types.ObjectId),
            userName: expect.any(String),
          }),
        ]),
      );
    });

    it('should handle server error', async () => {
      vi.spyOn(mongoose.Model, 'aggregate').mockRejectedValueOnce(new Error('DB error'));

      const req = mockReq();
      const res = mockRes();

      await reviewController.getReviewUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);

      vi.restoreAllMocks();
    });
  });

  describe('getReviewsByUser', () => {
    it('should return reviews for a specific user', async () => {
      await createTestReview({ productId: product._id, userId: user._id, isApproved: true });

      const req = mockReq({ params: { userId: user._id.toString() } });
      const res = mockRes();

      await reviewController.getReviewsByUser(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ userId: user._id }),
        ]),
      );
    });

    it('should return empty array if user has no reviews', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const req = mockReq({ params: { userId: fakeId } });
      const res = mockRes();

      await reviewController.getReviewsByUser(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should handle server error', async () => {
      const req = mockReq({ params: { userId: 'invalid' } });
      const res = mockRes();

      await reviewController.getReviewsByUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getLatestReviewsAll', () => {
    it('should return latest approved reviews', async () => {
      await createTestReview({ productId: product._id, userId: user._id, isApproved: true });
      await createTestReview({ productId: product._id, userId: user._id, isApproved: true });

      const req = mockReq({ query: {} });
      const res = mockRes();

      await reviewController.getLatestReviewsAll(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.any(Array));
    });

    it('should respect limit query parameter', async () => {
      for (let i = 0; i < 3; i++) {
        await createTestReview({ productId: product._id, userId: user._id, isApproved: true });
      }

      const req = mockReq({ query: { limit: '1' } });
      const res = mockRes();

      await reviewController.getLatestReviewsAll(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.any(Array));
      expect(res.json.mock.calls[0][0].length).toBeLessThanOrEqual(1);
    });

    it('should handle server error', async () => {
      vi.spyOn(mongoose.Query.prototype, 'limit').mockRejectedValueOnce(new Error('DB error'));

      const req = mockReq({ query: { limit: '10' } });
      const res = mockRes();

      await reviewController.getLatestReviewsAll(req, res);

      expect(res.status).toHaveBeenCalledWith(500);

      vi.restoreAllMocks();
    });
  });
});
