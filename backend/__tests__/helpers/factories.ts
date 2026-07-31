import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export const createTestUser = async (overrides = {}) => {
  const { User } = await import('../../models/User.js');
  const password = await bcrypt.hash('Test@123', 10);
  return User.create({
    fullName: 'Test User',
    email: 'test@example.com',
    mobileNumber: '9876543210',
    password,
    isAdmin: false,
    role: 'USER',
    isActive: true,
    address: { address: '123 Test St', state: 'Tamil Nadu', district: 'Chennai', pincode: '600001' },
    ...overrides,
  });
};

export const createTestAdmin = async (overrides = {}) => {
  const { User } = await import('../../models/User.js');
  const password = await bcrypt.hash('Admin@123', 10);
  return User.create({
    fullName: 'Admin User',
    email: 'admin@example.com',
    mobileNumber: '9876543211',
    password,
    isAdmin: true,
    role: 'SUPER_ADMIN',
    isActive: true,
    address: { address: '456 Admin St', state: 'Tamil Nadu', district: 'Chennai', pincode: '600001' },
    ...overrides,
  });
};

export const createTestPendingUser = async (overrides = {}) => {
  const { Otp } = await import('../../models/User.js');
  const password = await bcrypt.hash('Test@123', 10);
  return Otp.create({
    email: 'pending@example.com',
    fullName: 'Pending User',
    mobileNumber: '9876543212',
    password,
    otp: '123456',
    ...overrides,
  });
};

export const createTestCategory = async (overrides = {}) => {
  const Category = (await import('../../models/Category.js')).default;
  return Category.create({
    name: { en: 'Test Category', ta: '' },
    slug: { en: 'test-category', ta: '' },
    description: { en: 'Test description', ta: '' },
    image: 'https://example.com/cat.jpg',
    isActive: true,
    ...overrides,
  });
};

export const createTestProduct = async (overrides = {}) => {
  const Product = (await import('../../models/Product.js')).default;
  const cat = overrides.category || (await createTestCategory())._id;
  return Product.create({
    name: { en: 'Test Product', ta: '' },
    price: 500,
    discountPrice: 450,
    category: cat,
    description: { en: 'Test description', ta: '' },
    images: ['https://example.com/img.jpg'],
    isActive: true,
    visibility: 'PUBLIC',
    stock: 100,
    size: { value: 100, unit: 'ml' },
    ingredients: [{ en: 'Ingredient 1', ta: '' }],
    benefits: [{ en: 'Benefit 1', ta: '' }],
    usageInstructions: [{ en: 'Usage 1', ta: '' }],
    ...overrides,
  });
};

export const createTestOrder = async (overrides = {}) => {
  const Order = (await import('../../models/Order.js')).default;
  const user = overrides.userId || (await createTestUser())._id;
  const product = overrides.productId || (await createTestProduct())._id;
  return Order.create({
    userId: user,
    items: [{
      productId: product,
      name: 'Test Product',
      image: 'https://example.com/img.jpg',
      purchasedPrice: 450,
      quantity: 2,
      itemTotal: 900,
    }],
    subtotal: 900,
    couponDiscount: 0,
    deliveryCharges: 0,
    total: 900,
    shippingAddress: { address: '123 Test St', state: 'Tamil Nadu', district: 'Chennai', pincode: '600001' },
    mobileNumber: '9876543210',
    email: 'test@example.com',
    fullName: 'Test User',
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    currentStatus: 'Pending',
    shippingMethod: 'MANUAL',
    ...overrides,
  });
};

export const createTestCoupon = async (overrides = {}) => {
  const Coupon = (await import('../../models/Coupon.js')).default;
  return Coupon.create({
    code: 'TEST10',
    discountPercent: 10,
    expiryDate: new Date('2027-12-31'),
    active: true,
    usageLimit: 100,
    usedCount: 0,
    ...overrides,
  });
};

export const createTestBatch = async (overrides = {}) => {
  const Batch = (await import('../../models/Batch.js')).default;
  const product = overrides.productId || (await createTestProduct())._id;
  return Batch.create({
    productId: product,
    batchNumber: 'BATCH-001',
    quantityProduced: 100,
    currentStock: 100,
    manufactureDate: new Date('2026-01-01'),
    expiryDate: new Date('2028-01-01'),
    preparedBy: 'Preparer',
    supervisedBy: 'Supervisor',
    approvedBy: 'Approver',
    status: 'ACTIVE',
    ...overrides,
  });
};

export const createTestBlog = async (overrides = {}) => {
  const Blog = (await import('../../models/Blog.js')).default;
  return Blog.create({
    title: 'Test Blog',
    content: 'Test content',
    category: 'Health',
    author: 'Admin',
    date: new Date(),
    image: 'https://example.com/blog.jpg',
    reads: 0,
    ...overrides,
  });
};

export const createTestReview = async (overrides = {}) => {
  const Review = (await import('../../models/Review.js')).default;
  const product = overrides.productId || (await createTestProduct())._id;
  const user = overrides.userId || (await createTestUser())._id;
  return Review.create({
    productId: product,
    userId: user,
    userName: 'Test User',
    rating: 4,
    title: 'Great product',
    comment: 'Really liked it',
    isVerifiedPurchase: true,
    isApproved: true,
    helpfulCount: 0,
    ...overrides,
  });
};

export const createTestConsultation = async (overrides = {}) => {
  const Consultation = (await import('../../models/Consultation.js')).default;
  const user = overrides.userId || (await createTestUser())._id;
  return Consultation.create({
    fullName: 'Test User',
    mobileNumber: '9876543210',
    email: 'test@example.com',
    preferredDate: new Date('2027-06-15'),
    preferredTime: '10:00 AM',
    healthIssues: 'General checkup',
    status: 'Pending',
    userId: user,
    ...overrides,
  });
};

export const generateToken = (user: any) => {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { id: user._id, isAdmin: user.isAdmin, role: user.role },
    process.env.ACCESS_TOKEN_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
};

export const createAuthHeader = (token: string) => ({
  authorization: `Bearer ${token}`,
});