import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import type { Order } from "../../types";

interface OrdersHistoryProps {
  orders: Order[];
}

export default function OrdersHistory({ orders }: OrdersHistoryProps) {
  if (orders.length === 0) {
    return (
      <div className="space-y-6">
        <h3 className="text-base font-bold text-gray-850 uppercase tracking-wider border-b border-gray-50 pb-2.5">Orders Timeline History</h3>
        <div className="text-center py-16 bg-slate-50 border border-slate-100 rounded-2xl p-6 space-y-3">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-emerald-950">No orders logged</h4>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">You haven't purchased any tradicional remedies with this account yet.</p>
          <Link to="/shop" className="inline-block px-4 py-2 bg-siddha-dark text-white rounded-xl text-xs font-bold">Shop Remedies</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-base font-bold text-gray-850 uppercase tracking-wider border-b border-gray-50 pb-2.5">Orders Timeline History</h3>
      <div className="space-y-6">
        {orders.map((o) => (
          <div key={o.id} className="border border-gray-150 rounded-2xl p-5 hover:border-emerald-100 transition-all space-y-4 bg-slate-50/50">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-gray-100 pb-3">
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Order Reference</p>
                <p className="text-sm font-bold text-siddha-dark font-mono mt-0.5">{o.id}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Timeline Date</p>
                <p className="text-xs text-gray-600 font-medium mt-0.5">{new Date(o.date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Status Timeline</p>
                <span className="inline-block mt-0.5 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-emerald-100 text-siddha-dark">
                  {o.status}
                </span>
              </div>
              <Link
                to="/track-order"
                state={{ searchId: o.id }}
                className="px-4 py-2 bg-siddha-dark hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs h-fit text-center cursor-pointer"
              >
                Track Status Stepper
              </Link>
            </div>

            <div className="space-y-3">
              {o.items.map((item, idx) => (
                <div key={idx} className="flex items-center space-x-3 text-xs leading-none">
                  <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded border bg-white" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-emerald-950 truncate">{item.name}</h4>
                    <p className="text-[10px] text-gray-400 uppercase font-semibold mt-1">₹{item.price} x {item.quantity}</p>
                  </div>
                  <span className="font-black text-gray-800">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-3.5 flex justify-between items-center text-xs text-gray-500 flex-wrap gap-2">
              <div className="flex items-center space-x-1 font-semibold uppercase text-[10px]">
                <span>Method:</span>
                <span className="text-gray-700 font-bold">{o.paymentMethod}</span>
                <span className="text-[9px] text-[#D4AF37] font-black border border-amber-300 px-1 rounded ml-1">{o.paymentStatus}</span>
              </div>
              <div className="flex space-x-1.5 items-baseline">
                <span className="font-semibold uppercase text-[10px]">Total cost paid:</span>
                <span className="text-sm font-black text-siddha-dark font-mono">₹{o.total}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
