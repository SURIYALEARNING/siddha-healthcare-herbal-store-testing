import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ShoppingBag } from "lucide-react";
import type { Order } from "../../types";

interface OrdersHistoryProps {
  orders: Order[];
}

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
      <h3 className="text-base font-bold text-gray-850 uppercase tracking-wider border-b border-gray-50 pb-2.5">{t("user.orderHistory")}</h3>
      <div className="space-y-6">
        {orders.map((o) => (
          <div key={o.id} className="border border-gray-150 rounded-2xl p-5 hover:border-emerald-100 transition-all space-y-4 bg-slate-50/50">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-gray-100 pb-3">
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{t("checkout.orderNumber")}</p>
                <p className="text-sm font-bold text-siddha-dark font-mono mt-0.5">{o.id}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{t("user.orderPlaced")}</p>
                <p className="text-xs text-gray-600 font-medium mt-0.5">{new Date(o.date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{t("user.orderStatus")}</p>
                <span className="inline-block mt-0.5 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-emerald-100 text-siddha-dark">
                  {o.status}
                </span>
              </div>
              <Link
                to="/track-order"
                state={{ searchId: o.id }}
                className="px-4 py-2 bg-siddha-dark hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs h-fit text-center cursor-pointer"
              >
                {t("user.trackOrder")}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
