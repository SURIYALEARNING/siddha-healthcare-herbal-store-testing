import { useEffect, useState } from "react";
import { X, Package, ShoppingBag, Truck, MapPin, CheckCircle, Clock, Loader2 } from "lucide-react";
import type { Order, Shipment, TrackingEntry, ShippingStatus } from "../../types";
import StatusBadge from "./StatusBadge";
import { trackShipmentApi } from "../../api/shipping";

interface ShipmentDetailsModalProps {
  order: Order | null;
  onClose: () => void;
}

const TIMELINE_STEPS: { status: ShippingStatus; label: string; Icon: typeof Package }[] = [
  { status: "PAID",             label: "Payment Successful",   Icon: ShoppingBag },
  { status: "CONFIRMED",        label: "Order Confirmed",      Icon: CheckCircle },
  { status: "PACKED",           label: "Package Packed",       Icon: Package },
  { status: "PICKUP_REQUESTED", label: "Pickup Requested",     Icon: MapPin },
  { status: "PICKED_UP",        label: "Picked Up",            Icon: Truck },
  { status: "IN_TRANSIT",       label: "In Transit",           Icon: Truck },
  { status: "OUT_FOR_DELIVERY", label: "Out for Delivery",     Icon: MapPin },
  { status: "DELIVERED",        label: "Delivered",            Icon: CheckCircle },
];

export default function ShipmentDetailsModal({ order, onClose }: ShipmentDetailsModalProps) {
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState("");

  useEffect(() => {
    if (!order?.shiprocketOrderId) return;
    const load = async () => {
      setTrackingLoading(true);
      setTrackingError("");
      try {
        const data = await trackShipmentApi(order.shiprocketOrderId!);
        setShipment(data);
      } catch {
        setTrackingError("Could not fetch tracking data.");
      } finally {
        setTrackingLoading(false);
      }
    };
    load();
  }, [order?.shiprocketOrderId]);

  if (!order) return null;

  const shippingStatus = (order.shippingStatus || "PAID") as ShippingStatus;
  const activeIndex = TIMELINE_STEPS.findIndex((s) => s.status === shippingStatus);
  const currentIdx = activeIndex >= 0 ? activeIndex : 0;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold font-display text-emerald-950">Shipment Details</h3>
            <p className="text-[10px] text-gray-400 font-mono mt-0.5">Order #{order.id.slice(-8)}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 cursor-pointer p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="space-y-0.5">
              <p className="text-[10px] uppercase font-bold text-gray-400">Current Status</p>
              <StatusBadge status={shippingStatus} />
            </div>
            <div className="text-right space-y-0.5">
              <p className="text-[10px] uppercase font-bold text-gray-400">Total Amount</p>
              <p className="font-black font-mono text-siddha-dark">₹{order.total}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1 bg-white border border-gray-100 rounded-2xl p-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase">Customer</p>
              <p className="font-bold text-gray-800">{order.fullName}</p>
              <p className="text-gray-500 font-mono">{order.mobileNumber}</p>
            </div>
            <div className="space-y-1 bg-white border border-gray-100 rounded-2xl p-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase">Delivery</p>
              <p className="text-gray-700 leading-snug">
                {order.shippingAddress?.address}<br />
                {order.shippingAddress?.district}, {order.shippingAddress?.state}<br />
                {order.shippingAddress?.pincode}
              </p>
            </div>
          </div>

          {order.awbCode && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">AWB / Courier</p>
                <p className="font-mono font-bold text-indigo-800 mt-0.5">{order.awbCode}</p>
              </div>
              {order.courierName && (
                <span className="text-xs font-bold text-indigo-600 bg-white px-3 py-1 rounded-lg border border-indigo-200">
                  {order.courierName}
                </span>
              )}
            </div>
          )}

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tracking Timeline</h4>

            {trackingLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : trackingError ? (
              <p className="text-xs text-rose-600 bg-rose-50 p-3 rounded-xl">{trackingError}</p>
            ) : (
              <div className="relative pl-8 space-y-0">
                <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-gray-100" />
                {TIMELINE_STEPS.map((step, idx) => {
                  const isCompleted = idx <= currentIdx;
                  const isCurrent = idx === currentIdx;
                  const Icon = step.Icon;

                  const trackingEntry = shipment?.trackingHistory?.find(
                    (h: TrackingEntry) => h.status?.toLowerCase() === step.status.toLowerCase()
                  );

                  return (
                    <div key={step.status} className="relative pb-6 last:pb-0">
                      <div
                        className={`absolute left-[-14px] w-7 h-7 rounded-full border-2 flex items-center justify-center z-10 transition-all ${
                          isCompleted
                            ? "bg-siddha-dark border-siddha-dark text-white"
                            : "bg-white border-gray-200 text-gray-300"
                        } ${isCurrent ? "ring-4 ring-emerald-100 scale-105" : ""}`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="pl-4">
                        <h5 className={`text-xs font-bold ${isCompleted ? "text-emerald-950" : "text-gray-400"}`}>
                          {step.label}
                        </h5>
                        {trackingEntry && (
                          <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">
                            {trackingEntry.message && <span>{trackingEntry.message} — </span>}
                            {trackingEntry.location && <span>{trackingEntry.location} — </span>}
                            {trackingEntry.timestamp && (
                              <span className="font-mono">{new Date(trackingEntry.timestamp).toLocaleString()}</span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
