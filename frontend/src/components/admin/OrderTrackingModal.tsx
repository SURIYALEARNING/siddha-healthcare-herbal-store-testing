import { useEffect, useState } from "react";
import { X, PackageSearch, Truck } from "lucide-react";
import { useToastContext } from "../../context/ToastContext";
import { Button } from "../ui/Button";
import ImageUploader from "../ui/ImageUploader";
import { updateOrderTrackingApi } from "../../api/orders";
import { fetchCouriersApi } from "../../api/shipping";
import type { Order, Courier, ShippingStatus } from "../../types";

const SHIPMENT_STATUSES: ShippingStatus[] = [
  "SHIPPED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "RETURNED", "CANCELLED",
];

type Intent = "SHIP" | "MANAGE" | "DELIVER";

interface OrderTrackingModalProps {
  order: Order;
  intent?: Intent;
  onClose: () => void;
  onSaved: () => void;
}

const INTENT_META: Record<Intent, { title: string; submit: string }> = {
  SHIP: { title: "Ship Order", submit: "Ship Order" },
  MANAGE: { title: "Manage Tracking", submit: "Save Tracking Details" },
  DELIVER: { title: "Mark as Delivered", submit: "Confirm Delivery" },
};

export default function OrderTrackingModal({ order, onClose, onSaved, intent = "MANAGE" }: OrderTrackingModalProps) {
  const { showSuccess, showError } = useToastContext();
  const meta = INTENT_META[intent];

  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [courierName, setCourierName] = useState(order.courierName || order.tracking?.courierName || "");
  const [courierId, setCourierId] = useState(order.courierCompanyId || "");
  const [awbNumber, setAwbNumber] = useState(order.awbCode || order.tracking?.awbNumber || "");
  const [trackingUrl, setTrackingUrl] = useState(order.trackingLink || order.tracking?.trackingUrl || "");
  const [receiptImages, setReceiptImages] = useState<string[]>(
    order.courierReceiptImage ? [order.courierReceiptImage] : []
  );
  const [shippingNotes, setShippingNotes] = useState(order.shippingNotes || "");
  const [shipmentStatus, setShipmentStatus] = useState<ShippingStatus>(order.shippingStatus || "SHIPPED");
  const [validationError, setValidationError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCouriersApi().then(setCouriers).catch(() => setCouriers([]));
  }, []);

  const handleCourierSelect = (id: string) => {
    setCourierId(id);
    const courier = couriers.find((c) => c._id === id);
    if (courier) {
      setCourierName(courier.name);
      if (!trackingUrl) setTrackingUrl(courier.trackingUrl || "");
    }
  };

  const handleSave = async () => {
    if (intent === "SHIP") {
      if (!courierName.trim()) {
        setValidationError("Courier company is required to ship this order.");
        return;
      }
      if (!awbNumber.trim()) {
        setValidationError("Tracking number is required before this order can be shipped.");
        return;
      }
    }
    if ((intent === "SHIP" || intent === "MANAGE") && !shipmentStatus) {
      setValidationError("Please choose a shipment status.");
      return;
    }

    setValidationError("");
    setSaving(true);
    try {
      const statusToSend =
        intent === "SHIP" ? "SHIPPED" :
        intent === "DELIVER" ? "DELIVERED" :
        shipmentStatus;

      await updateOrderTrackingApi(order.id || order._id!, {
        courierId: courierId || undefined,
        courierName: courierName || undefined,
        awbNumber: awbNumber || undefined,
        trackingUrl: trackingUrl || undefined,
        courierReceiptImage: receiptImages[0] || undefined,
        shippingNotes: shippingNotes || undefined,
        shipmentStatus: statusToSend,
      });
      showSuccess(intent === "SHIP" ? "Shipped" : intent === "DELIVER" ? "Delivered" : "Saved",
        intent === "SHIP"
          ? "Order shipped and tracking saved."
          : intent === "DELIVER"
          ? "Order marked as delivered."
          : "Tracking details updated.");
      onSaved();
      onClose();
    } catch (err: any) {
      setValidationError(err?.response?.data?.error || err?.message || "Could not update order.");
    } finally {
      setSaving(false);
    }
  };

  const isReadOnly = intent === "DELIVER";

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold font-display text-emerald-950 flex items-center">
              {intent === "SHIP" ? <Truck className="w-4.5 h-4.5 text-siddha-dark mr-1.5" /> : <PackageSearch className="w-4.5 h-4.5 text-siddha-dark mr-1.5" />}
              {meta.title}
            </h3>
            <p className="text-[10px] text-gray-400 font-mono mt-0.5">Order #{String(order.id || order._id || "").slice(-8)}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 cursor-pointer p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {intent === "SHIP" && (
            <p className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-[11px] font-semibold text-emerald-800">
              Enter courier + tracking details below. The order status will update to <b>Shipped</b>.
            </p>
          )}
          {intent === "DELIVER" && (
            <p className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-[11px] font-semibold text-emerald-800">
              Confirm this order has been <b>delivered</b>. Courier and tracking will be retained.
            </p>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">
              Courier Company {intent === "SHIP" && <span className="text-rose-500">*</span>}
            </label>
            {isReadOnly ? (
              <div className="w-full px-4 py-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs font-bold text-gray-700">
                {courierName || "—"}
              </div>
            ) : (
              <>
                <select
                  value={courierId}
                  onChange={(e) => handleCourierSelect(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs font-semibold cursor-pointer focus:outline-none focus:border-siddha-dark"
                >
                  <option value="">Select known courier (preferred)</option>
                  {couriers.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={courierName}
                  onChange={(e) => { setCourierName(e.target.value); if (courierId) setCourierId(""); }}
                  placeholder="Or type courier name (Ex. Professional Couriers)"
                  className="mt-2 w-full px-4 py-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs focus:outline-none focus:border-siddha-dark focus:bg-white"
                />
              </>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">
              Tracking Number {intent === "SHIP" && <span className="text-rose-500">*</span>}
            </label>
            <input
              type="text"
              value={awbNumber}
              onChange={(e) => setAwbNumber(e.target.value)}
              readOnly={isReadOnly}
              placeholder="Ex. 417398422123"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs focus:outline-none focus:border-siddha-dark focus:bg-white font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Tracking URL (optional)</label>
            <input
              type="url"
              value={trackingUrl}
              onChange={(e) => setTrackingUrl(e.target.value)}
              readOnly={isReadOnly}
              placeholder="https://..."
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs focus:outline-none focus:border-siddha-dark focus:bg-white font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Courier Receipt Image (optional)</label>
            {isReadOnly ? (
              receiptImages.length > 0 ? (
                <a href={receiptImages[0]} target="_blank" rel="noreferrer" className="inline-block mt-1">
                  <img src={receiptImages[0]} alt="Courier receipt" className="h-20 w-20 object-cover rounded-xl border border-gray-150" />
                </a>
              ) : (
                <p className="text-xs text-gray-400">No receipt uploaded.</p>
              )
            ) : (
              <ImageUploader images={receiptImages} onImagesChange={setReceiptImages} maxImages={2} />
            )}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Internal Notes (optional)</label>
            <textarea
              value={shippingNotes}
              onChange={(e) => setShippingNotes(e.target.value)}
              rows={2}
              placeholder="Notes shared with the shipping team..."
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs focus:outline-none focus:border-siddha-dark focus:bg-white resize-none"
            />
          </div>

          {!isReadOnly && intent === "MANAGE" && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Shipment Status</label>
              <select
                value={shipmentStatus}
                onChange={(e) => setShipmentStatus(e.target.value as ShippingStatus)}
                className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs font-semibold cursor-pointer focus:outline-none focus:border-siddha-dark"
              >
                {SHIPMENT_STATUSES.map((s) => (
                  <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>
          )}

          {intent === "DELIVER" && (
            <div className="grid grid-cols-2 gap-2 border-t border-gray-100 pt-4 text-center">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[9px] font-bold uppercase text-gray-400">Delivered Date</p>
                <p className="text-xs font-black text-siddha-dark mt-0.5">{new Date().toLocaleDateString()}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[9px] font-bold uppercase text-gray-400">Shipped Date</p>
                <p className="text-xs font-black text-siddha-dark mt-0.5">
                  {order.tracking?.shippedAt ? new Date(order.tracking.shippedAt).toLocaleDateString() : "—"}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { label: "Subtotal", value: `₹${order.subtotal}` },
              { label: "Shipping", value: `₹${order.deliveryCharges || 0}` },
              { label: "Total", value: `₹${order.total}` },
            ].map((row) => (
              <div key={row.label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-[9px] font-bold uppercase text-gray-400">{row.label}</p>
                <p className="text-sm font-black text-siddha-dark font-mono mt-0.5">{row.value}</p>
              </div>
            ))}
          </div>

          {validationError && (
            <p className="text-[11px] font-bold text-rose-600">{validationError}</p>
          )}

          <div className="grid grid-cols-2 gap-2 pt-1">
            <Button onClick={onClose} variant="outline" className="w-full">Cancel</Button>
            <Button onClick={handleSave} variant="primary" className="w-full" loading={saving}>
              {meta.submit}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}