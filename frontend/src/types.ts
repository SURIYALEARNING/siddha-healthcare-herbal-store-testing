export interface Review {
  id: string;
  user: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Product {
  _id: string;
  name: string;
  price: number;
  discountPrice: number;
  stock: number;
  category: string;
  description: string;
  ingredients: string[];
  benefits: string[];
  usageInstructions: string[];
  images: string[];
  reviews: Review[];
  rating: number;
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

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

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

export interface User {
  id: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  address?: Address;
  isAdmin?: boolean;
}
