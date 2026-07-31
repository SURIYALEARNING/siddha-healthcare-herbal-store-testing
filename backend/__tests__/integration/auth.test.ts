import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';

vi.mock('../../config/mailer.js', () => ({
  sendOtpEmail: vi.fn().mockResolvedValue({ accepted: ['test@example.com'] }),
}));

import { createTestApp } from '../helpers/testApp.js';
import { createTestUser, generateToken, createAuthHeader } from '../helpers/factories.js';
import { User, Otp } from '../../models/User.js';

const app = createTestApp();

describe('Auth Integration', () => {
  describe('POST /auth/register - Step 1: Send OTP', () => {
    it('should send OTP for new email', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({ fullName: 'New User', email: 'new@example.com', mobileNumber: '9988776655', password: 'Pass@123' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/OTP sent/i);

      const otpRecord = await Otp.findOne({ email: 'new@example.com' });
      expect(otpRecord).not.toBeNull();
      expect(otpRecord!.otp).toMatch(/^\d{6}$/);
    });

    it('should reject duplicate email', async () => {
      await createTestUser({ email: 'dup@example.com' });
      const res = await request(app)
        .post('/auth/register')
        .send({ fullName: 'Dup', email: 'dup@example.com', mobileNumber: '9988776655', password: 'Pass@123' });
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/already registered/i);
    });

    it('should return 500 for missing fields', async () => {
      const res = await request(app).post('/auth/register').send({});
      expect(res.status).toBe(500);
    });
  });

  describe('POST /auth/verify-otp - Step 2: Verify OTP & create user', () => {
    it('should create user with valid OTP', async () => {
      await request(app).post('/auth/register').send({ fullName: 'OTP User', email: 'otp@example.com', mobileNumber: '9988776655', password: 'Pass@123' });
      const otpRecord = await Otp.findOne({ email: 'otp@example.com' });
      expect(otpRecord).not.toBeNull();

      const res = await request(app).post('/auth/verify-otp').send({ email: 'otp@example.com', otp: otpRecord!.otp });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const user = await User.findOne({ email: 'otp@example.com' });
      expect(user).not.toBeNull();
      expect(user!.fullName).toBe('OTP User');
    });

    it('should reject invalid OTP', async () => {
      const res = await request(app).post('/auth/verify-otp').send({ email: 'otp@example.com', otp: '000000' });
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Invalid OTP/i);
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      const { User } = await import('../../models/User.js');
      const bcrypt = await import('bcryptjs');
      const hash = await bcrypt.hash('TestPass@1', 10);
      await User.create({ fullName: 'Login User', email: 'login@example.com', mobileNumber: '9988776655', password: hash, isAdmin: false, role: 'USER' });
    });

    it('should login with valid credentials', async () => {
      const res = await request(app).post('/auth/login').send({ email: 'login@example.com', password: 'TestPass@1' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe('login@example.com');
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('should reject wrong password', async () => {
      const res = await request(app).post('/auth/login').send({ email: 'login@example.com', password: 'WrongPassword' });
      expect(res.status).toBe(401);
    });

    it('should reject non-existent email', async () => {
      const res = await request(app).post('/auth/login').send({ email: 'nobody@example.com', password: 'TestPass@1' });
      expect(res.status).toBe(401);
    });
  });

  describe('POST /auth/refresh', () => {
    it('should refresh access token with valid refresh token cookie', async () => {
      const user = await createTestUser({ email: 'refresh@example.com' });
      const jwt = await import('jsonwebtoken');
      const refreshToken = jwt.default.sign({ id: user._id.toString() }, process.env.REFRESH_TOKEN_SECRET!, { expiresIn: '7d' });

      const res = await request(app).post('/auth/refresh').set('Cookie', [`refreshToken=${refreshToken}`]);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.user).toBeDefined();
    });

    it('should reject missing refresh token', async () => {
      const res = await request(app).post('/auth/refresh');
      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/No refresh token/i);
    });

    it('should reject invalid refresh token', async () => {
      const res = await request(app).post('/auth/refresh').set('Cookie', ['refreshToken=invalidtoken']);
      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/Invalid or expired/i);
    });
  });

  describe('POST /auth/logout', () => {
    it('should clear refresh token cookie', async () => {
      const res = await request(app).post('/auth/logout');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Token validation middleware', () => {
    it('should reject request without token', async () => {
      const res = await request(app).get('/api/orders');
      expect(res.status).toBe(401);
    });

    it('should reject request with invalid token', async () => {
      const res = await request(app).get('/api/orders').set(createAuthHeader('invalidtoken'));
      expect(res.status).toBe(403);
    });

    it('should reject expired token', async () => {
      const jwt = await import('jsonwebtoken');
      const expired = jwt.default.sign({ id: new mongoose.Types.ObjectId().toString(), isAdmin: false }, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '0s' });
      const res = await request(app).get('/api/orders').set(createAuthHeader(expired));
      expect(res.status).toBe(403);
    });
  });

  describe('GET /auth/google', () => {
    it('should initiate Google OAuth', async () => {
      const res = await request(app).get('/auth/google');
      expect(res.status).toBe(302);
      expect(res.headers.location).toContain('accounts.google.com');
    });
  });
});
