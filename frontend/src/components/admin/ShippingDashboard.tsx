import { Truck, CreditCard, CheckCircle, Package, PackageCheck, Ship, MapPin, XCircle, RotateCcw, Sparkles } from "lucide-react";
import type { ShippingStats } from "../../types";

interface ShippingDashboardProps {
  stats: ShippingStats | null;
  activeView: "new" | "ready";
  onViewChange: (view: "new" | "ready") => void;
}

const CARDS: { key: keyof ShippingStats; label: string; Icon: typeof Truck; color: string }[] = [
  { key: "paid",            label: "Paid Orders",          Icon: CreditCard,  color: "text-blue-600" },
  { key: "confirmed",       label: "Confirmed Orders",     Icon: CheckCircle, color: "text-green-600" },
  { key: "packed",          label: "Packed Orders",        Icon: Package,     color: "text-orange-600" },
  { key: "pickupRequested", label: "Pickup Requested",     Icon: Ship,        color: "text-purple-600" },
  { key: "inTransit",       label: "In Transit",           Icon: MapPin,      color: "text-indigo-600" },
  { key: "delivered",       label: "Delivered",            Icon: PackageCheck,color: "text-emerald-600" },
  { key: "cancelled",       label: "Cancelled",            Icon: XCircle,     color: "text-red-600" },
  { key: "returned",        label: "Returned",             Icon: RotateCcw,   color: "text-gray-500" },
];

export default function ShippingDashboard({ stats, activeView, onViewChange }: ShippingDashboardProps) {
  if (!stats) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {CARDS.map((c) => (
          <div key={c.key} className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xs animate-pulse">
            <div className="h-3 bg-gray-100 rounded w-20 mb-3" />
            <div className="h-8 bg-gray-100 rounded w-16 mb-2" />
            <div className="h-2 bg-gray-100 rounded w-24" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => onViewChange("new")}
          className={`bg-white border-2 rounded-2xl p-5 shadow-xs text-left cursor-pointer transition-all ${
            activeView === "new" ? "border-siddha-gold ring-2 ring-siddha-gold/20" : "border-gray-100 hover:border-gray-200"
          }`}
        >
          <Sparkles className="w-5 h-5 text-blue-600 mb-2" />
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block leading-tight">New Orders</span>
          <p className="text-2xl font-black text-siddha-dark font-mono mt-1 leading-none">{stats.newOrders ?? 0}</p>
          <p className="text-[10px] font-bold text-gray-400 mt-1 font-mono">pending</p>
        </button>
        <button
          onClick={() => onViewChange("ready")}
          className={`bg-white border-2 rounded-2xl p-5 shadow-xs text-left cursor-pointer transition-all ${
            activeView === "ready" ? "border-siddha-gold ring-2 ring-siddha-gold/20" : "border-gray-100 hover:border-gray-200"
          }`}
        >
          <Truck className="w-5 h-5 text-purple-600 mb-2" />
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block leading-tight">Ready to Ship</span>
          <p className="text-2xl font-black text-siddha-dark font-mono mt-1 leading-none">{stats.readyToShip ?? 0}</p>
          <p className="text-[10px] font-bold text-gray-400 mt-1 font-mono">awaiting pickup</p>
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {CARDS.map((c) => {
          const value = stats[c.key] ?? 0;
          const Icon = c.Icon;
          return (
            <div key={c.key} className="bg-white border border-gray-100 rounded-xl p-4 relative overflow-hidden shadow-xs">
              <Icon className={`w-4 h-4 ${c.color} mb-1.5`} />
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block leading-tight">{c.label}</span>
              <p className="text-xl font-black text-siddha-dark font-mono mt-1 leading-none">{value}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
