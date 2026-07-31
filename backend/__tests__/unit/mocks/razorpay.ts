import { vi } from 'vitest';

export const mockRazorpay = {
  orders: {
    create: vi.fn(),
    fetch: vi.fn(),
    fetchAll: vi.fn(),
  },
  payments: {
    fetch: vi.fn(),
    refund: vi.fn(),
  },
};

vi.mock('razorpay', () => {
  return {
    default: vi.fn(() => mockRazorpay),
  };
});

export default mockRazorpay;