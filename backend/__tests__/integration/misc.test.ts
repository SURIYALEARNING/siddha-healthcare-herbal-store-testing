import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';

vi.mock('../../config/mailer.js', () => ({
  sendOtpEmail: vi.fn().mockResolvedValue({ accepted: ['test@example.com'] }),
}));

import { createTestApp } from '../helpers/testApp.js';
import {
  createTestUser, createTestAdmin, createTestProduct, createTestCategory,
  createTestOrder, createTestCoupon, createTestBatch, createTestBlog,
  createTestReview, createTestConsultation,
  generateToken, createAuthHeader,
} from '../helpers/factories.js';
import Category from '../../models/Category.js';
import Coupon from '../../models/Coupon.js';
import Cart from '../../models/Cart.js';
import Blog from '../../models/Blog.js';
import Review from '../../models/Review.js';
import Consultation from '../../models/Consultation.js';
import Batch from '../../models/Batch.js';
import { User } from '../../models/User.js';
import Carousel from '../../models/Carousel.js';

const app = createTestApp();

describe('Miscellaneous Integration', () => {
  let user: any;
  let admin: any;
  let userToken: string;
  let adminToken: string;
  let category: any;
  let product: any;

  beforeEach(async () => {
    user = await createTestUser({ email: 'muser@example.com', isAdmin: false, role: 'USER' });
    admin = await createTestAdmin({ email: 'madmin@example.com' });
    userToken = generateToken(user);
    adminToken = generateToken(admin);
    category = await createTestCategory();
    product = await createTestProduct({ category: category._id });
  });

  // ─── Health Check ──────────────────────────────────────
  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.time).toBeDefined();
    });
  });

  // ─── Categories ───────────────────────────────────────
  describe('Category CRUD', () => {
    it('GET /api/categories should return all categories', async () => {
      await createTestCategory({ name: { en: 'Cat 1', ta: '' }, slug: { en: 'cat-1', ta: '' }, _id: new mongoose.Types.ObjectId() });
      await createTestCategory({ name: { en: 'Cat 2', ta: '' }, slug: { en: 'cat-2', ta: '' }, _id: new mongoose.Types.ObjectId() });
      const res = await request(app).get('/api/categories');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it('GET /api/categories/:slug should return category by slug', async () => {
      const cat = await createTestCategory({ slug: { en: 'unique-slug-test', ta: '' }, _id: new mongoose.Types.ObjectId() });
      const res = await request(app).get(`/api/categories/${cat.slug.en}`);
      expect(res.status).toBe(200);
      expect(res.body.data.slug.en).toBe('unique-slug-test');
    });

    it('GET /api/categories/:slug should return 404 for non-existent slug', async () => {
      const res = await request(app).get('/api/categories/non-existent');
      expect(res.status).toBe(404);
    });

    it('POST /api/categories should create category as admin', async () => {
      const res = await request(app)
        .post('/api/categories')
        .set(createAuthHeader(adminToken))
        .send({ name: { en: 'New Cat', ta: '' }, slug: { en: 'new-cat', ta: '' } });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('POST /api/categories should reject non-admin', async () => {
      const res = await request(app)
        .post('/api/categories')
        .set(createAuthHeader(userToken))
        .send({ name: { en: 'Hack', ta: '' }, slug: { en: 'hack', ta: '' } });
      expect(res.status).toBe(403);
    });

    it('PUT /api/categories/:id should update category', async () => {
      const cat = await createTestCategory({ slug: { en: 'put-cat', ta: '' }, _id: new mongoose.Types.ObjectId() });
      const res = await request(app)
        .put(`/api/categories/${cat._id}`)
        .set(createAuthHeader(adminToken))
        .send({ name: { en: 'Updated Cat', ta: '' } });
      expect(res.status).toBe(200);
      expect(res.body.data.name.en).toBe('Updated Cat');
    });

    it('DELETE /api/categories/:id should delete category', async () => {
      const cat = await createTestCategory({ slug: { en: 'delete-cat', ta: '' }, _id: new mongoose.Types.ObjectId() });
      const res = await request(app)
        .delete(`/api/categories/${cat._id}`)
        .set(createAuthHeader(adminToken));
      expect(res.status).toBe(200);
      const gone = await Category.findById(cat._id);
      expect(gone).toBeNull();
    });

    it('DELETE /api/categories/:id should return 404 for non-existent', async () => {
      const res = await request(app)
        .delete(`/api/categories/${new mongoose.Types.ObjectId()}`)
        .set(createAuthHeader(adminToken));
      expect(res.status).toBe(404);
    });
  });

  // ─── Coupons ──────────────────────────────────────────
  describe('Coupon CRUD', () => {
    it('GET /api/coupons should return all coupons', async () => {
      await createTestCoupon({ code: 'SAVE20' });
      const res = await request(app).get('/api/coupons');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('POST /api/coupons/apply should apply valid coupon', async () => {
      await createTestCoupon({ code: 'TEST10' });
      const res = await request(app).post('/api/coupons/apply').send({ code: 'TEST10' });
      expect(res.status).toBe(200);
      expect(res.body.discountPercent).toBe(10);
    });

    it('POST /api/coupons/apply should reject invalid coupon', async () => {
      const res = await request(app).post('/api/coupons/apply').send({ code: 'INVALID' });
      expect(res.status).toBe(400);
    });

    it('POST /api/coupons/manage should create coupon as admin', async () => {
      const res = await request(app)
        .post('/api/coupons/manage')
        .set(createAuthHeader(adminToken))
        .send({ code: 'NEW20', discountPercent: 20 });
      expect(res.status).toBe(201);
      expect(res.body.coupon.code).toBe('NEW20');
    });

    it('POST /api/coupons/manage should update existing coupon', async () => {
      await createTestCoupon({ code: 'TEST10' });
      const res = await request(app)
        .post('/api/coupons/manage')
        .set(createAuthHeader(adminToken))
        .send({ code: 'TEST10', discountPercent: 25 });
      expect(res.status).toBe(200);
      expect(res.body.coupon.discountPercent).toBe(25);
    });

    it('POST /api/coupons/manage should reject non-admin', async () => {
      const res = await request(app)
        .post('/api/coupons/manage')
        .set(createAuthHeader(userToken))
        .send({ code: 'HACK', discountPercent: 99 });
      expect(res.status).toBe(403);
    });
  });

  // ─── Cart ────────────────────────────────────────────
  describe('Cart CRUD', () => {
    it('GET /api/cart should return empty cart for new user', async () => {
      const res = await request(app).get('/api/cart').set(createAuthHeader(userToken));
      expect(res.status).toBe(200);
      expect(res.body.items).toEqual([]);
    });

    it('POST /api/cart/add should add item', async () => {
      const res = await request(app)
        .post('/api/cart/add')
        .set(createAuthHeader(userToken))
        .send({ productId: product._id.toString(), name: 'Test', price: 500, discountPrice: 450, quantity: 2, image: 'https://example.com/img.jpg' });
      expect(res.status).toBe(200);
      expect(res.body.items).toHaveLength(1);
      expect(res.body.items[0].quantity).toBe(2);
    });

    it('POST /api/cart/add should increment quantity for existing item', async () => {
      await request(app).post('/api/cart/add').set(createAuthHeader(userToken))
        .send({ productId: product._id.toString(), name: 'Test', price: 500, discountPrice: 450, quantity: 1, image: '' });
      const res = await request(app).post('/api/cart/add').set(createAuthHeader(userToken))
        .send({ productId: product._id.toString(), name: 'Test', price: 500, discountPrice: 450, quantity: 2, image: '' });
      expect(res.status).toBe(200);
      const item = res.body.items.find((i: any) => i.productId === product._id.toString());
      expect(item.quantity).toBe(3);
    });

    it('POST /api/cart/add should reject missing fields', async () => {
      const res = await request(app).post('/api/cart/add').set(createAuthHeader(userToken)).send({});
      expect(res.status).toBe(400);
    });

    it('PUT /api/cart/update/:productId should update quantity', async () => {
      await request(app).post('/api/cart/add').set(createAuthHeader(userToken))
        .send({ productId: product._id.toString(), name: 'Test', price: 500, discountPrice: 450, quantity: 1, image: '' });
      const res = await request(app).put(`/api/cart/update/${product._id}`).set(createAuthHeader(userToken)).send({ quantity: 5 });
      expect(res.status).toBe(200);
      const item = res.body.items.find((i: any) => i.productId === product._id.toString());
      expect(item.quantity).toBe(5);
    });

    it('PUT /api/cart/update/:productId should reject invalid quantity', async () => {
      const res = await request(app).put(`/api/cart/update/${product._id}`).set(createAuthHeader(userToken)).send({ quantity: 0 });
      expect(res.status).toBe(400);
    });

    it('DELETE /api/cart/remove/:productId should remove item', async () => {
      await request(app).post('/api/cart/add').set(createAuthHeader(userToken))
        .send({ productId: product._id.toString(), name: 'Test', price: 500, discountPrice: 450, quantity: 1, image: '' });
      const res = await request(app).delete(`/api/cart/remove/${product._id}`).set(createAuthHeader(userToken));
      expect(res.status).toBe(200);
      expect(res.body.items).toHaveLength(0);
    });

    it('DELETE /api/cart/clear should clear cart', async () => {
      await request(app).post('/api/cart/add').set(createAuthHeader(userToken))
        .send({ productId: product._id.toString(), name: 'Test', price: 500, discountPrice: 450, quantity: 1, image: '' });
      const res = await request(app).delete('/api/cart/clear').set(createAuthHeader(userToken));
      expect(res.status).toBe(200);
    });

    it('POST /api/cart/sync should sync items', async () => {
      const res = await request(app)
        .post('/api/cart/sync')
        .set(createAuthHeader(userToken))
        .send({ items: [{ productId: product._id.toString(), name: 'Synced', price: 100, discountPrice: 90, quantity: 3, image: '' }] });
      expect(res.status).toBe(200);
      expect(res.body.items).toHaveLength(1);
      expect(res.body.items[0].quantity).toBe(3);
    });

    it('POST /api/cart/sync should reject non-array items', async () => {
      const res = await request(app).post('/api/cart/sync').set(createAuthHeader(userToken)).send({ items: 'invalid' });
      expect(res.status).toBe(400);
    });
  });

  // ─── Blogs ───────────────────────────────────────────
  describe('Blog CRUD', () => {
    it('GET /api/blogs should return all blogs', async () => {
      await createTestBlog();
      const res = await request(app).get('/api/blogs');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('POST /api/blogs/manage should create blog as admin', async () => {
      const res = await request(app)
        .post('/api/blogs/manage')
        .set(createAuthHeader(adminToken))
        .send({ title: 'New Blog', content: 'Content here', category: 'Health' });
      expect(res.status).toBe(201);
      expect(res.body.blog.title).toBe('New Blog');
    });

    it('POST /api/blogs/manage should reject non-admin', async () => {
      const res = await request(app)
        .post('/api/blogs/manage')
        .set(createAuthHeader(userToken))
        .send({ title: 'Hack', content: 'Bad', category: 'Health' });
      expect(res.status).toBe(403);
    });

    it('PUT /api/blogs/manage/:id should update blog', async () => {
      const blog = await createTestBlog();
      const res = await request(app)
        .put(`/api/blogs/manage/${blog._id}`)
        .set(createAuthHeader(adminToken))
        .send({ title: 'Updated Title' });
      expect(res.status).toBe(200);
      expect(res.body.blog.title).toBe('Updated Title');
    });

    it('PUT /api/blogs/manage/:id should return 404 for non-existent', async () => {
      const res = await request(app)
        .put(`/api/blogs/manage/${new mongoose.Types.ObjectId()}`)
        .set(createAuthHeader(adminToken))
        .send({ title: 'Ghost' });
      expect(res.status).toBe(404);
    });

    it('DELETE /api/blogs/manage/:id should delete blog', async () => {
      const blog = await createTestBlog();
      const res = await request(app)
        .delete(`/api/blogs/manage/${blog._id}`)
        .set(createAuthHeader(adminToken));
      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/removed/i);
    });

    it('POST /api/blogs/:id/increment-reads should increment reads', async () => {
      const blog = await createTestBlog();
      const res = await request(app).post(`/api/blogs/${blog._id}/increment-reads`);
      expect(res.status).toBe(200);
      expect(res.body.reads).toBe(1);
    });
  });

  // ─── Reviews ─────────────────────────────────────────
  describe('Review CRUD', () => {
    it('POST /api/products/:id/reviews should add review', async () => {
      const res = await request(app)
        .post(`/api/products/${product._id}/reviews`)
        .set(createAuthHeader(userToken))
        .send({ rating: 4, title: 'Good', comment: 'Nice product' });
      expect(res.status).toBe(201);
      expect(res.body.review.rating).toBe(4);
    });

    it('POST /api/products/:id/reviews should reject missing fields', async () => {
      const res = await request(app)
        .post(`/api/products/${product._id}/reviews`)
        .set(createAuthHeader(userToken))
        .send({});
      expect(res.status).toBe(400);
    });

    it('POST /api/products/:id/reviews should reject rating out of range', async () => {
      const res = await request(app)
        .post(`/api/products/${product._id}/reviews`)
        .set(createAuthHeader(userToken))
        .send({ rating: 6, comment: 'Bad' });
      expect(res.status).toBe(400);
    });

    it('GET /api/products/:id/reviews should return reviews', async () => {
      await createTestReview({ productId: product._id, userId: user._id });
      const res = await request(app).get(`/api/products/${product._id}/reviews`);
      expect(res.status).toBe(200);
      expect(res.body.reviews).toBeDefined();
    });

    it('GET /api/products/:id/reviews/stats should return stats', async () => {
      const res = await request(app).get(`/api/products/${product._id}/reviews/stats`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('averageRating');
      expect(res.body).toHaveProperty('totalReviews');
    });

    it('PUT /api/products/:id/reviews/:reviewId should update own review', async () => {
      const review = await createTestReview({ productId: product._id, userId: user._id });
      const res = await request(app)
        .put(`/api/products/${product._id}/reviews/${review._id}`)
        .set(createAuthHeader(userToken))
        .send({ comment: 'Updated comment' });
      expect(res.status).toBe(200);
      expect(res.body.review.comment).toBe('Updated comment');
    });

    it('DELETE /api/products/:id/reviews/:reviewId should delete own review', async () => {
      const review = await createTestReview({ productId: product._id, userId: user._id });
      const res = await request(app)
        .delete(`/api/products/${product._id}/reviews/${review._id}`)
        .set(createAuthHeader(userToken));
      expect(res.status).toBe(200);
    });
  });

  // ─── Consultation ────────────────────────────────────
  describe('Consultation', () => {
    it('POST /api/consultation should book consultation', async () => {
      const res = await request(app)
        .post('/api/consultation')
        .send({ fullName: 'Patient', mobileNumber: '9988776655', preferredDate: '2027-06-15', preferredTime: '10:00 AM', email: 'patient@example.com' });
      expect(res.status).toBe(201);
      expect(res.body.booking.fullName).toBe('Patient');
    });

    it('POST /api/consultation should reject missing required fields', async () => {
      const res = await request(app).post('/api/consultation').send({ fullName: 'Incomplete' });
      expect(res.status).toBe(400);
    });
  });

  // ─── Batch CRUD ──────────────────────────────────────
  describe('Batch CRUD', () => {
    it('GET /api/admin/batches should return batches for admin', async () => {
      await createTestBatch({ productId: product._id });
      const res = await request(app).get('/api/admin/batches').set(createAuthHeader(adminToken));
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('GET /api/admin/batches should reject non-admin', async () => {
      const res = await request(app).get('/api/admin/batches').set(createAuthHeader(userToken));
      expect(res.status).toBe(403);
    });

    it('POST /api/admin/batches should create batch', async () => {
      const res = await request(app)
        .post('/api/admin/batches')
        .set(createAuthHeader(adminToken))
        .send({
          productId: product._id.toString(),
          batchNumber: 'BATCH-NEW-001',
          quantityProduced: 200,
          manufactureDate: '2026-01-01',
          expiryDate: '2028-01-01',
        });
      expect(res.status).toBe(201);
      expect(res.body.currentStock).toBe(200);
    });

    it('POST /api/admin/batches should reject duplicate batch number', async () => {
      await createTestBatch({ productId: product._id, batchNumber: 'BATCH-DUP' });
      const res = await request(app)
        .post('/api/admin/batches')
        .set(createAuthHeader(adminToken))
        .send({
          productId: product._id.toString(),
          batchNumber: 'BATCH-DUP',
          quantityProduced: 100,
          manufactureDate: '2026-01-01',
          expiryDate: '2028-01-01',
        });
      expect(res.status).toBe(400);
    });

    it('PUT /api/admin/batches/:id should update batch', async () => {
      const batch = await createTestBatch({ productId: product._id });
      const res = await request(app)
        .put(`/api/admin/batches/${batch._id}`)
        .set(createAuthHeader(adminToken))
        .send({ preparedBy: 'New Preparer' });
      expect(res.status).toBe(200);
      expect(res.body.preparedBy).toBe('New Preparer');
    });

    it('PATCH /api/admin/batches/:id/stock-adjustment should adjust stock', async () => {
      const batch = await createTestBatch({ productId: product._id, currentStock: 100 });
      const res = await request(app)
        .patch(`/api/admin/batches/${batch._id}/stock-adjustment`)
        .set(createAuthHeader(adminToken))
        .send({ newStock: 80, reason: 'DAMAGED', reasonDetails: 'Found damaged items' });
      expect(res.status).toBe(200);
      expect(res.body.batch.currentStock).toBe(80);
    });

    it('PATCH /api/admin/batches/:id/stock-adjustment should reject missing fields', async () => {
      const batch = await createTestBatch({ productId: product._id });
      const res = await request(app)
        .patch(`/api/admin/batches/${batch._id}/stock-adjustment`)
        .set(createAuthHeader(adminToken))
        .send({});
      expect(res.status).toBe(400);
    });
  });

  // ─── Staff CRUD ──────────────────────────────────────
  describe('Staff CRUD', () => {
    it('POST /api/admin/staff should create staff as admin', async () => {
      const res = await request(app)
        .post('/api/admin/staff')
        .set(createAuthHeader(adminToken))
        .send({ fullName: 'Staff Member', email: 'staff@example.com', password: 'Pass@123', mobileNumber: '9988776633' });
      expect(res.status).toBe(201);
      expect(res.body.staff.fullName).toBe('Staff Member');
    });

    it('POST /api/admin/staff should reject non-admin', async () => {
      const res = await request(app)
        .post('/api/admin/staff')
        .set(createAuthHeader(userToken))
        .send({ fullName: 'Hack', email: 'hack@example.com', password: 'Pass@123' });
      expect(res.status).toBe(403);
    });

    it('GET /api/admin/staff should return staff list', async () => {
      const { User } = await import('../../models/User.js');
      const bcrypt = await import('bcryptjs');
      const hash = await bcrypt.hash('Pass@123', 10);
      await User.create({ fullName: 'Staff1', email: 'staff1@example.com', password: hash, role: 'STAFF', isAdmin: true });
      const res = await request(app).get('/api/admin/staff').set(createAuthHeader(adminToken));
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.some((s: any) => s.email === 'staff1@example.com')).toBe(true);
    });

    it('GET /api/admin/staff should reject non-admin', async () => {
      const res = await request(app).get('/api/admin/staff').set(createAuthHeader(userToken));
      expect(res.status).toBe(403);
    });

    it('PATCH /api/admin/staff/:id/status should toggle staff status', async () => {
      const bcrypt = await import('bcryptjs');
      const hash = await bcrypt.hash('Pass@123', 10);
      const staffUser = await User.create({ fullName: 'Toggle', email: 'toggle@example.com', password: hash, role: 'STAFF', isAdmin: true, isActive: true });
      const res = await request(app)
        .patch(`/api/admin/staff/${staffUser._id}/status`)
        .set(createAuthHeader(adminToken))
        .send({ isActive: false });
      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/disabled/i);
    });

    it('DELETE /api/admin/staff/:id should delete staff', async () => {
      const bcrypt = await import('bcryptjs');
      const hash = await bcrypt.hash('Pass@123', 10);
      const staffUser = await User.create({ fullName: 'DeleteMe', email: 'deleteme@example.com', password: hash, role: 'STAFF', isAdmin: true });
      const res = await request(app)
        .delete(`/api/admin/staff/${staffUser._id}`)
        .set(createAuthHeader(adminToken));
      expect(res.status).toBe(200);
    });
  });

  // ─── Reminder CRUD ───────────────────────────────────
  describe('Reminder CRUD', () => {
    it('GET /api/admin/reminders should return reminders for admin', async () => {
      const res = await request(app).get('/api/admin/reminders').set(createAuthHeader(adminToken));
      expect(res.status).toBe(200);
      expect(res.body).toBeDefined();
    });

    it('GET /api/admin/reminders should reject non-admin', async () => {
      const res = await request(app).get('/api/admin/reminders').set(createAuthHeader(userToken));
      expect(res.status).toBe(403);
    });

    it('GET /api/admin/reminders/today should return today reminders', async () => {
      const res = await request(app).get('/api/admin/reminders/today');
      expect(res.status).toBe(200);
      expect(res.body.count).toBeDefined();
      expect(Array.isArray(res.body.reminders)).toBe(true);
    });

    it('GET /api/admin/reminders/stats should return stats for admin', async () => {
      const res = await request(app).get('/api/admin/reminders/stats').set(createAuthHeader(adminToken));
      expect(res.status).toBe(200);
      expect(res.body.todayPending).toBeDefined();
    });
  });

  // ─── Carousel ────────────────────────────────────────
  describe('Carousel', () => {
    it('GET /api/carousel should return empty list when no carousel', async () => {
      const res = await request(app).get('/api/carousel');
      expect(res.status).toBe(200);
      expect(res.body.products).toEqual([]);
    });

    it('PUT /api/carousel/manage should update carousel as admin', async () => {
      const products = await Promise.all([
        createTestProduct({ category: category._id, name: { en: 'P1', ta: '' } }),
        createTestProduct({ category: category._id, name: { en: 'P2', ta: '' } }),
        createTestProduct({ category: category._id, name: { en: 'P3', ta: '' } }),
        createTestProduct({ category: category._id, name: { en: 'P4', ta: '' } }),
        createTestProduct({ category: category._id, name: { en: 'P5', ta: '' } }),
        createTestProduct({ category: category._id, name: { en: 'P6', ta: '' } }),
      ]);
      const res = await request(app)
        .put('/api/carousel/manage')
        .set(createAuthHeader(adminToken))
        .send({ productIds: products.map(p => p._id.toString()) });
      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/updated/i);
    });

    it('PUT /api/carousel/manage should reject less than 6 products', async () => {
      const res = await request(app)
        .put('/api/carousel/manage')
        .set(createAuthHeader(adminToken))
        .send({ productIds: [] });
      expect(res.status).toBe(400);
    });

    it('PUT /api/carousel/manage should reject non-admin', async () => {
      const res = await request(app)
        .put('/api/carousel/manage')
        .set(createAuthHeader(userToken))
        .send({ productIds: ['a', 'b', 'c', 'd', 'e', 'f'] });
      expect(res.status).toBe(403);
    });
  });
});
