import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';

vi.mock('../../config/mailer.js', () => ({
  sendOtpEmail: vi.fn().mockResolvedValue({ accepted: ['test@example.com'] }),
}));

import { createTestApp } from '../helpers/testApp.js';
import { createTestUser, createTestAdmin, createTestProduct, createTestCategory, createTestBatch, generateToken, createAuthHeader } from '../helpers/factories.js';
import Product from '../../models/Product.js';

const app = createTestApp();

describe('Products Integration', () => {
  let user: any;
  let admin: any;
  let userToken: string;
  let adminToken: string;
  let category: any;

  beforeEach(async () => {
    user = await createTestUser({ email: 'puser@example.com' });
    admin = await createTestAdmin({ email: 'padmin@example.com' });
    userToken = generateToken(user);
    adminToken = generateToken(admin);
    category = await createTestCategory();
  });

  describe('GET /api/products', () => {
    it('should return empty list when no products', async () => {
      const res = await request(app).get('/api/products');
      expect(res.status).toBe(200);
      expect(res.body.products).toEqual([]);
      expect(res.body.total).toBe(0);
    });

    it('should return products with pagination', async () => {
      await createTestProduct({ category: category._id, name: { en: 'Product A', ta: '' } });
      await createTestProduct({ category: category._id, name: { en: 'Product B', ta: '' } });

      const res = await request(app).get('/api/products');
      expect(res.status).toBe(200);
      expect(res.body.products).toHaveLength(2);
      expect(res.body.total).toBe(2);
      expect(res.body.page).toBe(1);
      expect(res.body.totalPages).toBe(1);
    });

    it('should filter by category', async () => {
      await createTestProduct({ category: category._id, name: { en: 'Cat Product', ta: '' } });
      const res = await request(app).get('/api/products');
      expect(res.status).toBe(200);
      expect(res.body.products).toBeDefined();
      expect(res.body.total).toBe(1);
    });

    it('should search by name', async () => {
      await createTestProduct({ category: category._id, name: { en: 'Apple Cider Vinegar', ta: '' } });
      const res = await request(app).get('/api/products?search=apple');
      expect(res.status).toBe(200);
      expect(res.body.products.length).toBeGreaterThanOrEqual(1);
    });

    it('should sort by price low to high', async () => {
      await createTestProduct({ category: category._id, name: { en: 'Cheap', ta: '' }, price: 100, discountPrice: 100 });
      await createTestProduct({ category: category._id, name: { en: 'Expensive', ta: '' }, price: 500, discountPrice: 500 });

      const res = await request(app).get('/api/products?sort=price-low');
      expect(res.status).toBe(200);
      expect(res.body.products[0].discountPrice).toBe(100);
    });

    it('should sort by price high to low', async () => {
      await createTestProduct({ category: category._id, name: { en: 'Cheap', ta: '' }, price: 100, discountPrice: 100 });
      await createTestProduct({ category: category._id, name: { en: 'Expensive', ta: '' }, price: 500, discountPrice: 500 });

      const res = await request(app).get('/api/products?sort=price-high');
      expect(res.status).toBe(200);
      expect(res.body.products[0].discountPrice).toBe(500);
    });

    it('should paginate results', async () => {
      for (let i = 0; i < 5; i++) {
        await createTestProduct({ category: category._id, name: { en: `Product ${i}`, ta: '' } });
      }
      const res = await request(app).get('/api/products?limit=2&page=1');
      expect(res.status).toBe(200);
      expect(res.body.products).toHaveLength(2);
      expect(res.body.total).toBe(5);
    });

    it('should include stock field', async () => {
      const prod = await createTestProduct({ category: category._id });
      await createTestBatch({ productId: prod._id, currentStock: 50, quantityProduced: 100 });
      const res = await request(app).get('/api/products');
      expect(res.status).toBe(200);
      expect(res.body.products[0].stock).toBeDefined();
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return product by id', async () => {
      const prod = await createTestProduct({ category: category._id });
      const res = await request(app).get(`/api/products/${prod._id}`);
      expect(res.status).toBe(200);
      expect(res.body._id).toBe(prod._id.toString());
      expect(res.body.stock).toBeDefined();
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/products/${fakeId}`);
      expect(res.status).toBe(404);
    });
  });

  describe('Admin CRUD /api/products/manage', () => {
    it('should create product as admin', async () => {
      const res = await request(app)
        .post('/api/products/manage')
        .set(createAuthHeader(adminToken))
        .send({ name: 'New Product', price: 299, category: category._id });
      expect(res.status).toBe(201);
      expect(res.body.message).toMatch(/created/i);
      expect(res.body.product.name.en).toBe('New Product');
    });

    it('should reject create without admin token', async () => {
      const res = await request(app)
        .post('/api/products/manage')
        .set(createAuthHeader(userToken))
        .send({ name: 'Hack', price: 100, category: category._id });
      expect(res.status).toBe(403);
    });

    it('should reject create without auth', async () => {
      const res = await request(app)
        .post('/api/products/manage')
        .send({ name: 'Hack', price: 100, category: category._id });
      expect(res.status).toBe(401);
    });

    it('should update product as admin', async () => {
      const prod = await createTestProduct({ category: category._id });
      const res = await request(app)
        .put(`/api/products/manage/${prod._id}`)
        .set(createAuthHeader(adminToken))
        .send({ name: 'Updated Product' });
      expect(res.status).toBe(200);
      expect(res.body.product.name.en).toBe('Updated Product');
    });

    it('should reject update from non-admin', async () => {
      const prod = await createTestProduct({ category: category._id });
      const res = await request(app)
        .put(`/api/products/manage/${prod._id}`)
        .set(createAuthHeader(userToken))
        .send({ name: 'Hacked' });
      expect(res.status).toBe(403);
    });

    it('should return 404 on update for non-existent product', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/products/manage/${fakeId}`)
        .set(createAuthHeader(adminToken))
        .send({ name: 'Ghost' });
      expect(res.status).toBe(404);
    });

    it('should delete product as admin', async () => {
      const prod = await createTestProduct({ category: category._id });
      const res = await request(app)
        .delete(`/api/products/manage/${prod._id}`)
        .set(createAuthHeader(adminToken));
      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/deleted/i);
      const gone = await Product.findById(prod._id);
      expect(gone).toBeNull();
    });

    it('should reject delete from non-admin', async () => {
      const prod = await createTestProduct({ category: category._id });
      const res = await request(app)
        .delete(`/api/products/manage/${prod._id}`)
        .set(createAuthHeader(userToken));
      expect(res.status).toBe(403);
    });
  });
});
