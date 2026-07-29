export type ReminderStatus = "PENDING" | "WHATSAPP_SENT" | "CALL_PENDING" | "CALL_COMPLETED" | "PURCHASED_AGAIN" | "CLOSED";
export type WhatsappStatus = "PENDING" | "SENT" | "FAILED";
export type CallStatus = "PENDING" | "PURCHASED_AGAIN" | "NOT_INTERESTED" | "NO_RESPONSE" | "WRONG_NUMBER" | "CALL_LATER" | "OTHER";

export interface Reminder {
  _id: string;
  customerId: {
    _id: string;
    fullName: string;
    mobileNumber: string;
    email?: string;
  };
  orderId: string;
  orderItemIndex: number;
  productId: {
    _id: string;
    name: { en: string; ta?: string };
    images: { url: string }[];
    price: number;
    discountPrice?: number;
  };
  quantity: number;
  reminderDays: number;
  purchaseDate: string;
  reminderDate: string;
  whatsappStatus: WhatsappStatus;
  callStatus: CallStatus;
  callReason: string;
  callNotes: string;
  status: ReminderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ReminderStats {
  todayPending: number;
  todayWhatsappSent: number;
  todayCallPending: number;
}

export interface AdminReply {
  message: string;
  repliedBy?: string;
  repliedAt?: string;
}

export interface Review {
  _id: string;
  productId: any;
  userId?: any;
  userName: string;
  userAvatar?: string;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  adminReply?: AdminReply;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewUser {
  userId: string;
  userName: string;
  userAvatar: string;
  totalReviews: number;
  pendingReviews: number;
  approvedReviews: number;
}

export interface ReviewPreview {
  _id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  rating1: number;
  rating2: number;
  rating3: number;
  rating4: number;
  rating5: number;
}

export interface ReviewFormData {
  rating: number;
  title?: string;
  comment: string;
}

export interface PaginatedReviews {
  reviews: Review[];
  total: number;
  page: number;
  totalPages: number;
}

export interface MediaItem {
  type: "image" | "video";
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  duration?: number | null;
  createdAt: string;
}

export interface Product {
  _id: string;
  name: Translation | string;
  productMotto?: Translation | string;
  shortDescription?: Translation | string;
  description: Translation | string;
  expiryDuration?: Translation | string;
  category: Category | string;
  price: number;
  discountPrice: number;
  stock: number;
  size?: Size;
  ingredients: (Translation | string)[];
  benefits: (Translation | string)[];
  usageInstructions: (Translation | string)[];
  safetyInstructions?: (Translation | string)[];
  storageInstructions?: (Translation | string)[];
  tags?: (Translation | string)[];
  images: string[];
  media?: MediaItem[];
  reviewStats: ReviewStats;
  latestReviews?: ReviewPreview[];
  averageRating?: number;
  totalReviews?: number;
  isFeatured?: boolean;
  isActive?: boolean;
  visibility?: "PUBLIC" | "UNLISTED";
  enableReminder?: boolean;
  reminderDays?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Address {
  address: string;
  state: string;
  district: string;
  pincode: string;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  discountPrice: number;
  quantity: number;
  image: string;
}

export interface BatchAllocation {
  batchId: string;
  batchNumber?: string;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  batchAllocations?: BatchAllocation[];
}

export type ShippingStatus =
  | "PAID" | "CONFIRMED" | "PACKED" | "PICKUP_REQUESTED"
  | "PICKED_UP" | "IN_TRANSIT" | "OUT_FOR_DELIVERY"
  | "DELIVERED" | "RETURNED" | "CANCELLED";

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  couponDiscount: number;
  total: number;
  shippingAddress: Address;
  mobileNumber: string;
  email: string;
  fullName: string;
  status: 'Ordered' | 'Packed' | 'Shipped' | 'Out for Delivery' | 'Delivered';
  paymentMethod: string;
  paymentStatus: 'Paid' | 'Pending';
  date: string;
  createdAt?: string;
  razorpayPaymentId?: string;
  shippingStatus?: ShippingStatus;
  shiprocketOrderId?: string;
  awbCode?: string;
  courierName?: string;
  trackingLink?: string;
}

export interface Shipment {
  _id: string;
  orderId: string;
  shiprocketOrderId?: string;
  awbCode?: string;
  courierName?: string;
  pickupStatus?: string;
  trackingStatus?: string;
  trackingHistory?: TrackingEntry[];
  pickupScheduledAt?: string;
  deliveredAt?: string;
  labelUrl?: string;
  manifestUrl?: string;
  dimensions?: { length: number; breadth: number; height: number };
  weight?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TrackingEntry {
  status: string;
  location: string;
  timestamp: string;
  message: string;
}

export interface ShippingStats {
  total: number;
  paid: number;
  confirmed: number;
  packed: number;
  pickupRequested: number;
  inTransit: number;
  delivered: number;
  cancelled: number;
  returned: number;
}

export interface Blog {
  id: string;
  title: string;
  content: string;
  category: string;
  author: string;
  date: string;
  image: string;
  reads: number;
}

export interface Coupon {
  code: string;
  discountPercent: number;
  expiryDate: string;
  active: boolean;
}

export interface Consultation {
  id: string;
  fullName: string;
  mobileNumber: string;
  email: string;
  preferredDate: string;
  preferredTime: string;
  healthIssues: string;
  status: string;
  date: string;
}

export interface Translation {
  en: string;
  ta: string;
}

export interface Size {
  value: number;
  unit: 'mg' | 'g' | 'kg' | 'ml' | 'L' | 'capsule' | 'tablet' | 'pcs';
}

export interface Category {
  _id: string;
  name: Translation;
  slug: Translation;
  description: Translation;
  image: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PincodeResponse {
  success: boolean;
  available: boolean;
  message: string;
  estimatedDays?: number;
  codAvailable?: boolean;
  prepaidAvailable?: boolean;
  courier?: { name: string; company: string };
  pincode?: string;
  address?: string;
}

export interface Batch {
  _id: string;
  productId: string | Product;
  batchNumber: string;
  quantityProduced: number;
  currentStock: number;
  manufactureDate: string;
  expiryDate: string;
  preparedBy: string;
  supervisedBy: string;
  approvedBy: string;
  status: "ACTIVE" | "OUT_OF_STOCK" | "HOLD" | "EXPIRED";
  createdAt: string;
  updatedAt: string;
}

export interface StockAdjustment {
  _id: string;
  batchId: string;
  previousStock: number;
  newStock: number;
  difference: number;
  reason: "OFFLINE_SALES" | "EXPIRED" | "DAMAGED" | "STOCK_CORRECTION" | "SAMPLE" | "OTHER";
  reasonDetails: string;
  updatedBy: string;
  createdAt: string;
}

export type PermissionKey =
  | "dashboard" | "products" | "categories" | "orders" | "customers"
  | "batches" | "reminders" | "reviews" | "coupons" | "carousel"
  | "consultations" | "shipping" | "staffManagement";

export type Permissions = Record<PermissionKey, boolean>;

export interface User {
  id: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  address?: Address;
  isAdmin?: boolean;
  role?: "SUPER_ADMIN" | "STAFF";
  isActive?: boolean;
  permissions?: Permissions;
  lastLogin?: string;
}

// Analytics types
export interface OverviewData {
  totalRevenue: number; totalOrders: number; totalCustomers: number;
  totalProducts: number; totalCategories: number; averageOrderValue: number;
  todayRevenue: number; todayOrders: number;
  pendingOrders: number; deliveredOrders: number; cancelledOrders: number;
  lowStockProducts: number; outOfStockProducts: number; expiredBatches: number;
  pendingReminders: number; pendingReviews: number;
  growth: { revenue: number; orders: number; avgOrderValue: number };
}

export interface DailyRevenue { date: string; revenue: number; orders: number }
export interface RevenueData { grossRevenue: number; discountAmount: number; netRevenue: number; dailyRevenue: DailyRevenue[] }
export interface OrderAnalytics { totalOrders: number; completedOrders: number; pendingOrders: number; cancelledOrders: number; shippedOrders: number; orderStatusChart: { name: string; value: number }[]; paymentMethodChart: { name: string; value: number }[]; ordersByDay: { date: string; count: number }[] }
export interface TopCustomer { id: string; fullName: string; email: string; mobileNumber: string; totalOrders: number; totalSpent: number }
export interface CustomerAnalytics { totalCustomers: number; newCustomers: number; returningCustomers: number; repeatPurchaseRate: number; customerLifetimeValue: number; topCustomers: TopCustomer[]; registrationTrend: { date: string; count: number }[] }
export interface ProductAnalytics { topSelling: any[]; leastSelling: any[]; totalProducts: number; productsWithSales: number; productsNeverSold: number }
export interface CategoryInfo { id: string; name: string; sales: number; revenue: number; orders: number }
export interface CategoryAnalytics { categories: CategoryInfo[]; totalCategories: number }
export interface InventoryAnalytics { totalStockQuantity: number; lowStockCount: number; outOfStockCount: number; totalProduced: number; totalSold: number }
export interface BatchAnalytics { activeBatches: number; outOfStockBatches: number; expiredBatches: number; holdBatches: number; statusChart: { name: string; value: number }[]; batches: any[] }
export interface ReminderAnalytics { todayReminders: number; pendingReminders: number; whatsappSent: number; callPending: number; callCompleted: number; purchasedAgain: number; notInterested: number; noResponse: number; reminderTrend: { date: string; count: number }[]; conversionRate: number }
export interface ReviewAnalytics { totalReviews: number; pendingReviews: number; approvedReviews: number; averageRating: number; ratingChart: { rating: number; count: number }[]; reviewTrend: { date: string; count: number }[] }
export interface PaymentAnalytics { successfulPayments: number; failedPayments: number; refundAmount: number; paymentMethodChart: { name: string; value: number }[] }
export interface ShippingAnalytics { deliveredOrders: number; inTransitOrders: number; rtoOrders: number; cancelledShipments: number }
export interface StaffAnalytics { totalStaff: number; activeStaff: number; staff: any[] }
export interface Activity { type: string; message: string; detail: string; time: string }
export interface Notification { type: string; message: string; severity: string }
