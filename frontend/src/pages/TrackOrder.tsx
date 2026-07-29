import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { trackOrderApi } from "../api";
import { Package, Truck, CheckCircle, Clock, MapPin, ChevronLeft, CreditCard, DollarSign } from "lucide-react";
import type { Order, TimelineEvent } from "../types";

const STATUS_STEPS = [
  { key: "Pending", label: "Order Placed", icon: Clock },
  { key: "Payment Successful", label: "Payment Successful", icon: DollarSign },
  { key: "Confirmed", label: "Confirmed", icon: CheckCircle },
  { key: "Packed", label: "Packed", icon: Package },
  { key: "Ready To Ship", label: "Ready To Ship", icon: Package },
  { key: "Shipped", label: "Shipped", icon: Truck },
  { key: "Out For Delivery", label: "Out For Delivery", icon: Truck },
  { key: "Delivered", label: "Delivered", icon: CheckCircle },
];

const FULFILLMENT_ORDER = [
  "Pending", "Confirmed", "Packed", "Ready To Ship",
  "Shipped", "Out For Delivery", "Delivered",
];

function getCurrentStepIndex(currentStatus: string): number {
  const idx = FULFILLMENT_ORDER.indexOf(currentStatus);
  return idx >= 0 ? idx : 0;
}

export default function TrackOrder() {
  const { orders } = useApp();
  const location = useLocation();
  const justPlacedId = (location.state as any)?.justPlacedId;
  const searchId = (location.state as any)?.searchId;
  const [order, setOrder] = useState<Order & { trackingHistory?: any[] } | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [lookupId, setLookupId] = useState("");
  const [manualLookup, setManualLookup] = useState(false);

  useEffect(() => {
    const id = justPlacedId || searchId;
    if (!id && !manualLookup) return;

    const fetchOrder = async (oid: string) => {
      try {
        const localOrder = orders.find((o) => o.id === oid) as any;
        if (localOrder) {
          setOrder(localOrder);
          return;
        }
        const data = await trackOrderApi(oid) as any;
        setOrder(data);
      } catch {
        setNotFound(true);
      }
    };

    if (id) {
      fetchOrder(id);
    }
  }, [justPlacedId, searchId, orders, manualLookup]);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupId.trim()) return;
    setNotFound(false);
    try {
      const data = await trackOrderApi(lookupId.trim()) as any;
      setOrder(data);
      setManualLookup(true);
    } catch {
      setOrder(null);
      setNotFound(true);
    }
  };

  if (!order && !notFound) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-2 border-siddha-dark border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-gray-400 mt-4">Loading tracking information...</p>
      </div>
    );
  }

  if (notFound && !order) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16">
        <h2 className="text-lg font-bold text-emerald-950 mb-4">Track Your Order</h2>
        <form onSubmit={handleLookup} className="flex gap-2 mb-4">
          <input
            type="text"
            value={lookupId}
            onChange={(e) => setLookupId(e.target.value)}
            placeholder="Enter Order ID"
            className="flex-1 px-4 py-2.5 border border-gray-150 rounded-xl text-xs font-medium focus:outline-none focus:border-siddha-dark"
          />
          <button type="submit" className="px-4 py-2.5 bg-siddha-dark text-white rounded-xl text-xs font-bold cursor-pointer">
            Track
          </button>
        </form>
        <p className="text-xs text-rose-600 font-bold text-center">Order not found. Please check the ID and try again.</p>
      </div>
    );
  }

  const currentStatus = order!.currentStatus || order!.status || "Pending";
  const currentStep = getCurrentStepIndex(currentStatus);
  const timeline = order!.timeline || [];
  const trackingHistory = (order as any).trackingHistory || [];

  const allShippingSnapshots = trackingHistory.map((h: any, i: number) => ({
    title: h.status || "Update",
    description: h.activity || h.location || "",
    createdAt: h.date || h.timestamp || new Date().toISOString(),
    source: "SHIPROCKET",
  }));

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link to="/account" className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-siddha-dark uppercase tracking-wider cursor-pointer">
        <ChevronLeft className="w-4 h-4" />
        Back to Account
      </Link>

      <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-4 border-b border-gray-50">
          <div>
            <h2 className="text-lg font-bold font-display text-emerald-950">Track Order</h2>
            <p className="text-[10px] font-mono text-gray-400 mt-0.5">#{order!.id || order!._id}</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className={`font-bold px-3 py-1 rounded-full ${
              order!.paymentStatus === "Paid" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
            }`}>
              {order!.paymentStatus}
            </span>
            <span className="text-gray-400">
              ₹{order!.total}
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center justify-between">
          {STATUS_STEPS.map((step, idx) => {
            const isCompleted = idx < currentStep;
            const isCurrent = idx === currentStep;
            const stepKey = step.key;
            const show = currentStep > 0 || idx <= 1;
            if (!show && idx > 1) return null;
            return (
              <div key={stepKey} className="flex flex-col items-center flex-1 relative">
                {idx > 0 && (
                  <div className={`absolute top-3 right-1/2 w-full h-0.5 -z-10 ${
                    isCompleted || isCurrent ? "bg-emerald-500" : "bg-gray-200"
                  }`} />
                )}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                  isCompleted ? "bg-emerald-500 text-white" :
                  isCurrent ? "bg-siddha-dark text-siddha-gold ring-2 ring-siddha-gold" :
                  "bg-gray-100 text-gray-400"
                }`}>
                  {isCompleted ? <CheckCircle className="w-3.5 h-3.5" /> : <step.icon className="w-3.5 h-3.5" />}
                </div>
                <p className={`text-[9px] font-bold uppercase mt-1.5 text-center leading-tight ${
                  isCompleted || isCurrent ? "text-gray-800" : "text-gray-400"
                }`}>
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>

        <div className="sm:hidden space-y-3">
          {STATUS_STEPS.filter((_, idx) => currentStep > 0 || idx <= 1).slice(0, currentStep + 1).map((step, idx) => {
            const isCompleted = idx < currentStep;
            const isCurrent = idx === currentStep;
            return (
              <div key={step.key} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                  isCompleted ? "bg-emerald-500 text-white" :
                  isCurrent ? "bg-siddha-dark text-siddha-gold ring-2 ring-siddha-gold" :
                  "bg-gray-100 text-gray-400"
                }`}>
                  {isCompleted ? <CheckCircle className="w-3 h-3" /> : <step.icon className="w-3 h-3" />}
                </div>
                <p className={`text-xs font-bold ${isCompleted || isCurrent ? "text-gray-800" : "text-gray-400"}`}>
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>

        {order!.tracking?.courierName && (
          <div className="bg-gray-50 rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {order!.tracking.courierName && (
              <div><p className="text-[9px] font-bold text-gray-400 uppercase">Courier</p><p className="font-bold mt-0.5">{order!.tracking.courierName}</p></div>
            )}
            {order!.tracking.awbNumber && (
              <div><p className="text-[9px] font-bold text-gray-400 uppercase">Tracking No.</p><p className="font-mono font-bold mt-0.5">{order!.tracking.awbNumber}</p></div>
            )}
            {order!.tracking.estimatedDelivery && (
              <div><p className="text-[9px] font-bold text-gray-400 uppercase">Est. Delivery</p><p className="font-bold mt-0.5">{new Date(order!.tracking.estimatedDelivery).toLocaleDateString()}</p></div>
            )}
            {order!.createdAt && (
              <div><p className="text-[9px] font-bold text-gray-400 uppercase">Ordered</p><p className="font-bold mt-0.5">{new Date(order!.createdAt).toLocaleDateString()}</p></div>
            )}
          </div>
        )}

        {(timeline.length > 0 || allShippingSnapshots.length > 0) && (
          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-4">Timeline</h3>
            <div className="relative pl-6 space-y-0">
              {[...timeline, ...allShippingSnapshots]
                .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                .map((event, idx, arr) => (
                <div key={idx} className="relative pb-5 last:pb-0">
                  {idx < arr.length - 1 && (
                    <div className="absolute left-[-14px] top-3 bottom-0 w-0.5 bg-emerald-200" />
                  )}
                  <div className={`absolute left-[-18px] top-1.5 w-3 h-3 rounded-full border-2 ${
                    idx === arr.length - 1 ? "bg-emerald-500 border-emerald-500" : "bg-white border-emerald-400"
                  }`} />
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-800">{event.title || event.status}</p>
                      {event.description && <p className="text-[10px] text-gray-400 mt-0.5">{event.description}</p>}
                      <p className="text-[9px] text-gray-400 mt-0.5">{new Date(event.createdAt).toLocaleString()}</p>
                    </div>
                    {(event as any).source && (
                      <span className={`shrink-0 text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full ${
                        (event as any).source === "SHIPROCKET" ? "bg-purple-50 text-purple-700" :
                        (event as any).source === "STAFF" ? "bg-blue-50 text-blue-700" :
                        (event as any).source === "SYSTEM" ? "bg-gray-50 text-gray-500" :
                        "bg-gray-50 text-gray-400"
                      }`}>
                        {(event as any).source}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Shipping Address</h4>
          <p className="text-xs font-bold">{order!.fullName}</p>
          <p className="text-xs text-gray-500">{order!.mobileNumber}</p>
          <p className="text-xs text-gray-500">
            {order!.shippingAddress.address}, {order!.shippingAddress.district}, {order!.shippingAddress.state} - {order!.shippingAddress.pincode}
          </p>
        </div>
      </div>
    </div>
  );
}
