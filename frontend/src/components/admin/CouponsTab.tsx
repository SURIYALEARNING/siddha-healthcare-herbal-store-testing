import { useState } from "react";
import { TicketPercent, CheckCircle } from "lucide-react";
import type { Coupon } from "../../types";

interface CouponsTabProps {
  coupons: Coupon[];
  onCreateCoupon: (data: Partial<Coupon>) => Promise<boolean>;
}

export default function CouponsTab({ coupons, onCreateCoupon }: CouponsTabProps) {
  const [form, setForm] = useState({ code: "", percent: 15, expiry: "2026-12-31" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code) return;

    const ok = await onCreateCoupon({
      code: form.code.toUpperCase().trim(),
      discountPercent: Number(form.percent),
      expiryDate: form.expiry,
    });

    if (ok) {
      alert(`Coupon ${form.code.toUpperCase()} registered ready in system.`);
      setForm({ code: "", percent: 15, expiry: "2026-12-31" });
    } else {
      alert("Failed creating coupon. Verify uniqueness.");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-5 bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 space-y-4">
        <h3 className="text-base font-bold font-display text-emerald-950">Create Promo Discount Coupons</h3>
        <p className="text-xs text-gray-400 uppercase font-bold tracking-widest block leading-none">Generates dynamic subtotal deductions</p>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Coupon Code Name *</label>
            <input
              type="text"
              placeholder="Ex. MONSOON25"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-150 focus:border-siddha-dark rounded-xl text-xs uppercase text-gray-800 font-extrabold tracking-widest"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Deduction Percent (%)</label>
              <input
                type="number"
                min="1"
                max="90"
                value={form.percent}
                onChange={(e) => setForm({ ...form, percent: Number(e.target.value) })}
                className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs font-mono font-bold"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase p-0.5">Expiry Threshold</label>
              <input
                type="date"
                value={form.expiry}
                onChange={(e) => setForm({ ...form, expiry: e.target.value })}
                className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs text-gray-650"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-siddha-dark hover:bg-emerald-800 text-white font-bold text-xs rounded-xl"
          >
            Register Security Code
          </button>
        </form>
      </div>

      <div className="lg:col-span-7 bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 space-y-4">
        <h3 className="text-base font-bold text-emerald-950 border-b border-gray-50 pb-2 flex items-center">
          <TicketPercent className="w-5 h-5 text-siddha-gold mr-1" />
          Active System Discount Codes ({coupons.length})
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {coupons.map((c) => (
            <div key={c.code} className="bg-slate-50 border border-gray-150 rounded-2xl p-4 flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-12 h-12 bg-siddha-light rounded-full filter blur-xl opacity-30"></div>
              <div>
                <span className="font-black text-xs text-siddha-dark uppercase tracking-widest block font-mono bg-white border border-gray-150 px-2.5 py-1 rounded w-fit select-all">
                  {c.code}
                </span>
                <p className="text-[11px] text-gray-650 font-semibold mt-2.5 leading-none">
                  Deducts: <span className="font-extrabold text-emerald-900">{c.discountPercent}% OFF</span>
                </p>
                <p className="text-[10px] text-gray-400 font-mono mt-1.5 leading-none">Expiry: {c.expiryDate}</p>
              </div>
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
