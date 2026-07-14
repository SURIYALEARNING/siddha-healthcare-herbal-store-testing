import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product, Blog, Coupon, User, Address, CartItem, Order, OrderItem } from "../types";

interface AppContextType {
  user: User | null;
  products: Product[];
  blogs: Blog[];
  coupons: Coupon[];
  cart: CartItem[];
  wishlist: string[];
  orders: Order[];
  activeCoupon: { code: string; percent: number } | null;
  loading: boolean;
  error: string | null;
  // Cart Actions
  addToCart: (product: Product, quantity?: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  // Wishlist
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  // Auth
  loginUser: (email: string, password: string) => Promise<boolean>;
  registerUser: (fullName: string, email: string, mobileNumber: string, password: string) => Promise<boolean>;
  logoutUser: () => void;
  updateUserProfile: (fullName: string, mobileNumber: string, address: Address) => Promise<boolean>;
  // Order & Coupon
  applyCouponCode: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  submitOrder: (shippingAddress: Address, mobileNumber: string, email: string, fullName: string, paymentMethod: string) => Promise<Order | null>;
  trackOrder: (orderId: string) => Promise<Order | null>;
  bookConsultation: (fullName: string, mobileNumber: string, email: string, date: string, time: string, healthIssues: string) => Promise<boolean>;
  refreshProducts: () => Promise<void>;

  // Admin Operations
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
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeCoupon, setActiveCoupon] = useState<{ code: string; percent: number } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const accessToken = localStorage.getItem('accessToken')

  // Load Initial Data
  useEffect(() => {
    const initApp = async () => {
      setLoading(true);
      // Load user from localStorage
      const savedUser = localStorage.getItem("siddha_user");
      let currentUserId = "";
      if (savedUser) {
        try {
          const u = JSON.parse(savedUser);
          setUser(u);
          currentUserId = u.id;
        } catch (e) {
          localStorage.removeItem("siddha_user");
        }
      }

      // Load items from local storage
      const savedWishlist = localStorage.getItem(`siddha_wishlist_${currentUserId || "guest"}`);
      if (savedWishlist) {
        setWishlist(JSON.parse(savedWishlist));
      }

      const savedCart = localStorage.getItem(`siddha_cart_${currentUserId || "guest"}`);
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }

      await Promise.all([
        fetchProducts(),
        fetchBlogs(),
        fetchCoupons()
      ]);

      if (currentUserId) {
        await fetchUserOrders(currentUserId);
      }
      setLoading(false);
    };

    initApp();
  }, []);

  // Update localStorage when cart / wishlist changing
  useEffect(() => {
    const key = user ? user.id : "guest";
    localStorage.setItem(`siddha_cart_${key}`, JSON.stringify(cart));
  }, [cart, user]);

  useEffect(() => {
    const key = user ? user.id : "guest";
    localStorage.setItem(`siddha_wishlist_${key}`, JSON.stringify(wishlist));
  }, [wishlist, user]);

  // Network Fetchers
  const fetchProducts = async () => {
    try {



      console.log("GET PRODUCT", accessToken);
      const res = await fetch("http://localhost:5000/api/products", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        }
      });
      if (res.ok) {
        const data = await res.json();

        setProducts(data);
      }
    } catch (e) {
      console.error("Failed to load products: ", e);
    }
  };

  const fetchBlogs = async () => {
    try {
      const res = await fetch("/api/blogs");
      if (res.ok) {
        const data = await res.json();
        setBlogs(data);
      }
    } catch (e) {
      console.error("Failed to load health blogs: ", e);
    }
  };

  const fetchCoupons = async () => {
    try {
      const res = await fetch("/api/coupons");
      if (res.ok) {
        const data = await res.json();
        setCoupons(data);
      }
    } catch (e) {
      console.error("Failed to list coupons: ", e);
    }
  };

  const fetchUserOrders = async (userId: string) => {
    console.log("order api fetch");

    try {
      const res = await fetch("/api/orders", {
        headers: { "Authorization": `Bearer ${userId}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (e) {
      console.error("Failed to load orders: ");
    }
  };

  const refreshProducts = async () => {
    await fetchProducts();
  };

  // Cart Functions
  const addToCart = (product: Product, quantity: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product._id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product._id
            ? { ...item, quantity: Math.min(product.stock, item.quantity + quantity) }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product._id,
          name: product.name,
          price: product.price,
          discountPrice: product.discountPrice,
          quantity: Math.min(product.stock, quantity),
          image: product.images[0]
        }
      ];
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    const prodObj = products.find(p => p._id === productId);
    const maxStock = prodObj ? prodObj.stock : 99;

    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.max(1, Math.min(maxStock, quantity)) }
          : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setActiveCoupon(null);
  };

  // Wishlist Functions
  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const isInWishlist = (productId: string) => {
    return wishlist.includes(productId);
  };

  // Auth Functions
  const loginUser = async (email: string, password: string): Promise<boolean> => {
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem('accessToken', data.accessToken)
        localStorage.setItem("siddha_user", JSON.stringify(data.user));

        // Load user dynamic states
        const customWishlist = localStorage.getItem(`siddha_wishlist_${data.user.id}`);
        setWishlist(customWishlist ? JSON.parse(customWishlist) : []);

        const customCart = localStorage.getItem(`siddha_cart_${data.user.id}`);
        setCart(customCart ? JSON.parse(customCart) : []);

        await fetchUserOrders(data.user.id);
        return true;
      } else {
        const fail = await res.json();
        setError(fail.error || "Login unsuccessful.");
        return false;
      }
    } catch (e) {
      setError("Server connection failure. Please retry.");
      return false;
    }
  };

  const registerUser = async (fullName: string, email: string, mobileNumber: string, password: string): Promise<boolean> => {
    setError(null);
    console.log("data send to backend");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, mobileNumber, password })
      });
      if (res.ok) {
        const data = await res.json();
        // Automatically login the newly registered user
        console.log({ fullName, email, mobileNumber, password });

        // return await loginUser(email, password);
      } else {
        const fail = await res.json();
        setError(fail.error || "Registration validation failed.");
        return false;
      }
    } catch (e) {
      setError(`Server registration connection failure. ${e}`);
      return false;
    }
  };



  const logoutUser = () => {
    setUser(null);
    setOrders([]);
    localStorage.removeItem("siddha_user");
    // Clear state or fallback to guest wishlist/cart
    setWishlist([]);
    setCart([]);
    setActiveCoupon(null);
  };

  const updateUserProfile = async (fullName: string, mobileNumber: string, address: Address): Promise<boolean> => {
    if (!user) return false;
    setError(null);
    try {
      // 1. Get current logged-in user to fetch their unique MongoDB target ID
      const localUser = JSON.parse(localStorage.getItem("siddha_user") || "{}");
      if (!localUser.id) {
        console.error("User context missing! Please re-login.");
        return false;
      }
      const res = await fetch(`/api/auth/update-profile/${localUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.id}`
        },
        body: JSON.stringify({
          fullName,
          mobileNumber,
          address: address.address,
          state: address.state,
          district: address.district,
          pincode: address.pincode
        })
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem("siddha_user", JSON.stringify(data.user));
        return true;
      } else {
        const fail = await res.json();
        setError(fail.error || "Profile modify failed.");
        return false;
      }
    } catch (e) {
      setError("Failed to modify user profile details.");
      return false;
    }
  };

  // Coupons
  const applyCouponCode = async (code: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/coupons/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code })
      });
      if (res.ok) {
        const data = await res.json();
        setActiveCoupon({ code: code.toUpperCase(), percent: data.discountPercent });
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const removeCoupon = () => {
    setActiveCoupon(null);
  };

  // Submit Checkout Order
  const submitOrder = async (
    shippingAddress: Address,
    mobileNumber: string,
    email: string,
    fullName: string,
    paymentMethod: string
  ): Promise<Order | null> => {
    if (!user) {
      setError("Please sign in to place an order.");
      return null;
    }

    const subtotal = cart.reduce((sum, item) => sum + (item.discountPrice * item.quantity), 0);
    const discount = activeCoupon ? Math.round(subtotal * (activeCoupon.percent / 100)) : 0;
    const total = subtotal - discount;
    console.log(cart);

    const checkoutPayload = {
      items: cart.map(c => ({
        productId: c.productId,
        name: c.name,
        price: c.discountPrice,
        quantity: c.quantity,
        image: c.image
      })),
      subtotal,
      couponDiscount: discount,
      total,
      shippingAddress,
      mobileNumber,
      email,
      fullName,
      paymentMethod
    };


    try {
      const accessToken = localStorage.getItem('accessToken')
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify(checkoutPayload)
      });

      if (res.ok) {
        const data = await res.json();
        clearCart();
        // pre-prepend new order to client view state
        setOrders(prev => [data.order, ...prev]);
        // Re-load products in case stock counts decreased
        await fetchProducts();
        return data.order;
      } else {
        const fail = await res.json();
        console.log(fail);
        setError(fail.error || "Order placement failed.");
        return null;
      }
    } catch (e) {
      setError("Failed to submit checkout payload to clinic server.");
      return null;
    }
  };

  // Public/user Order Tracking
  const trackOrder = async (orderId: string): Promise<Order | null> => {
    try {
      const res = await fetch(`/api/orders/track/${orderId}`);
      if (res.ok) {
        return await res.json();
      }
      return null;
    } catch (e) {
      return null;
    }
  };

  // Book Consultation with SMS / physicians
  const bookConsultation = async (
    fullName: string,
    mobileNumber: string,
    email: string,
    date: string,
    time: string,
    healthIssues: string
  ): Promise<boolean> => {
    try {
      const headers: { [key: string]: string } = { "Content-Type": "application/json" };
      if (user) headers["Authorization"] = `Bearer ${user.id}`;

      const res = await fetch("/api/consultation", {
        method: "POST",
        headers,
        body: JSON.stringify({ fullName, mobileNumber, email, preferredDate: date, preferredTime: time, healthIssues })
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  };

  // --- ADMIN ACTIONS ---
  const getAdminHeaders = () => {
    if (!user) return {};
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${user.id}`
    };
  };

  const adminAddProduct = async (productData: Partial<Product>): Promise<boolean> => {

    try {
      const res = await fetch("/api/products/manage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify(productData)
      });
      if (res.ok) {
        await fetchProducts();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const adminEditProduct = async (productId: string, productData: Partial<Product>): Promise<boolean> => {
    try {
      const res = await fetch(`/api/products/manage/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify(productData)
      });
      if (res.ok) {
        await fetchProducts();


        return true;
      }
      return false;
    } catch (e) {

      return false;
    }
  };

  const adminDeleteProduct = async (productId: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/products/manage/${productId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
      });
      if (res.ok) {
        await fetchProducts();
        // Evict from cart & wishlist
        console.log("admindelete");
        setCart(prev => prev.filter(c => c.productId !== productId));
        setWishlist(prev => prev.filter(id => id !== productId));
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const adminAddBlog = async (blogData: Partial<Blog>): Promise<boolean> => {
    try {
      const res = await fetch("/api/blogs/manage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify(blogData)
      });
      if (res.ok) {
        await fetchBlogs();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const adminEditBlog = async (blogId: string, blogData: Partial<Blog>): Promise<boolean> => {
    try {
      const res = await fetch(`/api/blogs/manage/${blogId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify(blogData)
      });
      if (res.ok) {
        await fetchBlogs();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const adminDeleteBlog = async (blogId: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/blogs/manage/${blogId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
      });
      if (res.ok) {
        await fetchBlogs();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const adminAddCoupon = async (couponData: Partial<Coupon>): Promise<boolean> => {
    try {
      const res = await fetch("/api/coupons/manage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify(couponData)
      });
      if (res.ok) {
        await fetchCoupons();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const adminFetchOrders = async (): Promise<Order[]> => {
    try {
      const res = await fetch("/api/admin/orders", {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
      });
      if (res.ok) {
        return await res.json();
      }
      return [];
    } catch (e) {
      return [];
    }
  };

  const adminFetchUsers = async (): Promise<any[]> => {
    try {
      const res = await fetch("/api/admin/users", {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
      });
      if (res.ok) {
        return await res.json();
      }
      return [];
    } catch (e) {
      return [];
    }
  };

  const adminFetchAnalytics = async (): Promise<any> => {
    try {
      const res = await fetch("/api/admin/analytics", {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
      });
      if (res.ok) {
        return await res.json();
      }
      return null;
    } catch (e) {
      return null;
    }
  };

  const adminUpdateOrderStatus = async (orderId: string, status: string, paymentStatus?: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({ status, paymentStatus })
      });
      if (res.ok) {
        // Refresh local user's order statuses as well
        if (user) {
          await fetchUserOrders(user.id);
        }
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const adminFetchConsultations = async (): Promise<any[]> => {
    try {
      const res = await fetch("/api/admin/consultations", {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
      });
      if (res.ok) {
        return await res.json();
      }
      return [];
    } catch (e) {
      return [];
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        products,
        blogs,
        coupons,
        cart,
        wishlist,
        orders,
        activeCoupon,
        loading,
        error,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        toggleWishlist,
        isInWishlist,
        loginUser,
        registerUser,
        logoutUser,
        updateUserProfile,
        applyCouponCode,
        removeCoupon,
        submitOrder,
        trackOrder,
        bookConsultation,
        refreshProducts,

        adminAddProduct,
        adminEditProduct,
        adminDeleteProduct,
        adminAddBlog,
        adminEditBlog,
        adminDeleteBlog,
        adminAddCoupon,
        adminFetchOrders,
        adminFetchUsers,
        adminFetchAnalytics,
        adminUpdateOrderStatus,
        adminFetchConsultations
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used inside an AppProvider context block");
  }
  return context;
}
