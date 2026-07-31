import { describe, it, expect, vi, beforeEach } from 'vitest';
import mongoose from 'mongoose';

vi.mock('../../../services/shiprocket.service.js', () => ({
  authenticate: vi.fn().mockResolvedValue({ token: 'mock-token' }),
  createOrder: vi.fn(),
  generateAWB: vi.fn(),
  requestPickup: vi.fn(),
  trackShipment: vi.fn(),
  cancelShipment: vi.fn(),
  checkServiceability: vi.fn(),
  syncPickupLocations: vi.fn(),
  getStoredPickupLocations: vi.fn(),
}));

vi.mock('../../../services/timelineService.js', () => ({
  addTimelineEvent: vi.fn(),
  addPaymentTimelineEvent: vi.fn(),
  addShiprocketAssignedEvent: vi.fn(),
  addShiprocketTrackingEvent: vi.fn(),
}));

vi.mock('../../../services/reminderService.js', () => ({
  maybeCreateRemindersForOrder: vi.fn(),
}));

import {
  getShippingOrders, getShippingStats, confirmOrder, markPacked,
  assignShiprocket, generateAWB, requestPickup, trackShipment,
  cancelShipment, checkPincode, checkMyAddress,
} from '../../../controllers/shippingController.js';
import Order from '../../../models/Order.js';
import Shipment from '../../../models/Shipment.js';
import { User } from '../../../models/User.js';
import * as shiprocket from '../../../services/shiprocket.service.js';
import { addTimelineEvent, addShiprocketAssignedEvent, addShiprocketTrackingEvent } from '../../../services/timelineService.js';
import { maybeCreateRemindersForOrder } from '../../../services/reminderService.js';
import type { Mock } from 'vitest';

function mockReqRes(reqOverrides = {}) {
  const req: any = { params: {}, query: {}, body: {}, user: { id: 'staff1', isAdmin: true }, ...reqOverrides };
  const res: any = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() };
  return { req, res };
}

const baseOrder = {
  items: [],
  subtotal: 0,
  total: 500,
  shippingAddress: { address: '123 St', state: 'TN', district: 'Chennai', pincode: '600001' },
  mobileNumber: '9876543210',
  email: 'a@b.com',
  fullName: 'User',
  paymentMethod: 'UPI',
  paymentStatus: 'Paid',
};

describe('getShippingOrders', () => {
  it('returns paid orders that are Pending or Ready To Ship', async () => {
    const uid = new mongoose.Types.ObjectId();
    await Order.create({ ...baseOrder, userId: uid, currentStatus: 'Pending' });
    await Order.create({ ...baseOrder, userId: uid, currentStatus: 'Ready To Ship' });
    await Order.create({ ...baseOrder, userId: uid, currentStatus: 'Delivered', total: 300 });
    const { req, res } = mockReqRes();
    await getShippingOrders(req, res);
    expect((res.json as Mock).mock.calls[0][0]).toHaveLength(2);
  });

  it('returns empty when no qualifying orders', async () => {
    const uid = new mongoose.Types.ObjectId();
    await Order.create({ ...baseOrder, userId: uid, currentStatus: 'Delivered' });
    const { req, res } = mockReqRes();
    await getShippingOrders(req, res);
    expect((res.json as Mock).mock.calls[0][0]).toHaveLength(0);
  });

  it('returns 500 on error', async () => {
    vi.spyOn(Order, 'find').mockImplementationOnce(() => { throw new Error('fail'); });
    const { req, res } = mockReqRes();
    await getShippingOrders(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe('getShippingStats', () => {
  it('returns stats breakdown', async () => {
    const uid = new mongoose.Types.ObjectId();
    await Order.create({ ...baseOrder, userId: uid, currentStatus: 'Pending', shippingStatus: 'PAID' });
    await Order.create({ ...baseOrder, userId: uid, currentStatus: 'Ready To Ship', shippingStatus: 'CONFIRMED' });
    const { req, res } = mockReqRes();
    await getShippingStats(req, res);
    const stats = (res.json as Mock).mock.calls[0][0];
    expect(stats.total).toBe(2);
    expect(stats.newOrders).toBe(1);
    expect(stats.readyToShip).toBe(1);
  });

  it('handles zero orders', async () => {
    const { req, res } = mockReqRes();
    await getShippingStats(req, res);
    expect(res.json).toHaveBeenCalledWith({
      total: 0, newOrders: 0, readyToShip: 0, paid: 0, confirmed: 0, packed: 0,
      pickupRequested: 0, inTransit: 0, delivered: 0, cancelled: 0, returned: 0,
    });
  });
});

describe('confirmOrder', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('confirms an order and sets shippingStatus', async () => {
    const uid = new mongoose.Types.ObjectId();
    const order = await Order.create({ ...baseOrder, userId: uid, currentStatus: 'Pending' });
    const { req, res } = mockReqRes({ body: { orderId: order._id.toString() } });
    await confirmOrder(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Order confirmed for shipping!' }));
    expect((res.json as Mock).mock.calls[0][0].order.shippingStatus).toBe('CONFIRMED');
  });

  it('returns 400 when orderId missing', async () => {
    const { req, res } = mockReqRes({ body: {} });
    await confirmOrder(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'orderId is required.' });
  });

  it('returns 404 when order not found', async () => {
    const { req, res } = mockReqRes({ body: { orderId: new mongoose.Types.ObjectId().toString() } });
    await confirmOrder(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

describe('markPacked', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('marks order as packed and creates shipment dimensions', async () => {
    const uid = new mongoose.Types.ObjectId();
    const order = await Order.create({ ...baseOrder, userId: uid, currentStatus: 'Confirmed' });
    const { req, res } = mockReqRes({
      body: { orderId: order._id.toString(), length: 20, breadth: 15, height: 10, weight: 1.5 },
    });
    await markPacked(req, res);
    expect(addTimelineEvent).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Order marked as packed!' }));
    const shipment = await Shipment.findOne({ orderId: order._id });
    expect(shipment).not.toBeNull();
    expect(shipment!.dimensions.length).toBe(20);
    expect(shipment!.weight).toBe(1.5);
  });

  it('returns 404 when order not found', async () => {
    const { req, res } = mockReqRes({ body: { orderId: new mongoose.Types.ObjectId().toString() } });
    await markPacked(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

describe('assignShiprocket', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('creates Shiprocket order and updates order/shipment records', async () => {
    const uid = new mongoose.Types.ObjectId();
    const order = await Order.create({ ...baseOrder, userId: uid, currentStatus: 'Pending' });
    (shiprocket.createOrder as Mock).mockResolvedValue({ order_id: 'SR-001', shipment_id: 5001 });
    (shiprocket.getStoredPickupLocations as Mock).mockResolvedValue([
      { pickup_location: 'primary-warehouse', is_primary_location: 1 },
    ]);
    const { req, res } = mockReqRes({ body: { orderId: order._id.toString() } });
    await assignShiprocket(req, res);
    expect(shiprocket.createOrder).toHaveBeenCalled();
    expect(addShiprocketAssignedEvent).toHaveBeenCalledWith(order._id.toString(), 'SR-001');
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Shiprocket order created!', shiprocketOrderId: 'SR-001' }));
    const updated = await Order.findById(order._id);
    expect(updated!.shippingMethod).toBe('SHIPROCKET');
    expect(updated!.shiprocketOrderId).toBe('SR-001');
    const shipment = await Shipment.findOne({ orderId: order._id });
    expect(shipment).not.toBeNull();
    expect(shipment!.shiprocketOrderId).toBe('SR-001');
  });

  it('returns 400 when orderId missing', async () => {
    const { req, res } = mockReqRes({ body: {} });
    await assignShiprocket(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 404 when order not found', async () => {
    const { req, res } = mockReqRes({ body: { orderId: new mongoose.Types.ObjectId().toString() } });
    await assignShiprocket(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('sends correct payload to shiprocket', async () => {
    const uid = new mongoose.Types.ObjectId();
    const order = await Order.create({ ...baseOrder, userId: uid, currentStatus: 'Pending' });
    (shiprocket.createOrder as Mock).mockResolvedValue({ order_id: 'SR-002', shipment_id: 5002 });
    const { req, res } = mockReqRes({ body: { orderId: order._id.toString() } });
    await assignShiprocket(req, res);
    const payload = (shiprocket.createOrder as Mock).mock.calls[0][0];
    expect(payload.order_id).toBe(order._id.toString());
    expect(payload.billing_customer_name).toBe('User');
    expect(payload.shipping_is_billing).toBe(true);
    expect(payload.order_items).toEqual([]);
    expect(payload.payment_method).toBe('Prepaid');
  });
});

describe('generateAWB', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('generates AWB and updates order/shipment', async () => {
    const uid = new mongoose.Types.ObjectId();
    const order = await Order.create({ ...baseOrder, userId: uid });
    const shipment = await Shipment.create({ orderId: order._id });
    (shiprocket.generateAWB as Mock).mockResolvedValue({ awb_code: 'AWB12345', courier_name: 'Delhivery' });
    const { req, res } = mockReqRes({ body: { orderId: order._id.toString(), shipmentId: 'SR-001' } });
    await generateAWB(req, res);
    expect(shiprocket.generateAWB).toHaveBeenCalledWith('SR-001');
    expect(res.json).toHaveBeenCalledWith({ message: 'AWB generated!', awbCode: 'AWB12345', courierName: 'Delhivery' });
    const updated = await Order.findById(order._id);
    expect(updated!.awbCode).toBe('AWB12345');
    expect(updated!.tracking!.awbNumber).toBe('AWB12345');
    const updatedShipment = await Shipment.findById(shipment._id);
    expect(updatedShipment!.awbCode).toBe('AWB12345');
    expect(updatedShipment!.trackingStatus).toBe('AWB_GENERATED');
  });
});

describe('requestPickup', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('requests pickup and updates statuses', async () => {
    const uid = new mongoose.Types.ObjectId();
    const order = await Order.create({ ...baseOrder, userId: uid });
    const shipment = await Shipment.create({ orderId: order._id });
    (shiprocket.requestPickup as Mock).mockResolvedValue({ pickup_status: 'scheduled' });
    const { req, res } = mockReqRes({ body: { orderId: order._id.toString(), shipmentIds: [5001] } });
    await requestPickup(req, res);
    expect(shiprocket.requestPickup).toHaveBeenCalledWith([5001]);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Pickup requested!' }));
    const updated = await Order.findById(order._id);
    expect(updated!.shippingStatus).toBe('PICKUP_REQUESTED');
    const updatedShipment = await Shipment.findById(shipment._id);
    expect(updatedShipment!.pickupStatus).toBe('REQUESTED');
  });
});

describe('trackShipment', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('tracks shipment and updates tracking history', async () => {
    const uid = new mongoose.Types.ObjectId();
    const order = await Order.create({ ...baseOrder, userId: uid });
    const shipment = await Shipment.create({ orderId: order._id, shiprocketOrderId: 'SR-001' });
    (shiprocket.trackShipment as Mock).mockResolvedValue({
      tracking_data: {
        status: 'In Transit',
        history: [{ status: 'Picked Up', timestamp: '2026-07-30T10:00:00Z' }],
      },
    });
    const { req, res } = mockReqRes({ params: { shipmentId: 'SR-001' } });
    await trackShipment(req, res);
    expect(shiprocket.trackShipment).toHaveBeenCalledWith('SR-001');
    const updatedShipment = await Shipment.findById(shipment._id);
    expect(updatedShipment!.trackingHistory).toHaveLength(1);
    expect(updatedShipment!.trackingStatus).toBe('In Transit');
  });

  it('auto-updates order to Delivered when tracking shows delivered', async () => {
    const uid = new mongoose.Types.ObjectId();
    const order = await Order.create({ ...baseOrder, userId: uid, currentStatus: 'Shipped' });
    await Shipment.create({ orderId: order._id, shiprocketOrderId: 'SR-002' });
    (shiprocket.trackShipment as Mock).mockResolvedValue({
      tracking_data: { status: 'Delivered', history: [{ status: 'Delivered', timestamp: '2026-07-30T12:00:00Z' }] },
    });
    (maybeCreateRemindersForOrder as unknown as Mock).mockResolvedValue([]);
    const { req, res } = mockReqRes({ params: { shipmentId: 'SR-002' } });
    await trackShipment(req, res);
    expect(addShiprocketTrackingEvent).toHaveBeenCalledTimes(1);
    expect(addShiprocketTrackingEvent.mock.calls[0][1]).toBe('DELIVERED');
    expect(addShiprocketTrackingEvent.mock.calls[0][2]).toMatchObject({
      status: 'Delivered',
      history: expect.any(Array),
    });
    const updated = await Order.findById(order._id);
    expect(updated!.shippingStatus).toBe('DELIVERED');
    expect(updated!.status).toBe('Delivered');
    expect(maybeCreateRemindersForOrder).toHaveBeenCalledTimes(1);
    expect(maybeCreateRemindersForOrder.mock.calls[0][0].toString()).toBe(order._id.toString());
    const updatedShipment = await Shipment.findOne({ shiprocketOrderId: 'SR-002' });
    expect(updatedShipment!.deliveredAt).toBeTruthy();
  });

  it('does not double-deliver if already delivered', async () => {
    const uid = new mongoose.Types.ObjectId();
    const order = await Order.create({ ...baseOrder, userId: uid, currentStatus: 'Delivered' });
    await Shipment.create({ orderId: order._id, shiprocketOrderId: 'SR-003' });
    (shiprocket.trackShipment as Mock).mockResolvedValue({
      tracking_data: { status: 'Delivered', history: [] },
    });
    const { req, res } = mockReqRes({ params: { shipmentId: 'SR-003' } });
    await trackShipment(req, res);
    expect(addShiprocketTrackingEvent).not.toHaveBeenCalled();
  });
});

describe('cancelShipment', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('cancels shipment and updates order status', async () => {
    const uid = new mongoose.Types.ObjectId();
    const order = await Order.create({ ...baseOrder, userId: uid, shippingStatus: 'CONFIRMED' });
    (shiprocket.cancelShipment as Mock).mockResolvedValue({});
    const { req, res } = mockReqRes({ body: { orderId: order._id.toString(), shipmentIds: [5001] } });
    await cancelShipment(req, res);
    expect(shiprocket.cancelShipment).toHaveBeenCalledWith([5001]);
    expect(addTimelineEvent).toHaveBeenCalledWith(expect.objectContaining({
      orderId: order._id.toString(), status: 'Cancelled',
    }));
    const updated = await Order.findById(order._id);
    expect(updated!.shippingStatus).toBe('CANCELLED');
    expect(res.json).toHaveBeenCalledWith({ message: 'Shipment cancelled.' });
  });
});

describe('checkPincode', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns serviceability result for valid pincode', async () => {
    (shiprocket.checkServiceability as Mock).mockResolvedValue({ success: true, recommended_courier: 'Delhivery' });
    const { req, res } = mockReqRes({ body: { pincode: '600001', weight: 1, cod: false } });
    await checkPincode(req, res);
    expect(shiprocket.checkServiceability).toHaveBeenCalledWith({
      pickupPincode: '600001', deliveryPincode: '600001', weight: 1, cod: false,
    });
    expect(res.json).toHaveBeenCalledWith({ success: true, recommended_courier: 'Delhivery' });
  });

  it('rejects missing pincode', async () => {
    const { req, res } = mockReqRes({ body: {} });
    await checkPincode(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('validates pincode format with 6-digit regex', async () => {
    const { req, res } = mockReqRes({ body: { pincode: '60000' } });
    await checkPincode(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Invalid pincode format.' });
  });

  it('rejects non-numeric pincode', async () => {
    const { req, res } = mockReqRes({ body: { pincode: 'ABCDEF' } });
    await checkPincode(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Invalid pincode format.' });
  });

  it('handles cod boolean and string true values', async () => {
    (shiprocket.checkServiceability as Mock).mockResolvedValue({ success: true });
    const { req: r1, res: s1 } = mockReqRes({ body: { pincode: '600001', cod: true } });
    await checkPincode(r1, s1);
    expect(shiprocket.checkServiceability).toHaveBeenCalledWith(expect.objectContaining({ cod: true }));
    vi.clearAllMocks();
    (shiprocket.checkServiceability as Mock).mockResolvedValue({ success: true });
    const { req: r2, res: s2 } = mockReqRes({ body: { pincode: '600001', cod: 'true' } });
    await checkPincode(r2, s2);
    expect(shiprocket.checkServiceability).toHaveBeenCalledWith(expect.objectContaining({ cod: true }));
  });
});

describe('checkMyAddress', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('checks serviceability for logged-in user address', async () => {
    const user = await User.create({
      fullName: 'User', email: 'u@b.com', mobileNumber: '9876543210', password: 'x',
      isAdmin: false, role: 'USER', isActive: true,
      address: { address: '456 My St', state: 'TN', district: 'Chennai', pincode: '600042' },
    });
    (shiprocket.checkServiceability as Mock).mockResolvedValue({ success: true, recommended_courier: 'FedEx' });
    const { req, res } = mockReqRes({ user: { id: user._id.toString() } });
    await checkMyAddress(req, res);
    expect(shiprocket.checkServiceability).toHaveBeenCalledWith({
      pickupPincode: '600001', deliveryPincode: '600042', weight: 0.5, cod: false,
    });
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true, pincode: '600042', address: '456 My St',
    }));
  });

  it('returns 404 when user not found', async () => {
    const { req, res } = mockReqRes({ user: { id: new mongoose.Types.ObjectId().toString() } });
    await checkMyAddress(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns 400 when user has no address pincode', async () => {
    const user = await User.create({
      fullName: 'User', email: 'u@b.com', mobileNumber: '9876543210', password: 'x',
      isAdmin: false, role: 'USER', isActive: true,
      address: { address: 'No Pincode', state: 'TN', district: 'Chennai', pincode: '' },
    });
    const { req, res } = mockReqRes({ user: { id: user._id.toString() } });
    await checkMyAddress(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
