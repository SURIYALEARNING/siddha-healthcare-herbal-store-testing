import { useState } from "react";
import { Eye, PackageCheck, Truck, QrCode, MapPin, CheckCircle } from "lucide-react";
import type { Order, ShippingStatus } from "../../types";
import type { ShiprocketFormData } from "./ShiprocketOrderModal";
import StatusBadge from "./StatusBadge";
import ShiprocketOrderModal from "./ShiprocketOrderModal";

interface ShippingTableProps {
  orders: Order[];
  loading: boolean;
  activeView: "new" | "ready";
  onConfirmOrder: (orderId: string) => Promise<void>;
  onMarkPacked: (orderId: string) => Promise<void>;
  onCreateShiprocketOrder: (orderId: string, formData?: Record<string, any>) => Promise<string | null>;
  onGenerateAWB: (orderId: string, shipmentId: string) => Promise<void>;
  onRequestPickup: (orderId: string, shipmentIds: string[]) => Promise<void>;
  onViewDetails: (order: Order) => void;
  onRefresh: () => void;
}

const STATUS_ORDER: ShippingStatus[] = [
  "PAID", "CONFIRMED", "PACKED", "PICKUP_REQUESTED",
  "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY",
  "DELIVERED", "RETURNED", "CANCELLED",
];

function statusWeight(s: string): number {
  const idx = STATUS_ORDER.indexOf(s as ShippingStatus);
  return idx >= 0 ? idx : 99;
}

export default function ShippingTable({
  orders, loading, activeView, onConfirmOrder, onMarkPacked, onCreateShiprocketOrder,
  onGenerateAWB, onRequestPickup, onViewDetails, onRefresh,
}: ShippingTableProps) {
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [sortField, setSortField] = useState<"createdAt" | "fullName" | "total">("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [formOrder, setFormOrder] = useState<Order | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const sorted = [...orders].sort((a, b) => {
    let cmp = 0;
    if (sortField === "createdAt") {
      cmp = new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime();
    } else if (sortField === "fullName") {
      cmp = (a.fullName || "").localeCompare(b.fullName || "");
    } else if (sortField === "total") {
      cmp = (a.total || 0) - (b.total || 0);
    }
    return sortDir === "desc" ? -cmp : cmp;
  });

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("desc"); }
  };

  const doAction = async (action: string, fn: () => Promise<void>) => {
    setActionLoading(action);
    try { await fn(); } finally { setActionLoading(null); }
  };

  const handleShiprocketSubmit = async (data: ShiprocketFormData) => {
    if (!formOrder) return;
    setFormSubmitting(true);
    try {
      await doAction(`confirm-${formOrder.id}`, () => onConfirmOrder(formOrder.id));
    } catch {
      return;
    }
    try {
      const shipmentId = await onCreateShiprocketOrder(formOrder.id, data);
      if (shipmentId) {
        await doAction(`awb-${formOrder.id}`, () => onGenerateAWB(formOrder.id, shipmentId));
      }
      setFormOrder(null);
      onRefresh();
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleMarkPacked = async (orderId: string) => {
    await doAction(`pack-${orderId}`, () => onMarkPacked(orderId));
  };

  const handleGenerateAWB = async (order: Order) => {
    const sid = order.shiprocketDetails?.shipmentId || order.shiprocketOrderId;
    if (sid) {
      await doAction(`awb-${order.id}`, () => onGenerateAWB(order.id, sid));
    }
  };

  const handleRequestPickup = async (order: Order) => {
    const sid = order.shiprocketDetails?.shipmentId || order.shiprocketOrderId;
    if (sid) {
      await doAction(`pickup-${order.id}`, () => onRequestPickup(order.id, [sid]));
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white border border-gray-100 rounded-3xl p-10 shadow-xs text-center space-y-3">
        <Truck className="w-10 h-10 text-gray-300 mx-auto" />
        <h4 className="font-bold text-emerald-950 text-sm">No Shipping Orders</h4>
        <p className="text-xs text-gray-400">Paid orders will appear here for processing.</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border border-gray-100 rounded-3xl p-4 sm:p-6 shadow-xs overflow-x-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold font-display text-emerald-950">
            Shipping Queue <span className="text-gray-400 font-mono text-[11px] ml-1">({orders.length})</span>
          </h3>
          <button
            onClick={onRefresh}
            className="text-[10px] font-bold text-gray-400 hover:text-siddha-dark uppercase tracking-wider cursor-pointer"
          >
            Refresh
          </button>
        </div>

        <table className="w-full text-xs text-left min-w-200">
          <thead>
            <tr className="border-b border-gray-150 text-gray-400 uppercase font-black tracking-widest text-[9px]">
              <th className="py-3 pr-2 cursor-pointer select-none hover:text-siddha-dark" onClick={() => handleSort("fullName")}>
                Customer {sortField === "fullName" && (sortDir === "asc" ? "↑" : "↓")}
              </th>
              <th className="py-3 pr-2">Contact</th>
              <th className="py-3 pr-2">Address</th>
              <th className="py-3 pr-2 cursor-pointer select-none hover:text-siddha-dark" onClick={() => handleSort("total")}>
                Amount {sortField === "total" && (sortDir === "asc" ? "↑" : "↓")}
              </th>
              <th className="py-3 pr-2">Items</th>
              <th className="py-3 pr-2">Courier / AWB</th>
              <th className="py-3 pr-2 cursor-pointer select-none hover:text-siddha-dark" onClick={() => handleSort("createdAt")}>
                Status {sortField === "createdAt" && (sortDir === "asc" ? "↑" : "↓")}
              </th>
              <th className="py-3 pr-2">Date</th>
              <th className="py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
            {sorted.map((order) => {
              const isDoing = (prefix: string) => actionLoading === `${prefix}-${order.id}`;
              const shippingStatus = (order.shippingStatus || "PAID") as ShippingStatus;
              const sw = statusWeight(shippingStatus);

              return (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 pr-2">
                    <p className="font-bold text-gray-800 leading-tight truncate max-w-32">{order.fullName}</p>
                    <span className="text-[10px] text-gray-400 font-mono block truncate max-w-32">#{order.id}</span>
                  </td>
                  <td className="py-3 pr-2">
                    <p className="font-mono text-[11px]">{order.mobileNumber}</p>
                    <p className="text-[10px] text-gray-400 truncate max-w-28">{order.email}</p>
                  </td>
                  <td className="py-3 pr-2 max-w-36">
                    <p className="text-[11px] leading-snug text-gray-600">
                      {order.shippingAddress?.address}, {order.shippingAddress?.district}
                    </p>
                    <p className="text-[10px] text-gray-400 font-mono">{order.shippingAddress?.pincode}</p>
                  </td>
                  <td className="py-3 pr-2 font-mono font-bold text-emerald-950">₹{order.total}</td>
                  <td className="py-3 pr-2 max-w-40">
                    {order.items?.map((item, idx) => (
                      <p key={idx} className="text-[11px] text-gray-500 truncate leading-snug">
                        {item.name} <span className="font-mono text-gray-700">x{item.quantity}</span>
                      </p>
                    ))}
                  </td>
                  <td className="py-3 pr-2">
                    {order.awbCode ? (
                      <div>
                        <p className="font-mono text-[11px] font-bold text-siddha-dark">{order.awbCode}</p>
                        {order.courierName && <p className="text-[10px] text-gray-400">{order.courierName}</p>}
                      </div>
                    ) : (
                      <span className="text-[10px] text-gray-300 uppercase font-bold">—</span>
                    )}
                  </td>
                  <td className="py-3 pr-2">
                    <StatusBadge status={shippingStatus} />
                  </td>
                  <td className="py-3 pr-2 text-[10px] text-gray-400 font-mono">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : new Date(order.date).toLocaleDateString()}
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1 flex-wrap">
                      {activeView === "new" && sw <= statusWeight("PAID") && (
                        <button
                          onClick={() => setFormOrder(order)}
                          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors flex items-center gap-1"
                        >
                          <CheckCircle className="w-3 h-3" /> Confirm
                        </button>
                      )}
                      {activeView === "ready" && (
                        <>
                          <button
                            onClick={() => onViewDetails(order)}
                            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-[10px] font-bold cursor-pointer transition-colors flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" /> View
                          </button>
                          <button
                            onClick={() => handleRequestPickup(order)}
                            disabled={isDoing("pickup")}
                            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors flex items-center gap-1"
                          >
                            {isDoing("pickup") ? "..." : <><MapPin className="w-3 h-3" /> Pickup</>}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {formOrder && (
        <ShiprocketOrderModal
          order={formOrder}
          submitting={formSubmitting}
          onClose={() => { if (!formSubmitting) setFormOrder(null); }}
          onSubmit={handleShiprocketSubmit}
        />
      )}
    </>
  );
}
