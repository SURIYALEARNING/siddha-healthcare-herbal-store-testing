import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import crypto from 'crypto';

vi.mock('../../config/mailer.js', () => ({
  sendOtpEmail: vi.fn().mockResolvedValue({ accepted: ['test@example.com'] }),
}));

vi.mock('razorpay', () => {
  const mockCreate = vi.fn().mockResolvedValue({ id: 'order_mock_123', amount: 45000, currency: 'INR' });
  return {
    default: function RazorpayMock() {
      return { orders: { create: mockCreate } };
    },
  };
});

import { createTestApp } from '../helpers/testApp.js';
import { createTestUser, createTestProduct, createTestCategory, createTestBatch, generateToken, createAuthHeader } from '../helpers/factories.js';

const app = createTestApp();

describe('Payment Integration', () => {
  let user: any;
  let userToken: string;
  let product: any;
  let category: any;

  beforeEach(async () => {
    user = await createTestUser({ email: 'payuser@example.com' });
    userToken = generateToken(user);
    category = await createTestCategory();
    product = await createTestProduct({ category: category._id, discountPrice: 450 });
    await createTestBatch({ productId: product._id, currentStock: 50, quantityProduced: 50 });
  });

  describe('GET /api/payment/config', () => {
    it('should return razorpay key', async () => {
      const res = await request(app).get('/api/payment/config');
      expect(res.status).toBe(200);
      expect(res.body.key).toBe('rzp_test_key');
    });
  });

  describe('POST /api/payment/create-order', () => {
    it('should create a razorpay order', async () => {
      const res = await request(app)
        .post('/api/payment/create-order')
        .set(createAuthHeader(userToken))
        .send({ items: [{ productId: product._id.toString(), quantity: 2 }] });
      expect(res.status).toBe(200);
      expect(res.body.orderId).toBe('order_mock_123');
      expect(res.body.amount).toBeDefined();
      expect(res.body.currency).toBe('INR');
    });

    it('should reject without items', async () => {
      const res = await request(app)
        .post('/api/payment/create-order')
        .set(createAuthHeader(userToken))
        .send({ items: [] });
      expect(res.status).toBe(400);
    });

    it('should reject without auth', async () => {
      const res = await request(app).post('/api/payment/create-order').send({ items: [{ productId: 'xyz', quantity: 1 }] });
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/payment/verify', () => {
    it('should verify valid payment signature', async () => {
      const razorpayOrderId = 'order_mock_123';
      const razorpayPaymentId = 'pay_mock_456';
      const sign = razorpayOrderId + '|' + razorpayPaymentId;
      const expectedSign = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!).update(sign).digest('hex');

      const res = await request(app)
        .post('/api/payment/verify')
        .set(createAuthHeader(userToken))
        .send({
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: razorpayPaymentId,
          razorpay_signature: expectedSign,
        });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.razorpayPaymentId).toBe(razorpayPaymentId);
    });

    it('should reject invalid payment signature', async () => {
      const res = await request(app)
        .post('/api/payment/verify')
        .set(createAuthHeader(userToken))
        .send({
          razorpay_order_id: 'order_mock_123',
          razorpay_payment_id: 'pay_mock_456',
          razorpay_signature: 'invalid_signature',
        });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/signature/i);
    });
  });
});
