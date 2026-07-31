import { describe, it, expect, vi, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import * as consultationController from '../../../controllers/consultationController.js';
import { createTestConsultation, createTestUser } from '../../helpers/factories';

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

describe('consultationController', () => {
  describe('bookConsultation', () => {
    it('should return 400 if fullName is missing', async () => {
      const req = mockReq({
        body: { mobileNumber: '9876543210', preferredDate: '2027-06-15', preferredTime: '10:00 AM' },
      });
      const res = mockRes();

      await consultationController.bookConsultation(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Full Name, Mobile, Date, and Time are required.',
      });
    });

    it('should return 400 if mobileNumber is missing', async () => {
      const req = mockReq({
        body: { fullName: 'John', preferredDate: '2027-06-15', preferredTime: '10:00 AM' },
      });
      const res = mockRes();

      await consultationController.bookConsultation(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 if preferredDate is missing', async () => {
      const req = mockReq({
        body: { fullName: 'John', mobileNumber: '9876543210', preferredTime: '10:00 AM' },
      });
      const res = mockRes();

      await consultationController.bookConsultation(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 if preferredTime is missing', async () => {
      const req = mockReq({
        body: { fullName: 'John', mobileNumber: '9876543210', preferredDate: '2027-06-15' },
      });
      const res = mockRes();

      await consultationController.bookConsultation(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should create a consultation and return 201 with default values', async () => {
      const req = mockReq({
        body: {
          fullName: 'John Doe',
          mobileNumber: '9876543210',
          preferredDate: '2027-06-15',
          preferredTime: '10:00 AM',
        },
      });
      const res = mockRes();

      await consultationController.bookConsultation(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Consultation booked successfully'),
          booking: expect.objectContaining({
            fullName: 'John Doe',
            mobileNumber: '9876543210',
            email: '',
            preferredDate: expect.any(String),
            preferredTime: '10:00 AM',
            healthIssues: 'General Siddha Health Consult.',
          }),
        }),
      );
    });

    it('should create a consultation with all provided fields', async () => {
      const req = mockReq({
        body: {
          fullName: 'Jane Doe',
          mobileNumber: '9876543211',
          email: 'jane@example.com',
          preferredDate: '2027-07-01',
          preferredTime: '02:00 PM',
          healthIssues: 'Digestive issues',
        },
      });
      const res = mockRes();

      await consultationController.bookConsultation(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          booking: expect.objectContaining({
            fullName: 'Jane Doe',
            email: 'jane@example.com',
            healthIssues: 'Digestive issues',
          }),
        }),
      );
    });

    it('should handle server error', async () => {
      vi.spyOn(mongoose.Model, 'create').mockRejectedValueOnce(new Error('DB error'));

      const req = mockReq({
        body: {
          fullName: 'John',
          mobileNumber: '9876543210',
          preferredDate: '2027-06-15',
          preferredTime: '10:00 AM',
        },
      });
      const res = mockRes();

      await consultationController.bookConsultation(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to book consultation.' });

      vi.restoreAllMocks();
    });
  });

  describe('getAdminConsultations', () => {
    it('should return all consultations sorted by newest', async () => {
      const user = await createTestUser({ email: 'alice@test.com' });
      await createTestConsultation({ fullName: 'Alice', userId: user._id });
      await createTestConsultation({ fullName: 'Bob', userId: user._id });

      const req = mockReq();
      const res = mockRes();

      await consultationController.getAdminConsultations(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ fullName: 'Alice' }),
          expect.objectContaining({ fullName: 'Bob' }),
        ]),
      );
    });

    it('should return empty array when no consultations exist', async () => {
      const req = mockReq();
      const res = mockRes();

      await consultationController.getAdminConsultations(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should handle server error', async () => {
      vi.spyOn(mongoose.Model, 'find').mockRejectedValueOnce(new Error('DB error'));

      const req = mockReq();
      const res = mockRes();

      await consultationController.getAdminConsultations(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch consultations.' });

      vi.restoreAllMocks();
    });
  });
});
