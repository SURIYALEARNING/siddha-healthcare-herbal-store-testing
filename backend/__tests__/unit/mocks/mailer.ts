import { vi } from 'vitest';

export const mockMailer = {
  createTransport: vi.fn(() => ({
    sendMail: vi.fn().mockResolvedValue({ accepted: ['test@example.com'], rejected: [] }),
  })),
};

vi.mock('nodemailer', () => mockMailer);

export default mockMailer;