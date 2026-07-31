import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { fetchAllProductsApi } from "../api/products";
import AdminHeader from "../components/admin/AdminHeader";
import Sidebar from "../components/admin/Sidebar";
import AnalyticsTab from "../components/admin/AnalyticsTab";
import ProductsTab from "../components/admin/ProductsTab";
import OrdersTab from "../components/admin/OrdersTab";
import CouponsTab from "../components/admin/CouponsTab";
import ConsultationsTab from "../components/admin/ConsultationsTab";
import ShippingTab from "../components/admin/ShippingTab";
import ManageCategories from "./admin/ManageCategories";
import CarouselTab from "../components/admin/CarouselTab";
import BatchTab from "../components/admin/BatchTab";
import ReminderTab from "../components/admin/ReminderTab";
import ReviewTab from "../components/admin/ReviewTab";
import StaffTab from "../components/admin/StaffTab";
import BlogTab from "../components/admin/BlogTab";
import type { TabId } from "../components/admin/AdminHeader";
import type { Consultation, Product } from "../types";

export default function Admin() {
  const {
    user,
    products,
    orders,
    coupons,
    adminAddProduct,
    adminEditProduct,
    adminDeleteProduct,
    adminUpdateOrderStatus,
    adminAddCoupon,
    adminFetchConsultations,
    logoutUser,
  } = useApp();

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>("analytics");
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [adminProducts, setAdminProducts] = useState<Product[]>([]);

  const refreshAdminProducts = () => {
    fetchAllProductsApi({ limit: 200 }).then((data) => setAdminProducts(data.products || [])).catch(() => {});
  };

  const isStaff = user?.role === "STAFF";
  const isSuperAdminFromRole = user?.role === "SUPER_ADMIN";

  useEffect(() => {
    if (!user || (!user.isAdmin && !isStaff && !isSuperAdminFromRole)) {
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => { refreshAdminProducts(); }, []);

  useEffect(() => {
    if (activeTab === "consultations") {
      adminFetchConsultations().then(setConsultations).catch(() => setConsultations([]));
    }
  }, [activeTab, adminFetchConsultations]);

  if (!user || (!user.isAdmin && !isStaff && !isSuperAdminFromRole)) return null;

  const hasPermission = (tab: TabId): boolean => {
    if (isSuperAdminFromRole) return true;
    const permMap: Partial<Record<TabId, string>> = {
      analytics: "dashboard", products: "products", categories: "categories",
      orders: "orders", customers: "customers", batches: "batches",
      reminders: "reminders", reviews: "reviews", coupons: "coupons",
      carousel: "carousel", consultations: "consultations", shipping: "shipping",
      staffManagement: "staffManagement", blogs: "blogs",
    };
    const key = permMap[tab];
    if (!key) return false;
    return (user.permissions as any)?.[key] === true;
  };

  // Redirect STAFF to first available tab if current tab is not permitted
  const safeActiveTab = hasPermission(activeTab) ? activeTab : "analytics";
  if (safeActiveTab !== activeTab) {
    setTimeout(() => setActiveTab(safeActiveTab), 0);
  }

  const handleSignOut = () => {
    logoutUser();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Sidebar user={user} activeTab={safeActiveTab} onTabChange={setActiveTab} onSignOut={handleSignOut} />
      <div className="pl-16 transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <AdminHeader user={user} onSignOut={handleSignOut} />

          {safeActiveTab === "analytics" && (
            <AnalyticsTab user={user} />
          )}

          {safeActiveTab === "products" && (
            <ProductsTab
              products={adminProducts}
              onAddProduct={adminAddProduct}
              onEditProduct={adminEditProduct}
              onDeleteProduct={adminDeleteProduct}
            />
          )}

          {safeActiveTab === "categories" && <ManageCategories />}

          {safeActiveTab === "coupons" && (
            <CouponsTab coupons={coupons} onCreateCoupon={adminAddCoupon} />
          )}

          {safeActiveTab === "consultations" && (
            <ConsultationsTab consultations={consultations} />
          )}

          {safeActiveTab === "orders" && (
            <OrdersTab />
          )}

          {safeActiveTab === "carousel" && (
            <CarouselTab products={adminProducts} />
          )}

          {safeActiveTab === "batches" && (
            <BatchTab products={adminProducts} />
          )}

          {safeActiveTab === "reminders" && (
            <ReminderTab />
          )}

          {safeActiveTab === "shipping" && (
            <ShippingTab />
          )}

          {safeActiveTab === "reviews" && (
            <ReviewTab />
          )}

          {safeActiveTab === "staffManagement" && (
            <StaffTab />
          )}

          {safeActiveTab === "blogs" && (
            <BlogTab />
          )}
        </div>
      </div>
    </div>
  );
}
