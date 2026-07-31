import mockJwt from '../../unit/mocks/jwt';
import { verifyToken, verifyAdmin } from '../../../Auth/authMiddleware.js';

const mockedVerify = vi.mocked(mockJwt.verify);

describe('verifyToken', () => {
  let req: any;
  let res: any;
  let next: any;

  beforeEach(() => {
    vi.clearAllMocks();
    req = { headers: {} };
    res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    next = vi.fn();
  });

  it('should return 401 if no authorization header', () => {
    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Access Denied. No token provided.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if token is missing (empty Bearer)', () => {
    req.headers.authorization = 'Bearer ';

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Access Denied. No token provided.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 403 if token is invalid/expired', () => {
    req.headers.authorization = 'Bearer invalid-token';
    mockedVerify.mockImplementation((_token: any, _secret: any, cb: any) => cb(new Error('jwt expired')));

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid or Expired Token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next() and set req.user with valid token', () => {
    req.headers.authorization = 'Bearer valid-token';
    const decodedUser = { id: 'user-id', isAdmin: false };
    mockedVerify.mockImplementation((_token: any, _secret: any, cb: any) => cb(null, decodedUser));

    verifyToken(req, res, next);

    expect(req.user).toEqual(decodedUser);
    expect(next).toHaveBeenCalled();
  });

  it('should use the correct secret from env', () => {
    req.headers.authorization = 'Bearer valid-token';
    mockedVerify.mockImplementation((_token: any, _secret: any, cb: any) => cb(null, { id: 'user-id', isAdmin: false }));

    verifyToken(req, res, next);

    expect(mockedVerify).toHaveBeenCalledWith(
      'valid-token',
      process.env.ACCESS_TOKEN_SECRET,
      expect.any(Function),
    );
    expect(next).toHaveBeenCalled();
  });
});

describe('verifyAdmin', () => {
  let req: any;
  let res: any;
  let next: any;

  beforeEach(() => {
    vi.clearAllMocks();
    req = { headers: {} };
    res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    next = vi.fn();
  });

  it('should return 401 if no auth header', () => {
    verifyAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Access Denied. No token provided!' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if not Bearer token', () => {
    req.headers.authorization = 'Basic some-token';

    verifyAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Access Denied. No token provided!' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 403 if user is not admin', () => {
    req.headers.authorization = 'Bearer valid-token';
    mockedVerify.mockReturnValue({ id: 'user-id', isAdmin: false });

    verifyAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Access Denied. Admin only route!' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next() if user is admin with valid token', () => {
    req.headers.authorization = 'Bearer valid-token';
    const adminUser = { id: 'admin-id', isAdmin: true };
    mockedVerify.mockReturnValue(adminUser);

    verifyAdmin(req, res, next);

    expect(req.user).toEqual(adminUser);
    expect(next).toHaveBeenCalled();
  });

  it('should return 400 for invalid token format', () => {
    req.headers.authorization = 'Bearer invalid-token';
    mockedVerify.mockImplementation(() => { throw new Error('jwt malformed'); });

    verifyAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid Token!' });
    expect(next).not.toHaveBeenCalled();
  });
});
