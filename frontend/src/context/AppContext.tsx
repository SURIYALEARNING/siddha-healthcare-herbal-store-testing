import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { Product, Blog, Coupon, User, Address, CartItem, Order } from "../types";
import {
  useAuth,
  useCart,
  useWishlist,
  useProducts,
  useOrders,
  useCoupons,
  useBlogs,
} from "../hooks";
import { bookConsultationApi, adminFetchConsultationsApi, adminFetchUsersApi, adminFetchAnalyticsApi } from "../api";
import { getErrorMessage } from "../api/errors";

interface ActiveCoupon {
  code: string;
  percent: number;
}

interface AppContextType {
  user: User | null;
  products: Product[];
  blogs: Blog[];
  coupons: Coupon[];
  cart: CartItem[];
  wishlist: string[];
  orders: Order[];
  activeCoupon: ActiveCoupon | null;
  loading: boolean;
  error: string | null;
  addToCart: (product: Product, quantity?: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  loginUser: (email: string, password: string) => Promise<boolean>;
  googleAuth: (accessToken: string, userData: User) => void;
  registerUser: (fullName: string, email: string, mobileNumber: string, password: string) => Promise<boolean>;
  logoutUser: () => void;
  updateUserProfile: (fullName: string, mobileNumber: string, address: Address) => Promise<boolean>;
  applyCouponCode: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  submitOrder: (shippingAddress: Address, mobileNumber: string, email: string, fullName: string, paymentMethod: string, razorpayPaymentId?: string) => Promise<Order | null>;
  trackOrder: (orderId: string) => Promise<Order | null>;
  bookConsultation: (fullName: string, mobileNumber: string, email: string, date: string, time: string, healthIssues: string) => Promise<boolean>;
  refreshProducts: () => Promise<void>;
  adminAddProduct: (productData: Partial<Product>) => Promise<boolean>;
  adminEditProduct: (productId: string, productData: Partial<Product>) => Promise<boolean>;
  adminDeleteProduct: (productId: string) => Promise<boolean>;
  adminAddBlog: (blogData: Partial<Blog>) => Promise<boolean>;
  adminEditBlog: (blogId: string, blogData: Partial<Blog>) => Promise<boolean>;
  adminDeleteBlog: (blogId: string) => Promise<boolean>;
  adminAddCoupon: (couponData: Partial<Coupon>) => Promise<boolean>;
  adminFetchOrders: () => Promise<Order[]>;
  adminFetchUsers: () => Promise<any[]>;
  adminFetchAnalytics: () => Promise<any>;
  adminUpdateOrderStatus: (orderId: string, status: string, paymentStatus?: string) => Promise<boolean>;
  adminFetchConsultations: () => Promise<any[]>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const cart = useCart(auth.user?.id);
  const wishlist = useWishlist(auth.user?.id);
  const products = useProducts();
  const orders = useOrders();
  const coupons = useCoupons();
  const blogs = useBlogs();

  const [activeCoupon, setActiveCoupon] = useState<ActiveCoupon | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      if (auth.user?.id) {
        const guestCart = localStorage.getItem("siddha_cart_guest");
        if (guestCart && JSON.parse(guestCart).length > 0) {
          await cart.syncGuestCart();
        } else {
          await cart.loadServerCart();
        }
        await orders.fetchUserOrders();
      }
      await Promise.all([
        products.fetchProducts(),
        blogs.fetchBlogs(),
        coupons.fetchCoupons(),
      ]);
      setLoading(false);
    };
    init();
  }, []);

  const loginUser = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const data = await auth.login(email, password);
      await cart.syncGuestCart();
      await orders.fetchUserOrders();
      return true;
    } catch {
      return false;
    }
  }, [auth, cart, orders]);

  const registerUser = useCallback(async (fullName: string, email: string, mobileNumber: string, password: string): Promise<boolean> => {
    try {
      await auth.register(fullName, email, mobileNumber, password);
      return true;
    } catch {
      return false;
    }
  }, [auth]);

  const logoutUser = useCallback(() => {
    auth.logout();
    cart.setCart([]);
    wishlist.setWishlist([]);
    orders.setOrders([]);
    setActiveCoupon(null);
  }, [auth, cart, wishlist, orders]);

  const updateUserProfile = useCallback(async (fullName: string, mobileNumber: string, address: Address): Promise<boolean> => {
    try {
      await auth.updateProfile(fullName, mobileNumber, address);
      return true;
    } catch {
      return false;
    }
  }, [auth]);

  const addToCart = useCallback((product: Product, quantity?: number) => {
    cart.addToCart(product, quantity, !!auth.user);
  }, [cart, auth.user]);

  const updateCartQuantity = useCallback((productId: string, quantity: number) => {
    const prod = products.products.find(p => p._id === productId);
    cart.updateQuantity(productId, quantity, prod?.stock || 99, !!auth.user);
  }, [cart, products.products, auth.user]);

  const removeFromCart = useCallback((productId: string) => {
    cart.removeFromCart(productId, !!auth.user);
  }, [cart, auth.user]);

  const clearCart = useCallback(() => {
    cart.clearCart(!!auth.user);
    setActiveCoupon(null);
  }, [cart, auth.user]);

  const applyCouponCode = useCallback(async (code: string): Promise<boolean> => {
    const result = await coupons.applyCoupon(code);
    if (result) {
      setActiveCoupon(result);
      return true;
    }
    return false;
  }, [coupons]);

  const removeCoupon = useCallback(() => setActiveCoupon(null), []);

  const submitOrder = useCallback(async (
    shippingAddress: Address, mobileNumber: string, email: string, fullName: string, paymentMethod: string,
    razorpayPaymentId?: string
  ): Promise<Order | null> => {
    if (!auth.user) return null;
    const subtotal = cart.cart.reduce((s, i) => s + i.discountPrice * i.quantity, 0);
    const discount = activeCoupon ? Math.round(subtotal * (activeCoupon.percent / 100)) : 0;
    try {
      const order = await orders.submitOrder({
        items: cart.cart.map(c => ({
          productId: c.productId, name: c.name, price: c.discountPrice, quantity: c.quantity, image: c.image,
        })),
        subtotal, couponDiscount: discount, total: subtotal - discount,
        shippingAddress, mobileNumber, email, fullName, paymentMethod,
        ...(razorpayPaymentId && { razorpayPaymentId }),
      });
      cart.clearCart(!!auth.user);
      setActiveCoupon(null);
      await products.fetchProducts();
      return order;
    } catch (e) {
      auth.setError(getErrorMessage(e, "Order placement failed."));
      return null;
    }
  }, [auth.user, cart, activeCoupon, orders, products]);

  const trackOrder = useCallback(async (orderId: string): Promise<Order | null> => {
    return orders.trackOrder(orderId);
  }, [orders]);

  const bookConsultation = useCallback(async (
    fullName: string, mobileNumber: string, email: string, date: string, time: string, healthIssues: string
  ): Promise<boolean> => {
    try {
      await bookConsultationApi(
        { fullName, mobileNumber, email, preferredDate: date, preferredTime: time, healthIssues },
        auth.user
      );
      return true;
    } catch {
      return false;
    }
  }, [auth.user]);

  const adminDeleteProduct = useCallback(async (productId: string) => {
    const ok = await products.adminDeleteProduct(productId);
    if (ok) {
      cart.setCart(prev => prev.filter(c => c.productId !== productId));
      wishlist.setWishlist(prev => prev.filter(id => id !== productId));
    }
    return ok;
  }, [products, cart, wishlist]);

  const adminUpdateOrderStatus = useCallback(async (orderId: string, status: string, paymentStatus?: string) => {
    const ok = await orders.adminUpdateOrderStatus(orderId, status, paymentStatus);
    if (ok && auth.user) await orders.fetchUserOrders();
    return ok;
  }, [orders, auth.user]);

  const value: AppContextType = {
    user: auth.user,
    products: products.products,
    blogs: blogs.blogs,
    coupons: coupons.coupons,
    cart: cart.cart,
    wishlist: wishlist.wishlist,
    orders: orders.orders,
    activeCoupon,
    loading,
    error: auth.error,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    toggleWishlist: wishlist.toggleWishlist,
    isInWishlist: wishlist.isInWishlist,
    loginUser,
    googleAuth: auth.googleAuth,
    registerUser,
    logoutUser,
    updateUserProfile,
    applyCouponCode,
    removeCoupon,
    submitOrder,
    trackOrder,
    bookConsultation,
    refreshProducts: products.fetchProducts,
    adminAddProduct: products.adminAddProduct,
    adminEditProduct: products.adminEditProduct,
    adminDeleteProduct,
    adminAddBlog: blogs.adminAddBlog,
    adminEditBlog: blogs.adminEditBlog,
    adminDeleteBlog: blogs.adminDeleteBlog,
    adminAddCoupon: coupons.adminAddCoupon,
    adminFetchOrders: orders.adminFetchOrders,
    adminFetchUsers: adminFetchUsersApi,
    adminFetchAnalytics: adminFetchAnalyticsApi,
    adminUpdateOrderStatus,
    adminFetchConsultations: adminFetchConsultationsApi,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
