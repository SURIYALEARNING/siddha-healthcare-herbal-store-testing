import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import mongoose from 'mongoose';

vi.mock('../../../services/reviewService.js', () => ({
  getProductsWithLatestReviews: vi.fn(),
  getLatestReviews: vi.fn(),
  getProductReviewStats: vi.fn(),
}));

vi.mock('../../../services/stockService.js', () => ({
  getProductStock: vi.fn(),
  getProductsStock: vi.fn(),
}));

vi.mock('../../../services/uploadService.js', () => ({
  uploadMedia: vi.fn(),
  deleteMedia: vi.fn(() => Promise.resolve()),
}));

import Product from '../../../models/Product.js';
import Category from '../../../models/Category.js';
import Coupon from '../../../models/Coupon.js';
import Cart from '../../../models/Cart.js';
import {  getProductsWithLatestReviews, getLatestReviews } from '../../../services/reviewService.js';
import { deleteMedia } from '../../../services/uploadService.js';
import { getProductStock, getProductsStock } from '../../../services/stockService.js';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../../../controllers/productController.js';
import {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../../controllers/categoryController.js';
import {
  getCoupons,
  applyCoupon,
  manageCoupon,
} from '../../../controllers/couponController.js';
import { createTestProduct, createTestCategory, createTestCoupon, createTestUser, generateToken, createAuthHeader } from '../../helpers/factories';

function mockReq(overrides: Record<string, any> = {}): Request {
  return {
    params: {},
    query: {},
    body: {},
    user: { id: new mongoose.Types.ObjectId().toString(), isAdmin: false, role: 'USER' },
    ...overrides,
  } as any;
}

function mockRes(): Response {
  const res: Record<string, any> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.send = vi.fn().mockReturnValue(res);
  return res as any;
}

const mockGetProductsWithLatestReviews = vi.mocked(getProductsWithLatestReviews);
const mockGetLatestReviews = vi.mocked(getLatestReviews);
const mockGetProductStock = vi.mocked(getProductStock);
const mockGetProductsStock = vi.mocked(getProductsStock);
const mockDeleteMedia = vi.mocked(deleteMedia);

// ---------------------------------------------------------------------------
// Product Controller
// ---------------------------------------------------------------------------
describe('Product Controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllProducts', () => {
    it('returns paginated products with stock info', async () => {
      const req = mockReq({ query: { page: '1', limit: '10' } });
      const res = mockRes();

      const products = [
        { _id: new mongoose.Types.ObjectId(), name: { en: 'Product A' }, price: 100 },
        { _id: new mongoose.Types.ObjectId(), name: { en: 'Product B' }, price: 200 },
      ];
      const paginatedResult = { products, total: 2, page: 1, totalPages: 1 };

      mockGetProductsWithLatestReviews.mockResolvedValue(paginatedResult as any);
      mockGetProductsStock.mockResolvedValue({ [products[0]._id.toString()]: 10, [products[1]._id.toString()]: 5 });

      await getAllProducts(req, res);

      expect(mockGetProductsWithLatestReviews).toHaveBeenCalledWith({
        page: 1, limit: 10, category: undefined, search: undefined, sort: undefined, scope: undefined,
      });
      expect(products[0]).toHaveProperty('stock', 10);
      expect(products[1]).toHaveProperty('stock', 5);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(paginatedResult);
    });

    it('filters by category', async () => {
      const catId = new mongoose.Types.ObjectId().toString();
      const req = mockReq({ query: { page: '1', limit: '50', category: catId } });
      const res = mockRes();

      const products = [{ _id: new mongoose.Types.ObjectId(), name: { en: 'Cat Product' }, price: 300 }];
      const paginatedResult = { products, total: 1, page: 1, totalPages: 1 };

      mockGetProductsWithLatestReviews.mockResolvedValue(paginatedResult as any);
      mockGetProductsStock.mockResolvedValue({ [products[0]._id.toString()]: 20 });

      await getAllProducts(req, res);

      expect(mockGetProductsWithLatestReviews).toHaveBeenCalledWith(
        expect.objectContaining({ category: catId })
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('searches by name', async () => {
      const req = mockReq({ query: { search: 'aloe' } });
      const res = mockRes();
      mockGetProductsWithLatestReviews.mockResolvedValue({ products: [], total: 0, page: 1, totalPages: 0 } as any);
      mockGetProductsStock.mockResolvedValue({});

      await getAllProducts(req, res);

      expect(mockGetProductsWithLatestReviews).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'aloe' })
      );
    });

    it('sorts by price', async () => {
      const req = mockReq({ query: { sort: 'price' } });
      const res = mockRes();
      mockGetProductsWithLatestReviews.mockResolvedValue({ products: [], total: 0, page: 1, totalPages: 0 } as any);
      mockGetProductsStock.mockResolvedValue({});

      await getAllProducts(req, res);

      expect(mockGetProductsWithLatestReviews).toHaveBeenCalledWith(
        expect.objectContaining({ sort: 'price' })
      );
    });

    it('handles empty results', async () => {
      const req = mockReq({ query: {} });
      const res = mockRes();
      const emptyResult = { products: [], total: 0, page: 1, totalPages: 0 };
      mockGetProductsWithLatestReviews.mockResolvedValue(emptyResult as any);
      mockGetProductsStock.mockResolvedValue({});

      await getAllProducts(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(emptyResult);
    });

    it('returns 500 on error', async () => {
      const req = mockReq({ query: {} });
      const res = mockRes();
      mockGetProductsWithLatestReviews.mockRejectedValue(new Error('Database failure'));

      await getAllProducts(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server Error' });
    });
  });

  describe('getProductById', () => {
    it('returns product with stock and reviews', async () => {
      const pid = new mongoose.Types.ObjectId();
      const req = mockReq({ params: { id: pid.toString() } });
      const res = mockRes();

      const productDoc = { _id: pid, name: { en: 'Test' }, price: 100, isActive: true };
      vi.spyOn(Product, 'findById').mockReturnValue({ lean: vi.fn().mockResolvedValue(productDoc) } as any);

      mockGetProductStock.mockResolvedValue(25);
      mockGetLatestReviews.mockResolvedValue([{ rating: 5, comment: 'Great!' }] as any);

      await getProductById(req, res);

      expect(Product.findById).toHaveBeenCalledWith(pid.toString());
      expect(mockGetProductStock).toHaveBeenCalledWith(pid);
      expect(mockGetLatestReviews).toHaveBeenCalledWith(pid, 3);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ ...productDoc, stock: 25, latestReviews: [{ rating: 5, comment: 'Great!' }] });
    });

    it('returns 404 if product not found', async () => {
      const pid = new mongoose.Types.ObjectId();
      const req = mockReq({ params: { id: pid.toString() } });
      const res = mockRes();

      vi.spyOn(Product, 'findById').mockReturnValue({ lean: vi.fn().mockResolvedValue(null) } as any);

      await getProductById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Product not found' });
    });

    it('returns 404 if product is inactive', async () => {
      const pid = new mongoose.Types.ObjectId();
      const req = mockReq({ params: { id: pid.toString() } });
      const res = mockRes();

      vi.spyOn(Product, 'findById').mockReturnValue({ lean: vi.fn().mockResolvedValue({ _id: pid, isActive: false }) } as any);

      await getProductById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Product not found' });
    });

    it('returns 500 on error', async () => {
      const pid = new mongoose.Types.ObjectId();
      const req = mockReq({ params: { id: pid.toString() } });
      const res = mockRes();

      vi.spyOn(Product, 'findById').mockReturnValue({ lean: vi.fn().mockRejectedValue(new Error('DB error')) } as any);

      await getProductById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server Error' });
    });
  });

  describe('createProduct', () => {
    it('returns 400 if missing required fields', async () => {
      const req = mockReq({ body: { price: 100 } });
      const res = mockRes();

      await createProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Name, price, and category are required.' });
    });

    it('creates product with string translation fields', async () => {
      const catId = new mongoose.Types.ObjectId();
      const req = mockReq({
        body: {
          name: 'Herbal Oil',
          price: '299',
          discountPrice: '249',
          category: catId.toString(),
          description: 'Pure herbal oil',
          productMotto: 'Nature best',
          shortDescription: 'Premium oil',
          expiryDuration: '12 months',
          isFeatured: true,
          averageRating: 4,
          totalReviews: 5,
        },
      });
      const res = mockRes();

      const created = {
        _id: new mongoose.Types.ObjectId(),
        name: { en: 'Herbal Oil', ta: '' },
        price: 299,
        discountPrice: 249,
        category: catId.toString(),
        description: { en: 'Pure herbal oil', ta: '' },
        productMotto: { en: 'Nature best', ta: '' },
        shortDescription: { en: 'Premium oil', ta: '' },
        expiryDuration: { en: '12 months', ta: '' },
        isFeatured: true,
        averageRating: 4,
        totalReviews: 5,
        isActive: true,
        images: ['https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800'],
      };

      vi.spyOn(Product, 'create').mockResolvedValue(created as any);

      await createProduct(req, res);

      expect(Product.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: { en: 'Herbal Oil', ta: '' },
          price: 299,
          discountPrice: 249,
          category: catId.toString(),
          description: { en: 'Pure herbal oil', ta: '' },
          productMotto: { en: 'Nature best', ta: '' },
          shortDescription: { en: 'Premium oil', ta: '' },
          expiryDuration: { en: '12 months', ta: '' },
          isFeatured: true,
          averageRating: 4,
          totalReviews: 5,
        })
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'Product created successfully', product: created });
    });

    it('handles array translation fields', async () => {
      const catId = new mongoose.Types.ObjectId();
      const req = mockReq({
        body: {
          name: 'Herbal Balm',
          price: 150,
          category: catId.toString(),
          ingredients: ['Aloe Vera', 'Neem'],
          benefits: ['Healing', 'Cooling'],
          usageInstructions: ['Apply on affected area'],
          safetyInstructions: [{ en: 'For external use only', ta: 'வெளிப்புற பயன்பாட்டிற்கு மட்டும்' }],
          storageInstructions: ['Store in cool dry place'],
          tags: ['herbal', 'natural'],
        },
      });
      const res = mockRes();

      const created = {
        _id: new mongoose.Types.ObjectId(),
        name: { en: 'Herbal Balm', ta: '' },
        price: 150,
        discountPrice: 150,
        category: catId.toString(),
        isActive: true,
        ingredients: [{ en: 'Aloe Vera', ta: '' }, { en: 'Neem', ta: '' }],
        benefits: [{ en: 'Healing', ta: '' }, { en: 'Cooling', ta: '' }],
        usageInstructions: [{ en: 'Apply on affected area', ta: '' }],
        safetyInstructions: [{ en: 'For external use only', ta: 'வெளிப்புற பயன்பாட்டிற்கு மட்டும்' }],
        storageInstructions: [{ en: 'Store in cool dry place', ta: '' }],
        tags: [{ en: 'herbal', ta: '' }, { en: 'natural', ta: '' }],
        images: ['https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800'],
      };

      vi.spyOn(Product, 'create').mockResolvedValue(created as any);

      await createProduct(req, res);

      expect(Product.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ingredients: [{ en: 'Aloe Vera', ta: '' }, { en: 'Neem', ta: '' }],
          benefits: [{ en: 'Healing', ta: '' }, { en: 'Cooling', ta: '' }],
          usageInstructions: [{ en: 'Apply on affected area', ta: '' }],
          safetyInstructions: [{ en: 'For external use only', ta: 'வெளிப்புற பயன்பாட்டிற்கு மட்டும்' }],
          storageInstructions: [{ en: 'Store in cool dry place', ta: '' }],
          tags: [{ en: 'herbal', ta: '' }, { en: 'natural', ta: '' }],
        })
      );
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('uses default image when none provided', async () => {
      const catId = new mongoose.Types.ObjectId();
      const req = mockReq({ body: { name: 'Simple', price: 100, category: catId.toString() } });
      const res = mockRes();

      const created = {
        _id: new mongoose.Types.ObjectId(),
        name: { en: 'Simple', ta: '' },
        price: 100,
        category: catId.toString(),
        images: ['https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800'],
      };
      vi.spyOn(Product, 'create').mockResolvedValue(created as any);

      await createProduct(req, res);

      expect(Product.create).toHaveBeenCalledWith(
        expect.objectContaining({
          images: ['https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800'],
        })
      );
    });

    it('creates product with translation object instead of string', async () => {
      const catId = new mongoose.Types.ObjectId();
      const req = mockReq({
        body: {
          name: { en: 'Oil', ta: 'எண்ணெய்' },
          price: 200,
          category: catId.toString(),
          description: { en: 'Description', ta: 'விளக்கம்' },
        },
      });
      const res = mockRes();

      const created = {
        _id: new mongoose.Types.ObjectId(),
        name: { en: 'Oil', ta: 'எண்ணெய்' },
        price: 200,
        discountPrice: 200,
        category: catId.toString(),
        description: { en: 'Description', ta: 'விளக்கம்' },
        images: ['https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800'],
      };
      vi.spyOn(Product, 'create').mockResolvedValue(created as any);

      await createProduct(req, res);

      expect(Product.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: { en: 'Oil', ta: 'எண்ணெய்' },
          description: { en: 'Description', ta: 'விளக்கம்' },
        })
      );
    });

    it('handles media array', async () => {
      const catId = new mongoose.Types.ObjectId();
      const media = [{ type: 'image', url: 'https://res.cloudinary.com/demo/image/upload/v1/test.jpg', publicId: 'test-pub' }];
      const req = mockReq({ body: { name: 'Media Product', price: 100, category: catId.toString(), media } });
      const res = mockRes();

      const created = {
        _id: new mongoose.Types.ObjectId(),
        name: { en: 'Media Product', ta: '' },
        price: 100,
        category: catId.toString(),
        media,
        images: ['https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800'],
      };
      vi.spyOn(Product, 'create').mockResolvedValue(created as any);

      await createProduct(req, res);

      expect(Product.create).toHaveBeenCalledWith(expect.objectContaining({ media }));
    });

    it('returns 500 on error', async () => {
      const req = mockReq({ body: { name: 'Fail', price: 100, category: new mongoose.Types.ObjectId().toString() } });
      const res = mockRes();

      vi.spyOn(Product, 'create').mockRejectedValue(new Error('Validation failed'));

      await createProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server Error' });
    });
  });

  describe('updateProduct', () => {
    it('updates product with $set', async () => {
      const pid = new mongoose.Types.ObjectId();
      const req = mockReq({ params: { id: pid.toString() }, body: { price: 599, isFeatured: true, stock: 999 } });
      const res = mockRes();
      const updated = { _id: pid, name: { en: 'Test' }, price: 599, isFeatured: true };

      vi.spyOn(Product, 'findByIdAndUpdate').mockResolvedValue(updated as any);

      await updateProduct(req, res);

      expect(Product.findByIdAndUpdate).toHaveBeenCalledWith(
        pid.toString(),
        { $set: { price: 599, isFeatured: true } },
        { new: true, runValidators: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Product updated successfully', product: updated });
    });

    it('handles translation string fields', async () => {
      const pid = new mongoose.Types.ObjectId();
      const req = mockReq({ params: { id: pid.toString() }, body: { name: 'Updated Name', description: 'Updated desc' } });
      const res = mockRes();
      const updated = { _id: pid, name: { en: 'Updated Name', ta: '' }, description: { en: 'Updated desc', ta: '' } };

      vi.spyOn(Product, 'findByIdAndUpdate').mockResolvedValue(updated as any);

      await updateProduct(req, res);

      expect(Product.findByIdAndUpdate).toHaveBeenCalledWith(
        pid.toString(),
        { $set: { name: { en: 'Updated Name', ta: '' }, description: { en: 'Updated desc', ta: '' } } },
        { new: true, runValidators: true }
      );
    });

    it('handles translation array fields', async () => {
      const pid = new mongoose.Types.ObjectId();
      const req = mockReq({
        params: { id: pid.toString() },
        body: { ingredients: ['New Ing'], benefits: [{ en: 'Existing Benefit', ta: '' }] },
      });
      const res = mockRes();

      vi.spyOn(Product, 'findByIdAndUpdate').mockResolvedValue({ _id: pid } as any);

      await updateProduct(req, res);

      expect(Product.findByIdAndUpdate).toHaveBeenCalledWith(
        pid.toString(),
        { $set: { ingredients: [{ en: 'New Ing', ta: '' }], benefits: [{ en: 'Existing Benefit', ta: '' }] } },
        { new: true, runValidators: true }
      );
    });

    it('returns 404 if product not found', async () => {
      const req = mockReq({ params: { id: new mongoose.Types.ObjectId().toString() }, body: { price: 100 } });
      const res = mockRes();

      vi.spyOn(Product, 'findByIdAndUpdate').mockResolvedValue(null);

      await updateProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Product not found' });
    });

    it('returns 500 on error', async () => {
      const req = mockReq({ params: { id: new mongoose.Types.ObjectId().toString() }, body: { price: 100 } });
      const res = mockRes();

      vi.spyOn(Product, 'findByIdAndUpdate').mockRejectedValue(new Error('Update failed'));

      await updateProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server Error' });
    });
  });

  describe('deleteProduct', () => {
    it('deletes product and returns 200', async () => {
      const pid = new mongoose.Types.ObjectId();
      const req = mockReq({ params: { id: pid.toString() } });
      const res = mockRes();

      vi.spyOn(Product, 'findByIdAndDelete').mockResolvedValue({
        _id: pid,
        name: { en: 'To Delete' },
        media: [{ type: 'image', url: 'https://res.cloudinary.com/demo/image/upload/v1/del.jpg', publicId: 'del-pub-id' }],
      } as any);

      await deleteProduct(req, res);

      expect(Product.findByIdAndDelete).toHaveBeenCalledWith(pid.toString());
      expect(mockDeleteMedia).toHaveBeenCalledWith(['del-pub-id']);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Product deleted successfully' });
    });

    it('cleans up multiple Cloudinary media', async () => {
      const pid = new mongoose.Types.ObjectId();
      const req = mockReq({ params: { id: pid.toString() } });
      const res = mockRes();

      vi.spyOn(Product, 'findByIdAndDelete').mockResolvedValue({
        _id: pid,
        media: [
          { type: 'image', url: 'https://res.cloudinary.com/demo/image/upload/v1/a.jpg', publicId: 'pub-a' },
          { type: 'video', url: 'https://res.cloudinary.com/demo/video/upload/v1/b.mp4', publicId: 'pub-b' },
        ],
      } as any);

      await deleteProduct(req, res);

      expect(mockDeleteMedia).toHaveBeenCalledWith(['pub-a', 'pub-b']);
    });

    it('does not call deleteMedia when no media', async () => {
      const pid = new mongoose.Types.ObjectId();
      const req = mockReq({ params: { id: pid.toString() } });
      const res = mockRes();

      vi.spyOn(Product, 'findByIdAndDelete').mockResolvedValue({ _id: pid, name: { en: 'No media' }, media: [] } as any);

      await deleteProduct(req, res);

      expect(mockDeleteMedia).not.toHaveBeenCalled();
    });

    it('does not call deleteMedia when media has no publicId', async () => {
      const pid = new mongoose.Types.ObjectId();
      const req = mockReq({ params: { id: pid.toString() } });
      const res = mockRes();

      vi.spyOn(Product, 'findByIdAndDelete').mockResolvedValue({
        _id: pid, media: [{ type: 'image', url: 'https://example.com/img.jpg' }],
      } as any);

      await deleteProduct(req, res);

      expect(mockDeleteMedia).not.toHaveBeenCalled();
    });

    it('returns 404 if not found', async () => {
      const pid = new mongoose.Types.ObjectId();
      const req = mockReq({ params: { id: pid.toString() } });
      const res = mockRes();

      vi.spyOn(Product, 'findByIdAndDelete').mockResolvedValue(null);

      await deleteProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Product not found' });
    });

    it('returns 500 on error', async () => {
      const pid = new mongoose.Types.ObjectId();
      const req = mockReq({ params: { id: pid.toString() } });
      const res = mockRes();

      vi.spyOn(Product, 'findByIdAndDelete').mockRejectedValue(new Error('Delete failed'));

      await deleteProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server Error' });
    });

    it('handles deleteMedia rejecting without crashing', async () => {
      const pid = new mongoose.Types.ObjectId();
      const req = mockReq({ params: { id: pid.toString() } });
      const res = mockRes();

      vi.spyOn(Product, 'findByIdAndDelete').mockResolvedValue({
        _id: pid,
        media: [{ type: 'image', url: 'https://res.cloudinary.com/demo/image/upload/v1/x.jpg', publicId: 'pub-x' }],
      } as any);

      mockDeleteMedia.mockRejectedValue(new Error('Cloudinary error'));

      await deleteProduct(req, res);

      expect(mockDeleteMedia).toHaveBeenCalledWith(['pub-x']);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Product deleted successfully' });
    });
  });
});

// ---------------------------------------------------------------------------
// Category Controller
// ---------------------------------------------------------------------------
describe('Category Controller', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const collections = mongoose.connection.collections;
    if (collections.categories) await collections.categories.deleteMany({});
  });

  describe('getCategories', () => {
    it('returns all categories sorted by createdAt desc', async () => {
      const req = mockReq({ query: {} });
      const res = mockRes();

      await createTestCategory({ name: { en: 'Older', ta: '' }, slug: { en: 'older', ta: '' }, createdAt: new Date('2025-01-01') });
      await createTestCategory({ name: { en: 'Newer', ta: '' }, slug: { en: 'newer', ta: '' }, createdAt: new Date('2025-06-01') });

      await getCategories(req, res);

      const payload = (res.json as any).mock.calls[0][0];
      expect(payload.success).toBe(true);
      expect(payload.data).toHaveLength(2);
    });

    it('filters active categories when active=true', async () => {
      const req = mockReq({ query: { active: 'true' } });
      const res = mockRes();

      await createTestCategory({ isActive: true, slug: { en: 'active-cat', ta: '' } });
      await createTestCategory({ isActive: false, slug: { en: 'inactive-cat', ta: '' } });

      await getCategories(req, res);

      const payload = (res.json as any).mock.calls[0][0];
      expect(payload.data).toHaveLength(1);
      expect(payload.data[0].isActive).toBe(true);
    });

    it('returns empty array when no categories', async () => {
      const req = mockReq({ query: {} });
      const res = mockRes();

      await getCategories(req, res);

      const payload = (res.json as any).mock.calls[0][0];
      expect(payload.data).toEqual([]);
    });

    it('returns 500 on error', async () => {
      const req = mockReq({ query: {} });
      const res = mockRes();

      vi.spyOn(Category, 'find').mockImplementationOnce(function () { throw new Error('Query failed'); } as any);

      await getCategories(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Query failed' });
    });
  });

  describe('getCategoryBySlug', () => {
    it('returns category by slug.en', async () => {
      const cat = await createTestCategory({ slug: { en: 'herbal-oils', ta: '' } });
      const req = mockReq({ params: { slug: 'herbal-oils' } });
      const res = mockRes();

      await getCategoryBySlug(req, res);

      const payload = (res.json as any).mock.calls[0][0];
      expect(payload.success).toBe(true);
      expect(payload.data.slug.en).toBe('herbal-oils');
    });

    it('returns 404 if slug not found', async () => {
      const req = mockReq({ params: { slug: 'non-existent' } });
      const res = mockRes();

      await getCategoryBySlug(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Category not found' });
    });

    it('returns 500 on error', async () => {
      const req = mockReq({ params: { slug: 'error' } });
      const res = mockRes();

      vi.spyOn(Category, 'findOne').mockImplementationOnce(function () { throw new Error('Find failed'); } as any);

      await getCategoryBySlug(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('createCategory', () => {
    it('creates category and returns 201', async () => {
      const req = mockReq({
        body: { name: { en: 'New Category', ta: 'புதிய வகை' }, slug: { en: 'new-category', ta: '' } },
      });
      const res = mockRes();

      await createCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      const payload = (res.json as any).mock.calls[0][0];
      expect(payload.success).toBe(true);
      expect(payload.data.name.en).toBe('New Category');
    });

    it('returns 409 on duplicate slug', async () => {
      await createTestCategory({ slug: { en: 'duplicate-slug', ta: '' } });
      const req = mockReq({
        body: { name: { en: 'Duplicate', ta: '' }, slug: { en: 'duplicate-slug', ta: '' } },
      });
      const res = mockRes();

      await createCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Category with this slug already exists' });
    });

    it('returns 400 on validation error', async () => {
      const req = mockReq({ body: { } });
      const res = mockRes();

      await createCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('updateCategory', () => {
    it('updates and returns category', async () => {
      const cat = await createTestCategory({ slug: { en: 'update-test', ta: '' } });
      const req = mockReq({ params: { id: cat._id.toString() }, body: { name: { en: 'Updated', ta: '' } } });
      const res = mockRes();

      await updateCategory(req, res);

      const payload = (res.json as any).mock.calls[0][0];
      expect(payload.success).toBe(true);
      expect(payload.data.name.en).toBe('Updated');
    });

    it('returns 404 if category not found', async () => {
      const req = mockReq({ params: { id: new mongoose.Types.ObjectId().toString() }, body: { name: { en: 'Nope' } } });
      const res = mockRes();

      await updateCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('returns 409 on duplicate slug during update', async () => {
      await createTestCategory({ slug: { en: 'existing-slug', ta: '' } });
      const cat2 = await createTestCategory({ slug: { en: 'other-slug', ta: '' } });

      const req = mockReq({ params: { id: cat2._id.toString() }, body: { slug: { en: 'existing-slug', ta: '' } } });
      const res = mockRes();

      await updateCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
    });

    it('returns 400 on validation error', async () => {
      const cat = await createTestCategory({ slug: { en: 'validation-test', ta: '' } });
      const req = mockReq({ params: { id: cat._id.toString() }, body: { name: 123 } });
      const res = mockRes();

      await updateCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('deleteCategory', () => {
    it('deletes category and returns success', async () => {
      const cat = await createTestCategory({ slug: { en: 'delete-test', ta: '' } });
      const req = mockReq({ params: { id: cat._id.toString() } });
      const res = mockRes();

      await deleteCategory(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Category deleted successfully' });
      const deleted = await Category.findById(cat._id);
      expect(deleted).toBeNull();
    });

    it('returns 404 if category not found', async () => {
      const req = mockReq({ params: { id: new mongoose.Types.ObjectId().toString() } });
      const res = mockRes();

      await deleteCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('returns 500 on error', async () => {
      const req = mockReq({ params: { id: new mongoose.Types.ObjectId().toString() } });
      const res = mockRes();

      vi.spyOn(Category, 'findByIdAndDelete').mockImplementationOnce(function () { throw new Error('Delete error'); } as any);

      await deleteCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});

// ---------------------------------------------------------------------------
// Coupon Controller
// ---------------------------------------------------------------------------
describe('Coupon Controller', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const collections = mongoose.connection.collections;
    if (collections.coupons) await collections.coupons.deleteMany({});
  });

  describe('getCoupons', () => {
    it('returns all coupons', async () => {
      const req = mockReq();
      const res = mockRes();

      await createTestCoupon({ code: 'SAVE10' });
      await createTestCoupon({ code: 'SAVE20' });

      await getCoupons(req, res);

      expect(res.json).toHaveBeenCalled();
      const data = (res.json as any).mock.calls[0][0] as any[];
      expect(data).toHaveLength(2);
      expect(data.some((c: any) => c.code === 'SAVE10')).toBe(true);
      expect(data.some((c: any) => c.code === 'SAVE20')).toBe(true);
    });

    it('returns empty array when no coupons', async () => {
      const req = mockReq();
      const res = mockRes();

      await getCoupons(req, res);

      const data = (res.json as any).mock.calls[0][0];
      expect(data).toEqual([]);
    });

    it('returns 500 on error', async () => {
      const req = mockReq();
      const res = mockRes();

      vi.spyOn(Coupon, 'find').mockImplementationOnce(function () { throw new Error('DB error'); } as any);

      await getCoupons(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch coupons.' });
    });
  });

  describe('applyCoupon', () => {
    it('applies a valid coupon and returns discount percent', async () => {
      await createTestCoupon({ code: 'SAVE20', discountPercent: 20, active: true });

      const req = mockReq({ body: { code: 'SAVE20' } });
      const res = mockRes();

      await applyCoupon(req, res);

      expect(res.json).toHaveBeenCalledWith({
        message: 'Coupon applied successfully!',
        discountPercent: 20,
      });
    });

    it('returns 400 for invalid coupon code', async () => {
      const req = mockReq({ body: { code: 'INVALID' } });
      const res = mockRes();

      await applyCoupon(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired coupon code.' });
    });

    it('returns 400 for inactive coupon', async () => {
      await createTestCoupon({ code: 'INACTIVE', active: false });

      const req = mockReq({ body: { code: 'INACTIVE' } });
      const res = mockRes();

      await applyCoupon(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('uppercases the code for lookup', async () => {
      await createTestCoupon({ code: 'PROMO10', active: true, discountPercent: 10 });

      const req = mockReq({ body: { code: 'promo10' } });
      const res = mockRes();

      await applyCoupon(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ discountPercent: 10 })
      );
    });

    it('returns 500 on error', async () => {
      const req = mockReq({ body: { code: 'ANY' } });
      const res = mockRes();

      vi.spyOn(Coupon, 'findOne').mockImplementationOnce(function () { throw new Error('Query fail'); } as any);

      await applyCoupon(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to apply coupon.' });
    });
  });

  describe('manageCoupon', () => {
    it('creates a new coupon and returns 201', async () => {
      const req = mockReq({ body: { code: 'NEW10', discountPercent: 10 } });
      const res = mockRes();

      await manageCoupon(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'New coupon created!',
        coupon: expect.objectContaining({ code: 'NEW10', discountPercent: 10 }),
      });
    });

    it('returns 400 if code or discountPercent missing', async () => {
      const req = mockReq({ body: { code: 'ONLYCODE' } });
      const res = mockRes();

      await manageCoupon(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Code and discount percent are required.' });
    });

    it('updates existing coupon', async () => {
      await createTestCoupon({ code: 'UPDATE', discountPercent: 5, expiryDate: '2026-01-01' });

      const req = mockReq({ body: { code: 'update', discountPercent: 15 } });
      const res = mockRes();

      await manageCoupon(req, res);

      expect(res.json).toHaveBeenCalledWith({
        message: 'Coupon successfully modified!',
        coupon: expect.objectContaining({ code: 'UPDATE', discountPercent: 15 }),
      });
    });

    it('uses default expiry date when not provided', async () => {
      const req = mockReq({ body: { code: 'DEFAULT', discountPercent: 25 } });
      const res = mockRes();

      await manageCoupon(req, res);

      const payload = (res.json as any).mock.calls[0][0] as any;
      expect(payload.coupon.expiryDate).toBe('2026-12-31');
    });

    it('uses provided expiry date for new coupon', async () => {
      const req = mockReq({ body: { code: 'DATED', discountPercent: 30, expiryDate: '2028-06-15' } });
      const res = mockRes();

      await manageCoupon(req, res);

      const payload = (res.json as any).mock.calls[0][0] as any;
      expect(payload.coupon.expiryDate).toBe('2028-06-15');
    });

    it('returns 500 on error', async () => {
      const req = mockReq({ body: { code: 'ERR', discountPercent: 10 } });
      const res = mockRes();

      vi.spyOn(Coupon, 'findOne').mockImplementationOnce(function () { throw new Error('Upsert failed'); } as any);

      await manageCoupon(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to manage coupon.' });
    });
  });
});

// ---------------------------------------------------------------------------
// Cart Controller (inline route handlers)
// ---------------------------------------------------------------------------
describe('Cart Controller', () => {
  let authHeader: Record<string, string>;
  let currentUserId: string;

  beforeEach(async () => {
    const collections = mongoose.connection.collections;
    if (collections.carts) await collections.carts.deleteMany({});
    if (collections.users) await collections.users.deleteMany({});
    vi.clearAllMocks();

    const user = await createTestUser();
    currentUserId = user._id.toString();
    const token = generateToken(user);
    authHeader = createAuthHeader(token);
  });

  async function importCartApp() {
    const express = (await import('express')).default;
    const cartRouter = (await import('../../../routes/cart.js')).default;
    const app = express();
    app.use(express.json());
    app.use('/cart', cartRouter);
    return app;
  }

  describe('GET /cart', () => {
    it('returns empty cart for new user', async () => {
      const app = await importCartApp();
      const supertest = (await import('supertest')).default;
      const res = await supertest(app).get('/cart').set(authHeader);

      expect(res.status).toBe(200);
      expect(res.body.items).toEqual([]);
    });

    it('returns existing cart', async () => {
      await Cart.create({
        userId: currentUserId,
        items: [{ productId: 'p1', name: 'Item', price: 100, discountPrice: 90, quantity: 2, image: 'img.jpg' }],
      });

      const app = await importCartApp();
      const supertest = (await import('supertest')).default;
      const res = await supertest(app).get('/cart').set(authHeader);

      expect(res.status).toBe(200);
      expect(res.body.items).toHaveLength(1);
      expect(res.body.items[0].productId).toBe('p1');
    });

    it('returns 401 without auth', async () => {
      const app = await importCartApp();
      const supertest = (await import('supertest')).default;
      const res = await supertest(app).get('/cart');

      expect(res.status).toBe(401);
    });

    it('returns 500 on error', async () => {
      vi.spyOn(Cart, 'findOne').mockImplementationOnce(function () { throw new Error('DB fail'); } as any);

      const app = await importCartApp();
      const supertest = (await import('supertest')).default;
      const res = await supertest(app).get('/cart').set(authHeader);

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Failed to fetch cart.');
    });
  });

  describe('POST /cart/add', () => {
    it('adds a new item to cart', async () => {
      const app = await importCartApp();
      const supertest = (await import('supertest')).default;
      const res = await supertest(app)
        .post('/cart/add')
        .set(authHeader)
        .send({ productId: 'p1', name: 'Herbal Oil', price: 500, discountPrice: 450, quantity: 1, image: 'img.jpg' });

      expect(res.status).toBe(200);
      expect(res.body.items).toHaveLength(1);
      expect(res.body.items[0].productId).toBe('p1');
    });

    it('increments quantity for existing item', async () => {
      await Cart.create({
        userId: currentUserId,
        items: [{ productId: 'p1', name: 'Herbal Oil', price: 500, discountPrice: 450, quantity: 1, image: 'img.jpg' }],
      });

      const app = await importCartApp();
      const supertest = (await import('supertest')).default;
      const res = await supertest(app)
        .post('/cart/add')
        .set(authHeader)
        .send({ productId: 'p1', name: 'Herbal Oil', price: 500, discountPrice: 450, quantity: 2, image: 'img.jpg' });

      expect(res.status).toBe(200);
      expect(res.body.items[0].quantity).toBe(3);
    });

    it('returns 400 if missing required fields', async () => {
      const app = await importCartApp();
      const supertest = (await import('supertest')).default;
      const res = await supertest(app)
        .post('/cart/add')
        .set(authHeader)
        .send({ productId: 'p1' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Missing required cart item fields.');
    });

    it('returns 500 on error', async () => {
      vi.spyOn(Cart.prototype, 'save').mockImplementationOnce(function () { throw new Error('Save failed'); } as any);

      const app = await importCartApp();
      const supertest = (await import('supertest')).default;
      const res = await supertest(app)
        .post('/cart/add')
        .set(authHeader)
        .send({ productId: 'p1', name: 'Oil', price: 100, discountPrice: 90, quantity: 1, image: 'img.jpg' });

      expect(res.status).toBe(500);
    });
  });

  describe('PUT /cart/update/:productId', () => {
    it('updates item quantity', async () => {
      await Cart.create({
        userId: currentUserId,
        items: [{ productId: 'p1', name: 'Item', price: 100, discountPrice: 90, quantity: 1, image: 'img.jpg' }],
      });

      const app = await importCartApp();
      const supertest = (await import('supertest')).default;
      const res = await supertest(app).put('/cart/update/p1').set(authHeader).send({ quantity: 5 });

      expect(res.status).toBe(200);
      expect(res.body.items[0].quantity).toBe(5);
    });

    it('returns 400 if quantity is less than 1', async () => {
      const app = await importCartApp();
      const supertest = (await import('supertest')).default;
      const res = await supertest(app).put('/cart/update/p1').set(authHeader).send({ quantity: 0 });

      expect(res.status).toBe(400);
    });

    it('returns 404 if cart not found', async () => {
      const app = await importCartApp();
      const supertest = (await import('supertest')).default;
      const res = await supertest(app).put('/cart/update/p1').set(authHeader).send({ quantity: 3 });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Cart not found.');
    });

    it('returns 404 if item not in cart', async () => {
      await Cart.create({ userId: currentUserId, items: [] });

      const app = await importCartApp();
      const supertest = (await import('supertest')).default;
      const res = await supertest(app).put('/cart/update/p999').set(authHeader).send({ quantity: 3 });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Item not found in cart.');
    });
  });

  describe('DELETE /cart/remove/:productId', () => {
    it('removes item from cart', async () => {
      await Cart.create({
        userId: currentUserId,
        items: [
          { productId: 'p1', name: 'Item 1', price: 100, discountPrice: 90, quantity: 1, image: 'img.jpg' },
          { productId: 'p2', name: 'Item 2', price: 200, discountPrice: 180, quantity: 2, image: 'img.jpg' },
        ],
      });

      const app = await importCartApp();
      const supertest = (await import('supertest')).default;
      const res = await supertest(app).delete('/cart/remove/p1').set(authHeader);

      expect(res.status).toBe(200);
      expect(res.body.items).toHaveLength(1);
      expect(res.body.items[0].productId).toBe('p2');
    });

    it('returns 404 if cart not found', async () => {
      const app = await importCartApp();
      const supertest = (await import('supertest')).default;
      const res = await supertest(app).delete('/cart/remove/p1').set(authHeader);

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /cart/clear', () => {
    it('clears all items from cart', async () => {
      await Cart.create({
        userId: currentUserId,
        items: [{ productId: 'p1', name: 'Item', price: 100, discountPrice: 90, quantity: 1, image: 'img.jpg' }],
      });

      const app = await importCartApp();
      const supertest = (await import('supertest')).default;
      const res = await supertest(app).delete('/cart/clear').set(authHeader);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Cart cleared.');
    });

    it('returns success even if no cart exists', async () => {
      const app = await importCartApp();
      const supertest = (await import('supertest')).default;
      const res = await supertest(app).delete('/cart/clear').set(authHeader);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Cart cleared.');
    });
  });

  describe('POST /cart/sync', () => {
    it('syncs incoming items and merges quantities', async () => {
      await Cart.create({
        userId: currentUserId,
        items: [{ productId: 'p1', name: 'Existing', price: 100, discountPrice: 90, quantity: 1, image: 'img.jpg' }],
      });

      const app = await importCartApp();
      const supertest = (await import('supertest')).default;
      const res = await supertest(app)
        .post('/cart/sync')
        .set(authHeader)
        .send({
          items: [
            { productId: 'p1', name: 'Existing', price: 100, discountPrice: 90, quantity: 5, image: 'img.jpg' },
            { productId: 'p2', name: 'New', price: 200, discountPrice: 180, quantity: 2, image: 'img2.jpg' },
          ],
        });

      expect(res.status).toBe(200);
      const p1 = res.body.items.find((i: any) => i.productId === 'p1');
      const p2 = res.body.items.find((i: any) => i.productId === 'p2');
      expect(p1.quantity).toBe(5);
      expect(p2.quantity).toBe(2);
    });

    it('returns 400 if items is not an array', async () => {
      const app = await importCartApp();
      const supertest = (await import('supertest')).default;
      const res = await supertest(app)
        .post('/cart/sync')
        .set(authHeader)
        .send({ items: 'not-an-array' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Items must be an array.');
    });
  });
});
