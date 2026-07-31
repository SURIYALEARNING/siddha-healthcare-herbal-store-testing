import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';

vi.mock('../../config/mailer.js', () => ({
  sendOtpEmail: vi.fn().mockResolvedValue({ accepted: ['test@example.com'] }),
}));

import { createTestApp } from '../helpers/testApp.js';
import { createTestUser, createTestAdmin, createTestProduct, createTestCategory, createTestBatch, createTestOrder, generateToken, createAuthHeader } from '../helpers/factories.js';
import Order from '../../models/Order.js';
import Product from '../../models/Product.js';
import Batch from '../../models/Batch.js';

const app = createTestApp();

describe('Orders Integration', () => {
  let user: any;
  let admin: any;
  let userToken: string;
  let adminToken: string;
  let product: any;
  let category: any;

  beforeEach(async () => {
    user = await createTestUser({ email: 'ouser@example.com' });
    admin = await createTestAdmin({ email: 'oadmin@example.com' });
    userToken = generateToken(user);
    adminToken = generateToken(admin);
    category = await createTestCategory();
    product = await createTestProduct({ category: category._id, discountPrice: 450 });
    await createTestBatch({ productId: product._id, currentStock: 50, quantityProduced: 50 });
  });

  describe('GET /api/orders - user orders', () => {
    it('should return empty list when no orders', async () => {
      const res = await request(app).get('/api/orders').set(createAuthHeader(userToken));
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('should return user orders sorted by newest', async () => {
      await createTestOrder({ userId: user._id, productId: product._id });
      await createTestOrder({ userId: user._id, productId: product._id });
      const res = await request(app).get('/api/orders').set(createAuthHeader(userToken));
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });

    it('should not return other users orders', async () => {
      const otherUser = await createTestUser({ email: 'other@example.com' });
      await createTestOrder({ userId: otherUser._id, productId: product._id });
      const res = await request(app).get('/api/orders').set(createAuthHeader(userToken));
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(0);
    });

    it('should require auth', async () => {
      const res = await request(app).get('/api/orders');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/orders - checkout', () => {
    it('should create order successfully', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set(createAuthHeader(userToken))
        .send({
          items: [{ productId: product._id.toString(), quantity: 2 }],
          shippingAddress: { address: 'Test St', state: 'TN', district: 'Chennai', pincode: '600001' },
          mobileNumber: '9876543210',
          email: 'ouser@example.com',
          fullName: 'Test User',
          paymentMethod: 'UPI',
        });
      expect(res.status).toBe(201);
      expect(res.body.message).toMatch(/placed/i);
      expect(res.body.order).toBeDefined();
      expect(res.body.order.total).toBeGreaterThan(0);
      expect(res.body.order.items).toHaveLength(1);

      const batch = await Batch.findById(product._id);
      expect(batch).toBeDefined();
    });

    it('should reject missing checkout fields', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set(createAuthHeader(userToken))
        .send({ items: [{ productId: product._id.toString(), quantity: 1 }] });
      expect(res.status).toBe(400);
    });

    it('should reject without auth', async () => {
      const res = await request(app).post('/api/orders').send({ items: [] });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/orders/track/:id', () => {
    it('should return tracking info for existing order', async () => {
      const order = await createTestOrder({ userId: user._id, productId: product._id, currentStatus: 'Shipped' });
      const res = await request(app).get(`/api/orders/track/${order._id}`);
      expect(res.status).toBe(200);
      expect(res.body._id).toBe(order._id.toString());
    });

    it('should return 404 for non-existent order', async () => {
      const res = await request(app).get(`/api/orders/track/${new mongoose.Types.ObjectId()}`);
      expect(res.status).toBe(404);
    });
  });

  describe('Admin: GET /api/admin/orders', () => {
    it('should return all orders for admin', async () => {
      await createTestOrder({ userId: user._id, productId: product._id });
      const res = await request(app).get('/api/admin/orders').set(createAuthHeader(adminToken));
      expect(res.status).toBe(200);
      expect(res.body.orders).toHaveLength(1);
      expect(res.body.total).toBe(1);
    });

    it('should reject non-admin', async () => {
      const res = await request(app).get('/api/admin/orders').set(createAuthHeader(userToken));
      expect(res.status).toBe(403);
    });

    it('should filter by status', async () => {
      await createTestOrder({ userId: user._id, productId: product._id, currentStatus: 'Pending' });
      await createTestOrder({ userId: user._id, productId: product._id, currentStatus: 'Delivered' });
      const res = await request(app).get('/api/admin/orders?status=Pending').set(createAuthHeader(adminToken));
      expect(res.status).toBe(200);
      expect(res.body.orders).toHaveLength(1);
      expect(res.body.orders[0].currentStatus).toBe('Pending');
    });
  });

  describe('Admin: PUT /api/admin/orders/:id/status', () => {
    it('should update order status', async () => {
      const order = await createTestOrder({ userId: user._id, productId: product._id, shippingMethod: 'MANUAL' });
      const res = await request(app)
        .put(`/api/admin/orders/${order._id}/status`)
        .set(createAuthHeader(adminToken))
        .send({ status: 'Delivered' });
      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/updated/i);
      expect(res.body.order.currentStatus).toBe('Delivered');
    });

    it('should reject non-admin', async () => {
      const order = await createTestOrder({ userId: user._id, productId: product._id });
      const res = await request(app)
        .put(`/api/admin/orders/${order._id}/status`)
        .set(createAuthHeader(userToken))
        .send({ status: 'Delivered' });
      expect(res.status).toBe(403);
    });
  });

  describe('Admin: GET /api/admin/orders/:id/timeline', () => {
    it('should return timeline', async () => {
      const order = await createTestOrder({ userId: user._id, productId: product._id });
      const res = await request(app).get(`/api/admin/orders/${order._id}/timeline`).set(createAuthHeader(adminToken));
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.timeline)).toBe(true);
      expect(res.body.currentStatus).toBeDefined();
    });

    it('should return 404 for non-existent order timeline', async () => {
      const res = await request(app).get(`/api/admin/orders/${new mongoose.Types.ObjectId()}/timeline`).set(createAuthHeader(adminToken));
      expect(res.status).toBe(404);
    });
  });

  describe('Admin: GET /api/admin/customers', () => {
    it('should return customer list', async () => {
      await createTestOrder({ userId: user._id, productId: product._id, total: 900 });
      const res = await request(app).get('/api/admin/customers').set(createAuthHeader(adminToken));
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      const found = res.body.find((c: any) => c.email === 'ouser@example.com');
      expect(found).toBeDefined();
      expect(found.totalOrders).toBe(1);
      expect(found.totalSpent).toBe(900);
    });

    it('should reject non-admin', async () => {
      const res = await request(app).get('/api/admin/customers').set(createAuthHeader(userToken));
      expect(res.status).toBe(403);
    });
  });

  describe('Admin: GET /api/admin/customers/:userId/orders', () => {
    it('should return orders for a specific customer', async () => {
      await createTestOrder({ userId: user._id, productId: product._id });
      const res = await request(app).get(`/api/admin/customers/${user._id}/orders`).set(createAuthHeader(adminToken));
      expect(res.status).toBe(200);
      expect(res.body.customer).toBeDefined();
      expect(res.body.customer.email).toBe('ouser@example.com');
      expect(res.body.orders).toHaveLength(1);
    });

    it('should filter by status', async () => {
      await createTestOrder({ userId: user._id, productId: product._id, currentStatus: 'Pending' });
      const res = await request(app).get(`/api/admin/customers/${user._id}/orders?status=Pending`).set(createAuthHeader(adminToken));
      expect(res.status).toBe(200);
      expect(res.body.orders).toHaveLength(1);
    });
  });
});
