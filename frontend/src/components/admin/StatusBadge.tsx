import type { ShippingStatus } from "../../types";

const STATUS_STYLES: Record<ShippingStatus, { bg: string; text: string; label: string }> = {
  PAID:             { bg: "bg-blue-50 border-blue-200", text: "text-blue-700", label: "Paid" },
  CONFIRMED:        { bg: "bg-green-50 border-green-200", text: "text-green-700", label: "Confirmed" },
  PACKED:           { bg: "bg-orange-50 border-orange-200", text: "text-orange-700", label: "Packed" },
  SHIPPED:          { bg: "bg-teal-50 border-teal-200", text: "text-teal-700", label: "Shipped" },
  PICKUP_REQUESTED: { bg: "bg-purple-50 border-purple-200", text: "text-purple-700", label: "Pickup Requested" },
  PICKED_UP:        { bg: "bg-cyan-50 border-cyan-200", text: "text-cyan-700", label: "Picked Up" },
  IN_TRANSIT:       { bg: "bg-indigo-50 border-indigo-200", text: "text-indigo-700", label: "In Transit" },
  OUT_FOR_DELIVERY: { bg: "bg-yellow-50 border-yellow-200", text: "text-yellow-700", label: "Out for Delivery" },
  DELIVERED:        { bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700", label: "Delivered" },
  RETURNED:         { bg: "bg-red-50 border-red-200", text: "text-red-700", label: "Returned" },
  CANCELLED:        { bg: "bg-gray-50 border-gray-200", text: "text-gray-600", label: "Cancelled" },
};

interface StatusBadgeProps {
  status: ShippingStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.PAID;
  return (
    <span className={`inline-block text-[10px] font-bold uppercase py-1 px-2.5 rounded-full border leading-none ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  );
}
