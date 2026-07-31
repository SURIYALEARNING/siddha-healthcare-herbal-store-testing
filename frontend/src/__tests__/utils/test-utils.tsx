import React, { type ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { render, type RenderOptions } from '@testing-library/react';
import { vi } from 'vitest';

export const mockProduct = {
  _id: 'prod1',
  name: { en: 'Test Product', ta: 'சோதனை தயாரிப்பு' },
  productMotto: { en: 'Natural Healing', ta: 'இயற்கை குணப்படுத்துதல்' },
  description: { en: 'Test description for this herbal product', ta: 'சோதனை விளக்கம்' },
  shortDescription: { en: 'Short desc', ta: '' },
  expiryDuration: { en: '2 years', ta: '' },
  price: 500,
  discountPrice: 399,
  stock: 10,
  images: ['https://example.com/img.jpg'],
  media: [{ type: 'image' as const, url: 'https://example.com/img.jpg', publicId: 'p1', width: 800, height: 800, format: 'jpg', bytes: 1000, createdAt: '2024-01-01' }],
  category: { _id: 'cat1', name: { en: 'Immunity Boosters', ta: '' }, slug: { en: 'immunity', ta: '' }, description: { en: '', ta: '' }, image: '', isActive: true, createdAt: '', updatedAt: '' },
  reviewStats: { averageRating: 4.5, totalReviews: 10, rating1: 0, rating2: 0, rating3: 1, rating4: 2, rating5: 7 },
  latestReviews: [{ _id: 'r1', userName: 'Test User', rating: 5, comment: 'Great product!', createdAt: '2024-01-01' }],
  averageRating: 4.5,
  totalReviews: 10,
  ingredients: [{ en: 'Ingredient A', ta: '' }],
  benefits: [{ en: 'Benefit A', ta: '' }],
  usageInstructions: [{ en: 'Usage A', ta: '' }],
  safetyInstructions: [{ en: 'Safety A', ta: '' }],
  storageInstructions: [{ en: 'Storage A', ta: '' }],
  tags: [{ en: 'herbal', ta: '' }],
  size: { value: 100, unit: 'g' as const },
  isActive: true,
  isFeatured: true,
  visibility: 'PUBLIC' as const,
  enableReminder: false,
  reminderDays: 0,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

export const mockCartItem = {
  productId: 'prod1',
  name: 'Test Product',
  price: 500,
  discountPrice: 399,
  quantity: 2,
  image: 'https://example.com/img.jpg',
};

export const mockOrder = {
  id: 'ord123',
  _id: 'ord123',
  userId: 'user1',
  items: [{ productId: 'prod1', name: 'Test Product', price: 399, quantity: 2, image: 'https://example.com/img.jpg' }],
  subtotal: 798,
  couponDiscount: 0,
  deliveryCharges: 0,
  total: 798,
  shippingAddress: { address: '123 Street', state: 'Tamil Nadu', district: 'Coimbatore', pincode: '641004' },
  mobileNumber: '9876543210',
  email: 'test@test.com',
  fullName: 'Test User',
  status: 'Ordered' as const,
  currentStatus: 'Pending' as const,
  paymentMethod: 'Cash on Delivery',
  paymentStatus: 'Pending' as const,
  date: '2024-01-01',
  createdAt: '2024-01-01T00:00:00Z',
  timeline: [{ status: 'Order Placed', title: 'Order Placed', description: 'Order has been placed', createdAt: '2024-01-01T00:00:00Z', updatedBy: 'system', source: 'SYSTEM' as const }],
  tracking: { courierName: 'Test Courier', awbNumber: 'AWB123', estimatedDelivery: '2024-01-05' },
};

export const mockUser = {
  id: 'user1',
  fullName: 'Test User',
  email: 'test@test.com',
  mobileNumber: '9876543210',
  address: { address: '123 Street', state: 'Tamil Nadu', district: 'Coimbatore', pincode: '641004' },
  isAdmin: false,
  role: 'USER' as const,
  isActive: true,
  permissions: null as any,
  lastLogin: '2024-01-01',
};

export const mockAdminUser = {
  ...mockUser,
  isAdmin: true,
  role: 'SUPER_ADMIN' as const,
  permissions: { dashboard: true, products: true, categories: true, orders: true, customers: true, batches: true, reminders: true, reviews: true, coupons: true, carousel: true, consultations: true, shipping: true, staffManagement: true },
};

export const mockBlog = {
  id: 'blog1',
  title: 'Test Blog Article',
  content: 'Test blog content for reading about siddha wellness',
  category: 'Daily Wellness',
  author: 'Dr. S. Thirugnanasambandar',
  date: '2024-01-01',
  image: 'https://example.com/blog.jpg',
  reads: 100,
};

export const mockCoupon = {
  code: 'SAVE20',
  discountPercent: 20,
  expiryDate: '2025-01-01',
  active: true,
};

export function createMockAppData(overrides: Record<string, any> = {}) {
  return {
    user: null,
    products: [],
    blogs: [],
    coupons: [],
    cart: [],
    wishlist: [],
    orders: [],
    activeCoupon: null,
    loading: false,
    error: null,
    addToCart: vi.fn(),
    updateCartQuantity: vi.fn(),
    removeFromCart: vi.fn(),
    clearCart: vi.fn(),
    toggleWishlist: vi.fn(),
    isInWishlist: vi.fn().mockReturnValue(false),
    loginUser: vi.fn().mockResolvedValue(true),
    googleAuth: vi.fn(),
    registerUser: vi.fn().mockResolvedValue(true),
    logoutUser: vi.fn(),
    updateUserProfile: vi.fn().mockResolvedValue(true),
    applyCouponCode: vi.fn().mockResolvedValue(true),
    removeCoupon: vi.fn(),
    submitOrder: vi.fn().mockResolvedValue({ id: 'order123' }),
    trackOrder: vi.fn(),
    bookConsultation: vi.fn().mockResolvedValue(true),
    refreshProducts: vi.fn(),
    adminAddProduct: vi.fn().mockResolvedValue(true),
    adminEditProduct: vi.fn().mockResolvedValue(true),
    adminDeleteProduct: vi.fn().mockResolvedValue(true),
    adminAddBlog: vi.fn().mockResolvedValue(true),
    adminEditBlog: vi.fn().mockResolvedValue(true),
    adminDeleteBlog: vi.fn().mockResolvedValue(true),
    adminAddCoupon: vi.fn().mockResolvedValue(true),
    adminFetchOrders: vi.fn(),
    adminFetchUsers: vi.fn(),
    adminFetchAnalytics: vi.fn(),
    adminUpdateOrderStatus: vi.fn().mockResolvedValue(true),
    adminFetchConsultations: vi.fn().mockResolvedValue([]),
    submitConsultation: vi.fn().mockResolvedValue(true),
    ...overrides,
  };
}

export function createMockToastContext(overrides: Record<string, any> = {}) {
  return {
    toasts: [],
    showToast: vi.fn(),
    showSuccess: vi.fn(),
    showError: vi.fn(),
    showWarning: vi.fn(),
    showInfo: vi.fn(),
    removeToast: vi.fn(),
    ...overrides,
  };
}

export function AllProviders({ children, appOverrides = {} }: { children: ReactNode; appOverrides?: Record<string, any> }) {
  return <BrowserRouter>{children}</BrowserRouter>;
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  appOverrides?: Record<string, any>;
}

export function renderWithProviders(
  ui: React.ReactElement,
  { appOverrides = {}, ...renderOptions }: CustomRenderOptions = {}
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return <AllProviders appOverrides={appOverrides}>{children}</AllProviders>;
  }
  return render(ui, { wrapper: Wrapper, ...renderOptions });
}
