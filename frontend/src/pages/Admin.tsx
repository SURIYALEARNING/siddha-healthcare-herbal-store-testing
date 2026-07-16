import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import AdminHeader from "../components/admin/AdminHeader";
import AnalyticsTab from "../components/admin/AnalyticsTab";
import ProductsTab from "../components/admin/ProductsTab";
import OrdersTab from "../components/admin/OrdersTab";
import CouponsTab from "../components/admin/CouponsTab";
import ConsultationsTab from "../components/admin/ConsultationsTab";
import ShippingTab from "../components/admin/ShippingTab";
import type { TabId } from "../components/admin/AdminHeader";
import type { Consultation } from "../types";

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

  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (activeTab === "consultations") {
      adminFetchConsultations().then(setConsultations).catch(() => setConsultations([]));
    }
  }, [activeTab, adminFetchConsultations]);

  if (!user || !user.isAdmin) return null;

  const handleSignOut = () => {
    logoutUser();
    navigate("/");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <AdminHeader user={user} activeTab={activeTab} onTabChange={setActiveTab} onSignOut={handleSignOut} />

      {activeTab === "analytics" && (
        <AnalyticsTab products={products} orders={orders} consultationsCount={consultations.length} />
      )}

      {activeTab === "products" && (
        <ProductsTab
          products={products}
          onAddProduct={adminAddProduct}
          onEditProduct={adminEditProduct}
          onDeleteProduct={adminDeleteProduct}
        />
      )}



      {activeTab === "coupons" && (
        <CouponsTab coupons={coupons} onCreateCoupon={adminAddCoupon} />
      )}

      {activeTab === "consultations" && (
        <ConsultationsTab consultations={consultations} />
      )}

      {activeTab === "orders" && (
        <OrdersTab orders={orders} onUpdateStatus={adminUpdateOrderStatus} />
      )}

      {activeTab === "shipping" && (
        <ShippingTab />
      )}
    </div>
  );
}
