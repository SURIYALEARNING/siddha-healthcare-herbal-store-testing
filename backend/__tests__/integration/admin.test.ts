import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';

vi.mock('../../config/mailer.js', () => ({
  sendOtpEmail: vi.fn().mockResolvedValue({ accepted: ['test@example.com'] }),
}));

import { createTestApp } from '../helpers/testApp.js';
import { createTestUser, createTestAdmin, createTestProduct, createTestCategory, createTestOrder, createTestConsultation, createTestBatch, generateToken, createAuthHeader } from '../helpers/factories.js';
import { User } from '../../models/User.js';
import Order from '../../models/Order.js';
import Consultation from '../../models/Consultation.js';

const app = createTestApp();

describe('Admin Routes Integration', () => {
  let user: any;
  let admin: any;
  let userToken: string;
  let adminToken: string;
  let product: any;
  let category: any;

  beforeEach(async () => {
    user = await createTestUser({ email: 'auser@example.com' });
    admin = await createTestAdmin({ email: 'aadmin@example.com' });
    userToken = generateToken(user);
    adminToken = generateToken(admin);
    category = await createTestCategory();
    product = await createTestProduct({ category: category._id });
  });

  describe('GET /api/admin/users', () => {
    it('should return all users for admin', async () => {
      const res = await request(app).get('/api/admin/users').set(createAuthHeader(adminToken));
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      const emails = res.body.map((u: any) => u.email);
      expect(emails).toContain('auser@example.com');
      expect(emails).toContain('aadmin@example.com');
    });

    it('should reject non-admin', async () => {
      const res = await request(app).get('/api/admin/users').set(createAuthHeader(userToken));
      expect(res.status).toBe(403);
    });

    it('should reject without auth', async () => {
      const res = await request(app).get('/api/admin/users');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/admin/analytics', () => {
    it('should return analytics data', async () => {
      await createTestOrder({ userId: user._id, productId: product._id, total: 900 });
      const res = await request(app).get('/api/admin/analytics').set(createAuthHeader(adminToken));
      expect(res.status).toBe(200);
      expect(res.body).toBeDefined();
      expect(typeof res.body).toBe('object');
    });

    it('should reject non-admin', async () => {
      const res = await request(app).get('/api/admin/analytics').set(createAuthHeader(userToken));
      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/admin/orders/stats', () => {
    it('should return order stats', async () => {
      await createTestOrder({ userId: user._id, productId: product._id, currentStatus: 'Pending' });
      await createTestOrder({ userId: user._id, productId: product._id, currentStatus: 'Delivered' });
      const res = await request(app).get('/api/admin/orders/stats').set(createAuthHeader(adminToken));
      expect(res.status).toBe(200);
      expect(res.body.today).toBeDefined();
      expect(typeof res.body.Pending).toBe('number');
      expect(typeof res.body.Delivered).toBe('number');
    });

    it('should reject non-admin', async () => {
      const res = await request(app).get('/api/admin/orders/stats').set(createAuthHeader(userToken));
      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/admin/consultations', () => {
    it('should return consultations for admin', async () => {
      await createTestConsultation();
      const res = await request(app).get('/api/admin/consultations').set(createAuthHeader(adminToken));
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should return empty list when no consultations', async () => {
      const res = await request(app).get('/api/admin/consultations').set(createAuthHeader(adminToken));
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('should reject non-admin', async () => {
      const res = await request(app).get('/api/admin/consultations').set(createAuthHeader(userToken));
      expect(res.status).toBe(403);
    });
  });

  describe('Access control for all admin endpoints', () => {
    it('should return 403 for non-admin on all admin routes', async () => {
      const adminRoutes = [
        '/api/admin/users',
        '/api/admin/analytics',
        '/api/admin/orders/stats',
        '/api/admin/consultations',
      ];
      for (const route of adminRoutes) {
        const res = await request(app).get(route).set(createAuthHeader(userToken));
        expect(res.status).toBe(403);
      }
    });

    it('should return 401 without token on admin routes', async () => {
      const res = await request(app).get('/api/admin/users');
      expect(res.status).toBe(401);
    });
  });
});
