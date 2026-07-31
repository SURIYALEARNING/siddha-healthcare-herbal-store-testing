import { describe, it, expect, vi, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import * as batchController from '../../../controllers/batchController.js';
import Batch from '../../../models/Batch.js';
import StockAdjustment from '../../../models/StockAdjustment.js';
import { createTestProduct, createTestBatch } from '../../helpers/factories';

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

describe('batchController', () => {
  let product: any;

  beforeEach(async () => {
    product = await createTestProduct();
  });

  describe('getBatches', () => {
    it('should return all batches sorted by newest', async () => {
      await createTestBatch({ batchNumber: 'BATCH-001', productId: product._id });
      await createTestBatch({ batchNumber: 'BATCH-002', productId: product._id });

      const req = mockReq();
      const res = mockRes();

      await batchController.getBatches(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ batchNumber: 'BATCH-001' }),
          expect.objectContaining({ batchNumber: 'BATCH-002' }),
        ]),
      );
    });

    it('should return empty array when no batches exist', async () => {
      const req = mockReq();
      const res = mockRes();

      await batchController.getBatches(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should handle server error', async () => {
      vi.spyOn(mongoose.Query.prototype, 'sort').mockRejectedValueOnce(new Error('DB error'));

      const req = mockReq();
      const res = mockRes();

      await batchController.getBatches(req, res);

      expect(res.status).toHaveBeenCalledWith(500);

      vi.restoreAllMocks();
    });
  });

  describe('getBatchById', () => {
    it('should return a batch by id', async () => {
      const batch = await createTestBatch({ productId: product._id });

      const req = mockReq({ params: { id: batch._id.toString() } });
      const res = mockRes();

      await batchController.getBatchById(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ _id: batch._id, batchNumber: 'BATCH-001' }),
      );
    });

    it('should return 404 if batch not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const req = mockReq({ params: { id: fakeId } });
      const res = mockRes();

      await batchController.getBatchById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Batch not found.' });
    });

    it('should handle server error', async () => {
      const req = mockReq({ params: { id: 'invalid' } });
      const res = mockRes();

      await batchController.getBatchById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('createBatch', () => {
    const validBody = {
      productId: '',
      batchNumber: 'BATCH-NEW-001',
      quantityProduced: 100,
      manufactureDate: '2026-01-01',
      expiryDate: '2028-01-01',
    };

    it('should return 400 if required fields are missing', async () => {
      const req = mockReq({ body: {} });
      const res = mockRes();

      await batchController.createBatch(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'productId, batchNumber, quantityProduced, manufactureDate, and expiryDate are required.',
      });
    });

    it('should return 400 if expiry date is before manufacture date', async () => {
      const req = mockReq({
        body: { ...validBody, productId: product._id.toString(), manufactureDate: '2028-01-01', expiryDate: '2026-01-01' },
      });
      const res = mockRes();

      await batchController.createBatch(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Expiry date must be after manufacture date.' });
    });

    it('should return 400 if expiry date equals manufacture date', async () => {
      const req = mockReq({
        body: { ...validBody, productId: product._id.toString(), manufactureDate: '2028-01-01', expiryDate: '2028-01-01' },
      });
      const res = mockRes();

      await batchController.createBatch(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 if quantity is negative', async () => {
      const req = mockReq({
        body: { ...validBody, productId: product._id.toString(), quantityProduced: -5 },
      });
      const res = mockRes();

      await batchController.createBatch(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Quantity produced cannot be negative.' });
    });

    it('should return 400 if batch number already exists', async () => {
      await createTestBatch({ batchNumber: 'DUPLICATE-BATCH', productId: product._id });

      const req = mockReq({
        body: { ...validBody, productId: product._id.toString(), batchNumber: 'DUPLICATE-BATCH' },
      });
      const res = mockRes();

      await batchController.createBatch(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Batch number already exists.' });
    });

    it('should create a batch and return 201', async () => {
      const req = mockReq({
        body: {
          productId: product._id.toString(),
          batchNumber: 'BATCH-NEW-001',
          quantityProduced: 200,
          manufactureDate: '2026-06-01',
          expiryDate: '2028-06-01',
          preparedBy: 'Preparer',
          supervisedBy: 'Supervisor',
          approvedBy: 'Approver',
          status: 'ACTIVE',
        },
      });
      const res = mockRes();

      await batchController.createBatch(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          batchNumber: 'BATCH-NEW-001',
          quantityProduced: 200,
          currentStock: 200,
          status: 'ACTIVE',
        }),
      );
    });

    it('should handle mongoose duplicate key error', async () => {
      await createTestBatch({ batchNumber: 'MONGO-DUP', productId: product._id });

      const req = mockReq({
        body: {
          productId: product._id.toString(),
          batchNumber: 'MONGO-DUP',
          quantityProduced: 50,
          manufactureDate: '2026-01-01',
          expiryDate: '2028-01-01',
        },
      });
      const res = mockRes();

      await batchController.createBatch(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should handle server error', async () => {
      vi.spyOn(mongoose.Model, 'findOne').mockRejectedValueOnce(new Error('DB error'));

      const req = mockReq({
        body: { ...validBody, productId: product._id.toString() },
      });
      const res = mockRes();

      await batchController.createBatch(req, res);

      expect(res.status).toHaveBeenCalledWith(500);

      vi.restoreAllMocks();
    });
  });

  describe('updateBatch', () => {
    it('should update a batch and return 200', async () => {
      const batch = await createTestBatch({ productId: product._id });

      const req = mockReq({
        params: { id: batch._id.toString() },
        body: { quantityProduced: 150, preparedBy: 'New Preparer' },
      });
      const res = mockRes();

      await batchController.updateBatch(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          quantityProduced: 150,
          preparedBy: 'New Preparer',
        }),
      );
    });

    it('should return 400 if expiry date is before manufacture date', async () => {
      const batch = await createTestBatch({ productId: product._id });

      const req = mockReq({
        params: { id: batch._id.toString() },
        body: { manufactureDate: '2028-01-01', expiryDate: '2026-01-01' },
      });
      const res = mockRes();

      await batchController.updateBatch(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Expiry date must be after manufacture date.' });
    });

    it('should return 400 if quantity produced is negative', async () => {
      const batch = await createTestBatch({ productId: product._id });

      const req = mockReq({
        params: { id: batch._id.toString() },
        body: { quantityProduced: -10 },
      });
      const res = mockRes();

      await batchController.updateBatch(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 if current stock is negative', async () => {
      const batch = await createTestBatch({ productId: product._id });

      const req = mockReq({
        params: { id: batch._id.toString() },
        body: { currentStock: -1 },
      });
      const res = mockRes();

      await batchController.updateBatch(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Current stock cannot be negative.' });
    });

    it('should return 400 if new batch number conflicts with existing', async () => {
      await createTestBatch({ batchNumber: 'EXISTING-BATCH', productId: product._id });
      const batch = await createTestBatch({ batchNumber: 'TO-UPDATE', productId: product._id });

      const req = mockReq({
        params: { id: batch._id.toString() },
        body: { batchNumber: 'EXISTING-BATCH' },
      });
      const res = mockRes();

      await batchController.updateBatch(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Batch number already exists.' });
    });

    it('should return 404 if batch not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const req = mockReq({
        params: { id: fakeId },
        body: { batchNumber: 'NEW-NUM' },
      });
      const res = mockRes();

      await batchController.updateBatch(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should handle server error', async () => {
      const req = mockReq({
        params: { id: 'invalid' },
        body: { preparedBy: 'X' },
      });
      const res = mockRes();

      await batchController.updateBatch(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('adjustStock', () => {
    it('should return 400 if newStock is missing', async () => {
      const req = mockReq({
        params: { id: new mongoose.Types.ObjectId().toString() },
        body: { reason: 'DAMAGED' },
      });
      const res = mockRes();

      await batchController.adjustStock(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'newStock and reason are required.' });
    });

    it('should return 400 if reason is missing', async () => {
      const req = mockReq({
        params: { id: new mongoose.Types.ObjectId().toString() },
        body: { newStock: 50 },
      });
      const res = mockRes();

      await batchController.adjustStock(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 404 if batch not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const req = mockReq({
        params: { id: fakeId },
        body: { newStock: 50, reason: 'DAMAGED' },
      });
      const res = mockRes();

      await batchController.adjustStock(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 400 if new stock is negative', async () => {
      const batch = await createTestBatch({ productId: product._id });

      const req = mockReq({
        params: { id: batch._id.toString() },
        body: { newStock: -1, reason: 'DAMAGED' },
      });
      const res = mockRes();

      await batchController.adjustStock(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Stock cannot be negative.' });
    });

    it('should adjust stock and create StockAdjustment record', async () => {
      const batch = await createTestBatch({
        productId: product._id,
        quantityProduced: 100,
        currentStock: 100,
      });

      const req = mockReq({
        params: { id: batch._id.toString() },
        body: { newStock: 80, reason: 'DAMAGED', reasonDetails: 'Water damage', updatedBy: 'Admin' },
      });
      const res = mockRes();

      await batchController.adjustStock(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Stock adjusted successfully.',
          batch: expect.objectContaining({ currentStock: 80 }),
        }),
      );

      const adjustments = await StockAdjustment.find({ batchId: batch._id });
      expect(adjustments).toHaveLength(1);
      expect(adjustments[0]).toMatchObject({
        previousStock: 100,
        newStock: 80,
        difference: -20,
        reason: 'DAMAGED',
        reasonDetails: 'Water damage',
        updatedBy: 'Admin',
      });
    });

    it('should auto-set status to OUT_OF_STOCK when stock hits 0', async () => {
      const batch = await createTestBatch({
        productId: product._id,
        quantityProduced: 10,
        currentStock: 10,
      });

      const req = mockReq({
        params: { id: batch._id.toString() },
        body: { newStock: 0, reason: 'SAMPLE' },
      });
      const res = mockRes();

      await batchController.adjustStock(req, res);

      const data = res.json.mock.calls[0][0];
      expect(data.batch.status).toBe('OUT_OF_STOCK');
    });

    it('should reset status from OUT_OF_STOCK to ACTIVE when stock becomes positive', async () => {
      const batch = await createTestBatch({
        productId: product._id,
        quantityProduced: 0,
        currentStock: 0,
        status: 'OUT_OF_STOCK',
      });

      const req = mockReq({
        params: { id: batch._id.toString() },
        body: { newStock: 50, reason: 'STOCK_CORRECTION' },
      });
      const res = mockRes();

      await batchController.adjustStock(req, res);

      const data = res.json.mock.calls[0][0];
      expect(data.batch.status).toBe('ACTIVE');
    });

    it('should handle server error', async () => {
      const req = mockReq({
        params: { id: 'invalid' },
        body: { newStock: 50, reason: 'OTHER' },
      });
      const res = mockRes();

      await batchController.adjustStock(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getStockHistory', () => {
    it('should return stock history for a batch', async () => {
      const batch = await createTestBatch({ productId: product._id });
      await StockAdjustment.create({
        batchId: batch._id,
        previousStock: 100,
        newStock: 80,
        difference: -20,
        reason: 'DAMAGED',
      });

      const req = mockReq({ params: { id: batch._id.toString() } });
      const res = mockRes();

      await batchController.getStockHistory(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            previousStock: 100,
            newStock: 80,
            reason: 'DAMAGED',
          }),
        ]),
      );
    });

    it('should return empty array when no history exists', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const req = mockReq({ params: { id: fakeId } });
      const res = mockRes();

      await batchController.getStockHistory(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should handle server error', async () => {
      const req = mockReq({ params: { id: 'invalid' } });
      const res = mockRes();

      await batchController.getStockHistory(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('allocateFromBatches', () => {
    it('should allocate stock from batches in FIFO order', async () => {
      const batch1 = await createTestBatch({
        productId: product._id,
        batchNumber: 'FIFO-001',
        quantityProduced: 10,
        currentStock: 10,
        status: 'ACTIVE',
      });
      const batch2 = await createTestBatch({
        productId: product._id,
        batchNumber: 'FIFO-002',
        quantityProduced: 20,
        currentStock: 20,
        status: 'ACTIVE',
      });

      const allocations = await batchController.allocateFromBatches(product._id, 15);

      expect(allocations).toHaveLength(2);
      expect(allocations[0]).toMatchObject({ batchNumber: 'FIFO-001', quantity: 10 });
      expect(allocations[1]).toMatchObject({ batchNumber: 'FIFO-002', quantity: 5 });

      const updated1 = await Batch.findById(batch1._id);
      expect(updated1!.currentStock).toBe(0);
      expect(updated1!.status).toBe('OUT_OF_STOCK');

      const updated2 = await Batch.findById(batch2._id);
      expect(updated2!.currentStock).toBe(15);
    });

    it('should allocate from a single batch when sufficient', async () => {
      const batch = await createTestBatch({
        productId: product._id,
        batchNumber: 'SINGLE',
        quantityProduced: 50,
        currentStock: 50,
        status: 'ACTIVE',
      });

      const allocations = await batchController.allocateFromBatches(product._id, 30);

      expect(allocations).toHaveLength(1);
      expect(allocations[0]).toMatchObject({ batchNumber: 'SINGLE', quantity: 30 });

      const updated = await Batch.findById(batch._id);
      expect(updated!.currentStock).toBe(20);
    });

    it('should throw error if insufficient stock', async () => {
      await createTestBatch({
        productId: product._id,
        batchNumber: 'LOW',
        quantityProduced: 5,
        currentStock: 5,
        status: 'ACTIVE',
      });

      await expect(
        batchController.allocateFromBatches(product._id, 100),
      ).rejects.toThrow('Not enough stock in ACTIVE batches. Short by 95 units.');
    });

    it('should only allocate from ACTIVE batches', async () => {
      await createTestBatch({
        productId: product._id,
        batchNumber: 'ACTIVE-BATCH',
        quantityProduced: 10,
        currentStock: 10,
        status: 'ACTIVE',
      });
      await createTestBatch({
        productId: product._id,
        batchNumber: 'HOLD-BATCH',
        quantityProduced: 50,
        currentStock: 50,
        status: 'HOLD',
      });

      const allocations = await batchController.allocateFromBatches(product._id, 10);

      expect(allocations).toHaveLength(1);
      expect(allocations[0].batchNumber).toBe('ACTIVE-BATCH');
    });

    it('should handle zero stock batches gracefully', async () => {
      await createTestBatch({
        productId: product._id,
        batchNumber: 'ZERO',
        quantityProduced: 0,
        currentStock: 0,
        status: 'OUT_OF_STOCK',
      });

      await expect(
        batchController.allocateFromBatches(product._id, 1),
      ).rejects.toThrow(/Not enough stock/);
    });
  });
});
