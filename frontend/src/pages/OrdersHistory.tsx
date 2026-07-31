import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useApp } from "../context/AppContext";
import OrdersHistoryList from "../components/account/OrdersHistory";

export default function OrdersHistory() {
  const { user, orders, loading } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate("/auth");
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        to="/account"
        className="inline-flex items-center space-x-1 text-xs font-bold text-gray-500 hover:text-siddha-dark uppercase tracking-wider mb-6 cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Account</span>
      </Link>

      {loading ? (
        <div className="space-y-4">
          <div className="h-5 w-40 bg-gray-100 rounded animate-pulse" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-gray-100 rounded-2xl p-5 space-y-3 animate-pulse">
              <div className="h-3 bg-gray-100 rounded w-60" />
              <div className="h-3 bg-gray-100 rounded w-40" />
              <div className="h-8 bg-gray-100 rounded w-full" />
            </div>
          ))}
        </div>
      ) : (
        <OrdersHistoryList orders={orders} />
      )}
    </div>
  );
}
