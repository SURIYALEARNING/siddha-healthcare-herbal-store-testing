import mongoose from 'mongoose';
import { User } from '../../../models/User.js';
import { createTestUser, createTestAdmin } from '../../helpers/factories';
import { requirePermission } from '../../../Auth/permissionMiddleware.js';

describe('requirePermission', () => {
  let req: any;
  let res: any;
  let next: any;

  beforeEach(() => {
    vi.clearAllMocks();
    req = { user: null };
    res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    next = vi.fn();
  });

  it('should return 401 if no user in req', async () => {
    req.user = undefined;

    const middleware = requirePermission('products');
    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Authentication required.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if user not found in DB', async () => {
    req.user = { id: new mongoose.Types.ObjectId().toString() };

    const middleware = requirePermission('products');
    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next() if SUPER_ADMIN role', async () => {
    const admin = await createTestAdmin();
    req.user = { id: admin._id.toString() };

    const middleware = requirePermission('products');
    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('should return 403 if not STAFF role', async () => {
    const user = await createTestUser({ role: 'USER' });
    req.user = { id: user._id.toString() };

    const middleware = requirePermission('products');
    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Access denied.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 403 if no permission for module', async () => {
    const staff = await createTestUser({
      role: 'STAFF',
      permissions: { products: false, dashboard: false },
    });
    req.user = { id: staff._id.toString() };

    const middleware = requirePermission('products');
    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Access denied. No permission for products.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next() if STAFF has permission', async () => {
    const staff = await createTestUser({
      role: 'STAFF',
      permissions: { products: true, dashboard: false },
    });
    req.user = { id: staff._id.toString() };

    const middleware = requirePermission('products');
    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('should return 500 on error', async () => {
    const user = await createTestUser({ role: 'STAFF' });
    req.user = { id: user._id.toString() };

    vi.spyOn(User, 'findById').mockRejectedValueOnce(new Error('Database error'));

    const middleware = requirePermission('products');
    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Permission check failed.' });
    expect(next).not.toHaveBeenCalled();
  });
});
