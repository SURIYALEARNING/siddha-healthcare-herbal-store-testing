import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';

vi.mock('../../config/mailer.js', () => ({
  sendOtpEmail: vi.fn().mockResolvedValue({ accepted: ['test@example.com'] }),
}));

vi.mock('../../services/shiprocket.service.js', () => {
  const mockResolved = (val: any) => vi.fn().mockResolvedValue(val);
  return {
    getValidToken: mockResolved('mock-token'),
    createOrder: mockResolved({ order_id: 'SR123', shipment_id: 'SHP456' }),
    generateAWB: mockResolved({ awb_code: 'AWB789', courier_name: 'Delhivery' }),
    requestPickup: mockResolved({ pickup_id: 'PK001', status: 'scheduled' }),
    trackShipment: mockResolved({
      tracking_data: {
        status: 'IN_TRANSIT',
        history: [{ status: 'PICKED UP', location: 'Chennai', timestamp: new Date().toISOString(), message: 'Pickup done' }],
      },
    }),
    cancelShipment: mockResolved({ status: 'cancelled' }),
    checkServiceability: mockResolved({
      success: true, available: true, message: 'Delivery available',
      estimatedDays: 3, estimatedDate: '2026-08-02', codAvailable: true,
      courier: { id: 1, name: 'Delhivery', rating: 4.5, freightCharge: 50, tracking: true, deliveryPerformance: 'good' },
      couriers: [],
    }),
    syncPickupLocations: mockResolved({ success: true, count: 1, companyName: 'Test Co' }),
    getStoredPickupLocations: mockResolved([
      { id: 1, pickup_location: 'primary', address: 'Test Address', city: 'Chennai', state: 'Tamil Nadu', pin_code: '600001', is_primary_location: 1 },
    ]),
    login: mockResolved({ token: 'mock-token' }),
    ndrAction: mockResolved({ success: true }),
    getPickupLocations: mockResolved({ data: { shipping_address: [], company_name: 'Test Co' } }),
  };
});

vi.mock('../../services/reminderService.js', () => ({
  maybeCreateRemindersForOrder: vi.fn().mockResolvedValue(undefined),
}));

import { createTestApp } from '../helpers/testApp.js';
import { createTestUser, createTestAdmin, createTestProduct, createTestCategory, createTestOrder, createTestBatch, generateToken, createAuthHeader } from '../helpers/factories.js';
import Order from '../../models/Order.js';
import Shipment from '../../models/Shipment.js';

const app = createTestApp();

describe('Shipping Integration', () => {
  let user: any;
  let admin: any;
  let userToken: string;
  let adminToken: string;
  let product: any;
  let category: any;
  let order: any;

  beforeEach(async () => {
    user = await createTestUser({ email: 'suser@example.com' });
    admin = await createTestAdmin({ email: 'sadmin@example.com' });
    userToken = generateToken(user);
    adminToken = generateToken(admin);
    category = await createTestCategory();
    product = await createTestProduct({ category: category._id });
    order = await createTestOrder({
      userId: user._id,
      productId: product._id,
      paymentStatus: 'Paid',
      currentStatus: 'Pending',
      shippingMethod: 'MANUAL',
      shippingStatus: 'PAID',
    });
  });

  describe('GET /api/admin/shipping/orders', () => {
    it('should return shipping orders', async () => {
      const res = await request(app).get('/api/admin/shipping/orders').set(createAuthHeader(adminToken));
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should reject non-admin', async () => {
      const res = await request(app).get('/api/admin/shipping/orders').set(createAuthHeader(userToken));
      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/admin/shipping/stats', () => {
    it('should return shipping stats', async () => {
      const res = await request(app).get('/api/admin/shipping/stats').set(createAuthHeader(adminToken));
      expect(res.status).toBe(200);
      expect(res.body.total).toBeGreaterThan(0);
      expect(typeof res.body.newOrders).toBe('number');
    });
  });

  describe('POST /api/admin/shipping/confirm', () => {
    it('should confirm an order for shipping', async () => {
      const res = await request(app)
        .post('/api/admin/shipping/confirm')
        .set(createAuthHeader(adminToken))
        .send({ orderId: order._id.toString() });
      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/confirmed/i);
      expect(res.body.order.shippingStatus).toBe('CONFIRMED');
    });

    it('should reject without orderId', async () => {
      const res = await request(app)
        .post('/api/admin/shipping/confirm')
        .set(createAuthHeader(adminToken))
        .send({});
      expect(res.status).toBe(400);
    });

    it('should return 404 for non-existent order', async () => {
      const res = await request(app)
        .post('/api/admin/shipping/confirm')
        .set(createAuthHeader(adminToken))
        .send({ orderId: new mongoose.Types.ObjectId().toString() });
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/admin/shipping/mark-packed', () => {
    it('should mark order as packed', async () => {
      const res = await request(app)
        .post('/api/admin/shipping/mark-packed')
        .set(createAuthHeader(adminToken))
        .send({ orderId: order._id.toString(), length: 10, breadth: 10, height: 10, weight: 0.5 });
      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/packed/i);
      expect(res.body.order.shippingStatus).toBe('PACKED');
    });

    it('should return 404 for non-existent order', async () => {
      const res = await request(app)
        .post('/api/admin/shipping/mark-packed')
        .set(createAuthHeader(adminToken))
        .send({ orderId: new mongoose.Types.ObjectId().toString() });
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/admin/shipping/create-shiprocket-order', () => {
    it('should create shiprocket order', async () => {
      const res = await request(app)
        .post('/api/admin/shipping/create-shiprocket-order')
        .set(createAuthHeader(adminToken))
        .send({ orderId: order._id.toString() });
      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/Shiprocket order/i);
      expect(res.body.shiprocketOrderId).toBe('SR123');
    });
  });

  describe('POST /api/admin/shipping/generate-awb', () => {
    it('should generate AWB', async () => {
      await Shipment.create({ orderId: order._id, shipmentId: 'SHP456' });
      const res = await request(app)
        .post('/api/admin/shipping/generate-awb')
        .set(createAuthHeader(adminToken))
        .send({ orderId: order._id.toString(), shipmentId: 'SHP456' });
      expect(res.status).toBe(200);
      expect(res.body.awbCode).toBe('AWB789');
    });
  });

  describe('POST /api/admin/shipping/request-pickup', () => {
    it('should request pickup', async () => {
      const res = await request(app)
        .post('/api/admin/shipping/request-pickup')
        .set(createAuthHeader(adminToken))
        .send({ orderId: order._id.toString(), shipmentIds: ['SHP456'] });
      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/Pickup/i);
    });
  });

  describe('GET /api/admin/shipping/track/:shipmentId', () => {
    it('should track shipment', async () => {
      const shipment = await Shipment.create({ orderId: order._id, shiprocketOrderId: 'SR123' });
      const res = await request(app)
        .get(`/api/admin/shipping/track/${shipment.shiprocketOrderId}`)
        .set(createAuthHeader(adminToken));
      expect(res.status).toBe(200);
      expect(res.body.tracking_data).toBeDefined();
    });
  });

  describe('POST /api/shipping/check-pincode', () => {
    it('should check pincode serviceability', async () => {
      const res = await request(app)
        .post('/api/shipping/check-pincode')
        .send({ pincode: '600001', weight: 0.5, cod: true });
      expect(res.status).toBe(200);
      expect(res.body.available).toBe(true);
    });

    it('should reject missing pincode', async () => {
      const res = await request(app).post('/api/shipping/check-pincode').send({});
      expect(res.status).toBe(400);
    });

    it('should reject invalid pincode format', async () => {
      const res = await request(app).post('/api/shipping/check-pincode').send({ pincode: '123' });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/shipping/check-my-address', () => {
    it('should check user address serviceability', async () => {
      const res = await request(app)
        .get('/api/shipping/check-my-address')
        .set(createAuthHeader(userToken));
      expect(res.status).toBe(200);
      expect(res.body.pincode).toBeDefined();
    });

    it('should reject without auth', async () => {
      const res = await request(app).get('/api/shipping/check-my-address');
      expect(res.status).toBe(401);
    });

    it('should return 400 when no address set', async () => {
      const noAddrUser = await createTestUser({
        email: 'noaddr@example.com',
        mobileNumber: '9988776600',
        address: { address: '', state: '', district: '', pincode: '' },
      });
      const token = generateToken(noAddrUser);
      const res = await request(app)
        .get('/api/shipping/check-my-address')
        .set(createAuthHeader(token));
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/webhooks/shiprocket', () => {
    it('should process shiprocket webhook', async () => {
      const shipment = await Shipment.create({ orderId: order._id, shipmentId: 'SHP999' });
      const res = await request(app)
        .post('/api/webhooks/shiprocket')
        .send({ shipment_id: shipment._id.toString(), current_status: 'DELIVERED' });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });

    it('should process IN_TRANSIT webhook', async () => {
      const shipment = await Shipment.create({ orderId: order._id, shipmentId: 'SHP888' });
      const res = await request(app)
        .post('/api/webhooks/shiprocket')
        .send({ shipment_id: shipment._id.toString(), current_status: 'IN TRANSIT' });
      expect(res.status).toBe(200);
    });
  });
});
