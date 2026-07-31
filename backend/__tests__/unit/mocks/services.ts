import { vi } from 'vitest';

vi.mock('../../services/uploadService.js', () => ({
  uploadMedia: vi.fn(),
  deleteMedia: vi.fn(),
}));

vi.mock('../../services/reviewService.js', () => ({
  getProductsWithLatestReviews: vi.fn(),
  getLatestReviews: vi.fn(),
  getProductReviewStats: vi.fn(),
}));

vi.mock('../../services/stockService.js', () => ({
  getProductStock: vi.fn(),
  getProductsStock: vi.fn(),
}));

vi.mock('../../services/timelineService.js', () => ({
  addTimelineEvent: vi.fn(),
  addPaymentTimelineEvent: vi.fn(),
  addShiprocketAssignedEvent: vi.fn(),
  addShiprocketTrackingEvent: vi.fn(),
}));

vi.mock('../../services/reminderService.js', () => ({
  maybeCreateRemindersForOrder: vi.fn(),
}));

vi.mock('../../services/analyticsService.js', () => ({
  buildAnalytics: vi.fn(),
  getOverview: vi.fn(),
  getRevenueAnalytics: vi.fn(),
  getOrderAnalytics: vi.fn(),
  getCustomerAnalytics: vi.fn(),
  getProductAnalytics: vi.fn(),
  getCategoryAnalytics: vi.fn(),
  getInventoryAnalytics: vi.fn(),
  getBatchAnalytics: vi.fn(),
  getReminderAnalytics: vi.fn(),
  getReviewAnalytics: vi.fn(),
  getPaymentAnalytics: vi.fn(),
  getShippingAnalytics: vi.fn(),
  getStaffAnalytics: vi.fn(),
  getRecentActivities: vi.fn(),
  getNotifications: vi.fn(),
}));

export const mockServices = {
  uploadService: (await vi.importMock('../../services/uploadService.js')) as any,
  reviewService: (await vi.importMock('../../services/reviewService.js')) as any,
  stockService: (await vi.importMock('../../services/stockService.js')) as any,
  timelineService: (await vi.importMock('../../services/timelineService.js')) as any,
  reminderService: (await vi.importMock('../../services/reminderService.js')) as any,
  analyticsService: (await vi.importMock('../../services/analyticsService.js')) as any,
};

export default mockServices;