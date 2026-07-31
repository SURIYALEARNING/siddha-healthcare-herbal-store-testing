import { vi } from 'vitest';

export const mockJwt = {
  sign: vi.fn().mockReturnValue('mock-jwt-token'),
  verify: vi.fn(),
  decode: vi.fn(),
};

vi.mock('jsonwebtoken', () => ({
  default: mockJwt,
  ...mockJwt,
}));

export default mockJwt;