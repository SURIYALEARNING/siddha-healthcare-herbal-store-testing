import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ShoppingBag, Eye, RotateCcw } from "lucide-react";
import type { Order } from "../../types";

interface OrdersHistoryProps {
  orders: Order[];
}

const STATUS_COLORS: Record<string, string> = {
  Pending: "bg-amber-50 text-amber-700",
  Confirmed: "bg-blue-50 text-blue-700",
  Packed: "bg-indigo-50 text-indigo-700",
  "Ready To Ship": "bg-purple-50 text-purple-700",
  Shipped: "bg-cyan-50 text-cyan-700",
  "Out For Delivery": "bg-orange-50 text-orange-700",
  Delivered: "bg-emerald-50 text-emerald-700",
  Ordered: "bg-amber-50 text-amber-700",
  Cancelled: "bg-rose-50 text-rose-700",
  Returned: "bg-slate-50 text-slate-700",
  Refunded: "bg-gray-50 text-gray-700",
};

export default function OrdersHistory({ orders }: OrdersHistoryProps) {
  const { t } = useTranslation();

  if (orders.length === 0) {
    return (
      <div className="space-y-6">
        <h3 className="text-base font-bold text-gray-850 uppercase tracking-wider border-b border-gray-50 pb-2.5">{t("user.orderHistory")}</h3>
        <div className="text-center py-16 bg-slate-50 border border-slate-100 rounded-2xl p-6 space-y-3">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-emerald-950">{t("user.noOrders")}</h4>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">{t("user.noOrders")}</p>
          <Link to="/shop" className="inline-block px-4 py-2 bg-siddha-dark text-white rounded-xl text-xs font-bold">{t("navigation.products")}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-base font-bold text-gray-850 uppercase tracking-wider border-b border-gray-50 pb-2.5">
        {t("user.orderHistory")} ({orders.length})
      </h3>
      <div className="space-y-4">
        {orders.map((o) => {
          const displayStatus = o.currentStatus || o.status || "Pending";
          return (
            <div key={o.id} className="border border-gray-150 rounded-2xl p-5 hover:border-emerald-100 transition-all space-y-3 bg-white">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-gray-100 pb-3">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t("checkout.orderNumber")}</p>
                    <p className="text-xs font-bold text-siddha-dark font-mono mt-0.5">#{(o.id || "").slice(-8)}</p>
                  </div>
                  <div className="hidden sm:block w-px h-8 bg-gray-100" />
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t("user.orderPlaced")}</p>
                    <p className="text-[11px] text-gray-600 font-medium mt-0.5">{new Date(o.date || o.createdAt || "").toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-block text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${STATUS_COLORS[displayStatus] || "bg-gray-50 text-gray-500"}`}>
                    {displayStatus}
                  </span>
                  {o.paymentStatus === "Paid" && (
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{o.paymentStatus}</span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {o.items.slice(0, 3).map((item, idx) => (
                  <span key={idx} className="text-[10px] text-gray-500 bg-gray-50 px-2 py-1 rounded-lg truncate max-w-40">
                    {item.name} <span className="font-bold text-gray-700">x{item.quantity}</span>
                  </span>
                ))}
                {o.items.length > 3 && (
                  <span className="text-[10px] text-gray-400 font-bold px-2 py-1">+{o.items.length - 3} more</span>
                )}
              </div>

              <div className="flex items-center justify-between pt-1">
                <p className="text-sm font-black text-emerald-950 font-mono">₹{o.total}</p>
                <div className="flex gap-2">
                  <Link
                    to="/track-order"
                    state={{ searchId: o.id }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-siddha-dark hover:bg-emerald-800 text-white rounded-xl text-[10px] font-bold transition-colors cursor-pointer"
                  >
                    <Eye className="w-3 h-3" />
                    {t("user.trackOrder")}
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
