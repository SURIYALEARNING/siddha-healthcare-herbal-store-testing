import type { Order } from "../../types";

interface OrdersTabProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: string) => void;
}

const STATUSES = ["Ordered", "Packed", "Shipped", "Out for Delivery", "Delivered"] as const;

export default function OrdersTab({ orders, onUpdateStatus }: OrdersTabProps) {
  console.log(orders);
  
  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 space-y-6 overflow-x-auto">
      <div className="border-b border-gray-50 pb-3 flex justify-between items-center">
        <h3 className="text-base font-bold font-display text-emerald-950">Active Customer Orders Tracker</h3>
        <span className="text-xs bg-[#D4AF37] px-3 py-1 rounded-full text-siddha-dark font-bold font-mono uppercase tracking-wider">
          {orders.length} Purchases logged
        </span>
      </div>

      <table className="w-full text-xs text-left min-w-180">
        <thead>
          <tr className="border-b border-gray-150 text-gray-400 uppercase font-black tracking-widest text-[9px] py-1">
            <th className="py-2.5">Order Reference</th>
            <th>Target Recipient Info</th>
            <th>Remedy Purchases details</th>
            <th>Cost Paid</th>
            <th>Logistics status</th>
            <th className="text-right">Status action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
          {orders.map((o) => (
            <tr key={o.id} className="py-1">
              <td className="py-3 font-mono text-siddha-dark font-extrabold max-w-28 truncate select-all">
                {o.id}
              </td>
              <td>
                <p className="font-bold text-gray-805 leading-none">{o.fullName}</p>
                <span className="text-[10px] text-gray-400 font-mono mt-1 block select-all">{o.mobileNumber}</span>
              </td>
              <td className="max-w-64">
                <div className="space-y-1">
                  {o.items.map((item, idx) => (
                    <p key={idx} className="truncate text-gray-500 leading-snug">
                      • {item.name} <span className="font-mono text-slate-805 text-[11px] font-black">x{item.quantity}</span>
                    </p>
                  ))}
                </div>
              </td>
              <td className="font-mono font-bold text-emerald-950">₹{o.total}</td>
              <td>
                <span className="inline-block text-[10px] font-bold uppercase py-0.5 px-2 bg-siddha-light text-siddha-dark rounded-full border border-emerald-250 leading-none">
                  {o.status}
                </span>
              </td>
              <td className="text-right">
                <select
                  value={o.status}
                  onChange={(e) => onUpdateStatus(o.id, e.target.value)}
                  className="p-1.5 border border-gray-150 bg-gray-50 text-[10px] font-bold rounded-lg cursor-pointer max-w-32 focus:outline-none"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
