import { describe, it, expect, vi, beforeEach } from 'vitest';
import mongoose from 'mongoose';

vi.mock('../../../services/timelineService.js', () => ({
  addTimelineEvent: vi.fn(),
  addPaymentTimelineEvent: vi.fn(),
}));

vi.mock('../../../services/reminderService.js', () => ({
  maybeCreateRemindersForOrder: vi.fn(),
}));

vi.mock('../../../services/analyticsService.js', () => ({
  buildAnalytics: vi.fn(),
}));

vi.mock('../../../services/shiprocket.service.js', () => ({
  default: { trackShipment: vi.fn() },
}));

import {
  getAdminOrders, getOrderById, updateOrderStatus,
  getOrderTimeline, getCustomerOrders, getCustomersList,
  trackOrder, getAdminAnalytics,
} from '../../../controllers/adminController.js';
import Order from '../../../models/Order.js';
import { User } from '../../../models/User.js';
import Product from '../../../models/Product.js';
import { addTimelineEvent, addPaymentTimelineEvent } from '../../../services/timelineService.js';
import { maybeCreateRemindersForOrder } from '../../../services/reminderService.js';
import { buildAnalytics } from '../../../services/analyticsService.js';
import type { Mock } from 'vitest';

function mockReqRes(reqOverrides = {}) {
  const req: any = { params: {}, query: {}, body: {}, user: { id: 'admin1', isAdmin: true }, ...reqOverrides };
  const res: any = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() };
  return { req, res };
}

describe('getAdminOrders', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns paginated orders with total count', async () => {
    const uid = new mongoose.Types.ObjectId();
    await Order.create({ userId: uid, items: [], subtotal: 0, total: 100, shippingAddress: { address: 'a', state: 'TN', district: 'C', pincode: '600001' }, mobileNumber: '9876543210', email: 'a@b.com', fullName: 'U', paymentMethod: 'UPI', paymentStatus: 'Paid' });
    await Order.create({ userId: uid, items: [], subtotal: 0, total: 200, shippingAddress: { address: 'b', state: 'TN', district: 'C', pincode: '600001' }, mobileNumber: '9876543211', email: 'b@b.com', fullName: 'V', paymentMethod: 'COD', paymentStatus: 'Pending' });
    const { req, res } = mockReqRes({ query: { page: '1', limit: '10' } });
    await getAdminOrders(req, res);
    expect(res.json).toHaveBeenCalledWith({
      orders: expect.arrayContaining([expect.objectContaining({ total: 100 }), expect.objectContaining({ total: 200 })]),
      total: 2, page: 1, totalPages: 1,
    });
  });

  it('excludes timeline field', async () => {
    const uid = new mongoose.Types.ObjectId();
    await Order.create({ userId: uid, items: [], subtotal: 0, total: 100, shippingAddress: { address: 'a', state: 'TN', district: 'C', pincode: '600001' }, mobileNumber: '9876543210', email: 'a@b.com', fullName: 'U', paymentMethod: 'UPI', paymentStatus: 'Paid', timeline: [{ status: 'Pending', title: 'Placed', createdAt: new Date(), updatedBy: 'SYSTEM', source: 'SYSTEM' }] });
    const { req, res } = mockReqRes({ query: {} });
    await getAdminOrders(req, res);
    const call = (res.json as Mock).mock.calls[0][0];
    expect(call.orders[0].timeline).toBeUndefined();
  });

  it('filters by status', async () => {
    const uid = new mongoose.Types.ObjectId();
    await Order.create({ userId: uid, items: [], subtotal: 0, total: 100, shippingAddress: { address: 'a', state: 'TN', district: 'C', pincode: '600001' }, mobileNumber: '9876543210', email: 'a@b.com', fullName: 'U', paymentMethod: 'UPI', paymentStatus: 'Paid', currentStatus: 'Pending' });
    await Order.create({ userId: uid, items: [], subtotal: 0, total: 200, shippingAddress: { address: 'b', state: 'TN', district: 'C', pincode: '600001' }, mobileNumber: '9876543211', email: 'b@b.com', fullName: 'V', paymentMethod: 'COD', paymentStatus: 'Paid', currentStatus: 'Delivered' });
    const { req, res } = mockReqRes({ query: { status: 'Delivered' } });
    await getAdminOrders(req, res);
    const call = (res.json as Mock).mock.calls[0][0];
    expect(call.total).toBe(1);
    expect(call.orders[0].currentStatus).toBe('Delivered');
  });

  it('filters by paymentStatus', async () => {
    const uid = new mongoose.Types.ObjectId();
    await Order.create({ userId: uid, items: [], subtotal: 0, total: 100, shippingAddress: { address: 'a', state: 'TN', district: 'C', pincode: '600001' }, mobileNumber: '9876543210', email: 'a@b.com', fullName: 'U', paymentMethod: 'UPI', paymentStatus: 'Paid' });
    await Order.create({ userId: uid, items: [], subtotal: 0, total: 200, shippingAddress: { address: 'b', state: 'TN', district: 'C', pincode: '600001' }, mobileNumber: '9876543211', email: 'b@b.com', fullName: 'V', paymentMethod: 'COD', paymentStatus: 'Pending' });
    const { req, res } = mockReqRes({ query: { paymentStatus: 'Pending' } });
    await getAdminOrders(req, res);
    const call = (res.json as Mock).mock.calls[0][0];
    expect(call.total).toBe(1);
    expect(call.orders[0].paymentStatus).toBe('Pending');
  });

  it('filters by period today', async () => {
    const uid = new mongoose.Types.ObjectId();
    await Order.create({ userId: uid, items: [], subtotal: 0, total: 100, shippingAddress: { address: 'a', state: 'TN', district: 'C', pincode: '600001' }, mobileNumber: '9876543210', email: 'a@b.com', fullName: 'U', paymentMethod: 'UPI', paymentStatus: 'Paid' });
    const { req, res } = mockReqRes({ query: { period: 'today' } });
    await getAdminOrders(req, res);
    expect((res.json as Mock).mock.calls[0][0].total).toBe(1);
  });

  it('filters by period yesterday', async () => {
    const uid = new mongoose.Types.ObjectId();
    await Order.create({ userId: uid, items: [], subtotal: 0, total: 100, shippingAddress: { address: 'a', state: 'TN', district: 'C', pincode: '600001' }, mobileNumber: '9876543210', email: 'a@b.com', fullName: 'U', paymentMethod: 'UPI', paymentStatus: 'Paid', createdAt: new Date(Date.now() - 86400000 * 2) });
    const { req, res } = mockReqRes({ query: { period: 'yesterday' } });
    await getAdminOrders(req, res);
    expect((res.json as Mock).mock.calls[0][0].total).toBe(0);
  });

  it('filters by period last7', async () => {
    const uid = new mongoose.Types.ObjectId();
    await Order.create({ userId: uid, items: [], subtotal: 0, total: 100, shippingAddress: { address: 'a', state: 'TN', district: 'C', pincode: '600001' }, mobileNumber: '9876543210', email: 'a@b.com', fullName: 'U', paymentMethod: 'UPI', paymentStatus: 'Paid' });
    const { req, res } = mockReqRes({ query: { period: 'last7' } });
    await getAdminOrders(req, res);
    expect((res.json as Mock).mock.calls[0][0].total).toBe(1);
  });

  it('filters by period thisMonth', async () => {
    const uid = new mongoose.Types.ObjectId();
    await Order.create({ userId: uid, items: [], subtotal: 0, total: 100, shippingAddress: { address: 'a', state: 'TN', district: 'C', pincode: '600001' }, mobileNumber: '9876543210', email: 'a@b.com', fullName: 'U', paymentMethod: 'UPI', paymentStatus: 'Paid' });
    const { req, res } = mockReqRes({ query: { period: 'thisMonth' } });
    await getAdminOrders(req, res);
    expect((res.json as Mock).mock.calls[0][0].total).toBe(1);
  });

  it('filters by date range', async () => {
    const uid = new mongoose.Types.ObjectId();
    await Order.create({ userId: uid, items: [], subtotal: 0, total: 100, shippingAddress: { address: 'a', state: 'TN', district: 'C', pincode: '600001' }, mobileNumber: '9876543210', email: 'a@b.com', fullName: 'U', paymentMethod: 'UPI', paymentStatus: 'Paid' });
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const { req, res } = mockReqRes({ query: { dateFrom: yesterday, dateTo: tomorrow } });
    await getAdminOrders(req, res);
    expect((res.json as Mock).mock.calls[0][0].total).toBe(1);
  });

  it('searches by fullName', async () => {
    const user = await User.create({ fullName: 'SearchableUser', email: 's@b.com', mobileNumber: '9876543222', password: 'hashed', isAdmin: false, role: 'USER', isActive: true, address: { address: 'x', state: 'TN', district: 'C', pincode: '600001' } });
    await Order.create({ userId: user._id, items: [], subtotal: 0, total: 100, shippingAddress: { address: 'a', state: 'TN', district: 'C', pincode: '600001' }, mobileNumber: '9876543210', email: 'a@b.com', fullName: user.fullName, paymentMethod: 'UPI', paymentStatus: 'Paid' });
    const { req, res } = mockReqRes({ query: { search: 'Searchable' } });
    await getAdminOrders(req, res);
    expect((res.json as Mock).mock.calls[0][0].total).toBe(1);
  });

  it('searches by mobileNumber', async () => {
    const user = await User.create({ fullName: 'MUser', email: 'm@b.com', mobileNumber: '9876543333', password: 'hashed', isAdmin: false, role: 'USER', isActive: true, address: { address: 'x', state: 'TN', district: 'C', pincode: '600001' } });
    await Order.create({ userId: user._id, items: [], subtotal: 0, total: 100, shippingAddress: { address: 'a', state: 'TN', district: 'C', pincode: '600001' }, mobileNumber: '9876543210', email: 'a@b.com', fullName: user.fullName, paymentMethod: 'UPI', paymentStatus: 'Paid' });
    const { req, res } = mockReqRes({ query: { search: '9876543333' } });
    await getAdminOrders(req, res);
    expect((res.json as Mock).mock.calls[0][0].total).toBe(1);
  });

  it('searches by email', async () => {
    const uid = new mongoose.Types.ObjectId();
    await Order.create({ userId: uid, items: [], subtotal: 0, total: 100, shippingAddress: { address: 'a', state: 'TN', district: 'C', pincode: '600001' }, mobileNumber: '9876543210', email: 'searchable@b.com', fullName: 'U', paymentMethod: 'UPI', paymentStatus: 'Paid' });
    const { req, res } = mockReqRes({ query: { search: 'searchable@b.com' } });
    await getAdminOrders(req, res);
    expect((res.json as Mock).mock.calls[0][0].total).toBe(1);
  });

  it('respects limit cap of 100', async () => {
    const uid = new mongoose.Types.ObjectId();
    for (let i = 0; i < 5; i++) {
      await Order.create({ userId: uid, items: [], subtotal: 0, total: 10, shippingAddress: { address: 'a', state: 'TN', district: 'C', pincode: '600001' }, mobileNumber: '9876543210', email: 'a@b.com', fullName: 'U', paymentMethod: 'UPI', paymentStatus: 'Paid' });
    }
    const { req, res } = mockReqRes({ query: { limit: '200', page: '1' } });
    await getAdminOrders(req, res);
    expect((res.json as Mock).mock.calls[0][0].orders.length).toBe(5);
  });

  it('filters by shippingMethod', async () => {
    const uid = new mongoose.Types.ObjectId();
    await Order.create({ userId: uid, items: [], subtotal: 0, total: 100, shippingAddress: { address: 'a', state: 'TN', district: 'C', pincode: '600001' }, mobileNumber: '9876543210', email: 'a@b.com', fullName: 'U', paymentMethod: 'UPI', paymentStatus: 'Paid', shippingMethod: 'SHIPROCKET' });
    const { req, res } = mockReqRes({ query: { shippingMethod: 'SHIPROCKET' } });
    await getAdminOrders(req, res);
    expect((res.json as Mock).mock.calls[0][0].total).toBe(1);
  });

  it('filters by userId', async () => {
    const uid = new mongoose.Types.ObjectId();
    await Order.create({ userId: uid, items: [], subtotal: 0, total: 100, shippingAddress: { address: 'a', state: 'TN', district: 'C', pincode: '600001' }, mobileNumber: '9876543210', email: 'a@b.com', fullName: 'U', paymentMethod: 'UPI', paymentStatus: 'Paid' });
    const { req, res } = mockReqRes({ query: { userId: uid.toString() } });
    await getAdminOrders(req, res);
    expect((res.json as Mock).mock.calls[0][0].total).toBe(1);
  });

  it('returns 500 on error', async () => {
    const { req, res } = mockReqRes({ query: {} });
    vi.spyOn(Order, 'find').mockImplementationOnce(() => { throw new Error('DB down'); });
    await getAdminOrders(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch orders.' });
  });
});

describe('getOrderById', () => {
  it('returns order when found', async () => {
    const order = await Order.create({ userId: new mongoose.Types.ObjectId(), items: [], subtotal: 0, total: 100, shippingAddress: { address: 'a', state: 'TN', district: 'C', pincode: '600001' }, mobileNumber: '9876543210', email: 'a@b.com', fullName: 'U', paymentMethod: 'UPI', paymentStatus: 'Paid' });
    const { req, res } = mockReqRes({ params: { id: order._id.toString() } });
    await getOrderById(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ total: 100 }));
  });

  it('returns 404 when not found', async () => {
    const { req, res } = mockReqRes({ params: { id: new mongoose.Types.ObjectId().toString() } });
    await getOrderById(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns 500 on cast error', async () => {
    const { req, res } = mockReqRes({ params: { id: 'invalid' } });
    await getOrderById(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe('updateOrderStatus', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('rejects non-terminal status update for Shiprocket orders', async () => {
    const order = await Order.create({
      userId: new mongoose.Types.ObjectId(), items: [], subtotal: 0, total: 100,
      shippingAddress: { address: 'a', state: 'TN', district: 'C', pincode: '600001' },
      mobileNumber: '9876543210', email: 'a@b.com', fullName: 'U',
      paymentMethod: 'UPI', paymentStatus: 'Paid', shippingMethod: 'SHIPROCKET', currentStatus: 'Pending',
    });
    const { req, res } = mockReqRes({ params: { id: order._id.toString() }, body: { status: 'Packed' } });
    await updateOrderStatus(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Shiprocket orders cannot be manually updated. Use the shipping workflow or wait for Shiprocket updates.',
    });
  });

  it('allows terminal status updates on Shiprocket orders', async () => {
    const order = await Order.create({
      userId: new mongoose.Types.ObjectId(), items: [], subtotal: 0, total: 100,
      shippingAddress: { address: 'a', state: 'TN', district: 'C', pincode: '600001' },
      mobileNumber: '9876543210', email: 'a@b.com', fullName: 'U',
      paymentMethod: 'UPI', paymentStatus: 'Paid', shippingMethod: 'SHIPROCKET', currentStatus: 'Pending',
    });
    (addTimelineEvent as unknown as Mock).mockResolvedValue({ status: 'Cancelled' });
    const { req, res } = mockReqRes({ params: { id: order._id.toString() }, body: { status: 'Cancelled' } });
    await updateOrderStatus(req, res);
    expect(addTimelineEvent).toHaveBeenCalledWith(expect.objectContaining({ status: 'Cancelled' }));
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Order status updated!',
      order: expect.objectContaining({ currentStatus: 'Cancelled' }),
    }));
  });

  it('updates payment status and calls addPaymentTimelineEvent', async () => {
    const order = await Order.create({
      userId: new mongoose.Types.ObjectId(), items: [], subtotal: 0, total: 100,
      shippingAddress: { address: 'a', state: 'TN', district: 'C', pincode: '600001' },
      mobileNumber: '9876543210', email: 'a@b.com', fullName: 'U',
      paymentMethod: 'UPI', paymentStatus: 'Pending', shippingMethod: 'MANUAL', currentStatus: 'Pending',
    });
    const { req, res } = mockReqRes({ params: { id: order._id.toString() }, body: { paymentStatus: 'Paid' } });
    await updateOrderStatus(req, res);
    expect(addPaymentTimelineEvent).toHaveBeenCalledWith(order._id.toString(), 'STAFF');
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      order: expect.objectContaining({ paymentStatus: 'Paid' }),
    }));
  });

  it('skips addPaymentTimelineEvent when paymentStatus unchanged', async () => {
    const order = await Order.create({
      userId: new mongoose.Types.ObjectId(), items: [], subtotal: 0, total: 100,
      shippingAddress: { address: 'a', state: 'TN', district: 'C', pincode: '600001' },
      mobileNumber: '9876543210', email: 'a@b.com', fullName: 'U',
      paymentMethod: 'UPI', paymentStatus: 'Paid', shippingMethod: 'MANUAL',
    });
    const { req, res } = mockReqRes({ params: { id: order._id.toString() }, body: { paymentStatus: 'Paid' } });
    await updateOrderStatus(req, res);
    expect(addPaymentTimelineEvent).not.toHaveBeenCalled();
  });

  it('calls maybeCreateRemindersForOrder when status is Delivered', async () => {
    const order = await Order.create({
      userId: new mongoose.Types.ObjectId(), items: [], subtotal: 0, total: 100,
      shippingAddress: { address: 'a', state: 'TN', district: 'C', pincode: '600001' },
      mobileNumber: '9876543210', email: 'a@b.com', fullName: 'U',
      paymentMethod: 'UPI', paymentStatus: 'Paid', shippingMethod: 'MANUAL', currentStatus: 'Pending',
    });
    (addTimelineEvent as unknown as Mock).mockResolvedValue({ status: 'Delivered' });
    (maybeCreateRemindersForOrder as unknown as Mock).mockResolvedValue([]);
    const { req, res } = mockReqRes({ params: { id: order._id.toString() }, body: { status: 'Delivered' } });
    await updateOrderStatus(req, res);
    expect(maybeCreateRemindersForOrder).toHaveBeenCalledWith(order._id.toString());
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      order: expect.objectContaining({ currentStatus: 'Delivered' }),
    }));
  });

  it('returns 404 when order not found', async () => {
    const { req, res } = mockReqRes({ params: { id: new mongoose.Types.ObjectId().toString() }, body: { status: 'Shipped' } });
    await updateOrderStatus(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns 500 on error', async () => {
    vi.spyOn(Order, 'findById').mockImplementationOnce(() => { throw new Error('fail'); });
    const { req, res } = mockReqRes({ params: { id: new mongoose.Types.ObjectId().toString() }, body: { status: 'Shipped' } });
    await updateOrderStatus(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe('getOrderTimeline', () => {
  it('returns timeline and currentStatus', async () => {
    const order = await Order.create({
      userId: new mongoose.Types.ObjectId(), items: [], subtotal: 0, total: 100,
      shippingAddress: { address: 'a', state: 'TN', district: 'C', pincode: '600001' },
      mobileNumber: '9876543210', email: 'a@b.com', fullName: 'U',
      paymentMethod: 'UPI', paymentStatus: 'Paid', currentStatus: 'Pending',
    });
    const { req, res } = mockReqRes({ params: { id: order._id.toString() } });
    await getOrderTimeline(req, res);
    expect(res.json).toHaveBeenCalledWith({ timeline: [], currentStatus: 'Pending' });
  });

  it('returns 404 when not found', async () => {
    const { req, res } = mockReqRes({ params: { id: new mongoose.Types.ObjectId().toString() } });
    await getOrderTimeline(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

describe('getCustomerOrders', () => {
  it('returns customer info with orders and totalSpent', async () => {
    const user = await User.create({ fullName: 'CU', email: 'cu@b.com', mobileNumber: '9876543222', password: 'x', isAdmin: false, role: 'USER', isActive: true, address: { address: 'x', state: 'TN', district: 'C', pincode: '600001' } });
    await Order.create({ userId: user._id, items: [], subtotal: 0, total: 300, shippingAddress: { address: 'a', state: 'TN', district: 'C', pincode: '600001' }, mobileNumber: '9876543210', email: 'cu@b.com', fullName: 'CU', paymentMethod: 'UPI', paymentStatus: 'Paid' });
    await Order.create({ userId: user._id, items: [], subtotal: 0, total: 700, shippingAddress: { address: 'b', state: 'TN', district: 'C', pincode: '600001' }, mobileNumber: '9876543211', email: 'cu@b.com', fullName: 'CU', paymentMethod: 'COD', paymentStatus: 'Pending' });
    const { req, res } = mockReqRes({ params: { userId: user._id.toString() } });
    await getCustomerOrders(req, res);
    const call = (res.json as Mock).mock.calls[0][0];
    expect(call.customer.totalOrders).toBe(2);
    expect(call.customer.totalSpent).toBe(1000);
    expect(call.orders.length).toBe(2);
  });

  it('filters by status', async () => {
    const user = await User.create({ fullName: 'CU', email: 'cu@b.com', mobileNumber: '9876543222', password: 'x', isAdmin: false, role: 'USER', isActive: true, address: { address: 'x', state: 'TN', district: 'C', pincode: '600001' } });
    await Order.create({ userId: user._id, items: [], subtotal: 0, total: 100, shippingAddress: { address: 'a', state: 'TN', district: 'C', pincode: '600001' }, mobileNumber: '9876543210', email: 'cu@b.com', fullName: 'CU', paymentMethod: 'UPI', paymentStatus: 'Paid', currentStatus: 'Delivered' });
    await Order.create({ userId: user._id, items: [], subtotal: 0, total: 200, shippingAddress: { address: 'b', state: 'TN', district: 'C', pincode: '600001' }, mobileNumber: '9876543211', email: 'cu@b.com', fullName: 'CU', paymentMethod: 'COD', paymentStatus: 'Pending', currentStatus: 'Pending' });
    const { req, res } = mockReqRes({ params: { userId: user._id.toString() }, query: { status: 'Delivered' } });
    await getCustomerOrders(req, res);
    const call = (res.json as Mock).mock.calls[0][0];
    expect(call.orders.length).toBe(1);
    expect(call.customer.totalSpent).toBe(100);
  });

  it('returns customer null when user not found', async () => {
    const { req, res } = mockReqRes({ params: { userId: new mongoose.Types.ObjectId().toString() } });
    await getCustomerOrders(req, res);
    const call = (res.json as Mock).mock.calls[0][0];
    expect(call.customer).toBeNull();
    expect(call.orders).toEqual([]);
  });
});

describe('getCustomersList', () => {
  it('returns sorted customers with order stats', async () => {
    const u1 = await User.create({ fullName: 'A', email: 'a@b.com', mobileNumber: '1', password: 'x', isAdmin: false, role: 'USER', isActive: true, address: { address: 'x', state: 'TN', district: 'C', pincode: '600001' } });
    const u2 = await User.create({ fullName: 'B', email: 'b@b.com', mobileNumber: '2', password: 'x', isAdmin: false, role: 'USER', isActive: true, address: { address: 'y', state: 'TN', district: 'C', pincode: '600001' } });
    await Order.create({ userId: u1._id, items: [], subtotal: 0, total: 500, shippingAddress: { address: 'a', state: 'TN', district: 'C', pincode: '600001' }, mobileNumber: '1', email: 'a@b.com', fullName: 'A', paymentMethod: 'UPI', paymentStatus: 'Paid' });
    await Order.create({ userId: u2._id, items: [], subtotal: 0, total: 1000, shippingAddress: { address: 'b', state: 'TN', district: 'C', pincode: '600001' }, mobileNumber: '2', email: 'b@b.com', fullName: 'B', paymentMethod: 'COD', paymentStatus: 'Paid' });
    const { req, res } = mockReqRes();
    await getCustomersList(req, res);
    const call = (res.json as Mock).mock.calls[0][0];
    expect(call).toHaveLength(2);
    expect(call[0].totalSpent).toBe(1000);
    expect(call[1].totalSpent).toBe(500);
  });

  it('handles users with no orders', async () => {
    await User.create({ fullName: 'C', email: 'c@b.com', mobileNumber: '3', password: 'x', isAdmin: false, role: 'USER', isActive: true, address: { address: 'z', state: 'TN', district: 'C', pincode: '600001' } });
    const { req, res } = mockReqRes();
    await getCustomersList(req, res);
    const call = (res.json as Mock).mock.calls[0][0];
    expect(call).toHaveLength(1);
    expect(call[0].totalOrders).toBe(0);
    expect(call[0].totalSpent).toBe(0);
    expect(call[0].lastOrderDate).toBeNull();
  });
});

describe('trackOrder', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns order with trackingHistory', async () => {
    const order = await Order.create({
      userId: new mongoose.Types.ObjectId(), items: [], subtotal: 0, total: 100,
      shippingAddress: { address: 'a', state: 'TN', district: 'C', pincode: '600001' },
      mobileNumber: '9876543210', email: 'a@b.com', fullName: 'U',
      paymentMethod: 'UPI', paymentStatus: 'Paid',
    });
    const { req, res } = mockReqRes({ params: { id: order._id.toString() } });
    await trackOrder(req, res);
    const call = (res.json as Mock).mock.calls[0][0];
    expect(call.total).toBe(100);
    expect(call.trackingHistory).toEqual([]);
  });

  it('best-effort when Shiprocket tracking fetch fails', async () => {
    const srMod = await import('../../../services/shiprocket.service.js');
    (srMod.default.trackShipment as Mock).mockRejectedValue(new Error('API down'));
    const order = await Order.create({
      userId: new mongoose.Types.ObjectId(), items: [], subtotal: 0, total: 100,
      shippingAddress: { address: 'a', state: 'TN', district: 'C', pincode: '600001' },
      mobileNumber: '9876543210', email: 'a@b.com', fullName: 'U',
      paymentMethod: 'UPI', paymentStatus: 'Paid',
      shiprocketDetails: { shipmentId: 'SR123' },
    });
    const { req, res } = mockReqRes({ params: { id: order._id.toString() } });
    await trackOrder(req, res);
    const call = (res.json as Mock).mock.calls[0][0];
    expect(call.total).toBe(100);
    expect(call.trackingHistory).toEqual([]);
  });

  it('returns 404 when order not found', async () => {
    const { req, res } = mockReqRes({ params: { id: new mongoose.Types.ObjectId().toString() } });
    await trackOrder(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

describe('getAdminAnalytics', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('builds analytics from orders, products, users, consultations', async () => {
    const uid = new mongoose.Types.ObjectId();
    await Order.create({ userId: uid, items: [], subtotal: 0, total: 1000, shippingAddress: { address: 'a', state: 'TN', district: 'C', pincode: '600001' }, mobileNumber: '9876543210', email: 'a@b.com', fullName: 'U', paymentMethod: 'UPI', paymentStatus: 'Paid' });
    await Product.create({ name: { en: 'P1', ta: '' }, price: 100, category: new mongoose.Types.ObjectId(), isActive: true, visibility: 'PUBLIC', stock: 10 });
    await User.create({ fullName: 'A', email: 'a@b.com', mobileNumber: '1', password: 'x', isAdmin: false, role: 'USER', isActive: true, address: { address: 'x', state: 'TN', district: 'C', pincode: '600001' } });
    const Consultation = (await import('../../../models/Consultation.js')).default;
    await Consultation.create({ fullName: 'CU', mobileNumber: '9876543210', email: 'cu@b.com', preferredDate: new Date(), preferredTime: '10:00', healthIssues: 'Cold' });
    const mockResult = { totalRevenue: 1000, totalOrders: 1, totalCustomers: 1, topProducts: [], categoryData: [], monthlyRevenue: [], bookingCount: 1 };
    (buildAnalytics as unknown as Mock).mockReturnValue(mockResult);
    const { req, res } = mockReqRes();
    await getAdminAnalytics(req, res);
    expect(buildAnalytics).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(mockResult);
  });

  it('returns 500 on error', async () => {
    vi.spyOn(Order, 'find').mockImplementationOnce(() => { throw new Error('fail'); });
    const { req, res } = mockReqRes();
    await getAdminAnalytics(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch analytics.' });
  });
});
