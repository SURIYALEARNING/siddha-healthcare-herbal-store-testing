import { useState, useEffect } from "react";
import { X, Package, Truck, Ruler, Weight, MapPin, User, Phone, Mail, Map, CreditCard } from "lucide-react";
import type { Order } from "../../types";
import { fetchPickupLocationsApi } from "../../api/shipping";

interface ShiprocketFormData {
  pickup_location: string;
  length: number;
  breadth: number;
  height: number;
  weight: number;
  billing_customer_name: string;
  billing_last_name: string;
  billing_address: string;
  billing_address_2: string;
  billing_city: string;
  billing_pincode: string;
  billing_state: string;
  billing_country: string;
  billing_email: string;
  billing_phone: string;
  comment: string;
  order_date: string;
  payment_method: string;
  sub_total: number;
}

interface Props {
  order: Order;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (data: ShiprocketFormData) => Promise<void>;
}

const COURIER_TYPES = [
  { value: "SR_STANDARD", label: "Surface" },
  { value: "SR_EXPRESS", label: "Air Express" },
  { value: "SR_QUICK", label: "3hr Quick" },
];

export default function ShiprocketOrderModal({ order, submitting, onClose, onSubmit }: Props) {
  const [form, setForm] = useState<ShiprocketFormData>({
    pickup_location: "",
    length: 10,
    breadth: 10,
    height: 10,
    weight: 0.5,
    billing_customer_name: "",
    billing_last_name: "",
    billing_address: "",
    billing_address_2: "",
    billing_city: "",
    billing_pincode: "",
    billing_state: "",
    billing_country: "India",
    billing_email: "",
    billing_phone: "",
    comment: "",
    order_date: "",
    payment_method: "Prepaid",
    sub_total: 0,
  });

  const [courierType, setCourierType] = useState("SR_STANDARD");
  const [pickupOptions, setPickupOptions] = useState<{ name: string }[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchPickupLocationsApi().then((list) => {
      setPickupOptions(list);
      if (list.length > 0) {
        setForm((prev) => ({ ...prev, pickup_location: list[0].name }));
      }
    });
  }, []);

  useEffect(() => {
    if (!order) return;
    const date = order.createdAt
      ? new Date(order.createdAt).toISOString().split("T")[0] + " 11:11"
      : new Date().toISOString().split("T")[0] + " 11:11";
    setForm({
      pickup_location: "",
      length: 10,
      breadth: 10,
      height: 10,
      weight: 0.5,
      billing_customer_name: order.fullName || "",
      billing_last_name: "",
      billing_address: order.shippingAddress?.address || "",
      billing_address_2: "",
      billing_city: order.shippingAddress?.district || "",
      billing_pincode: order.shippingAddress?.pincode || "",
      billing_state: order.shippingAddress?.state || "",
      billing_country: "India",
      billing_email: order.email || "",
      billing_phone: order.mobileNumber || "",
      comment: "",
      order_date: date,
      payment_method: order.paymentMethod === "Cash on Delivery" ? "COD" : "Prepaid",
      sub_total: order.subtotal || order.total || 0,
    });
  }, [order]);

  const update = (field: keyof ShiprocketFormData, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.pickup_location.trim()) errs.pickup_location = "Required";
    if (!form.length || form.length <= 0) errs.length = "Required";
    if (!form.breadth || form.breadth <= 0) errs.breadth = "Required";
    if (!form.height || form.height <= 0) errs.height = "Required";
    if (!form.weight || form.weight <= 0) errs.weight = "Required";
    if (!form.billing_customer_name.trim()) errs.billing_customer_name = "Required";
    if (!form.billing_address.trim()) errs.billing_address = "Required";
    if (!form.billing_city.trim()) errs.billing_city = "Required";
    if (!form.billing_pincode.trim() || !/^\d{6}$/.test(form.billing_pincode))
      errs.billing_pincode = "6-digit pincode required";
    if (!form.billing_state.trim()) errs.billing_state = "Required";
    if (!form.billing_email.trim() || !/\S+@\S+\.\S+/.test(form.billing_email))
      errs.billing_email = "Valid email required";
    if (!form.billing_phone.trim() || !/^\d{10}$/.test(form.billing_phone))
      errs.billing_phone = "10-digit phone required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit({ ...form, courier_type: courierType } as any);
  };

  const labelClass = "text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1";
  const inputClass = "w-full px-3 py-2 bg-gray-50 border border-gray-150 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:border-siddha-dark focus:bg-white transition-colors";
  const errorClass = "text-[9px] text-rose-600 font-bold mt-0.5";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-6 pb-6 overflow-y-auto bg-gray-900/50 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl mx-4 bg-white rounded-3xl shadow-2xl border border-gray-100">
        <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-gray-100 bg-white rounded-t-3xl">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-siddha-dark rounded-xl flex items-center justify-center">
              <Truck className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-emerald-950">Create Shiprocket Order</h2>
              <p className="text-[9px] text-gray-400 font-mono">#{order.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full cursor-pointer transition-colors" disabled={submitting}>
            <X className="w-3.5 h-3.5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
            <div>
              <p className={labelClass}><MapPin className="w-3 h-3 inline mr-1" />Pickup Location *</p>
              {pickupOptions.length > 0 ? (
                <select value={form.pickup_location} onChange={(e) => update("pickup_location", e.target.value)} className={inputClass}>
                  {pickupOptions.map((p) => (<option key={p.name} value={p.name}>{p.name}</option>))}
                </select>
              ) : (
                <input type="text" value={form.pickup_location} onChange={(e) => update("pickup_location", e.target.value)} placeholder="e.g. Primary" className={inputClass} />
              )}
              {errors.pickup_location && <p className={errorClass}>{errors.pickup_location}</p>}
            </div>
            <div>
              <p className={labelClass}><Truck className="w-3 h-3 inline mr-1" />Courier Type</p>
              <select value={courierType} onChange={(e) => setCourierType(e.target.value)} className={inputClass}>
                {COURIER_TYPES.map((c) => (<option key={c.value} value={c.value}>{c.label}</option>))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 bg-gray-50 border border-gray-100 rounded-2xl">
            <p className="text-[9px] font-black text-gray-500 uppercase tracking-wider col-span-full flex items-center gap-1"><Ruler className="w-3 h-3" />Package Dimensions (cm) & Weight (kg)</p>
            {(["length", "breadth", "height"] as const).map((f) => (
              <div key={f}>
                <p className={labelClass}>{f.charAt(0).toUpperCase() + f.slice(1)} *</p>
                <input type="number" step="0.1" min="1" value={form[f]} onChange={(e) => update(f, parseFloat(e.target.value) || 0)} className={inputClass} />
                {errors[f] && <p className={errorClass}>{errors[f]}</p>}
              </div>
            ))}
            <div>
              <p className={labelClass}><Weight className="w-3 h-3 inline mr-1" />Weight *</p>
              <input type="number" step="0.1" min="0.1" value={form.weight} onChange={(e) => update("weight", parseFloat(e.target.value) || 0)} className={inputClass} />
              {errors.weight && <p className={errorClass}>{errors.weight}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 border border-gray-100 rounded-2xl">
            <p className="text-[9px] font-black text-gray-500 uppercase tracking-wider col-span-full flex items-center gap-1"><User className="w-3 h-3" />Billing Details</p>
            <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className={labelClass}>Customer Name *</p>
                <input type="text" value={form.billing_customer_name} onChange={(e) => update("billing_customer_name", e.target.value)} className={inputClass} />
                {errors.billing_customer_name && <p className={errorClass}>{errors.billing_customer_name}</p>}
              </div>
              <div>
                <p className={labelClass}>Last Name</p>
                <input type="text" value={form.billing_last_name} onChange={(e) => update("billing_last_name", e.target.value)} className={inputClass} />
              </div>
            </div>
            <div className="sm:col-span-2">
              <p className={labelClass}>Address *</p>
              <input type="text" value={form.billing_address} onChange={(e) => update("billing_address", e.target.value)} className={inputClass} />
              {errors.billing_address && <p className={errorClass}>{errors.billing_address}</p>}
            </div>
            <div>
              <p className={labelClass}>Address Line 2</p>
              <input type="text" value={form.billing_address_2} onChange={(e) => update("billing_address_2", e.target.value)} className={inputClass} />
            </div>
            <div>
              <p className={labelClass}>City *</p>
              <input type="text" value={form.billing_city} onChange={(e) => update("billing_city", e.target.value)} className={inputClass} />
              {errors.billing_city && <p className={errorClass}>{errors.billing_city}</p>}
            </div>
            <div>
              <p className={labelClass}>Pincode *</p>
              <input type="text" value={form.billing_pincode} onChange={(e) => update("billing_pincode", e.target.value)} className={inputClass} maxLength={6} />
              {errors.billing_pincode && <p className={errorClass}>{errors.billing_pincode}</p>}
            </div>
            <div>
              <p className={labelClass}>State *</p>
              <input type="text" value={form.billing_state} onChange={(e) => update("billing_state", e.target.value)} className={inputClass} />
              {errors.billing_state && <p className={errorClass}>{errors.billing_state}</p>}
            </div>
            <div>
              <p className={labelClass}>Country *</p>
              <input type="text" value={form.billing_country} onChange={(e) => update("billing_country", e.target.value)} className={inputClass} />
            </div>
            <div>
              <p className={labelClass}><Mail className="w-3 h-3 inline mr-1" />Email *</p>
              <input type="email" value={form.billing_email} onChange={(e) => update("billing_email", e.target.value)} className={inputClass} />
              {errors.billing_email && <p className={errorClass}>{errors.billing_email}</p>}
            </div>
            <div>
              <p className={labelClass}><Phone className="w-3 h-3 inline mr-1" />Phone *</p>
              <input type="text" value={form.billing_phone} onChange={(e) => update("billing_phone", e.target.value)} className={inputClass} maxLength={10} />
              {errors.billing_phone && <p className={errorClass}>{errors.billing_phone}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 border border-gray-100 rounded-2xl">
            <p className="text-[9px] font-black text-gray-500 uppercase tracking-wider col-span-full flex items-center gap-1"><CreditCard className="w-3 h-3" />Order Info</p>
            <div>
              <p className={labelClass}>Order Date</p>
              <input type="text" value={form.order_date} onChange={(e) => update("order_date", e.target.value)} className={inputClass} />
            </div>
            <div>
              <p className={labelClass}>Payment Method</p>
              <select value={form.payment_method} onChange={(e) => update("payment_method", e.target.value)} className={inputClass}>
                <option value="Prepaid">Prepaid</option>
                <option value="COD">COD</option>
              </select>
            </div>
            <div>
              <p className={labelClass}>Sub Total</p>
              <input type="number" value={form.sub_total} onChange={(e) => update("sub_total", parseFloat(e.target.value) || 0)} className={inputClass} />
            </div>
            <div>
              <p className={labelClass}>Comment / Notes</p>
              <input type="text" value={form.comment} onChange={(e) => update("comment", e.target.value)} className={inputClass} placeholder="Reseller: ..." />
            </div>
          </div>

          <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl">
            <p className="text-[9px] font-black text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1"><Package className="w-3 h-3" />Order Items</p>
            <div className="space-y-2">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between bg-white rounded-xl px-3 py-2 border border-gray-100">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-800 truncate">{item.name}</p>
                    <p className="text-[9px] text-gray-400 font-mono">SKU: {item.productId || "—"}</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs shrink-0">
                    <span className="text-gray-500">x{item.quantity}</span>
                    <span className="font-mono font-bold text-emerald-950">₹{item.purchasedPrice || (item.itemTotal || 0) / item.quantity}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {errors.form && (
            <p className="p-3 bg-rose-50 text-rose-700 border border-rose-100 rounded-xl text-xs font-bold">{errors.form}</p>
          )}

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={onClose} disabled={submitting} className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer transition-colors disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="px-5 py-2.5 bg-siddha-dark hover:bg-emerald-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors disabled:opacity-50 flex items-center gap-1.5">
              {submitting ? (
                "Creating..."
              ) : (
                <><Truck className="w-3.5 h-3.5" /> Create Shiprocket Order</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export type { ShiprocketFormData };
