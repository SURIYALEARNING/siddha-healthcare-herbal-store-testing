import { Truck, CreditCard, CheckCircle, Package, PackageCheck, Ship, MapPin, XCircle, RotateCcw } from "lucide-react";
import type { ShippingStats } from "../../types";

interface ShippingDashboardProps {
  stats: ShippingStats | null;
}

const CARDS: { key: keyof ShippingStats; label: string; Icon: typeof Truck; color: string }[] = [
  { key: "total",           label: "Total Orders",         Icon: Truck,       color: "text-gray-600" },
  { key: "paid",            label: "Paid Orders",          Icon: CreditCard,  color: "text-blue-600" },
  { key: "confirmed",       label: "Confirmed Orders",     Icon: CheckCircle, color: "text-green-600" },
  { key: "packed",          label: "Packed Orders",        Icon: Package,     color: "text-orange-600" },
  { key: "pickupRequested", label: "Pickup Requested",     Icon: Ship,        color: "text-purple-600" },
  { key: "inTransit",       label: "In Transit",           Icon: MapPin,      color: "text-indigo-600" },
  { key: "delivered",       label: "Delivered",            Icon: PackageCheck,color: "text-emerald-600" },
  { key: "cancelled",       label: "Cancelled",            Icon: XCircle,     color: "text-red-600" },
  { key: "returned",        label: "Returned",             Icon: RotateCcw,   color: "text-gray-500" },
];

export default function ShippingDashboard({ stats }: ShippingDashboardProps) {
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
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {CARDS.map((c) => {
        const value = stats[c.key] ?? 0;
        const Icon = c.Icon;
        return (
          <div key={c.key} className="bg-white border border-gray-100 rounded-3xl p-5 relative overflow-hidden shadow-xs">
            <Icon className={`w-5 h-5 ${c.color} mb-2`} />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block leading-tight">{c.label}</span>
            <p className="text-2xl font-black text-siddha-dark font-mono mt-1 leading-none">{value}</p>
            <p className="text-[10px] font-bold text-gray-400 mt-1 font-mono">orders</p>
          </div>
        );
      })}
    </div>
  );
}
