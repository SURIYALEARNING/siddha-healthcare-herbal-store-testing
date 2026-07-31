import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// --- Mocks ---

const mockSendMail = vi.hoisted(
  () => vi.fn().mockResolvedValue({ accepted: ['test@example.com'], rejected: [] }),
);

vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn(() => ({ sendMail: mockSendMail })),
  },
  createTransport: vi.fn(() => ({ sendMail: mockSendMail })),
}));

vi.mock('../../../models/User.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    PendingUser: (actual as any).Otp,
  };
});

// --- SUT & helpers ---

import { registerStep1, verifyOTP, finalRegister } from '../../../controllers/authController.js';
import { createTestUser, createTestPendingUser } from '../../helpers/factories';
import { User, Otp } from '../../../models/User.js';

// --- Tests ---

describe('authController', () => {
  let mockReq: Record<string, any>;
  let mockRes: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('registerStep1', () => {
    it('returns 400 if email already registered', async () => {
      const user = await createTestUser();
      mockReq = { body: { email: user.email, fullName: 'Dup', mobileNumber: '9999999999', password: 'Pass123!' } };
      await registerStep1(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Email already registered.' });
    });

    it('creates pending user with OTP', async () => {
      mockReq = { body: { email: 'new@example.com', fullName: 'New User', mobileNumber: '9999999999', password: 'Pass123!' } };
      await registerStep1(mockReq, mockRes);
      const pending = await Otp.findOne({ email: 'new@example.com' });
      expect(pending).not.toBeNull();
      expect(pending!.otp).toMatch(/^\d{6}$/);
      const passwordValid = await bcrypt.compare('Pass123!', pending!.password);
      expect(passwordValid).toBe(true);
    });

    it('sends OTP email', async () => {
      mockReq = { body: { email: 'mailtest@example.com', fullName: 'Mail', mobileNumber: '8888888888', password: 'Pass123!' } };
      await registerStep1(mockReq, mockRes);
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'mailtest@example.com',
          subject: 'Your Registration OTP',
        }),
      );
    });

    it('returns 200 with success message', async () => {
      mockReq = { body: { email: 'ok@example.com', fullName: 'OK', mobileNumber: '7777777777', password: 'Pass123!' } };
      await registerStep1(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'OTP sent to your email successfully!' });
    });

    it('handles errors with 500', async () => {
      vi.spyOn(User, 'findOne').mockRejectedValueOnce(new Error('DB failure'));
      mockReq = { body: { email: 'err@example.com', fullName: 'Err', mobileNumber: '6666666666', password: 'Pass123!' } };
      await registerStep1(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Registration failed. Please try again.' });
    });
  });

  describe('verifyOTP', () => {
    it('returns 400 for invalid OTP', async () => {
      await createTestPendingUser({ email: 'badotp@example.com', otp: '123456' });
      mockReq = { body: { email: 'badotp@example.com', otp: '000000' } };
      await verifyOTP(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Invalid or expired OTP.' });
    });

    it('returns 400 for expired / no pending user', async () => {
      mockReq = { body: { email: 'ghost@example.com', otp: '123456' } };
      await verifyOTP(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Invalid or expired OTP.' });
    });

    it('returns 200 on successful verification', async () => {
      await createTestPendingUser({ email: 'valid@example.com', otp: '654321' });
      mockReq = { body: { email: 'valid@example.com', otp: '654321' } };
      await verifyOTP(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'OTP verified successfully. Please provide address details.',
      });
    });
  });

  describe('finalRegister', () => {
    it('returns 400 if no pending data (expired session)', async () => {
      mockReq = { body: { email: 'expired@example.com', address: 'Addr', state: 'TN', district: 'CH', pincode: '600001' } };
      await finalRegister(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Session expired. Restart registration.' });
    });

    it('creates user from pending data with address', async () => {
      await createTestPendingUser({
        email: 'final@example.com',
        fullName: 'Final User',
        mobileNumber: '6666666666',
        password: await bcrypt.hash('Secret@1', 10),
        otp: '111111',
      });
      mockReq = { body: { email: 'final@example.com', address: '123 Street', state: 'Tamil Nadu', district: 'Chennai', pincode: '600001' } };
      await finalRegister(mockReq, mockRes);
      const user = await User.findOne({ email: 'final@example.com' });
      expect(user).not.toBeNull();
      expect(user!.fullName).toBe('Final User');
      expect(user!.address.address).toBe('123 Street');
      expect(user!.address.state).toBe('Tamil Nadu');
      expect(user!.address.district).toBe('Chennai');
      expect(user!.address.pincode).toBe('600001');
    });

    it('cleans up pending user', async () => {
      await createTestPendingUser({ email: 'cleanup@example.com', otp: '222222' });
      mockReq = { body: { email: 'cleanup@example.com', address: 'Addr', state: 'S', district: 'D', pincode: '123456' } };
      await finalRegister(mockReq, mockRes);
      const remaining = await Otp.findOne({ email: 'cleanup@example.com' });
      expect(remaining).toBeNull();
    });

    it('returns 201 with created user', async () => {
      await createTestPendingUser({ email: 'created@example.com', fullName: 'Created User', otp: '333333' });
      mockReq = { body: { email: 'created@example.com', address: 'Addr', state: 'S', district: 'D', pincode: '123456' } };
      await finalRegister(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      const body = mockRes.json.mock.calls[0][0];
      expect(body.message).toBe('User registered successfully!');
      expect(body.user.email).toBe('created@example.com');
      expect(body.user.fullName).toBe('Created User');
    });

    it('handles errors with 500', async () => {
      await createTestPendingUser({ email: 'errend@example.com', otp: '444444' });
      vi.spyOn(User.prototype, 'save').mockRejectedValueOnce(new Error('Save failed'));
      mockReq = { body: { email: 'errend@example.com', address: 'A', state: 'S', district: 'D', pincode: '123456' } };
      await finalRegister(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Registration failed. Please try again.' });
    });
  });
});
