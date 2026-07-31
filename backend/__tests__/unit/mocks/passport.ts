import { vi } from 'vitest';

export const mockPassport = {
  initialize: vi.fn(() => (req: any, res: any, next: any) => next()),
  authenticate: vi.fn(() => (req: any, res: any, next: any) => next()),
  serializeUser: vi.fn(),
  deserializeUser: vi.fn(),
  use: vi.fn(),
};

vi.mock('passport', () => mockPassport);

vi.mock('passport-local', () => ({
  Strategy: vi.fn(),
}));

vi.mock('passport-google-oauth20', () => ({
  Strategy: vi.fn(),
}));

export default mockPassport;