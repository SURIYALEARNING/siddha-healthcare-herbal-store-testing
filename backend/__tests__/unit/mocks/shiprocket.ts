import { vi } from 'vitest';

export const mockShiprocketService = {
  authenticate: vi.fn().mockResolvedValue({ token: 'mock-token' }),
  createOrder: vi.fn(),
  generateAWB: vi.fn(),
  requestPickup: vi.fn(),
  trackShipment: vi.fn(),
  cancelShipment: vi.fn(),
  checkServiceability: vi.fn(),
  syncPickupLocations: vi.fn(),
  getStoredPickupLocations: vi.fn(),
};

vi.mock('../../services/shiprocket.service.js', () => mockShiprocketService);

export default mockShiprocketService;