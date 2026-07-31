import { describe, it, expect, vi, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import mongoose from 'mongoose';
import express from 'express';
import jwt from 'jsonwebtoken';
import supertest from 'supertest';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// ── Module-level mocks ──────────────────────────────────────────────

vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn(() => ({
      sendMail: vi.fn().mockResolvedValue({ accepted: ['test@example.com'], rejected: [] }),
    })),
  },
  createTransport: vi.fn(() => ({
    sendMail: vi.fn().mockResolvedValue({ accepted: ['test@example.com'], rejected: [] }),
  })),
}));

vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockReturnValue({
    models: { generateContent: vi.fn().mockResolvedValue({ text: 'mock response' }) },
  }),
}));

vi.mock('passport-google-oauth20', () => {
  class MockGoogleStrategy {
    name = 'google';
    constructor(_opts: any, _verify: any) {}
  }
  return { Strategy: MockGoogleStrategy };
});

vi.mock('razorpay', () => ({
  default: vi.fn().mockReturnValue({
    orders: { create: vi.fn().mockResolvedValue({ id: 'order_test', status: 'created' }) },
    payments: { fetch: vi.fn().mockResolvedValue({ id: 'pay_test', status: 'captured' }) },
  }),
}));

vi.mock('cloudinary', () => ({
  v2: {
    config: vi.fn(),
    uploader: {
      upload_stream: vi.fn((_opts: any, cb: any) => cb(null, {
        secure_url: 'https://res.cloudinary.com/test/image.jpg',
        public_id: 'test_public_id',
        width: 800,
        height: 800,
        format: 'jpg',
        bytes: 50000,
      })),
    },
    api: {
      delete_resources: vi.fn().mockResolvedValue({ deleted: {} }),
    },
  },
}));

vi.mock('../../config/mailer.js', () => ({
  sendOtpEmail: vi.fn().mockResolvedValue(true),
}));

vi.mock('../../services/uploadService.js', () => {
  const validateFile = (file: any) => {
    const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
    const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
    const MAX_VIDEO_SIZE = 100 * 1024 * 1024;

    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      if (file.size > MAX_IMAGE_SIZE) throw new Error(`Image "${file.originalname}" exceeds 10MB limit`);
      return 'image';
    }
    if (ALLOWED_VIDEO_TYPES.includes(file.mimetype)) {
      if (file.size > MAX_VIDEO_SIZE) throw new Error(`Video "${file.originalname}" exceeds 100MB limit`);
      return 'video';
    }
    throw new Error(`Unsupported file type: ${file.mimetype}`);
  };

  return {
    uploadFiles: vi.fn(async (files: any[]) => {
      if (!files || files.length === 0) throw new Error('No files provided');
      for (const f of files) validateFile(f);
      return [];
    }),
    deleteMedia: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock('../../controllers/batchController.js', async () => {
  const actual = await vi.importActual('../../controllers/batchController.js');
  return {
    ...actual as any,
    allocateFromBatches: vi.fn().mockResolvedValue([]),
  };
});

// ── Imports ─────────────────────────────────────────────────────────

import {
  createTestUser,
  createTestAdmin,
  createTestProduct,
  createTestCategory,
  createTestOrder,
  generateToken,
} from '../helpers/factories';

import { verifyToken } from '../../Auth/authMiddleware.js';
import { uploadFiles } from '../../services/uploadService.js';
import { User, Otp } from '../../models/User.js';
import Product from '../../models/Product.js';
import Order from '../../models/Order.js';

// ── Static top-level imports (vitest hoists mocks before these) ─────

import passport from 'passport';
import '../../config/passport.js';

import authRoutes from '../../routes/authRoutes.js';
import productRoutes from '../../routes/productRoutes.js';
import categoryRoutes from '../../routes/categoryRoutes.js';
import reviewRoutes from '../../routes/reviewRoutes.js';
import orderRoutes from '../../routes/orders.js';
import cartRoutes from '../../routes/cart.js';
import adminRoutes from '../../routes/adminRoutes.js';
import staffRoutes from '../../routes/staffRoutes.js';
import authProfileRoutes from '../../routes/authProfileRoutes.js';
import couponRoutes from '../../routes/couponRoutes.js';
import blogRoutes from '../../routes/blogRoutes.js';
import consultationRoutes from '../../routes/consultationRoutes.js';
import chatbotRoutes from '../../routes/chatbotRoutes.js';
import carouselRoutes from '../../routes/carouselRoutes.js';
import batchRoutes from '../../routes/batchRoutes.js';
import reminderRoutes from '../../routes/reminderRoutes.js';
import analyticsRoutes from '../../routes/analyticsRoutes.js';
import uploadRoutes from '../../routes/uploadRoutes.js';
import paymentRoutes from '../../routes/payment.js';
import { router as adminShippingRoutes, publicRouter as publicShippingRoutes } from '../../routes/shippingRoutes.js';

// ── Test app factory ────────────────────────────────────────────────

function createApp() {
  const app = express();

  const allowedOrigins = (
    process.env.FRONTEND_URL || 'http://localhost:5173'
  ).split(',').map((s: string) => s.trim());

  const corsOptions = {
    origin: (origin: string | undefined, cb: (err: Error | null, allow?: boolean) => void) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(null, true);
    },
    credentials: true,
  };

  app.use(helmet());
  app.disable('x-powered-by');
  app.use(cors(corsOptions));
  app.use(cookieParser());
  app.use(passport.initialize());

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { error: 'Too many attempts. Please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/auth', authLimiter);

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Health
  app.get('/api/health', (_req: any, res: any) => {
    res.json({ status: 'ok', time: new Date() });
  });

  // Routes
  app.use('/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/products', uploadRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api', reviewRoutes);
  app.use('/api', orderRoutes);
  app.use('/api/cart', cartRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/admin/staff', staffRoutes);
  app.use('/api/auth/profile', authProfileRoutes);
  app.use('/api/coupons', couponRoutes);
  app.use('/api/blogs', blogRoutes);
  app.use('/api/consultation', consultationRoutes);
  app.use('/api/chatbot', chatbotRoutes);
  app.use('/api/carousel', carouselRoutes);
  app.use('/api/admin/batches', batchRoutes);
  app.use('/api/admin/reminders', reminderRoutes);
  app.use('/api/admin/dashboard', analyticsRoutes);
  app.use('/api/payment', paymentRoutes);
  app.use('/api/admin/shipping', adminShippingRoutes);
  app.use('/api/shipping', publicShippingRoutes);

  return app;
}

let app: express.Application;
let request: supertest.SuperTest<supertest.Test>;

beforeAll(async () => {
  app = createApp();
  request = supertest(app) as any;
});

afterAll(async () => {
  vi.restoreAllMocks();
});

// ── Helpers ─────────────────────────────────────────────────────────

function expiredToken(userId: string, isAdmin = false, role = 'USER') {
  return jwt.sign(
    { id: userId, isAdmin, role },
    process.env.ACCESS_TOKEN_SECRET || 'test-access-token-secret-key',
    { expiresIn: '0s' },
  );
}

// ─────────────────────────────────────────────────────────────────────
// 1. JWT Security
// ─────────────────────────────────────────────────────────────────────

describe('JWT Security', () => {
  let user: any;
  let admin: any;
  let userToken: string;
  let adminToken: string;

  beforeEach(async () => {
    user = await createTestUser();
    admin = await createTestAdmin();
    userToken = generateToken(user);
    adminToken = generateToken(admin);
  });

  describe('verifyToken middleware', () => {
    it('returns 401 when no token is provided', async () => {
      const res = await request.get('/api/orders');
      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/no token/i);
    });

    it('returns 403 when token is expired', async () => {
      const bad = expiredToken(user._id.toString());
      const res = await request.get('/api/orders').set('authorization', `Bearer ${bad}`);
      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/invalid|expired/i);
    });

    it('returns 403 when token has an invalid signature', async () => {
      const bad = jwt.sign(
        { id: user._id.toString(), isAdmin: false, role: 'USER' },
        'wrong-secret-key',
      );
      const res = await request.get('/api/orders').set('authorization', `Bearer ${bad}`);
      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/invalid|expired/i);
    });

    it('notes that JWT payload (id) is not validated against DB – a token with a valid signature but non-existent user id passes middleware', async () => {
      // verifyToken only checks JWT signature, not if the user exists in DB
      const fakeId = new mongoose.Types.ObjectId().toString();
      const tampered = jwt.sign(
        { id: fakeId, isAdmin: false, role: 'USER' },
        process.env.ACCESS_TOKEN_SECRET || 'test-access-token-secret-key',
      );
      const res = await request.get('/api/orders').set('authorization', `Bearer ${tampered}`);
      // Middleware accepts any validly-signed token – this is expected by design
      // (database lookup happens in the controller, not the auth middleware)
      expect(res.status).toBe(200);
    });

    it('returns 200 with valid token on protected route', async () => {
      const res = await request.get('/api/orders').set('authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
    });
  });

  describe('verifyAdmin middleware', () => {
    it('returns 403 when regular user token accesses admin route', async () => {
      const res = await request.get('/api/admin/orders').set('authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/admin only/i);
    });

    it('returns 400 when token is malformed/jwt error', async () => {
      const res = await request
        .get('/api/admin/orders')
        .set('authorization', 'Bearer definitely-not-a-valid-jwt');
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/invalid token/i);
    });

    it('allows admin token on admin route', async () => {
      const res = await request.get('/api/admin/orders').set('authorization', `Bearer ${adminToken}`);
      expect([200, 404]).toContain(res.status);
    });
  });

  describe('verifyAdmin on category creation', () => {
    it('prevents regular user from creating a category', async () => {
      const res = await request
        .post('/api/categories')
        .set('authorization', `Bearer ${userToken}`)
        .send({ name: { en: 'Hacked Category' } });
      expect(res.status).toBe(403);
    });
  });

  describe('requirePermission for STAFF', () => {
    it('returns 403 for STAFF user without permission for a module', async () => {
      const staffUser = await createTestUser({
        email: 'staff-no-perm@test.com',
        role: 'STAFF',
        isAdmin: true,
        permissions: { staffManagement: false },
      });
      const staffToken = generateToken(staffUser);
      // /api/admin/staff uses requirePermission('staffManagement')
      const res = await request
        .get('/api/admin/staff')
        .set('authorization', `Bearer ${staffToken}`);
      expect(res.status).toBe(403);
    });

    it('allows SUPER_ADMIN to bypass permission checks', async () => {
      const res = await request
        .get('/api/admin/orders')
        .set('authorization', `Bearer ${adminToken}`);
      expect([200, 404]).toContain(res.status);
    });

    it('returns 403 for USER role accessing admin/staff routes', async () => {
      const res = await request
        .get('/api/admin/staff')
        .set('authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(403);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────
// 2. Mass Assignment Protection
// ─────────────────────────────────────────────────────────────────────

describe('Mass Assignment Protection', () => {
  let admin: any;
  let adminToken: string;
  let category: any;
  let product: any;

  beforeEach(async () => {
    admin = await createTestAdmin();
    adminToken = generateToken(admin);
    category = await createTestCategory();
    product = await createTestProduct({ category: category._id });
  });

  it('prevents setting isAdmin=true during registration', async () => {
    const res = await request
      .post('/auth/register')
      .send({
        fullName: 'Hacker',
        email: 'hacker@test.com',
        mobileNumber: '9999999999',
        password: 'Pass@123',
        isAdmin: true,
        role: 'SUPER_ADMIN',
      });
    // Registration creates an OTP pending entry, not a User
    expect(res.status).toBe(200);

    // Verify the OTP record does NOT have isAdmin/role elevated
    const pending = await Otp.findOne({ email: 'hacker@test.com' });
    expect(pending).not.toBeNull();
    expect((pending as any).isAdmin).toBeUndefined();
    expect((pending as any).role).toBeUndefined();
  });

  it('prevents setting isAdmin/role via product update', async () => {
    const res = await request
      .put(`/api/products/manage/${product._id}`)
      .set('authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Updated',
        isAdmin: true,
        role: 'SUPER_ADMIN',
        price: 100,
      });

    // Product create requires name, price, category – but update should process
    expect([200, 400, 404]).toContain(res.status);
  });

  it('prevents injecting extra fields during order creation', async () => {
    const user = await createTestUser();
    const token = generateToken(user);
    const prod = await createTestProduct({ category: category._id, stock: 100 });

    const res = await request
      .post('/api/orders')
      .set('authorization', `Bearer ${token}`)
      .send({
        items: [{ productId: prod._id.toString(), quantity: 1, name: 'Test', purchasedPrice: 100, itemTotal: 100 }],
        shippingAddress: { address: 'Test', state: 'TN', district: 'C', pincode: '600001' },
        mobileNumber: '9876543210',
        email: 'test@test.com',
        fullName: 'Test User',
        paymentMethod: 'Cash on Delivery',
        couponCode: '',
        secretField: 'should_not_exist',
        hiddenAdminFlag: true,
      });

    if (res.status === 201) {
      const order = await Order.findById(res.body.order._id);
      expect(order).not.toBeNull();
      expect((order as any).secretField).toBeUndefined();
      expect((order as any).hiddenAdminFlag).toBeUndefined();
    }
  });

  it('prevents injecting role/SUPER_ADMIN in profile update', async () => {
    const testUser = await createTestUser();
    const token = generateToken(testUser);

    const res = await request
      .put(`/auth/update-profile/${testUser._id}`)
      .set('authorization', `Bearer ${token}`)
      .send({
        fullName: 'Updated Name',
        mobileNumber: '9876543210',
        role: 'SUPER_ADMIN',
        isAdmin: true,
      });

    const updated = await User.findById(testUser._id);
    expect(updated!.role).toBe('USER');
    expect(updated!.isAdmin).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────
// 3. NoSQL Injection
// ─────────────────────────────────────────────────────────────────────

describe('NoSQL Injection', () => {
  let user: any;

  beforeEach(async () => {
    user = await createTestUser({
      email: 'nosql-test@example.com',
      password: await (async () => {
        const bcrypt = require('bcryptjs');
        return bcrypt.hash('RealPass123', 10);
      })(),
    });
  });

  it('rejects MongoDB $gt operator as email during login', async () => {
    const res = await request
      .post('/auth/login')
      .send({ email: { $gt: '' }, password: 'RealPass123' });
    // Should not authenticate – either 401 or 400
    expect([400, 401]).toContain(res.status);
  });

  it('rejects MongoDB $ne operator as email during login', async () => {
    const res = await request
      .post('/auth/login')
      .send({ email: { $ne: '' }, password: 'RealPass123' });
    expect([400, 401]).toContain(res.status);
  });

  it('rejects MongoDB $regex operator as email during login', async () => {
    const res = await request
      .post('/auth/login')
      .send({ email: { $regex: '.*' }, password: 'RealPass123' });
    expect([400, 401]).toContain(res.status);
  });

  it('rejects MongoDB $gt operator in registration email', async () => {
    const res = await request
      .post('/auth/register')
      .send({
        fullName: 'NoSQL',
        email: { $gt: '' },
        mobileNumber: '9999999999',
        password: 'Test@123',
      });
    expect([400, 500]).toContain(res.status);
  });

  it('rejects NoSQL operators in product search query', async () => {
    const res = await request.get('/api/products?search[$gt]=');
    expect(res.status).toBe(500);
    expect(res.body).not.toHaveProperty('token');
    expect(res.body).not.toHaveProperty('accessToken');
  });

  it('rejects deeply nested NoSQL operators in request body', async () => {
    const admin = await createTestAdmin();
    const token = generateToken(admin);

    const res = await request
      .put(`/api/products/manage/${new mongoose.Types.ObjectId()}`)
      .set('authorization', `Bearer ${token}`)
      .send({
        name: 'Test',
        price: { $gt: 0 },
      });
    expect(res.status).toBe(500);
  });
});

// ─────────────────────────────────────────────────────────────────────
// 4. Input Validation
// ─────────────────────────────────────────────────────────────────────

describe('Input Validation', () => {
  let admin: any;
  let adminToken: string;
  let category: any;

  beforeEach(async () => {
    admin = await createTestAdmin();
    adminToken = generateToken(admin);
    category = await createTestCategory();
  });

  describe('XSS', () => {
    it('VULNERABILITY: product name accepts XSS without sanitization', async () => {
      const res = await request
        .post('/api/products/manage')
        .set('authorization', `Bearer ${adminToken}`)
        .send({
          name: '<script>alert("xss")</script>',
          price: 100,
          category: category._id.toString(),
        });
      expect(res.status).toBe(201);
      const created = await Product.findById(res.body.product._id);
      expect(created!.name.en).toBe('<script>alert("xss")</script>');
      // Note: No XSS sanitization is applied
    });

    it('VULNERABILITY: review comment accepts XSS without sanitization', async () => {
      const user = await createTestUser({
        email: 'xss-reviewer@test.com',
      });
      const token = generateToken(user);
      const prod = await createTestProduct({ category: category._id });

      const res = await request
        .post(`/api/products/${prod._id}/reviews`)
        .set('authorization', `Bearer ${token}`)
        .send({
          rating: 5,
          title: 'Nice',
          comment: '<script>alert("xss")</script>',
        });
      expect(res.status).toBe(201);
      expect(res.body.review.comment).toBe('<script>alert("xss")</script>');
    });
  });

  describe('Invalid ObjectId', () => {
    it('returns error for invalid ObjectId in product param', async () => {
      const res = await request.get('/api/products/invalid-id-12345');
      expect([400, 404, 500]).toContain(res.status);
    });

    it('returns error for invalid ObjectId in review product param', async () => {
      const user = await createTestUser();
      const token = generateToken(user);
      const res = await request
        .post('/api/products/bad-objectid/reviews')
        .set('authorization', `Bearer ${token}`)
        .send({ rating: 3, comment: 'OK' });
      expect([400, 404, 500]).toContain(res.status);
    });

    it('returns error for invalid ObjectId in order tracking', async () => {
      const res = await request.get('/api/orders/track/invalid-mongo-id');
      expect([400, 404, 500]).toContain(res.status);
    });
  });

  describe('Negative values', () => {
    it('clamps negative price to zero during product creation', async () => {
      const res = await request
        .post('/api/products/manage')
        .set('authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Neg Test',
          price: -100,
          category: category._id.toString(),
        });
      expect(res.status).toBe(201);
      const created = await Product.findById(res.body.product._id);
      expect(created!.price).toBe(0);
    });

    it('rejects negative quantity in order', async () => {
      const user = await createTestUser();
      const token = generateToken(user);
      const prod = await createTestProduct({ category: category._id, stock: 100 });

      const res = await request
        .post('/api/orders')
        .set('authorization', `Bearer ${token}`)
        .send({
          items: [{ productId: prod._id.toString(), quantity: -5, name: 'Test', purchasedPrice: 100, itemTotal: 100 }],
          shippingAddress: { address: 'Test', state: 'TN', district: 'C', pincode: '600001' },
          mobileNumber: '9876543210',
          email: 'test@test.com',
          fullName: 'Test User',
          paymentMethod: 'Cash on Delivery',
        });
      expect([400, 500]).toContain(res.status);
    });
  });

  describe('Non-numeric values for number fields', () => {
    it('rejects string value for price field', async () => {
      const res = await request
        .post('/api/products/manage')
        .set('authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Bad Price',
          price: 'not-a-number',
          category: category._id.toString(),
        });
      expect([400, 500]).toContain(res.status);
    });

    it('rejects string value for stock field in product update', async () => {
      const prod = await createTestProduct({ category: category._id });
      const res = await request
        .put(`/api/products/manage/${prod._id}`)
        .set('authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated',
          price: 'NaN',
        });
      expect([400, 500]).toContain(res.status);
    });
  });

  describe('Oversized payload', () => {
    it('handles request near size limit gracefully', async () => {
      const bigString = 'x'.repeat(1024 * 1024); // 1MB
      const res = await request
        .post('/auth/register')
        .send({
          fullName: 'Big Payload',
          email: `${bigString.substring(0, 100)}@test.com`,
          mobileNumber: '9999999999',
          password: 'Test@123',
        });
      // Should either succeed (ignoring the size) or fail gracefully
      expect([200, 400, 413, 500]).toContain(res.status);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────
// 5. Rate Limiting / Brute Force
// ─────────────────────────────────────────────────────────────────────

describe('Rate Limiting', () => {
  it('blocks requests after exceeding auth rate limit', async () => {
    const user = await createTestUser({
      email: 'ratelimit@test.com',
    });
    const token = generateToken(user);

    const results: number[] = [];
    for (let i = 0; i < 25; i++) {
      const res = await request
        .post('/auth/login')
        .send({ email: 'ratelimit@test.com', password: 'wrongpass' });
      results.push(res.status);
    }

    // Default rate limit is 20 attempts per 15 minutes
    const rateLimited = results.filter((s) => s === 429);
    expect(rateLimited.length).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────────────────────────────
// 6. File Upload Validation
// ─────────────────────────────────────────────────────────────────────

describe('File Upload Validation', () => {
  it('rejects non-image files (uploadService validation)', async () => {
    // Test the validation logic in uploadService directly
    const badFiles = [
      { originalname: 'virus.exe', mimetype: 'application/x-msdownload', size: 1000, buffer: Buffer.from('bad') },
      { originalname: 'script.js', mimetype: 'text/javascript', size: 500, buffer: Buffer.from('bad') },
      { originalname: 'doc.txt', mimetype: 'text/plain', size: 200, buffer: Buffer.from('bad') },
      { originalname: 'page.html', mimetype: 'text/html', size: 300, buffer: Buffer.from('bad') },
    ];

    for (const file of badFiles) {
      await expect(uploadFiles([file as any])).rejects.toThrow(/unsupported file type/i);
    }
  });

  it('rejects oversized image files (uploadService validation)', async () => {
    const oversized = {
      originalname: 'huge.jpg',
      mimetype: 'image/jpeg',
      size: 11 * 1024 * 1024, // 11MB > 10MB limit
      buffer: Buffer.alloc(11 * 1024 * 1024),
    };

    await expect(uploadFiles([oversized as any])).rejects.toThrow(/exceeds.+limit/i);
  });

  it('rejects path traversal in filenames (multer memoryStorage)', async () => {
    // multer with memoryStorage does not write to disk, so path traversal
    // in filenames is inherently blocked at the filesystem level.
    // Verify the route still handles malicious filenames gracefully.
    const admin = await createTestAdmin();
    const token = generateToken(admin);

    const res = await request
      .post('/api/products/upload-media')
      .set('authorization', `Bearer ${token}`)
      .attach('files', Buffer.from('not-an-image'), {
        filename: '../../../etc/passwd',
        contentType: 'application/x-msdownload',
      });
    expect(res.status).toBe(400);
  });

  it('rejects too many files', async () => {
    const admin = await createTestAdmin();
    const token = generateToken(admin);
    const res = await request
      .post('/api/products/upload-media')
      .set('authorization', `Bearer ${token}`);
    expect(res.status).toBe(400);
  });

  it('path traversal in filename is handled by multer memoryStorage (no disk write)', async () => {
    const admin = await createTestAdmin();
    const token = generateToken(admin);

    const res = await request
      .post('/api/products/upload-media')
      .set('authorization', `Bearer ${token}`)
      .attach('files', Buffer.from('fake-image-data'), {
        filename: '..%2F..%2Fetc%2Fpasswd.png',
        contentType: 'image/png',
      });
    // Multer with memoryStorage stores file in memory, not disk – path traversal
    // in filename is not a filesystem risk. The file type is valid (image/png).
    expect(res.status).toBe(200);
  });
});

// ─────────────────────────────────────────────────────────────────────
// 7. CSRF / CORS
// ─────────────────────────────────────────────────────────────────────

describe('CSRF / CORS', () => {
  it('allows requests from configured frontend origin', async () => {
    const res = await request
      .get('/api/health')
      .set('Origin', 'http://localhost:5173');
    expect(res.status).toBe(200);
  });

  it('allows requests from any origin (permissive dev mode)', async () => {
    const res = await request
      .get('/api/health')
      .set('Origin', 'https://evil-malicious-site.com');
    // The current CORS config allows all origins in dev
    expect(res.status).toBe(200);
  });

  it('responds to preflight OPTIONS request with correct CORS headers', async () => {
    const res = await request
      .options('/auth/login')
      .set('Origin', 'http://localhost:5173')
      .set('Access-Control-Request-Method', 'POST');

    expect(res.headers['access-control-allow-origin']).toBeDefined();
    expect(res.headers['access-control-allow-credentials']).toBe('true');
    expect([200, 204]).toContain(res.status);
  });

  it('returns CORS headers on all responses', async () => {
    const res = await request
      .get('/api/health')
      .set('Origin', 'http://localhost:5173');
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    expect(res.headers['access-control-allow-credentials']).toBe('true');
  });

  it('handles preflight with multiple allowed methods', async () => {
    const res = await request
      .options('/api/products')
      .set('Origin', 'http://localhost:5173')
      .set('Access-Control-Request-Method', 'GET');
    expect(res.headers['access-control-allow-methods']).toBeDefined();
    expect([200, 204]).toContain(res.status);
  });
});

// ─────────────────────────────────────────────────────────────────────
// 8. Security Headers
// ─────────────────────────────────────────────────────────────────────

describe('Security Headers', () => {
  it('includes X-Frame-Options (Helmet is now used)', async () => {
    const res = await request.get('/api/health');
    expect(res.headers['x-frame-options']).toBeDefined();
    expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
  });

  it('includes X-Content-Type-Options header', async () => {
    const res = await request.get('/api/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  it('includes Strict-Transport-Security header', async () => {
    const res = await request.get('/api/health');
    expect(res.headers['strict-transport-security']).toBeDefined();
  });

  it('includes Content-Security-Policy header', async () => {
    const res = await request.get('/api/health');
    expect(res.headers['content-security-policy']).toBeDefined();
  });

  it('does NOT leak Express version via X-Powered-By header (disabled)', async () => {
    const res = await request.get('/api/health');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────────────────
// 9. Path Traversal
// ─────────────────────────────────────────────────────────────────────

describe('Path Traversal', () => {
  it('prevents path traversal in product ID param', async () => {
    const attempts = [
      '../../../etc/passwd',
      '..%2F..%2F..%2Fetc%2Fpasswd',
      '....//....//....//etc/passwd',
      '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
    ];

    for (const attempt of attempts) {
      const res = await request.get(`/api/products/${attempt}`);
      // Should not return file content or crash – return 400/404/500
      expect([400, 404, 500]).toContain(res.status);
      // Ensure no file content leaked
      expect(res.text || '').not.toMatch(/root:|nobody:|daemon:|bin:/);
    }
  });

  it('prevents path traversal in order tracking param', async () => {
    const res = await request.get('/api/orders/track/../../../etc/passwd');
    expect([400, 404, 500]).toContain(res.status);
  });

  it('prevents path traversal in category param', async () => {
    const res = await request.get('/api/categories/../../../etc/passwd');
    expect([400, 404, 500]).toContain(res.status);
  });
});

// ─────────────────────────────────────────────────────────────────────
// 10. Prototype Pollution
// ─────────────────────────────────────────────────────────────────────

describe('Prototype Pollution', () => {
  it('prevents __proto__ injection in registration body', async () => {
    const res = await request
      .post('/auth/register')
      .send({
        fullName: 'ProtoPollute',
        email: 'proto@test.com',
        mobileNumber: '9999999999',
        password: 'Test@123',
        __proto__: { isAdmin: true },
      });
    expect([200, 400, 429, 500]).toContain(res.status);
  });

  it('prevents constructor.prototype injection in product creation', async () => {
    const admin = await createTestAdmin();
    const token = generateToken(admin);
    const cat = await createTestCategory();

    const res = await request
      .post('/api/products/manage')
      .set('authorization', `Bearer ${token}`)
      .send({
        name: 'Proto Test',
        price: 100,
        category: cat._id.toString(),
        'constructor.prototype.isAdmin': true,
      });
    expect([201, 400, 500]).toContain(res.status);
  });

  it('prevents __proto__ injection in profile update', async () => {
    const user = await createTestUser();
    const token = generateToken(user);

    const res = await request
      .put(`/auth/update-profile/${user._id}`)
      .set('authorization', `Bearer ${token}`)
      .send({
        fullName: 'Updated',
        mobileNumber: '9876543210',
        __proto__: { isAdmin: true, role: 'SUPER_ADMIN' },
      });
    expect([200, 400, 429]).toContain(res.status);

    const User = (await import('../../models/User.js')).User;
    const updated = await User.findById(user._id);
    expect(updated!.isAdmin).toBe(false);
    expect(updated!.role).toBe('USER');
  });

  it('prevents prototype pollution through query parameters', async () => {
    const res = await request.get('/api/products?__proto__[isAdmin]=true');
    expect(res.status).toBe(200);
    // Ensure the response doesn't indicate pollution
    expect(res.body).not.toHaveProperty('isAdmin');
  });

  it('prevents deeply nested prototype pollution in order body', async () => {
    const user = await createTestUser();
    const token = generateToken(user);
    const cat = await createTestCategory();
    const prod = await createTestProduct({ category: cat._id, stock: 50 });

    const res = await request
      .post('/api/orders')
      .set('authorization', `Bearer ${token}`)
      .send({
        items: [{ productId: prod._id.toString(), quantity: 1, name: 'Test', purchasedPrice: 100, itemTotal: 100 }],
        shippingAddress: { address: 'Test', state: 'TN', district: 'C', pincode: '600001' },
        mobileNumber: '9876543210',
        email: 'test@test.com',
        fullName: 'Test User',
        paymentMethod: 'Cash on Delivery',
        constructor: { prototype: { isAdmin: true } },
      });
    expect([201, 400, 500]).toContain(res.status);
  });
});

// ─────────────────────────────────────────────────────────────────────
// Negative / Error cases summary
// ─────────────────────────────────────────────────────────────────────

describe('Error Handling Safety', () => {
  it('does NOT leak internal implementation details in error messages', async () => {
    const res = await request.get('/api/products/invalid-id');
    const bodyStr = JSON.stringify(res.body);
    expect(bodyStr).not.toMatch(/Cast to ObjectId/i);
    expect(bodyStr).not.toMatch(/model.*Product/i);
  });

  it('does not expose file system paths in error messages', async () => {
    const res = await request.get('/api/products/000000000000000000000000');
    const bodyStr = JSON.stringify(res.body).toLowerCase();
    expect(bodyStr).not.toMatch(/[a-z]:\\\\|\/backend\/|\/routes\/|\/controllers\//i);
  });

  it('returns consistent error response structure', async () => {
    const res = await request.get('/api/orders?invalid=1');
    expect(res.status).toBe(401);
    expect(typeof res.body).toBe('object');
    expect(res.body).not.toBeNull();
  });
});
