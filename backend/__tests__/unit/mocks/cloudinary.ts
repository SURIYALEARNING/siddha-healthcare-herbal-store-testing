import { vi } from 'vitest';

export const mockCloudinary = {
  v2: {
    uploader: {
      upload: vi.fn(),
      destroy: vi.fn(),
    },
    api: {
      delete_resources: vi.fn(),
    },
  },
  config: vi.fn(),
};

vi.mock('cloudinary', () => mockCloudinary);

export default mockCloudinary;