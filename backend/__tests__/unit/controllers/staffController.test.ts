import { describe, it, expect, vi, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import * as staffController from '../../../controllers/staffController.js';
import { User } from '../../../models/User.js';
import { createTestAdmin, createTestUser } from '../../helpers/factories';

function mockReq(overrides: any = {}) {
  return {
    params: {},
    body: {},
    query: {},
    user: null,
    ...overrides,
  };
}

function mockRes() {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

async function createTestStaff(overrides: any = {}) {
  const password = await bcrypt.hash('Staff@123', 10);
  return User.create({
    fullName: 'Staff User',
    email: 'staff@example.com',
    mobileNumber: '9876543212',
    password,
    isAdmin: true,
    role: 'STAFF',
    isActive: true,
    permissions: {
      dashboard: true, products: false, categories: false, orders: false,
      customers: false, batches: false, reminders: false, reviews: false,
      coupons: false, carousel: false, consultations: false, shipping: false,
      staffManagement: false,
    },
    ...overrides,
  });
}

describe('staffController', () => {
  describe('getStaffList', () => {
    it('should return all staff members', async () => {
      await createTestStaff({ fullName: 'Staff A', email: 'a@test.com' });
      await createTestStaff({ fullName: 'Staff B', email: 'b@test.com' });

      const req = mockReq();
      const res = mockRes();

      await staffController.getStaffList(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ fullName: 'Staff A' }),
          expect.objectContaining({ fullName: 'Staff B' }),
        ]),
      );
    });

    it('should return empty array when no staff exists', async () => {
      const req = mockReq();
      const res = mockRes();

      await staffController.getStaffList(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should not include passwords in response', async () => {
      await createTestStaff();

      const req = mockReq();
      const res = mockRes();

      await staffController.getStaffList(req, res);

      const staffList = res.json.mock.calls[0][0];
      for (const s of staffList) {
        expect(s).not.toHaveProperty('password');
      }
    });

    it('should should only return STAFF role users', async () => {
      await createTestStaff();
      await createTestUser();

      const req = mockReq();
      const res = mockRes();

      await staffController.getStaffList(req, res);

      const staffList = res.json.mock.calls[0][0];
      for (const s of staffList) {
        expect(s.role).toBe('STAFF');
      }
    });

    it('should handle server error', async () => {
      vi.spyOn(mongoose.Query.prototype, 'lean').mockRejectedValueOnce(new Error('DB error'));

      const req = mockReq();
      const res = mockRes();

      await staffController.getStaffList(req, res);

      expect(res.status).toHaveBeenCalledWith(500);

      vi.restoreAllMocks();
    });
  });

  describe('getStaffById', () => {
    it('should return a staff member by id', async () => {
      const staff = await createTestStaff();

      const req = mockReq({ params: { id: staff._id.toString() } });
      const res = mockRes();

      await staffController.getStaffById(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ _id: staff._id, fullName: 'Staff User' }),
      );
    });

    it('should return 404 if staff not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const req = mockReq({ params: { id: fakeId } });
      const res = mockRes();

      await staffController.getStaffById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Staff not found.' });
    });

    it('should return 404 for non-STAFF users', async () => {
      const user = await createTestUser();

      const req = mockReq({ params: { id: user._id.toString() } });
      const res = mockRes();

      await staffController.getStaffById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should not include password', async () => {
      const staff = await createTestStaff();

      const req = mockReq({ params: { id: staff._id.toString() } });
      const res = mockRes();

      await staffController.getStaffById(req, res);

      const data = res.json.mock.calls[0][0];
      expect(data).not.toHaveProperty('password');
    });

    it('should handle server error', async () => {
      const req = mockReq({ params: { id: 'invalid' } });
      const res = mockRes();

      await staffController.getStaffById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('createStaff', () => {
    it('should return 400 if fullName is missing', async () => {
      const req = mockReq({
        body: { email: 'new@test.com', password: 'Pass@123' },
      });
      const res = mockRes();

      await staffController.createStaff(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Name, email, and password are required.',
      });
    });

    it('should return 400 if email is missing', async () => {
      const req = mockReq({
        body: { fullName: 'New Staff', password: 'Pass@123' },
      });
      const res = mockRes();

      await staffController.createStaff(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 if password is missing', async () => {
      const req = mockReq({
        body: { fullName: 'New Staff', email: 'new@test.com' },
      });
      const res = mockRes();

      await staffController.createStaff(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should create a staff member and return 201', async () => {
      const req = mockReq({
        body: {
          fullName: 'New Staff',
          email: 'newstaff@test.com',
          mobileNumber: '9876543215',
          password: 'Secure@123',
        },
      });
      const res = mockRes();

      await staffController.createStaff(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Staff created successfully.',
          staff: expect.objectContaining({
            fullName: 'New Staff',
            email: 'newstaff@test.com',
            role: 'STAFF',
            isAdmin: true,
            isActive: true,
          }),
        }),
      );
    });

    it('should return 400 for duplicate email', async () => {
      await createTestStaff({ email: 'dup@test.com' });

      const req = mockReq({
        body: {
          fullName: 'Duplicate',
          email: 'dup@test.com',
          password: 'Pass@123',
        },
      });
      const res = mockRes();

      await staffController.createStaff(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Email already registered.' });
    });

    it('should create staff with permissions if provided', async () => {
      const req = mockReq({
        body: {
          fullName: 'Perm Staff',
          email: 'perm@test.com',
          password: 'Pass@123',
          permissions: { dashboard: true, products: true },
        },
      });
      const res = mockRes();

      await staffController.createStaff(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          staff: expect.objectContaining({
            permissions: expect.objectContaining({
              dashboard: true,
              products: true,
            }),
          }),
        }),
      );
    });

    it('should not include password in response', async () => {
      const req = mockReq({
        body: { fullName: 'No Pass', email: 'nopass@test.com', password: 'Pass@123' },
      });
      const res = mockRes();

      await staffController.createStaff(req, res);

      const data = res.json.mock.calls[0][0];
      expect(data.staff).not.toHaveProperty('password');
    });

    it('should handle server error', async () => {
      vi.spyOn(mongoose.Model, 'findOne').mockRejectedValueOnce(new Error('DB error'));

      const req = mockReq({
        body: { fullName: 'Test', email: 'test@error.com', password: 'Pass@123' },
      });
      const res = mockRes();

      await staffController.createStaff(req, res);

      expect(res.status).toHaveBeenCalledWith(500);

      vi.restoreAllMocks();
    });
  });

  describe('updateStaff', () => {
    it('should update staff and return 200', async () => {
      const staff = await createTestStaff();

      const req = mockReq({
        params: { id: staff._id.toString() },
        body: { fullName: 'Updated Name', mobileNumber: '9999999999' },
      });
      const res = mockRes();

      await staffController.updateStaff(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Staff updated successfully.',
          staff: expect.objectContaining({
            fullName: 'Updated Name',
            mobileNumber: '9999999999',
          }),
        }),
      );
    });

    it('should return 404 if staff not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const req = mockReq({
        params: { id: fakeId },
        body: { fullName: 'Ghost' },
      });
      const res = mockRes();

      await staffController.updateStaff(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should handle server error', async () => {
      const req = mockReq({
        params: { id: 'invalid' },
        body: { fullName: 'Error' },
      });
      const res = mockRes();

      await staffController.updateStaff(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('updateStaffStatus', () => {
    it('should return 400 if isActive is missing', async () => {
      const req = mockReq({
        params: { id: new mongoose.Types.ObjectId().toString() },
        body: {},
      });
      const res = mockRes();

      await staffController.updateStaffStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'isActive is required.' });
    });

    it('should return 403 if target is SUPER_ADMIN', async () => {
      const admin = await createTestAdmin();

      const req = mockReq({
        params: { id: admin._id.toString() },
        body: { isActive: false },
      });
      const res = mockRes();

      await staffController.updateStaffStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Cannot disable Super Admin.' });
    });

    it('should enable a staff member', async () => {
      const staff = await createTestStaff({ isActive: false });

      const req = mockReq({
        params: { id: staff._id.toString() },
        body: { isActive: true },
      });
      const res = mockRes();

      await staffController.updateStaffStatus(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Staff enabled successfully.',
          staff: expect.objectContaining({ isActive: true }),
        }),
      );
    });

    it('should disable a staff member', async () => {
      const staff = await createTestStaff({ isActive: true });

      const req = mockReq({
        params: { id: staff._id.toString() },
        body: { isActive: false },
      });
      const res = mockRes();

      await staffController.updateStaffStatus(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Staff disabled successfully.',
          staff: expect.objectContaining({ isActive: false }),
        }),
      );
    });

    it('should return 404 if staff not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const req = mockReq({
        params: { id: fakeId },
        body: { isActive: false },
      });
      const res = mockRes();

      await staffController.updateStaffStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should handle server error', async () => {
      const req = mockReq({
        params: { id: 'invalid' },
        body: { isActive: true },
      });
      const res = mockRes();

      await staffController.updateStaffStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('resetPassword', () => {
    it('should return 400 if password is too short', async () => {
      const req = mockReq({
        params: { id: new mongoose.Types.ObjectId().toString() },
        body: { password: '12345' },
      });
      const res = mockRes();

      await staffController.resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Password must be at least 6 characters.',
      });
    });

    it('should return 400 if password is missing', async () => {
      const req = mockReq({
        params: { id: new mongoose.Types.ObjectId().toString() },
        body: {},
      });
      const res = mockRes();

      await staffController.resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should reset password and return 200', async () => {
      const staff = await createTestStaff();

      const req = mockReq({
        params: { id: staff._id.toString() },
        body: { password: 'NewPass@123' },
      });
      const res = mockRes();

      await staffController.resetPassword(req, res);

      expect(res.json).toHaveBeenCalledWith({ message: 'Password reset successfully.' });

      const updated = await User.findById(staff._id).lean();
      const isMatch = await bcrypt.compare('NewPass@123', updated.password);
      expect(isMatch).toBe(true);
    });

    it('should return 404 if staff not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const req = mockReq({
        params: { id: fakeId },
        body: { password: 'NewPass@123' },
      });
      const res = mockRes();

      await staffController.resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should handle server error', async () => {
      const req = mockReq({
        params: { id: 'invalid' },
        body: { password: 'NewPass@123' },
      });
      const res = mockRes();

      await staffController.resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('deleteStaff', () => {
    it('should return 403 if target is SUPER_ADMIN', async () => {
      const admin = await createTestAdmin();

      const req = mockReq({ params: { id: admin._id.toString() } });
      const res = mockRes();

      await staffController.deleteStaff(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Cannot delete Super Admin.' });
    });

    it('should delete a staff member and return 200', async () => {
      const staff = await createTestStaff();

      const req = mockReq({ params: { id: staff._id.toString() } });
      const res = mockRes();

      await staffController.deleteStaff(req, res);

      expect(res.json).toHaveBeenCalledWith({ message: 'Staff deleted successfully.' });

      const deleted = await User.findById(staff._id);
      expect(deleted).toBeNull();
    });

    it('should handle server error', async () => {
      const req = mockReq({ params: { id: 'invalid' } });
      const res = mockRes();

      await staffController.deleteStaff(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
