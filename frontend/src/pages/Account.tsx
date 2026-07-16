import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import AccountHeader from "../components/account/AccountHeader";
import AccountSidebar from "../components/account/AccountSidebar";
import ProfileDashboard from "../components/account/ProfileDashboard";
import OrdersHistory from "../components/account/OrdersHistory";
import SavedAddress from "../components/account/SavedAddress";
import AccountWishlist from "../components/account/AccountWishlist";
import type { AccountTab } from "../components/account/AccountSidebar";

export default function Account() {
  const { user, orders, wishlist, products, updateUserProfile, logoutUser } = useApp();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<AccountTab>("dashboard");

  useEffect(() => {
    if (!user) navigate("/auth");
  }, [user, navigate]);

  if (!user) return null;

  const handleSignOut = () => {
    logoutUser();
    navigate("/");
  };

  const wishlistProducts = products.filter(p => wishlist.includes(p._id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <AccountHeader fullName={user.fullName} onSignOut={handleSignOut} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <AccountSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          ordersCount={orders.length}
          wishlistCount={wishlist.length}
        />

        <div className="lg:col-span-9 bg-white border border-gray-100 rounded-3xl p-6 sm:p-8">
          {activeTab === "dashboard" && <ProfileDashboard user={user} onSave={updateUserProfile} />}
          {activeTab === "orders" && <OrdersHistory orders={orders} />}
          {activeTab === "addresses" && <SavedAddress user={user} />}
          {activeTab === "wishlist" && <AccountWishlist products={wishlistProducts} />}
        </div>
      </div>
    </div>
  );
}
